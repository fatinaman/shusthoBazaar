import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const runtimeDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const serverDirectory = path.basename(runtimeDirectory) === 'dist'
  ? path.dirname(runtimeDirectory)
  : runtimeDirectory;
dotenv.config({ path: path.resolve(serverDirectory, '../.env') });

export const config = {
  port: Number(process.env.PORT || 3001),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  serverUrl: process.env.SERVER_URL || 'http://localhost:3001',
  jwtSecret: process.env.JWT_SECRET || '',
  dbPath: process.env.DB_PATH
    ? path.resolve(serverDirectory, '..', process.env.DB_PATH)
    : path.resolve(serverDirectory, 'db/shusthobazaar.db'),
  deliveryFee: 60,
};

export function validateConfig() {
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
  }
}
