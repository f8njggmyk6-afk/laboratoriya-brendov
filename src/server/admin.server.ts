import { createClient, type Session } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";
import { summarizeServices, serviceIdentity } from "../site/serviceCatalog";
import { validateOrderPatch } from "../admin/model";

export class AdminError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const cookieAccess = "__Host-lb_admin_access",
  cookieRefresh = "__Host-lb_admin_refresh";
export function adminConfigured() {
  return !!(
    process.env.LB_ADMIN_ENABLED === "true" &&
    process.env.LB_SUPABASE_URL &&
    process.env.LB_ADMIN_GATEWAY_TOKEN &&
    process.env.LB_ADMIN_EMAIL
  );
}
function database() {
  if (!adminConfigured())
    throw new AdminError(
      503,
      "Панель подготовлена. Для входа нужно завершить подключение базы заказов.",
    );
  return createClient(
    process.env.LB_SUPABASE_URL!,
    process.env.LB_ADMIN_GATEWAY_TOKEN!,
    {
      global: { fetch: gatewayFetch },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
// The project service key stays inside Supabase. Only this server holds the gateway token.
async function gatewayFetch(input: RequestInfo | URL, init?: RequestInit) {
  const request = new Request(input, init);
  const project = new URL(process.env.LB_SUPABASE_URL!);
  const target = new URL(request.url);
  if (target.origin !== project.origin)
    throw new Error("Unexpected database host");
  return fetch(new URL("/functions/v1/lb-admin-gateway", project), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-LB-Gateway-Token": process.env.LB_ADMIN_GATEWAY_TOKEN!,
    },
    body: JSON.stringify({
      path: target.pathname + target.search,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body:
        request.method === "GET" || request.method === "HEAD"
          ? null
          : await request.text(),
    }),
    signal: request.signal,
    redirect: "error",
  });
}
const ownerEmail = () => process.env.LB_ADMIN_EMAIL?.trim().toLowerCase();
export function assertOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    throw new AdminError(403, "Запрос с другого сайта запрещён");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new AdminError(415, "Нужен JSON-запрос");
}
export async function readBody(request: Request, max = 24000) {
  const body = await request.text();
  if (new TextEncoder().encode(body).length > max)
    throw new AdminError(413, "Слишком большой запрос");
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    throw new AdminError(400, "Некорректный JSON");
  }
}
export function privateJson(
  value: unknown,
  status = 200,
  headers = new Headers(),
) {
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("Vary", "Cookie");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  headers.set("Pragma", "no-cache");
  return Response.json(value, { status, headers });
}
function cookies(request: Request) {
  return Object.fromEntries(
    (request.headers.get("cookie") ?? "").split(";").map((part) => {
      const i = part.indexOf("=");
      return i < 0 ? ["", ""] : [part.slice(0, i).trim(), part.slice(i + 1)];
    }),
  );
}
function setSession(headers: Headers, session: Session) {
  headers.append(
    "Set-Cookie",
    `${cookieAccess}=${session.access_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${session.expires_in}`,
  );
  headers.append(
    "Set-Cookie",
    `${cookieRefresh}=${session.refresh_token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
  );
}
export function clearSession(headers: Headers) {
  for (const name of [cookieAccess, cookieRefresh])
    headers.append(
      "Set-Cookie",
      `${name}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
    );
}
export async function requireAdmin(request: Request, headers: Headers) {
  const jar = cookies(request),
    token = jar[cookieAccess],
    refresh = jar[cookieRefresh];
  if (!token && !refresh) throw new AdminError(401, "Войдите в панель");
  const db = database();
  let activeToken = token;
  let result = token ? await db.auth.getUser(token) : null;
  if ((!result || result.error) && refresh) {
    const renewed = await db.auth.refreshSession({ refresh_token: refresh });
    if (!renewed.error && renewed.data.session) {
      setSession(headers, renewed.data.session);
      activeToken = renewed.data.session.access_token;
      result = await db.auth.getUser(renewed.data.session.access_token);
    }
  }
  const user = result?.data.user;
  if (
    !user ||
    result?.error ||
    !user.email_confirmed_at ||
    user.email?.toLowerCase() !== ownerEmail()
  ) {
    clearSession(headers);
    throw new AdminError(401, "Сессия закончилась. Войдите снова.");
  }
  return { email: user.email!, id: user.id, token: activeToken ?? "" };
}
async function rateLimit(key: string, limit: number, seconds: number) {
  const hash = createHash("sha256").update(key).digest("hex");
  const { data, error } = await database().rpc("lb_admin_rate_limit", {
    p_key: hash,
    p_limit: limit,
    p_seconds: seconds,
  });
  if (error) throw new AdminError(503, "Вход временно недоступен");
  if (data !== true)
    throw new AdminError(429, "Слишком много попыток. Попробуйте позже.");
}
export async function handleAdminAuth(request: Request) {
  const headers = new Headers();
  try {
    if (request.method === "GET") {
      if (!adminConfigured())
        return privateJson(
          { authenticated: false, configured: false },
          200,
          headers,
        );
      const user = await requireAdmin(request, headers);
      return privateJson(
        { authenticated: true, email: user.email },
        200,
        headers,
      );
    }
    assertOrigin(request);
    const body = await readBody(request, 2000);
    if (body.action === "logout") {
      try {
        const user = await requireAdmin(request, headers);
        if (user.token)
          await database().auth.admin.signOut(user.token, "local");
      } catch {}
      clearSession(headers);
      return privateJson({ ok: true }, 200, headers);
    }
    if (!adminConfigured())
      throw new AdminError(
        503,
        "Для входа нужно завершить подключение базы заказов.",
      );
    const ip =
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    await rateLimit("auth-ip:" + ip, 12, 900);
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email !== ownerEmail())
      throw new AdminError(403, "Вход доступен только владельцу");
    if (body.action === "request") {
      await rateLimit("owner-code:" + email, 1, 60);
      const key = process.env.RESEND_API_KEY,
        from = process.env.RESEND_FROM_EMAIL;
      if (!key || !from)
        throw new AdminError(503, "Не подключена отправка кода входа");
      const { data, error } = await database().auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      if (error || !data.properties?.email_otp)
        throw new AdminError(503, "Не удалось создать код входа");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: "Код входа — Лаборатория брендов",
          text: `Код для входа в панель заказов: ${data.properties.email_otp}\n\nВведите код только на https://laboratoriyabrendov.com/admin. Если вы не запрашивали вход, не передавайте этот код.`,
        }),
      });
      if (!response.ok)
        throw new AdminError(
          503,
          "Не удалось отправить код. Попробуйте позже.",
        );
      return privateJson({ ok: true }, 200, headers);
    }
    if (body.action === "verify") {
      if (typeof body.code !== "string" || !/^\d{6,10}$/.test(body.code))
        throw new AdminError(400, "Введите код из письма");
      await rateLimit("owner-verify:" + email, 8, 900);
      const { data, error } = await database().auth.verifyOtp({
        email,
        token: body.code,
        type: "email",
      });
      if (
        error ||
        !data.session ||
        !data.user?.email_confirmed_at ||
        data.user.email?.toLowerCase() !== ownerEmail()
      )
        throw new AdminError(401, "Код неверный или уже истёк");
      setSession(headers, data.session);
      return privateJson({ authenticated: true, email }, 200, headers);
    }
    throw new AdminError(400, "Неизвестное действие");
  } catch (error) {
    return handleError(error, headers);
  }
}
export function handleError(error: unknown, headers = new Headers()) {
  if (error instanceof AdminError)
    return privateJson({ error: error.message }, error.status, headers);
  console.error("Admin operation failed");
  return privateJson(
    { error: "Не получилось выполнить действие. Попробуйте ещё раз." },
    500,
    headers,
  );
}
export async function handleOrders(request: Request) {
  const headers = new Headers();
  try {
    const admin = await requireAdmin(request, headers);
    if (request.method === "GET") {
      const id = new URL(request.url).searchParams.get("id");
      if (id) {
        if (!/^[0-9a-f-]{36}$/i.test(id))
          throw new AdminError(400, "Некорректный номер заказа");
        const db = database();
        const [order, history] = await Promise.all([
          db.from("lb_orders").select("*").eq("id", id).single(),
          db
            .from("lb_order_history")
            .select("*")
            .eq("order_id", id)
            .order("created_at", { ascending: false })
            .limit(100),
        ]);
        if (order.error)
          throw new AdminError(
            order.error.code === "PGRST116" ? 404 : 503,
            "Не удалось загрузить заказ",
          );
        if (history.error)
          throw new AdminError(503, "Не удалось загрузить историю");
        return privateJson(
          { order: order.data, history: history.data },
          200,
          headers,
        );
      }
      const { data, error } = await database()
        .from("lb_orders")
        .select(
          "id,order_number,customer_name,customer_email,status,agreed_amount,due_date,created_at,updated_at,version,catalog_total,has_custom,terms_confirmed,notification_status",
        )
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw new AdminError(503, "Не удалось загрузить заявки");
      return privateJson({ orders: data }, 200, headers);
    }
    assertOrigin(request);
    const body = await readBody(request);
    if (
      typeof body.id !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(body.id) ||
      !Number.isInteger(body.version)
    )
      throw new AdminError(400, "Некорректный заказ");
    const { patch, error } = validateOrderPatch(body.patch);
    if (error || !patch)
      throw new AdminError(400, error ?? "Некорректные данные");
    const result = await database().rpc("lb_admin_update_order", {
      p_id: body.id,
      p_version: body.version,
      p_patch: patch,
      p_actor: admin.email,
    });
    if (result.error) {
      if (result.error.message.includes("version_conflict"))
        throw new AdminError(
          409,
          "Заказ изменён в другой вкладке. Обновите его перед сохранением.",
        );
      throw new AdminError(503, "Не удалось сохранить заказ");
    }
    return privateJson({ order: result.data }, 200, headers);
  } catch (error) {
    return handleError(error, headers);
  }
}
export async function saveIncomingOrder(input: {
  requestId?: string;
  name: string;
  email: string;
  brief: string;
  services: readonly string[];
  rateKey?: string;
}) {
  if (!adminConfigured()) return null;
  await rateLimit("intake:" + (input.rateKey ?? "unknown"), 12, 600);
  const summary = summarizeServices(input.services);
  const snapshot = summary.chosen.map((item) => ({
    id: item.n,
    code: serviceIdentity(item).code,
    direction: serviceIdentity(item).direction,
    name: item.name,
    amount: item.pricing === "quote" ? null : item.amount,
    items: item.items,
  }));
  const requestId =
    input.requestId && /^[0-9a-f-]{36}$/i.test(input.requestId)
      ? input.requestId
      : randomUUID();
  const db = database();
  const { data, error } = await db
    .from("lb_orders")
    .upsert(
      {
        request_id: requestId,
        customer_name: input.name,
        customer_email: input.email,
        brief: input.brief,
        services: snapshot,
        advertising_total: summary.advertisingTotal,
        development_total: summary.developmentTotal,
        catalog_total: summary.total,
        has_custom: summary.custom.length > 0,
        agreed_amount: summary.fixed.length ? summary.total : null,
        agreed_scope: snapshot
          .map(
            (item) =>
              item.code +
              " — " +
              item.name +
              (item.items.length ? ": " + item.items.join("; ") : ""),
          )
          .join("\n"),
      },
      { onConflict: "request_id", ignoreDuplicates: true },
    )
    .select("id,order_number,tracking_code")
    .maybeSingle();
  if (error) throw new AdminError(503, "Не удалось сохранить заявку");
  if (data)
    return data as { id: string; order_number: number; tracking_code: string };
  const existing = await db
    .from("lb_orders")
    .select("id,order_number,tracking_code")
    .eq("request_id", requestId)
    .single();
  if (existing.error)
    throw new AdminError(503, "Не удалось проверить сохранение заявки");
  return existing.data as {
    id: string;
    order_number: number;
    tracking_code: string;
  };
}
export async function markNotification(id: string, status: "sent" | "failed") {
  const { error } = await database()
    .from("lb_orders")
    .update({ notification_status: status })
    .eq("id", id);
  if (error) console.error("Order notification status was not updated");
}

// A capability code grants read-only access to this limited public projection only.
export async function handleTracking(request: Request) {
  try {
    assertOrigin(request);
    const body = await readBody(request, 2000);
    const code =
      typeof body.code === "string"
        ? body.code.trim().toUpperCase().replace(/\s/g, "")
        : "";
    if (!/^LB-[0-9A-F]{32}$/.test(code))
      throw new AdminError(404, "Заказ не найден. Проверьте код отслеживания.");
    const ip =
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    await rateLimit("tracking:" + ip, 30, 600);
    const { data, error } = await database()
      .from("lb_orders")
      .select(
        "order_number,status,services,terms_confirmed,agreed_amount,due_date,paid,delivered,public_notice,public_notice_until,public_updated_at",
      )
      .eq("tracking_code", code)
      .maybeSingle();
    if (error)
      throw new AdminError(
        503,
        "Не удалось обновить статус. Попробуйте позже.",
      );
    if (!data)
      throw new AdminError(404, "Заказ не найден. Проверьте код отслеживания.");
    return privateJson({
      order: {
        number: data.order_number,
        status: data.status,
        services: (Array.isArray(data.services) ? data.services : []).map(
          (s: { code: string; name: string }) => ({
            code: s.code,
            name: s.name,
          }),
        ),
        amount: data.terms_confirmed ? data.agreed_amount : null,
        dueDate: data.terms_confirmed ? data.due_date : null,
        paid: data.paid,
        delivered: data.delivered,
        notice:
          !data.public_notice_until ||
          Date.parse(data.public_notice_until) > Date.now()
            ? data.public_notice
            : "",
        updatedAt: data.public_updated_at,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
