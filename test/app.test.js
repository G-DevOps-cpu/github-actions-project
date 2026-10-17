import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { handler, totalPrice } from '../src/app.js';

test('calculates an order with quantities', () => {
  assert.equal(totalPrice([{ price: 12.5, quantity: 2 }, { price: 5, quantity: 1 }]), 30);
});
test('handles empty orders and decimal prices', () => {
  assert.equal(totalPrice([]), 0);
  assert.equal(totalPrice([{ price: 0.1, quantity: 3 }]), 0.3);
});
test('rejects invalid order input', () => {
  assert.throws(() => totalPrice(null), TypeError);
  for (const item of [{ price: -1, quantity: 1 }, { price: 1, quantity: 0 }, { price: NaN, quantity: 1 }]) {
    assert.throws(() => totalPrice([item]), RangeError);
  }
});
test('HTTP routes return expected status and content', async (t) => {
  const server = createServer(handler).listen(0, '127.0.0.1');
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const health = await fetch(`${base}/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });
  const homepage = await fetch(base);
  assert.equal(homepage.status, 200);
  assert.match(homepage.headers.get('content-type'), /text\/html/);
  assert.match(await homepage.text(), /Demo basket/);
  for (const [path, type] of [['/styles.css', 'text/css'], ['/shop.js', 'text/javascript']]) {
    const response = await fetch(`${base}${path}`);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('content-type').startsWith(type));
    assert.ok((await response.text()).length > 0);
  }
  assert.equal((await (await fetch(`${base}/api`)).json()).app, 'ShopFast');
  assert.equal((await fetch(`${base}/package.json`)).status, 404);
  assert.equal((await fetch(`${base}/missing`)).status, 404);
});
