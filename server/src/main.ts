import 'reflect-metadata';
import { createApp } from './app.js';
import { config, validateConfig } from '../config/index.js';
import { seed } from '../db/seed.js';

async function bootstrap() {
  validateConfig();
  seed();
  const app = await createApp();
  await app.listen(config.port);
  console.log(`ShusthoBazaar API listening on ${config.serverUrl}`);
}

void bootstrap();
