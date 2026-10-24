import { gatewayTokenHash, ownerEmail } from "./config.ts";

// A server-to-server gateway. No CORS, browser access, or project secrets in responses.
const json = (error: string, status: number) => Response.json({ error }, {
  status, headers: { "Cache-Control": "private, no-store" },
});

export async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json("Unauthorized", 401);
  const token = request.headers.get("x-lb-gateway-token") ?? "";
  if (token.length < 32 || token.length > 256) return json("Unauthorized", 401);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
  const expected = gatewayTokenHash.match(/../g)!.map((part) => parseInt(part, 16));
  let mismatch = 0;
  for (let i = 0; i < digest.length; i++) mismatch |= digest[i] ^ expected[i];
  if (mismatch) return json("Unauthorized", 401);
  try {
    if (Number(request.headers.get("content-length") ?? 0) > 100000) return json("Too large", 413);
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > 100000) return json("Too large", 413);
    const payload = JSON.parse(raw);
    if (typeof payload.path !== "string" || !payload.path.startsWith("/") || payload.path.startsWith("//") || /[\\#]/.test(payload.path)) return json("Forbidden", 403);
    const project = Deno.env.get("SUPABASE_URL")!;
    const url = new URL(payload.path, project);
    if (url.origin !== new URL(project).origin) return json("Forbidden", 403);
    const method = payload.method;
    const path = url.pathname;
    const allowed =
      (path === "/rest/v1/lb_orders" && ["GET", "POST", "PATCH"].includes(method)) ||
      (path === "/rest/v1/lb_order_history" && method === "GET") ||
      (["/rest/v1/rpc/lb_admin_rate_limit", "/rest/v1/rpc/lb_admin_update_order"].includes(path) && method === "POST") ||
      (path === "/auth/v1/admin/generate_link" && method === "POST") ||
      (path === "/auth/v1/verify" && method === "POST") ||
      (path === "/auth/v1/user" && method === "GET") ||
      (path === "/auth/v1/token" && url.search === "?grant_type=refresh_token" && method === "POST") ||
      (path === "/auth/v1/logout" && url.search === "?scope=local" && method === "POST");
    if (!allowed) return json("Forbidden", 403);
    if (path === "/auth/v1/admin/generate_link" || path === "/auth/v1/verify") {
      const body = JSON.parse(payload.body ?? "{}");
      if (body.email !== ownerEmail || body.new_email || body.redirect_to || body.options) return json("Forbidden", 403);
      if (path.endsWith("generate_link") && body.type !== "magiclink") return json("Forbidden", 403);
      if (path.endsWith("verify") && (body.type !== "email" || !/^\d{6,10}$/.test(body.token))) return json("Forbidden", 403);
    }
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!key || !project) return json("Unavailable", 503);
    const incoming = new Headers(payload.headers ?? {});
    const headers = new Headers({ apikey: key, Authorization: `Bearer ${key}` });
    for (const name of ["content-type", "accept", "prefer", "range", "range-unit"]) {
      const value = incoming.get(name);
      if (value) headers.set(name, value);
    }
    // Data requests are restricted to the public schema and the allowlisted tables/RPCs.
    if (path.startsWith("/rest/")) {
      headers.set("Accept-Profile", "public");
      headers.set("Content-Profile", "public");
    }
    if (path === "/auth/v1/user" || path === "/auth/v1/logout") {
      const auth = incoming.get("authorization");
      if (!auth || auth === `Bearer ${token}` || !/^Bearer [A-Za-z0-9_.-]+$/.test(auth)) return json("Unauthorized", 401);
      headers.set("Authorization", auth);
    }
    const upstream = await fetch(url, {
      method, headers,
      body: method === "GET" ? undefined : payload.body,
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    const responseHeaders = new Headers({ "Cache-Control": "private, no-store" });
    for (const name of ["content-type", "content-range", "range-unit"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return json("Gateway unavailable", 502);
  }
}

Deno.serve(handler);
