import { app } from './app.js';
import { config, validateConfig } from '../config/index.js';
import { seed } from '../db/seed.js';

validateConfig();
seed();

app.listen(config.port, () => {
  console.log(`ShusthoBazaar API listening on ${config.serverUrl}`);
});
