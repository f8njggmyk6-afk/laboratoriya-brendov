import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import * as model from "../src/admin/model.ts";
import { noticePreset } from "../src/admin/notices.ts";
const require = createRequire(import.meta.url);
const good = "LB-" + "A".repeat(32);
let queryCount = 0,
  allowed = true,
  fields = "",
  fail = false;
let row = {
  id: "internal-id",
  customer_name: "Private name",
  customer_email: "private@example.com",
  notes: "PRIVATE NOTES",
  brief: "PRIVATE BRIEF",
  order_number: 42,
  status: "in_progress",
  services: [
    { code: "DEV01", name: "Project", items: ["PRIVATE SCOPE"], amount: 999 },
  ],
  terms_confirmed: true,
  agreed_amount: 5000,
  due_date: "2026-11-01",
  paid: false,
  delivered: false,
  public_notice: "Work continues",
  public_notice_until: null,
  public_updated_at: "2026-10-24T12:00:00Z",
};
const db = {
  rpc: async () => ({ data: allowed, error: null }),
  from: (name) => {
    assert.equal(name, "lb_orders");
    queryCount++;
    return {
      select(value) {
        fields = value;
        return this;
      },
      eq(key, value) {
        assert.equal(key, "tracking_code");
        this.code = value;
        return this;
      },
      maybeSingle() {
        return Promise.resolve({
          data: this.code === good ? row : null,
          error: fail ? { message: "Database issue" } : null,
        });
      },
    };
  },
};
const sandbox = {
  exports: {},
  require: (id) =>
    id === "@supabase/supabase-js"
      ? { createClient: () => db }
      : id === "../site/serviceCatalog"
        ? {}
        : id === "../admin/model"
          ? model
          : require(id),
  process: {
    env: {
      LB_ADMIN_ENABLED: "true",
      LB_SUPABASE_URL: "https://test.supabase.co",
      LB_ADMIN_GATEWAY_TOKEN: "test-key",
      LB_ADMIN_EMAIL: "owner@example.com",
    },
  },
  Request,
  Response,
  Headers,
  URL,
  TextEncoder,
  console,
  Date,
};
vm.runInNewContext(
  ts.transpileModule(fs.readFileSync("src/server/admin.server.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText,
  sandbox,
);
const request = (code, origin = "https://laboratoriyabrendov.com") =>
  new Request("https://laboratoriyabrendov.com/api/tracking", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
const track = sandbox.exports.handleTracking;
assert.equal((await track(request("ЛБ-00042"))).status, 404);
assert.equal(queryCount, 0);
assert.equal((await track(request(good, "https://other.example"))).status, 403);
assert.equal(queryCount, 0);
assert.equal((await track(request("LB-" + "B".repeat(32)))).status, 404);
let response = await track(request(good.toLowerCase()));
assert.equal(response.status, 200);
assert.match(response.headers.get("cache-control"), /no-store/);
let data = await response.json();
assert.equal(data.order.number, 42);
assert.equal(data.order.amount, 5000);
assert.equal(data.order.notice, "Work continues");
const raw = JSON.stringify(data);
for (const secret of [
  "Private name",
  "private@example.com",
  "PRIVATE NOTES",
  "PRIVATE BRIEF",
  "PRIVATE SCOPE",
  "internal-id",
  good,
])
  assert.equal(raw.includes(secret), false, secret);
assert.deepEqual(
  Object.keys(data.order).sort(),
  [
    "number",
    "status",
    "services",
    "amount",
    "dueDate",
    "paid",
    "delivered",
    "notice",
    "updatedAt",
  ].sort(),
);
assert.equal(fields.includes("notes"), false);
assert.equal(fields.includes("customer_email"), false);
assert.equal(fields.includes("brief"), false);
row = {
  ...row,
  terms_confirmed: false,
  public_notice_until: "2020-01-01T00:00:00Z",
};
data = await (await track(request(good))).json();
assert.equal(data.order.amount, null);
assert.equal(data.order.dueDate, null);
assert.equal(data.order.notice, "");
allowed = false;
const before = queryCount;
assert.equal((await track(request(good))).status, 429);
assert.equal(queryCount, before);
allowed = true;
fail = true;
assert.equal((await track(request(good))).status, 503);
fail = false;
const now = new Date("2026-10-24T12:00:00Z");
assert.equal(
  noticePreset("break", now).public_notice_until,
  "2026-10-24T14:00:00.000Z",
);
assert.match(noticePreset("break", now).public_notice, /17:00 МСК/);
assert.equal(noticePreset("clear").public_notice, "");
const base = {
  customer_name: "Client",
  customer_email: "client@example.com",
  agreed_amount: 5000,
  due_date: "2026-11-01",
  agreed_scope: "Project",
  status: "payment",
  notes: "Private",
  terms_confirmed: true,
  paid: false,
  delivered: false,
  public_notice: "Update",
  public_notice_until: null,
};
assert.ok(model.validateOrderPatch(base).patch);
assert.ok(model.validateOrderPatch({ ...base, status: "handover" }).error);
assert.ok(
  model.validateOrderPatch({ ...base, status: "handover", paid: true }).patch,
);
assert.ok(
  model.validateOrderPatch({ ...base, public_notice: "X".repeat(601) }).error,
);
assert.ok(
  model.validateOrderPatch({ ...base, public_notice_until: "not-a-date" })
    .error,
);
assert.ok(
  model.validateOrderPatch({
    ...base,
    status: "completed",
    paid: true,
    delivered: true,
  }).patch,
);
console.log(
  "PASS tracking: unguessable-code lookup, narrow public projection, private-field exclusion, origin/rate checks, hidden unconfirmed amounts, expired notices, stage/payment rules and Moscow presets. No real messages sent.",
);
