import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'shusthobazaar-orders-'));
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
let sellerCookie;
let adminCookie;
let addressId;
let orderIds;

async function login(email, password) {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.headers.get('set-cookie').split(';', 1)[0];
}

async function postJson(url, body, cookie) {
  return fetch(`${baseUrl}/api${url}`, {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

before(async () => {
  seed();
  app = await createApp();
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${app.getHttpServer().address().port}`;
  customerCookie = await login('customer@shusthobazaar.demo', 'Customer123!');
  sellerCookie = await login('seller@shusthobazaar.demo', 'Seller123!');
  adminCookie = await login('admin@shusthobazaar.demo', 'Admin123!');

  const addressResponse = await postJson('/addresses', {
    recipient: 'Aminul Islam',
    phone: '01712345678',
    street: 'House 42, Banani',
    city: 'Dhaka',
  }, customerCookie);
  addressId = (await addressResponse.json()).addresses[0].id;
  await postJson('/cart/items', { productId: 'p001', quantity: 1 }, customerCookie);

  const sellerRoleId = db.prepare("SELECT id FROM roles WHERE name = 'seller'").get().id;
  const secondSellerUserId = Number(db.prepare(`
    INSERT INTO users (role_id, full_name, email, password_hash)
    VALUES (?, 'Second Seller', 'seller2@example.test', 'not-used')
  `).run(sellerRoleId).lastInsertRowid);
  const secondSellerId = Number(db.prepare(`
    INSERT INTO sellers
      (user_id, pharmacy_name, drug_license_no, address_line, city, latitude, longitude, status)
    VALUES (?, 'Second Pharmacy', 'DEMO-DGDA-0003', 'Mirpur, Dhaka', 'Dhaka', 23.8, 90.3, 'approved')
  `).run(secondSellerUserId).lastInsertRowid);
  const categoryId = db.prepare('SELECT id FROM categories LIMIT 1').get().id;
  const productId = Number(db.prepare(`
    INSERT INTO products
      (seller_id, category_id, name, generic_name, description, price, stock_qty)
    VALUES (?, ?, 'Other pharmacy item', 'Example generic', 'Test item', 10000, 5)
  `).run(secondSellerId, categoryId).lastInsertRowid);
  db.prepare('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)').run(productId, '/images/logo.png');
  await postJson('/cart/items', { productId: 'p023', quantity: 1 }, customerCookie);
  const checkout = await postJson('/checkout', { addressId, paymentMethod: 'cod' }, customerCookie);
  orderIds = (await checkout.json()).orders.map((order) => order.id);
});

after(async () => {
  await app.close();
  closeDatabase();
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('customers see only their own orders and order details include tracking history', async () => {
  const list = await fetch(`${baseUrl}/api/orders`, { headers: { cookie: customerCookie } });
  assert.equal(list.status, 200);
  const orders = (await list.json()).orders;
  assert.equal(orders.length, 2);
  assert.ok(orders.every((order) => order.statusHistory[0].status === 'Placed'));

  const detail = await fetch(`${baseUrl}/api/orders/${orderIds[0]}`, { headers: { cookie: customerCookie } });
  assert.equal(detail.status, 200);
  const order = await detail.json();
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].price, 35);
  assert.equal(order.invoice.invoiceNo, `INV-${new Date().getFullYear()}-000001`);

  const otherCustomer = await postJson('/auth/register', {
    name: 'Different User',
    email: 'different@example.test',
    password: 'CustomerPassword123',
  }, '');
  const otherCookie = otherCustomer.headers.get('set-cookie').split(';', 1)[0];
  const forbidden = await fetch(`${baseUrl}/api/orders/${orderIds[0]}`, { headers: { cookie: otherCookie } });
  assert.equal(forbidden.status, 404);
});

test('seller status transitions are forward-only, scoped to owned orders, and settle COD on delivery', async () => {
  const notOwned = await fetch(`${baseUrl}/api/orders/${orderIds[1]}/status`, {
    method: 'PATCH',
    headers: { cookie: sellerCookie, 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'confirmed' }),
  });
  assert.equal(notOwned.status, 404);

  const skipStep = await fetch(`${baseUrl}/api/orders/${orderIds[0]}/status`, {
    method: 'PATCH',
    headers: { cookie: sellerCookie, 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'out_for_delivery' }),
  });
  assert.equal(skipStep.status, 409);

  for (const status of ['confirmed', 'out_for_delivery', 'delivered']) {
    const response = await fetch(`${baseUrl}/api/orders/${orderIds[0]}/status`, {
      method: 'PATCH',
      headers: { cookie: sellerCookie, 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    assert.equal(response.status, 200);
  }
  const detail = await fetch(`${baseUrl}/api/orders/${orderIds[0]}`, { headers: { cookie: customerCookie } });
  const order = await detail.json();
  assert.equal(order.status, 'Delivered');
  assert.equal(order.payment.status, 'success');
  assert.deepEqual(order.statusHistory.map((entry) => entry.status), [
    'Placed',
    'Confirmed',
    'Out for Delivery',
    'Delivered',
  ]);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM invoices WHERE order_id = 1').get().count, 1);
});

test('invoice endpoint returns JSON and is idempotent', async () => {
  const first = await fetch(`${baseUrl}/api/orders/${orderIds[1]}/invoice`, {
    headers: { cookie: adminCookie },
  });
  const second = await fetch(`${baseUrl}/api/orders/${orderIds[1]}/invoice`, {
    headers: { cookie: adminCookie },
  });
  assert.equal(first.status, 200);
  const invoice = await first.json();
  assert.equal(invoice.id, invoice.invoiceNo);
  assert.equal(invoice.orderId, orderIds[1]);
  assert.equal(invoice.items[0].unitPrice, 100);
  assert.equal((await second.json()).invoiceNo, invoice.invoiceNo);
});
