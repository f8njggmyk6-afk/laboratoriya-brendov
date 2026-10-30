import Database from "better-sqlite3";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { summarizeServices, serviceIdentity } from "../site/serviceCatalog";
import { validateOrderPatch } from "../admin/model";

export class AdminError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const cookieName = "__Host-lb_admin_session";
const sessionSeconds = 8 * 60 * 60;
const emailOfOwner = () => (process.env.LB_ADMIN_EMAIL ?? "").trim().toLowerCase();
const dbPath = () => (process.env.LB_SQLITE_PATH ?? "").trim();
let cachedDb: ReturnType<typeof openDatabase> | undefined;

function storageConfigured() {
  return Boolean(dbPath());
}

export function adminConfigured() {
  const password = process.env.LB_ADMIN_PASSWORD ?? "";
  return process.env.LB_ADMIN_ENABLED === "true" &&
    storageConfigured() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOfOwner()) &&
    password.length >= 32;
}

function openDatabase() {
  const configuredPath = dbPath();
  if (!configuredPath) {
    throw new AdminError(503, "Локальная база заказов ещё не настроена.");
  }
  const path = resolve(configuredPath);
  const projectPath = resolve(process.cwd());
  if (path === projectPath || path.startsWith(projectPath + sep)) {
    throw new AdminError(503, "Путь к базе должен находиться вне папки сайта.");
  }

  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const connection = new Database(path);
  connection.pragma("journal_mode = WAL");
  connection.pragma("synchronous = FULL");
  connection.pragma("foreign_keys = ON");
  connection.pragma("busy_timeout = 5000");
  connection.exec(`
    CREATE TABLE IF NOT EXISTS lb_orders (
      order_number INTEGER PRIMARY KEY AUTOINCREMENT,
      id TEXT NOT NULL UNIQUE,
      request_id TEXT NOT NULL UNIQUE,
      tracking_code TEXT NOT NULL UNIQUE CHECK(length(tracking_code)=35),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      public_updated_at TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
      customer_name TEXT NOT NULL CHECK(length(customer_name) BETWEEN 1 AND 120),
      customer_email TEXT NOT NULL CHECK(customer_email='' OR length(customer_email) BETWEEN 3 AND 254),
      brief TEXT NOT NULL CHECK(length(brief) BETWEEN 1 AND 4000),
      services TEXT NOT NULL DEFAULT '[]',
      advertising_total REAL NOT NULL DEFAULT 0 CHECK(advertising_total >= 0),
      development_total REAL NOT NULL DEFAULT 0 CHECK(development_total >= 0),
      catalog_total REAL NOT NULL DEFAULT 0 CHECK(catalog_total=advertising_total+development_total),
      has_custom INTEGER NOT NULL DEFAULT 0 CHECK(has_custom IN (0,1)),
      agreed_amount REAL CHECK(agreed_amount IS NULL OR (agreed_amount >= 0 AND agreed_amount <= 100000000)),
      due_date TEXT,
      agreed_scope TEXT NOT NULL DEFAULT '' CHECK(length(agreed_scope)<=10000),
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','discussion','in_progress','approval','payment','handover','completed')),
      notes TEXT NOT NULL DEFAULT '' CHECK(length(notes)<=10000),
      terms_confirmed INTEGER NOT NULL DEFAULT 0 CHECK(terms_confirmed IN (0,1)),
      paid INTEGER NOT NULL DEFAULT 0 CHECK(paid IN (0,1)),
      delivered INTEGER NOT NULL DEFAULT 0 CHECK(delivered IN (0,1)),
      notification_status TEXT NOT NULL DEFAULT 'pending' CHECK(notification_status IN ('pending','sent','failed')),
      progress_percent INTEGER NOT NULL DEFAULT 0 CHECK(progress_percent BETWEEN 0 AND 100),
      service_progress TEXT NOT NULL DEFAULT '{}',
      public_notice TEXT NOT NULL DEFAULT '' CHECK(length(public_notice)<=600),
      public_notice_until TEXT,
      deleted_at TEXT,
      CHECK(status IN ('new','discussion') OR (terms_confirmed=1 AND agreed_amount IS NOT NULL AND due_date IS NOT NULL AND length(trim(agreed_scope))>0)),
      CHECK(status<>'handover' OR paid=1),
      CHECK(delivered=0 OR paid=1),
      CHECK(status<>'completed' OR (paid=1 AND delivered=1))
    );
    CREATE INDEX IF NOT EXISTS lb_orders_created ON lb_orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS lb_orders_due ON lb_orders(due_date) WHERE status<>'completed';
    CREATE INDEX IF NOT EXISTS lb_orders_tracking ON lb_orders(tracking_code) WHERE deleted_at IS NULL;

    CREATE TABLE IF NOT EXISTS lb_order_history (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES lb_orders(id),
      created_at TEXT NOT NULL,
      actor_email TEXT NOT NULL,
      changes TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS lb_history_order ON lb_order_history(order_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS lb_admin_rate_limits (
      key_hash TEXT PRIMARY KEY,
      window_started INTEGER NOT NULL,
      hit_count INTEGER NOT NULL CHECK(hit_count > 0)
    );

    CREATE TABLE IF NOT EXISTS lb_admin_sessions (
      token_hash TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS lb_sessions_expiry ON lb_admin_sessions(expires_at);
  `);
  try {
    chmodSync(path, 0o600);
  } catch {
    connection.close();
    throw new AdminError(503, "Не удалось защитить файл локальной базы.");
  }
  return connection;
}

function database() {
  if (!cachedDb) cachedDb = openDatabase();
  return cachedDb;
}

export function assertOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    throw new AdminError(403, "Запрос с другого сайта запрещён");
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    throw new AdminError(415, "Нужен JSON-запрос");
  }
}

export async function readBody(request: Request, max = 24000) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > max) throw new AdminError(413, "Слишком большой запрос");
  const body = await request.text();
  if (new TextEncoder().encode(body).length > max) {
    throw new AdminError(413, "Слишком большой запрос");
  }
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    throw new AdminError(400, "Некорректный JSON");
  }
}

export function privateJson(value: unknown, status = 200, headers = new Headers()) {
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Vary", "Cookie");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Pragma", "no-cache");
  return Response.json(value, { status, headers });
}

function cookieValue(request: Request) {
  const cookies = (request.headers.get("cookie") ?? "").split(";");
  for (const cookie of cookies) {
    const index = cookie.indexOf("=");
    if (index < 0) continue;
    if (cookie.slice(0, index).trim() === cookieName) {
      return cookie.slice(index + 1).trim();
    }
  }
  return "";
}

function setSession(headers: Headers, token: string) {
  headers.append(
    "Set-Cookie",
    cookieName + "=" + token + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + sessionSeconds,
  );
}

export function clearSession(headers: Headers) {
  headers.append(
    "Set-Cookie",
    cookieName + "=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0",
  );
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function requireAdmin(request: Request, headers: Headers) {
  if (!adminConfigured()) {
    throw new AdminError(503, "Вход в панель ещё не настроен.");
  }
  const token = cookieValue(request);
  if (!/^[0-9a-f]{64}$/.test(token)) {
    clearSession(headers);
    throw new AdminError(401, "Войдите в панель");
  }
  const row = database()
    .prepare("SELECT email, expires_at FROM lb_admin_sessions WHERE token_hash=?")
    .get(tokenHash(token)) as { email: string; expires_at: number } | undefined;
  if (!row || row.expires_at <= Date.now() || row.email !== emailOfOwner()) {
    database().prepare("DELETE FROM lb_admin_sessions WHERE token_hash=?").run(tokenHash(token));
    clearSession(headers);
    throw new AdminError(401, "Сессия закончилась. Войдите снова.");
  }
  return { email: row.email };
}

function rateLimit(key: string, limit: number, seconds: number) {
  const hash = createHash("sha256").update(key).digest("hex");
  const now = Date.now();
  const maxAge = seconds * 1000;
  const run = database().transaction(() => {
    database()
      .prepare("DELETE FROM lb_admin_rate_limits WHERE window_started < ?")
      .run(now - 24 * 60 * 60 * 1000);
    const existing = database()
      .prepare("SELECT window_started, hit_count FROM lb_admin_rate_limits WHERE key_hash=?")
      .get(hash) as { window_started: number; hit_count: number } | undefined;
    if (!existing || now - existing.window_started >= maxAge) {
      database()
        .prepare("INSERT INTO lb_admin_rate_limits(key_hash,window_started,hit_count) VALUES(?,?,1) ON CONFLICT(key_hash) DO UPDATE SET window_started=excluded.window_started,hit_count=1")
        .run(hash, now);
      return 1;
    }
    const hits = existing.hit_count + 1;
    database()
      .prepare("UPDATE lb_admin_rate_limits SET hit_count=? WHERE key_hash=?")
      .run(hits, hash);
    return hits;
  });
  if (run() > limit) {
    throw new AdminError(429, "Слишком много попыток. Попробуйте позже.");
  }
}

export async function handleAdminAuth(request: Request) {
  const headers = new Headers();
  try {
    if (request.method === "GET") {
      if (!adminConfigured()) {
        return privateJson({ authenticated: false, configured: false }, 200, headers);
      }
      try {
        const admin = requireAdmin(request, headers);
        return privateJson({ authenticated: true, email: admin.email }, 200, headers);
      } catch (error) {
        if (!(error instanceof AdminError) || error.status !== 401) throw error;
        return privateJson({ authenticated: false, configured: true }, 200, headers);
      }
    }
    assertOrigin(request);
    const body = await readBody(request, 2000);
    if (body.action === "logout") {
      const token = cookieValue(request);
      if (/^[0-9a-f]{64}$/.test(token) && storageConfigured()) {
        database().prepare("DELETE FROM lb_admin_sessions WHERE token_hash=?").run(tokenHash(token));
      }
      clearSession(headers);
      return privateJson({ ok: true }, 200, headers);
    }
    if (body.action !== "login" || !adminConfigured()) {
      throw new AdminError(503, "Вход в панель ещё не настроен.");
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    await rateLimit("admin-ip:" + ip, 12, 900);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    await rateLimit("admin-owner:" + email, 8, 900);
    const suppliedPassword = typeof body.password === "string" ? body.password : "";
    const expectedPassword = process.env.LB_ADMIN_PASSWORD ?? "";
    const equalLength = Buffer.from(suppliedPassword).length === Buffer.from(expectedPassword).length;
    const safeSupplied = createHash("sha256").update(suppliedPassword).digest();
    const safeExpected = createHash("sha256").update(expectedPassword).digest();
    const passwordOk = timingSafeEqual(safeSupplied, safeExpected);
    if (email !== emailOfOwner() || !equalLength || !passwordOk) {
      throw new AdminError(401, "Неверная почта или пароль.");
    }

    const now = Date.now();
    database().prepare("DELETE FROM lb_admin_sessions WHERE expires_at<=?").run(now);
    const token = randomBytes(32).toString("hex");
    database()
      .prepare("INSERT INTO lb_admin_sessions(token_hash,email,created_at,expires_at) VALUES(?,?,?,?)")
      .run(tokenHash(token), email, now, now + sessionSeconds * 1000);
    setSession(headers, token);
    return privateJson({ authenticated: true, email }, 200, headers);
  } catch (error) {
    return handleError(error, headers);
  }
}

export function handleError(error: unknown, headers = new Headers()) {
  if (error instanceof AdminError) {
    return privateJson({ error: error.message }, error.status, headers);
  }
  console.error("Local admin operation failed");
  return privateJson(
    { error: "Не получилось выполнить действие. Попробуйте ещё раз." },
    500,
    headers,
  );
}

type OrderInput = {
  requestId?: string;
  name: string;
  email: string;
  brief: string;
  services: readonly string[];
  rateKey?: string;
};

export async function saveIncomingOrder(input: OrderInput) {
  if (!storageConfigured()) return null;
  rateLimit("intake:" + (input.rateKey ?? "unknown"), 12, 600);
  const summary = summarizeServices(input.services);
  const snapshot = summary.chosen.map((item) => {
    const identity = serviceIdentity(item);
    return {
      id: item.n,
      code: identity.code,
      direction: identity.direction,
      name: item.name,
      amount: item.pricing === "quote" ? null : item.amount,
      items: item.items,
    };
  });
  const requestId = input.requestId && /^[0-9a-f-]{36}$/i.test(input.requestId)
    ? input.requestId
    : randomUUID();
  const id = randomUUID();
  const trackingCode = "LB-" + randomUUID().replace(/-/g, "").toUpperCase();
  const now = new Date().toISOString();
  const agreedScope = snapshot
    .map((item) => item.code + " — " + item.name + (item.items.length ? ": " + item.items.join("; ") : ""))
    .join("\n");

  const insert = database().prepare(`
    INSERT OR IGNORE INTO lb_orders (
      id,request_id,tracking_code,created_at,updated_at,public_updated_at,
      customer_name,customer_email,brief,services,advertising_total,development_total,
      catalog_total,has_custom,agreed_amount,agreed_scope,status,notes,
      terms_confirmed,paid,delivered,notification_status,progress_percent,service_progress,
      public_notice,public_notice_until
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'new','',0,0,0,'pending',0,'{}','',NULL)
  `);
  insert.run(
    id, requestId, trackingCode, now, now, now,
    input.name.trim().slice(0, 120) || "Клиент",
    input.email.trim().toLowerCase().slice(0, 254),
    input.brief.trim().slice(0, 4000) || "Заказ по выбранным услугам.",
    JSON.stringify(snapshot),
    summary.advertisingTotal,
    summary.developmentTotal,
    summary.total,
    summary.custom.length > 0 ? 1 : 0,
    summary.fixed.length ? summary.total : null,
    agreedScope.slice(0, 10000),
  );

  const row = database()
    .prepare("SELECT id,order_number,tracking_code FROM lb_orders WHERE request_id=?")
    .get(requestId) as { id: string; order_number: number; tracking_code: string } | undefined;
  if (!row) throw new AdminError(503, "Не удалось сохранить заявку.");
  return row;
}

export async function markNotification(id: string, status: "sent" | "failed") {
  database()
    .prepare("UPDATE lb_orders SET notification_status=?,updated_at=? WHERE id=?")
    .run(status, new Date().toISOString(), id);
}

function toOrder(row: Record<string, unknown>) {
  const parsed = { ...row } as Record<string, unknown>;
  for (const field of ["services", "service_progress"]) {
    try {
      parsed[field] = JSON.parse(String(row[field] ?? (field === "services" ? "[]" : "{}")));
    } catch {
      parsed[field] = field === "services" ? [] : {};
    }
  }
  for (const field of ["terms_confirmed", "paid", "delivered", "has_custom"]) {
    parsed[field] = Boolean(row[field]);
  }
  parsed.order_number = Number(row.order_number);
  parsed.version = Number(row.version);
  parsed.advertising_total = Number(row.advertising_total);
  parsed.development_total = Number(row.development_total);
  parsed.catalog_total = Number(row.catalog_total);
  parsed.progress_percent = Number(row.progress_percent ?? 0);
  return parsed;
}

export async function handleOrders(request: Request) {
  const headers = new Headers();
  try {
    const admin = requireAdmin(request, headers);
    const db = database();
    if (request.method === "GET") {
      const id = new URL(request.url).searchParams.get("id");
      if (id) {
        if (!/^[0-9a-f-]{36}$/i.test(id)) throw new AdminError(400, "Некорректный номер заказа");
        const row = db.prepare("SELECT * FROM lb_orders WHERE id=? AND deleted_at IS NULL").get(id) as Record<string, unknown> | undefined;
        if (!row) throw new AdminError(404, "Заказ не найден");
        const historyRows = db.prepare("SELECT * FROM lb_order_history WHERE order_id=? ORDER BY created_at DESC LIMIT 100").all(id) as Record<string, unknown>[];
        const history = historyRows.map((item) => {
          let changes: unknown = {};
          try { changes = JSON.parse(String(item.changes)); } catch {}
          return { ...item, changes };
        });
        return privateJson({ order: toOrder(row), history }, 200, headers);
      }
      const rows = db.prepare(`
        SELECT id,order_number,customer_name,customer_email,status,agreed_amount,due_date,
          created_at,updated_at,version,catalog_total,has_custom,terms_confirmed,notification_status
        FROM lb_orders WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 300
      `).all() as Record<string, unknown>[];
      return privateJson({ orders: rows.map(toOrder) }, 200, headers);
    }

    assertOrigin(request);
    const body = await readBody(request);
    if (typeof body.id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.id) || !Number.isInteger(body.version)) {
      throw new AdminError(400, "Некорректный заказ");
    }
    const id = body.id;
    const version = Number(body.version);
    const current = db.prepare("SELECT * FROM lb_orders WHERE id=? AND deleted_at IS NULL").get(id) as Record<string, unknown> | undefined;
    if (!current) throw new AdminError(404, "Заказ не найден");
    if (Number(current.version) !== version) {
      throw new AdminError(409, "Заказ изменился. Обновите карточку перед сохранением.");
    }

    if (request.method === "DELETE") {
      if (body.confirm !== "delete") throw new AdminError(400, "Подтвердите удаление заказа");
      const now = new Date().toISOString();
      const changes = { deleted_at: { before: null, after: now } };
      const result = db.transaction(() => {
        const update = db.prepare("UPDATE lb_orders SET deleted_at=?,updated_at=?,version=version+1 WHERE id=? AND version=? AND deleted_at IS NULL").run(now, now, id, version);
        if (update.changes !== 1) throw new AdminError(409, "Заказ изменился. Обновите карточку перед удалением.");
        db.prepare("INSERT INTO lb_order_history(id,order_id,created_at,actor_email,changes) VALUES(?,?,?,?,?)")
          .run(randomUUID(), id, now, admin.email, JSON.stringify(changes));
      });
      result();
      return privateJson({ ok: true }, 200, headers);
    }

    const validated = validateOrderPatch(body.patch);
    if (validated.error || !validated.patch) throw new AdminError(400, validated.error ?? "Некорректные данные");
    const patch = validated.patch;
    const before = toOrder(current);
    const publicFields = new Set([
      "status", "agreed_amount", "due_date", "terms_confirmed", "paid", "delivered",
      "progress_percent", "service_progress", "public_notice", "public_notice_until",
    ]);
    const changed: Record<string, { before: unknown; after: unknown }> = {};
    for (const [key, value] of Object.entries(patch)) {
      if (JSON.stringify(before[key]) !== JSON.stringify(value)) {
        changed[key] = { before: before[key], after: value };
      }
    }
    const now = new Date().toISOString();
    const publicChanged = Object.keys(changed).some((key) => publicFields.has(key));
    const publicUpdatedAt = publicChanged ? now : String(current.public_updated_at);
    const update = db.prepare(`
      UPDATE lb_orders SET
        customer_name=?, customer_email=?, agreed_amount=?, due_date=?, agreed_scope=?,
        status=?, notes=?, terms_confirmed=?, paid=?, delivered=?, progress_percent=?,
        service_progress=?, public_notice=?, public_notice_until=?, public_updated_at=?,
        updated_at=?, version=version+1
      WHERE id=? AND version=? AND deleted_at IS NULL
    `);
    const tx = db.transaction(() => {
      const result = update.run(
        patch.customer_name, patch.customer_email, patch.agreed_amount, patch.due_date,
        patch.agreed_scope, patch.status, patch.notes, patch.terms_confirmed ? 1 : 0,
        patch.paid ? 1 : 0, patch.delivered ? 1 : 0, patch.progress_percent,
        JSON.stringify(patch.service_progress), patch.public_notice, patch.public_notice_until,
        publicUpdatedAt, now, id, version,
      );
      if (result.changes !== 1) throw new AdminError(409, "Заказ изменён в другой вкладке. Обновите его перед сохранением.");
      if (Object.keys(changed).length) {
        db.prepare("INSERT INTO lb_order_history(id,order_id,created_at,actor_email,changes) VALUES(?,?,?,?,?)")
          .run(randomUUID(), id, now, admin.email, JSON.stringify(changed));
      }
    });
    tx();
    const updated = db.prepare("SELECT * FROM lb_orders WHERE id=?").get(id) as Record<string, unknown>;
    return privateJson({ order: toOrder(updated) }, 200, headers);
  } catch (error) {
    return handleError(error, headers);
  }
}

export async function handleTracking(request: Request) {
  try {
    assertOrigin(request);
    const body = await readBody(request, 2000);
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase().replace(/\s/g, "") : "";
    if (!/^LB-[0-9A-F]{32}$/.test(code)) {
      throw new AdminError(404, "Заказ не найден. Проверьте код отслеживания.");
    }
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    rateLimit("tracking:" + ip, 30, 600);
    const row = database().prepare(`
      SELECT order_number,status,services,terms_confirmed,agreed_amount,due_date,paid,delivered,
        public_notice,public_notice_until,public_updated_at,progress_percent,service_progress
      FROM lb_orders WHERE tracking_code=? AND deleted_at IS NULL
    `).get(code) as Record<string, unknown> | undefined;
    if (!row) throw new AdminError(404, "Заказ не найден. Проверьте код отслеживания.");
    const services = (() => {
      try { return JSON.parse(String(row.services)) as Array<{ code: string; name: string }>; }
      catch { return []; }
    })();
    let serviceProgress: Record<string, string> = {};
    try { serviceProgress = JSON.parse(String(row.service_progress)); } catch {}
    const noticeUntil = row.public_notice_until ? Date.parse(String(row.public_notice_until)) : 0;
    return privateJson({
      order: {
        number: Number(row.order_number),
        status: row.status,
        progress: Number(row.progress_percent ?? 0),
        services: services.map((service) => ({
          code: service.code,
          name: service.name,
          status: serviceProgress[service.code] ?? "pending",
        })),
        amount: row.terms_confirmed ? row.agreed_amount : null,
        dueDate: row.terms_confirmed ? row.due_date : null,
        paid: Boolean(row.paid),
        delivered: Boolean(row.delivered),
        notice: !noticeUntil || noticeUntil > Date.now() ? row.public_notice : "",
        updatedAt: row.public_updated_at,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
