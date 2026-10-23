import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as catalog from '../src/site/serviceCatalog.ts';

const all = catalog.serviceCatalog;
const premium = all.filter(item => item.discountPercent);
assert.equal(all.length, 27);
assert.equal(new Set(all.map(item => item.n)).size, all.length);
assert.equal(premium.length, 6);
const expected = {'22':190000, '23':237500, '24':142500, '25':285000, '26':142500, '27':475000};
for (const item of premium) {
  assert.equal(item.discountPercent, 5);
  assert.equal(item.amount, expected[item.n]);
  assert.equal(item.amount * 100, item.baseAmount * 95);
  assert.equal(item.pricing, 'fixed');
  assert(item.nameEn && item.descriptionEn && item.timelineEn);
  assert.equal(item.items.length, item.itemsEn.length);
}
assert.equal(catalog.summarizeServices(['08', '23', '26', '23', 'unknown']).total, 384000);
assert.equal(catalog.summarizeServices(['23', '26']).total, 380000);
assert.equal(catalog.summarizeServices(['23', '26']).development.length, 2);
assert.equal(all.find(item => item.n === '18').amount, 12000);
assert.equal(all.find(item => item.n === '18').discountPercent, undefined);
assert.equal(catalog.servicePrice(all.find(item => item.n === '21'), catalog.money, 'en'), 'Custom specification');

// Invoke the actual route with the mail transport mocked; no network and no emails.
const source = fs.readFileSync(new URL('../src/routes/api/contact.tsx', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
let message;
const context = {
  exports: {},
  require: id => id === '@tanstack/react-router' ? {createFileRoute: () => config => config} : catalog,
  process: {env:{RESEND_API_KEY:'test', RESEND_FROM_EMAIL:'test@example.com', NOTIFY_TO_EMAIL:'owner@example.com'}},
  console, Response,
  fetch: async (_url, options) => { message = JSON.parse(options.body); return Response.json({id:'mock'}); },
};
vm.runInNewContext(code, context);
const request = new Request('http://localhost/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:'Test', email:'test@example.com', brief:'Test', services:['08','23','26','21'], total:999999})});
const result = await context.exports.Route.server.handlers.POST({request});
assert.equal(result.status, 200);
assert.match(message.text, /Итого за выбранные пакеты: 384\s000 ₽/u);
assert.match(message.text, /Разработка · № 09 \[DEV-09\] — Интернет-магазин: 237\s500 ₽ \(скидка 5% уже учтена; без скидки 250\s000 ₽\)/u);
assert.match(message.text, /Разработка · № 12 \[DEV-12\] — ИИ-помощник по документам/u);
assert(!message.text.includes('999999'));
assert.match(message.text, /В стоимость входит: Каталог до 100 товаров/u);
assert.match(message.text, /DEV-07.*стоимость по индивидуальному заданию, в итог не включена/u);
assert.equal(catalog.summarizeServices(['21']).total, 0);
assert.equal(catalog.summarizeServices(['21']).custom.length, 1);
assert.equal(catalog.summarizeServices(['15','18','23','21']).total, 252500);
for (const item of all.filter(item=>item.pricing==='fixed')) {
  assert(item.amount>0 && item.items.length>=3);
  assert.equal(catalog.servicePrice(item,catalog.money,'ru'), catalog.money(item.amount));
}
assert(!message.text.includes('стартовая цена'));
assert.match(message.text, /📣 Реклама · № 08 \[AD-08\] — Простой логотип/u);
assert.equal(catalog.serviceIdentity(all.find(item=>item.n==='14')).code, 'AD-14');
assert.equal(catalog.serviceIdentity(all.find(item=>item.n==='15')).code, 'DEV-01');
assert.equal(catalog.serviceIdentity(all.find(item=>item.n==='27')).code, 'DEV-13');
assert.equal(new Set(all.map(item=>catalog.serviceIdentity(item).code)).size, 27);
console.log('PASS: six 5% discounts, localized catalog, stable existing prices, fixed package totals, custom-project exclusion and actual notification route. No emails sent.');
