import express from 'express';
import cors from 'cors';
import { config } from '../config/index.js';
import authRoutes from './routes/auth.js';
import catalogueRoutes from './routes/catalogue.js';
import cartRoutes from './routes/cart.js';
import addressRoutes from './routes/addresses.js';
import checkoutRoutes from './routes/checkout.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/mockPayments.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';

export const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api', catalogueRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
