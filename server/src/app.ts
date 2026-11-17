import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import { AppModule } from './app.module.js';
import { HttpErrorFilter } from './common/http-error.filter.js';
import { config } from '../config/index.js';
import { rateLimit } from 'express-rate-limit';

export async function createApp() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const server = app.getHttpAdapter().getInstance();

  server.disable('x-powered-by');
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json({ limit: '1mb' }));
  app.use(
    ['/api/auth/login', '/api/auth/register'],
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 20,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );
  app.setGlobalPrefix('api');
  app.enableCors({ origin: config.clientUrl, credentials: true });
  app.useGlobalFilters(new HttpErrorFilter());
  return app;
}
