import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { config } from '../config/index.js';

const runtimeDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverDirectory = path.basename(runtimeDirectory) === 'dist'
  ? path.dirname(runtimeDirectory)
  : runtimeDirectory;
const schemaPath = path.join(serverDirectory, 'db/schema.sql');
const resolvedDbPath = path.resolve(config.dbPath);
fs.mkdirSync(path.dirname(resolvedDbPath), { recursive: true });

export const db = new Database(resolvedDbPath);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export function migrate() {
  const existing = db.prepare(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' LIMIT 1",
  ).get();
  if (!existing) db.exec(fs.readFileSync(schemaPath, 'utf8'));
}

export function closeDatabase() {
  if (db.open) db.close();
}

migrate();
