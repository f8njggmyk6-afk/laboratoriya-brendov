import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash, webcrypto } from 'node:crypto';
import ts from 'typescript';

const token = 'test-only-gateway-token-'.repeat(3);
const gatewayTokenHash = createHash('sha256').update(token).digest('hex');
let forwarded;
const sandbox = {
  exports: {},
  require: () => ({ gatewayTokenHash, ownerEmail: 'owner@example.com' }),
  Deno: { env: { get: (key) => key === 'SUPABASE_URL' ? 'https://test.supabase.co' : 'private-service-key' }, serve: () => {} },
  crypto: webcrypto, TextEncoder, Uint8Array, Request, Response, Headers, URL, AbortSignal,
  fetch: async (url, options) => {
    forwarded = { url: String(url), ...options };
    return Response.json({ ok: true });
  },
};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('supabase/functions/lb-admin-gateway/index.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, sandbox);
const invoke = (path, method = 'GET', body = null, secret = token, headers = {}) => sandbox.exports.handler(new Request('https://test.supabase.co/functions/v1/lb-admin-gateway', {
  method: 'POST', headers: { 'x-lb-gateway-token': secret, 'content-type': 'application/json' },
  body: JSON.stringify({ path, method, body: body === null ? null : JSON.stringify(body), headers }),
}));
assert.equal((await invoke('/rest/v1/lb_orders', 'GET', null, 'wrong')).status, 401);
for (const path of ['/rest/v1/other_table', '/auth/v1/admin/users', '//evil.test/rest/v1/lb_orders', '/rest/v1/../../admin', '/rest/v1/lb_orders#fragment']) {
  assert.equal((await invoke(path)).status, 403, path);
}
assert.equal((await invoke('/rest/v1/lb_orders', 'DELETE')).status, 403);
assert.equal((await invoke('/auth/v1/admin/generate_link', 'POST', { type: 'magiclink', email: 'someone@example.com' })).status, 403);
assert.equal((await invoke('/auth/v1/verify', 'POST', { type: 'email', email: 'owner@example.com', token: 'bad' })).status, 403);
assert.equal((await invoke('/auth/v1/user', 'GET', null, token, { authorization: `Bearer ${token}` })).status, 401);
let response = await invoke('/rest/v1/lb_orders?select=id', 'GET', null, token, { authorization: 'Bearer user-jwt', 'accept-profile': 'auth' });
assert.equal(response.status, 200);
assert.equal(forwarded.headers.get('authorization'), 'Bearer private-service-key');
assert.equal(forwarded.headers.get('accept-profile'), 'public');
assert.equal(forwarded.url, 'https://test.supabase.co/rest/v1/lb_orders?select=id');
assert.equal(response.headers.get('apikey'), null);
assert.equal((await response.text()).includes('private-service-key'), false);
response = await invoke('/auth/v1/user', 'GET', null, token, { authorization: 'Bearer real-user-jwt' });
assert.equal(response.status, 200);
assert.equal(forwarded.headers.get('authorization'), 'Bearer real-user-jwt');
assert.equal(forwarded.headers.get('apikey'), 'private-service-key');
assert.equal((await invoke('/auth/v1/admin/generate_link', 'POST', { email: 'owner@example.com', type: 'magiclink' })).status, 200);
assert.equal((await invoke('/auth/v1/token?grant_type=refresh_token', 'POST', { refresh_token: 'test' })).status, 200);
assert.equal((await invoke('/auth/v1/logout?scope=local', 'POST', {}, token, { authorization: 'Bearer real-user-jwt' })).status, 200);
console.log('Admin gateway: authentication, owner restrictions, routing, key isolation passed');
