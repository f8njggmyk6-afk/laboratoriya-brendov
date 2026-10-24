import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import * as model from "../src/admin/model.ts";
import * as catalog from "../src/site/serviceCatalog.ts";
const require = createRequire(import.meta.url);
const config = {
  LB_ADMIN_ENABLED: "true",
  LB_SUPABASE_URL: "https://unit-test.supabase.co",
  LB_ADMIN_GATEWAY_TOKEN: "unit-test-server-key",
  LB_ADMIN_EMAIL: "owner@example.com",
  RESEND_API_KEY: "unit-test",
  RESEND_FROM_EMAIL: "Lab <lab@example.com>",
};
const owner = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "owner@example.com",
  email_confirmed_at: "2026-10-24T00:00:00Z",
};
let user = owner,
  rpcError = null,
  rpcCalls = [],
  writes = [],
  mail = [],
  generated = 0,
  selected = 0,
  lastInsert,
  dbCreated = 0;
const basePatch = {
  customer_name: "Client",
  customer_email: "client@example.com",
  agreed_amount: 15000,
  due_date: "2026-10-30",
  agreed_scope: "One landing page",
  status: "discussion",
  notes: "",
  terms_confirmed: false,
  paid: false,
  delivered: false,
};
const fakeRow = {
  id: "22222222-2222-4222-8222-222222222222",
  order_number: 1,
  version: 1,
  ...basePatch,
};
function table(name) {
  return {
    mode: "read",
    upsert(value) {
      this.mode = "insert";
      lastInsert = value;
      writes.push({ table: name, value });
      return this;
    },
    update(value) {
      this.mode = "update";
      writes.push({ table: name, value });
      return this;
    },
    select() {
      selected++;
      return this;
    },
    eq() {
      return this;
    },
    order() {
      return this;
    },
    limit() {
      return Promise.resolve({ data: [fakeRow], error: null });
    },
    single() {
      return Promise.resolve({ data: fakeRow, error: null });
    },
    maybeSingle() {
      return Promise.resolve({
        data: { id: fakeRow.id, order_number: 1 },
        error: null,
      });
    },
    then(resolve, reject) {
      return Promise.resolve({ error: null, data: null }).then(resolve, reject);
    },
  };
}
const db = {
  auth: {
    getUser: async () => ({ data: { user }, error: null }),
    refreshSession: async () => ({
      data: { session: null },
      error: { message: "expired" },
    }),
    verifyOtp: async () => ({
      data: {
        user,
        session: {
          access_token: "verified-access",
          refresh_token: "verified-refresh",
          expires_in: 3600,
        },
      },
      error: null,
    }),
    admin: {
      generateLink: async () => {
        generated++;
        return { data: { properties: { email_otp: "123456" } }, error: null };
      },
      signOut: async () => ({ error: null }),
    },
  },
  from: table,
  rpc: async (name, args) => {
    rpcCalls.push({ name, args });
    return {
      data:
        name === "lb_admin_rate_limit"
          ? true
          : { ...fakeRow, ...args.p_patch, version: 2 },
      error: rpcError,
    };
  },
};
const sandbox = {
  exports: {},
  require: (id) =>
    id === "@supabase/supabase-js"
      ? {
          createClient: () => {
            dbCreated++;
            return db;
          },
        }
      : id === "../site/serviceCatalog"
        ? catalog
        : id === "../admin/model"
          ? model
          : require(id),
  process: { env: { ...config } },
  console,
  Request,
  Response,
  Headers,
  URL,
  TextEncoder,
  fetch: async (url, options) => {
    mail.push({ url, body: JSON.parse(options.body) });
    return Response.json({ id: "mock" });
  },
};
const code = ts.transpileModule(
  fs.readFileSync("src/server/admin.server.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } },
).outputText;
vm.runInNewContext(code, sandbox);
const admin = sandbox.exports;
const request = (
  path,
  method = "GET",
  body,
  authenticated = false,
  origin = "https://laboratoriyabrendov.com",
) =>
  new Request("https://laboratoriyabrendov.com/api/admin/" + path, {
    method,
    headers: {
      ...(authenticated
        ? { cookie: "__Host-lb_admin_access=checked-on-server" }
        : {}),
      ...(body ? { "Content-Type": "application/json", Origin: origin } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
let response = await admin.handleOrders(request("orders"));
assert.equal(response.status, 401);
assert.equal(dbCreated, 0);
assert.equal(selected, 0);
user = {
  ...owner,
  email: "customer@example.com",
  user_metadata: { role: "admin", email: owner.email },
};
response = await admin.handleOrders(request("orders", "GET", null, true));
assert.equal(response.status, 401);
assert.equal(selected, 0);
user = owner;
response = await admin.handleOrders(request("orders", "GET", null, true));
assert.equal(response.status, 200);
assert.match(response.headers.get("cache-control"), /no-store/);
response = await admin.handleOrders(
  request(
    "orders",
    "PATCH",
    { id: fakeRow.id, version: 1, patch: basePatch },
    true,
    "https://other.example",
  ),
);
assert.equal(response.status, 403);
assert.equal(rpcCalls.length, 0);
response = await admin.handleOrders(
  request(
    "orders",
    "PATCH",
    {
      id: fakeRow.id,
      version: 1,
      patch: { ...basePatch, status: "in_progress" },
    },
    true,
  ),
);
assert.equal(response.status, 400);
assert.equal(rpcCalls.length, 0);
response = await admin.handleOrders(
  request(
    "orders",
    "PATCH",
    {
      id: fakeRow.id,
      version: 1,
      patch: { ...basePatch, status: "in_progress", terms_confirmed: true },
    },
    true,
  ),
);
assert.equal(response.status, 200);
assert.equal(rpcCalls.at(-1).args.p_actor, owner.email);
rpcError = { message: "version_conflict" };
response = await admin.handleOrders(
  request(
    "orders",
    "PATCH",
    { id: fakeRow.id, version: 1, patch: basePatch },
    true,
  ),
);
assert.equal(response.status, 409);
rpcError = null;
response = await admin.handleAdminAuth(
  request("auth", "POST", { action: "request", email: "stranger@example.com" }),
);
assert.equal(response.status, 403);
assert.equal(generated, 0);
assert.equal(mail.length, 0);
response = await admin.handleAdminAuth(
  request("auth", "POST", { action: "request", email: owner.email }),
);
assert.equal(response.status, 200);
assert.equal(mail.length, 1);
assert.deepEqual(mail[0].body.to, [owner.email]);
assert.match(mail[0].body.text, /123456/);
response = await admin.handleAdminAuth(
  request("auth", "POST", {
    action: "verify",
    email: owner.email,
    code: "123456",
  }),
);
assert.equal(response.status, 200);
assert.match(
  response.headers.get("set-cookie"),
  /HttpOnly; Secure; SameSite=Strict/,
);
assert(!JSON.stringify(await response.json()).includes("verified-access"));
await admin.saveIncomingOrder({
  name: "Client",
  email: "client@example.com",
  brief: "Test",
  services: ["08", "23", "dev-custom"],
});
assert.equal(lastInsert.catalog_total, 241500);
assert.equal(lastInsert.advertising_total, 4000);
assert.equal(lastInsert.development_total, 237500);
assert.equal(lastInsert.has_custom, true);
assert.equal(lastInsert.services.at(-1).amount, null);
assert(
  model.validateOrderPatch({
    ...basePatch,
    status: "completed",
    terms_confirmed: true,
  }).error,
);
assert(
  model.validateOrderPatch({
    ...basePatch,
    status: "completed",
    terms_confirmed: true,
    paid: true,
    delivered: true,
  }).patch,
);
assert(
  model.validateOrderPatch({ ...basePatch, due_date: "2026-02-30" }).error,
);
assert(model.validateOrderPatch({ ...basePatch, agreed_amount: 12.34 }).patch);
assert(model.validateOrderPatch({ ...basePatch, agreed_amount: 12.345 }).error);
assert(
  model.validateOrderPatch({ ...basePatch, agreed_amount: Infinity }).error,
);
assert(
  model.validateOrderPatch({
    ...basePatch,
    agreed_amount: null,
    status: "in_progress",
    terms_confirmed: true,
  }).error,
);
sandbox.process.env = {};
response = await admin.handleAdminAuth(request("auth"));
assert.equal((await response.json()).configured, false);
assert.equal(
  await admin.saveIncomingOrder({
    name: "A",
    email: "a@example.com",
    brief: "B",
    services: [],
  }),
  null,
);
// Invoke actual contact handler with failed notification after durable storage.
let notificationStatus,
  failStorage = false;
const contactContext = {
  exports: {},
  require: (id) =>
    id === "@tanstack/react-router"
      ? { createFileRoute: () => (config) => config }
      : id.includes("admin.server")
        ? {
            saveIncomingOrder: async () => {
              if (failStorage) throw Error("storage");
              return { id: fakeRow.id, order_number: 7 };
            },
            markNotification: async (_id, status) => {
              notificationStatus = status;
            },
          }
        : catalog,
  process: {
    env: {
      RESEND_API_KEY: "test",
      RESEND_FROM_EMAIL: "lab@example.com",
      NOTIFY_TO_EMAIL: owner.email,
    },
  },
  console: { error: () => {} },
  Response,
  fetch: async () => new Response("mail failed", { status: 500 }),
};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/routes/api/contact.tsx", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  contactContext,
);
const submit = () =>
  new Request("https://laboratoriyabrendov.com/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Client",
      email: "client@example.com",
      brief: "Test",
      services: ["23"],
      total: 1,
    }),
  });
response = await contactContext.exports.Route.server.handlers.POST({
  request: submit(),
});
assert.equal(response.status, 200);
assert.equal((await response.json()).orderNumber, 7);
assert.equal(notificationStatus, "failed");
failStorage = true;
response = await contactContext.exports.Route.server.handlers.POST({
  request: submit(),
});
assert.equal(response.status, 503);
// Installation script must not grant browser roles access or use elevated SQL functions.
const sql = fs.readFileSync("docs/admin-database.sql", "utf8");
assert(!/security definer/i.test(sql));
assert(!/grant .* to (anon|authenticated)/i.test(sql));
for (const table of ["lb_orders", "lb_order_history", "lb_admin_rate_limits"])
  assert(sql.includes(`alter table public.${table} enable row level security`));
console.log(
  "PASS: owner-only auth, anonymous denial, CSRF, HttpOnly cookies, agreement validation, version conflicts, server totals, durable intake and failed notifications. All transports mocked; no emails or live DB changes.",
);
