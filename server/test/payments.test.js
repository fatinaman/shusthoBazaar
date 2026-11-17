import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'shusthobazaar-payments-'));
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
let checkoutReference;

async function postJson(url, body, cookie = customerCookie) {
  return fetch(`${baseUrl}/api${url}`, {
    method: 'POST',
    headers: { cookie, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function login(email, password) {
  const response = await postJson('/auth/login', { email, password }, '');
  return response.headers.get('set-cookie').split(';', 1)[0];
}

before(async () => {
  seed();
  app = await createApp();
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${app.getHttpServer().address().port}`;
  customerCookie = await login('customer@shusthobazaar.demo', 'Customer123!');
  const address = await postJson('/addresses', {
    recipient: 'Aminul Islam',
    phone: '01712345678',
    street: 'House 42, Banani',
    city: 'Dhaka',
  });
  const addressId = (await address.json()).addresses[0].id;
  await postJson('/cart/items', { productId: 'p001', quantity: 2 });
  const checkout = await postJson('/checkout', { addressId, paymentMethod: 'mock' });
  assert.equal(checkout.status, 201);
  const response = await checkout.json();
  checkoutReference = response.checkoutReference;
  assert.equal(response.paymentStatus, 'pending');
  assert.equal(response.orders[0].payment.method, 'mock');
  assert.equal(db.prepare('SELECT status FROM payments').get().status, 'pending');
});

after(async () => {
  await app.close();
  closeDatabase();
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('mock payment results are owner-authorized and persisted with idempotent retry behavior', async () => {
  const otherRegistration = await postJson('/auth/register', {
    name: 'Another Customer',
    email: 'another-customer@example.test',
    password: 'CustomerPassword123',
  }, '');
  const otherCookie = otherRegistration.headers.get('set-cookie').split(';', 1)[0];
  const forbidden = await postJson('/payments/mock/complete', {
    checkoutReference,
    result: 'success',
  }, otherCookie);
  assert.equal(forbidden.status, 404);
  assert.equal(db.prepare('SELECT status FROM payments').get().status, 'pending');

  const declined = await postJson('/payments/mock/complete', {
    checkoutReference,
    result: 'failed',
  });
  assert.equal(declined.status, 200);
  assert.equal((await declined.json()).orders[0].payment.status, 'failed');
  const failureRow = db.prepare('SELECT status, transaction_id FROM payments').get();
  assert.equal(failureRow.status, 'failed');
  assert.match(failureRow.transaction_id, /^MOCK-/);

  const successfulRetry = await postJson('/payments/mock/complete', {
    checkoutReference,
    result: 'success',
  });
  assert.equal(successfulRetry.status, 200);
  const successResult = await successfulRetry.json();
  assert.equal(successResult.orders[0].payment.status, 'success');
  assert.equal(successResult.orders[0].paymentStatus, 'Paid (mock)');
  assert.ok(db.prepare('SELECT paid_at FROM payments').get().paid_at);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM invoices').get().count, 1);

  const repeatedSuccess = await postJson('/payments/mock/complete', {
    checkoutReference,
    result: 'success',
  });
  assert.equal((await repeatedSuccess.json()).idempotent, true);

  const downgrade = await postJson('/payments/mock/complete', {
    checkoutReference,
    result: 'failed',
  });
  assert.equal(downgrade.status, 409);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM invoices').get().count, 1);
});

test('mock payment completion validates its result and rejects unknown references', async () => {
  const invalid = await postJson('/payments/mock/complete', {
    checkoutReference,
    result: 'pending',
  });
  assert.equal(invalid.status, 400);

  const missing = await postJson('/payments/mock/complete', {
    checkoutReference: 'SB-CHECKOUT-00000000-0000-0000-0000-000000000000',
    result: 'success',
  });
  assert.equal(missing.status, 404);
});
