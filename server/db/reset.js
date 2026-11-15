import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';

const databasePath = path.resolve(config.dbPath);
for (const candidate of [databasePath, `${databasePath}-wal`, `${databasePath}-shm`]) {
  if (fs.existsSync(candidate)) fs.rmSync(candidate);
}

const { seed } = await import('./seed.js');
seed();
console.log('Database reset and seed complete.');
