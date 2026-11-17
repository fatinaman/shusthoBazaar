import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'shusthobazaar-cart-'));
process.env.DB_PATH = path.join(temporaryDirectory, 'test.sqlite');
process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';

const [{ createApp }, { seed }, { closeDatabase }] = await Promise.all([
  import('../src/app.ts'),
  import('../db/seed.js'),
  import('../db/index.js'),
]);

let app;
let baseUrl;
let customerCookie;

async function login(email = 'customer@shusthobazaar.demo', password = 'Customer123!') {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.headers.get('set-cookie').split(';', 1)[0];
}

before(async () => {
  seed();
  app = await createApp();
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${app.getHttpServer().address().port}`;
  customerCookie = await login();
});

after(async () => {
  await app.close();
  closeDatabase();
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('cart requires a customer session and recalculates quantity, coupon, stock and totals', async () => {
  const unauthorized = await fetch(`${baseUrl}/api/cart`);
  assert.equal(unauthorized.status, 401);

  const add = await fetch(`${baseUrl}/api/cart/items`, {
    method: 'POST',
    headers: { cookie: customerCookie, 'content-type': 'application/json' },
    body: JSON.stringify({ productId: 'p001', quantity: 2 }),
  });
  assert.equal(add.status, 201);
  let cart = await add.json();
  assert.equal(cart.items[0].quantity, 2);
  assert.equal(cart.subtotal, 70);
  assert.equal(cart.shippingFee, 60);
  assert.equal(cart.total, 130);

  const coupon = await fetch(`${baseUrl}/api/cart/coupon`, {
    method: 'POST',
    headers: { cookie: customerCookie, 'content-type': 'application/json' },
    body: JSON.stringify({ code: 'welcome10' }),
  });
  assert.equal(coupon.status, 200);
  cart = await coupon.json();
  assert.equal(cart.couponCode, 'WELCOME10');
  assert.equal(cart.discount, 7);
  assert.equal(cart.total, 123);

  const update = await fetch(`${baseUrl}/api/cart/items/p001`, {
    method: 'PATCH',
    headers: { cookie: customerCookie, 'content-type': 'application/json' },
    body: JSON.stringify({ quantity: 3 }),
  });
  cart = await update.json();
  assert.equal(cart.items[0].quantity, 3);
  assert.equal(cart.subtotal, 105);
  assert.equal(cart.discount, 10.5);

  const overStock = await fetch(`${baseUrl}/api/cart/items/p001`, {
    method: 'PATCH',
    headers: { cookie: customerCookie, 'content-type': 'application/json' },
    body: JSON.stringify({ quantity: 151 }),
  });
  assert.equal(overStock.status, 409);

  const removed = await fetch(`${baseUrl}/api/cart/items/p001`, {
    method: 'DELETE',
    headers: { cookie: customerCookie },
  });
  assert.equal((await removed.json()).items.length, 0);

  const clearCoupon = await fetch(`${baseUrl}/api/cart/coupon`, {
    method: 'DELETE',
    headers: { cookie: customerCookie },
  });
  assert.equal((await clearCoupon.json()).couponCode, null);
});

test('address creation maps checkout fields and keeps addresses private to each user', async () => {
  const created = await fetch(`${baseUrl}/api/addresses`, {
    method: 'POST',
    headers: { cookie: customerCookie, 'content-type': 'application/json' },
    body: JSON.stringify({
      label: 'Home',
      recipient: 'Aminul Islam',
      phone: '01712345678',
      street: 'House 42, Road 11, Banani',
      city: 'Dhaka',
      postalCode: '1213',
    }),
  });
  assert.equal(created.status, 201);
  const { addresses } = await created.json();
  assert.equal(addresses[0].id, 'addr-1');
  assert.equal(addresses[0].street, 'House 42, Road 11, Banani');
  assert.equal(addresses[0].postalCode, '1213');
  assert.equal(addresses[0].isDefault, true);

  const secondCookie = await login('seller@shusthobazaar.demo', 'Seller123!');
  const forbidden = await fetch(`${baseUrl}/api/addresses`, { headers: { cookie: secondCookie } });
  assert.equal(forbidden.status, 403);
});
