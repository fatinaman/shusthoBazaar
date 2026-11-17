import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'shusthobazaar-auth-'));
process.env.DB_PATH = path.join(temporaryDirectory, 'test.sqlite');
process.env.JWT_SECRET = 'test-secret-with-more-than-thirty-two-characters';

const [{ createApp }, { seed }, { closeDatabase }] = await Promise.all([
  import('../src/app.ts'),
  import('../db/seed.js'),
  import('../db/index.js'),
]);

let app;
let baseUrl;

before(async () => {
  seed();
  app = await createApp();
  await app.listen(0, '127.0.0.1');
  baseUrl = `http://127.0.0.1:${app.getHttpServer().address().port}`;
});

after(async () => {
  await app.close();
  closeDatabase();
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('demo login returns the frontend user shape and authenticates /me with its cookie', async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'customer@shusthobazaar.demo', password: 'Customer123!' }),
  });
  assert.equal(response.status, 200);
  const { user } = await response.json();
  assert.deepEqual(user, {
    id: 'demo-customer',
    name: 'Aminul Islam',
    email: 'customer@shusthobazaar.demo',
    role: 'customer',
    sellerId: null,
    storeName: null,
  });

  const cookie = response.headers.get('set-cookie').split(';', 1)[0];
  const meResponse = await fetch(`${baseUrl}/api/auth/me`, { headers: { cookie } });
  assert.equal(meResponse.status, 200);
  assert.deepEqual(await meResponse.json(), { user });
});

test('registration creates a customer account and rejects duplicate email addresses', async () => {
  const body = { name: 'Test Customer', email: 'new@example.test', password: 'NewPassword123' };
  const first = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  assert.equal(first.status, 201);
  assert.equal((await first.json()).user.role, 'customer');

  const duplicate = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  assert.equal(duplicate.status, 409);
});

test('login validates input and rejects invalid credentials', async () => {
  const invalid = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', password: '' }),
  });
  assert.equal(invalid.status, 400);

  const wrongPassword = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'customer@shusthobazaar.demo', password: 'incorrect-password' }),
  });
  assert.equal(wrongPassword.status, 401);
});
