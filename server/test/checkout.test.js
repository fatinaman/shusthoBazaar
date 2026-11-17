import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'shusthobazaar-checkout-'));
process.env.DB_PATH = path.join(temporaryDirectory, 'test.sqlite');
process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';

const [{ createApp }, { seed }, { db, closeDatabase }] = await Promise.all([
  import('../src/app.ts'),
  import('../db/seed.js'),
  import('../db/index.js'),
]);

let app;
let baseUrl;
let customerCookie;
let addressId;

async function postJson(url, body, cookie = customerCookie) {
  return fetch(`${baseUrl}${url}`, {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

before(async () => {
  seed();
  app = await createApp();
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${app.getHttpServer().address().port}/api`;
  const login = await postJson('/auth/login', {
    email: 'customer@shusthobazaar.demo',
    password: 'Customer123!',
  }, '');
  customerCookie = login.headers.get('set-cookie').split(';', 1)[0];

  const addressResponse = await postJson('/addresses', {
    label: 'Home',
    recipient: 'Aminul Islam',
    phone: '01712345678',
    street: 'House 42, Road 11, Banani',
    city: 'Dhaka',
    postalCode: '1213',
  });
  addressId = (await addressResponse.json()).addresses[0].id;

  const sellerRoleId = db.prepare("SELECT id FROM roles WHERE name = 'seller'").get().id;
  const sellerUserId = Number(db.prepare(`
    INSERT INTO users (role_id, full_name, email, password_hash)
    VALUES (?, 'Second Seller', 'seller2@example.test', 'not-used')
  `).run(sellerRoleId).lastInsertRowid);
  const sellerId = Number(db.prepare(`
    INSERT INTO sellers
      (user_id, pharmacy_name, drug_license_no, address_line, city, latitude, longitude, status)
    VALUES (?, 'Second Pharmacy', 'DEMO-DGDA-0003', 'Mirpur, Dhaka', 'Dhaka', 23.8, 90.3, 'approved')
  `).run(sellerUserId).lastInsertRowid);
  const categoryId = db.prepare('SELECT id FROM categories LIMIT 1').get().id;
  const productId = Number(db.prepare(`
    INSERT INTO products
      (seller_id, category_id, name, generic_name, description, price, stock_qty)
    VALUES (?, ?, 'Test stock item', 'Example generic', 'Test fixture product', 10000, 10)
  `).run(sellerId, categoryId).lastInsertRowid);
  db.prepare('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)').run(productId, '/images/logo.png');
});

after(async () => {
  await app.close();
  closeDatabase();
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('checkout splits by seller, prices from the DB, applies coupon, charges per seller, and snapshots stock', async () => {
  assert.equal((await postJson('/cart/items', { productId: 'p001', quantity: 2 })).status, 201);
  assert.equal((await postJson('/cart/items', { productId: 'p023', quantity: 1 })).status, 201);
  assert.equal((await postJson('/cart/coupon', { code: 'WELCOME10' })).status, 200);

  const checkout = await postJson('/checkout', {
    addressId,
    paymentMethod: 'cod',
    subtotal: 0,
    total: 0,
    items: [{ productId: 'p001', quantity: 1000, price: 0 }],
  });
  assert.equal(checkout.status, 201);
  const result = await checkout.json();
  assert.equal(result.orders.length, 2);
  assert.equal(result.paymentStatus, 'pending');
  assert.deepEqual(result.orders.map((order) => order.total).sort((a, b) => a - b), [123, 150]);
  assert.equal(result.orders.reduce((sum, order) => sum + order.subtotal, 0), 170);
  assert.equal(result.orders.reduce((sum, order) => sum + order.discount, 0), 17);
  assert.equal(result.orders.reduce((sum, order) => sum + order.shippingFee, 0), 120);
  assert.ok(result.orders.every((order) => order.status === 'Placed'));
  assert.ok(result.orders.every((order) => order.payment.method === 'cod' && order.payment.status === 'pending'));

  const stock = db.prepare('SELECT stock_qty FROM products WHERE id = 1').get().stock_qty;
  assert.equal(stock, 148);
  const secondProductStock = db.prepare('SELECT stock_qty FROM products WHERE name = ?').get('Test stock item').stock_qty;
  assert.equal(secondProductStock, 9);
  const historyCount = db.prepare('SELECT COUNT(*) AS count FROM order_status_history').get().count;
  assert.equal(historyCount, 2);

  const cartResponse = await fetch(`${baseUrl}/cart`, { headers: { cookie: customerCookie } });
  const freshCart = await cartResponse.json();
  assert.equal(freshCart.items.length, 0);
  assert.equal(freshCart.total, 0);
});

test('checkout rejects an address owned by another user and an empty cart', async () => {
  const empty = await postJson('/checkout', { addressId, paymentMethod: 'cod' });
  assert.equal(empty.status, 422);

  const newCustomer = await postJson('/auth/register', {
    name: 'Other Customer',
    email: 'other-customer@example.test',
    password: 'CustomerPassword123',
  }, '');
  const otherCookie = newCustomer.headers.get('set-cookie').split(';', 1)[0];
  const otherAddress = await postJson('/addresses', {
    recipient: 'Other Customer',
    phone: '01700000000',
    street: '1 Other Road',
    city: 'Dhaka',
  }, otherCookie);
  assert.equal(otherAddress.status, 201);
  const otherCart = await postJson('/cart/items', { productId: 'p001', quantity: 1 }, otherCookie);
  assert.equal(otherCart.status, 201);

  const unauthorizedAddress = await postJson('/checkout', {
    addressId,
    paymentMethod: 'cod',
  }, otherCookie);
  assert.equal(unauthorizedAddress.status, 404);
});
