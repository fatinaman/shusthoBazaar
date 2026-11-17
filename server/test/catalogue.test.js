import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'shusthobazaar-catalogue-'));
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
  baseUrl = `http://127.0.0.1:${app.getHttpServer().address().port}/api`;
});

after(async () => {
  await app.close();
  closeDatabase();
  fs.rmSync(temporaryDirectory, { recursive: true, force: true });
});

test('catalogue lists seeded products with frontend-compatible product fields and paisa conversion', async () => {
  const response = await fetch(`${baseUrl}/products?limit=100`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.total, 22);
  assert.equal(body.products[0].id, 'p001');
  assert.equal(body.products[0].name, 'Napa Extra');
  assert.equal(body.products[0].price, 35);
  assert.equal(body.products[0].image, '/images/napa-extra-paracetamol-box-and-tablet-strip.webp');
  assert.equal(typeof body.products[0].isAvailable, 'boolean');
});

test('catalogue searches generic names and filters categories', async () => {
  const search = await fetch(`${baseUrl}/products?q=omeprazole`);
  const searchBody = await search.json();
  assert.ok(searchBody.products.some((product) => product.name === 'Seclo 20mg'));

  const category = await fetch(`${baseUrl}/products?category=Gastric`);
  const categoryBody = await category.json();
  assert.ok(categoryBody.products.length > 0);
  assert.ok(categoryBody.products.every((product) => product.category.includes('Gastric')));
});

test('product detail and category endpoints handle found and missing records', async () => {
  const product = await fetch(`${baseUrl}/products/p002`);
  assert.equal(product.status, 200);
  assert.equal((await product.json()).generic, 'Omeprazole 20mg');

  const missing = await fetch(`${baseUrl}/products/p999`);
  assert.equal(missing.status, 404);
  const categories = await fetch(`${baseUrl}/categories`);
  assert.ok((await categories.json()).categories.length >= 5);
});

test('catalogue rejects invalid pagination parameters', async () => {
  const response = await fetch(`${baseUrl}/products?page=0`);
  assert.equal(response.status, 400);
});
