import { readFileSync } from 'node:fs';

const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/shop.js', ['shop.js', 'text/javascript; charset=utf-8']],
].map(([route, [file, type]]) => [route, { type, body: readFileSync(new URL(`./public/${file}`, import.meta.url)) }]));

export function totalPrice(items) {
  if (!Array.isArray(items)) throw new TypeError('Items must be an array');
  let cents = 0;
  for (const { price, quantity } of items) {
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 1) {
      throw new RangeError('Price must be nonnegative and quantity a positive integer');
    }
    cents += Math.round(price * 100) * quantity;
  }
  return cents / 100;
}

export function handler(req, res) {
  const path = new URL(req.url, 'http://localhost').pathname;
  const asset = assets.get(path);
  if ((req.method === 'GET' || req.method === 'HEAD') && asset) {
    res.setHeader('Content-Type', asset.type);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(req.method === 'HEAD' ? undefined : asset.body);
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'GET' && req.url === '/health') {
    res.end(JSON.stringify({ status: 'ok' }));
  } else if (req.method === 'GET' && req.url === '/api') {
    res.end(JSON.stringify({ app: 'ShopFast', message: 'Shipped with GitHub Actions' }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
}
