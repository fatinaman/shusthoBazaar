import { randomUUID } from 'node:crypto';
import { db } from '../../db/index.js';
import { AppError } from '../middleware/errors.js';
import { getOrderView, ensureInvoice } from './orders.js';

export function completeMockPayment(checkoutReference, userId, result) {
  const rows = db.prepare(`
    SELECT pay.id AS payment_id, pay.order_id, pay.method, pay.status, o.customer_id
    FROM payments pay
    JOIN orders o ON o.id = pay.order_id
    WHERE pay.checkout_reference = ?
    ORDER BY pay.order_id
  `).all(checkoutReference);
  if (rows.length === 0 || rows.some((row) => row.customer_id !== userId)) {
    throw new AppError(404, 'Checkout payment not found.');
  }
  if (rows.some((row) => row.method !== 'mock')) {
    throw new AppError(409, 'This checkout is not configured for mock payment.');
  }

  const statuses = new Set(rows.map((row) => row.status));
  if (statuses.size !== 1) throw new AppError(409, 'Checkout payment records are inconsistent.');
  const currentStatus = rows[0].status;
  if (currentStatus === 'success') {
    if (result === 'failed') throw new AppError(409, 'A successful payment cannot be changed to failed.');
    return { orders: rows.map((row) => getOrderView(row.order_id)), idempotent: true };
  }
  if (currentStatus !== 'pending' && currentStatus !== 'failed') {
    throw new AppError(409, 'Checkout payment cannot be completed in its current state.');
  }

  const nextStatus = result === 'success' ? 'success' : 'failed';
  const transactionId = `MOCK-${randomUUID()}`;
  const update = db.transaction(() => {
    db.prepare(`
      UPDATE payments
      SET status = ?, transaction_id = NULL,
          paid_at = CASE WHEN ? = 'success' THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE checkout_reference = ? AND method = 'mock'
    `).run(nextStatus, nextStatus, checkoutReference);
    db.prepare('UPDATE payments SET transaction_id = ? WHERE id = ?')
      .run(transactionId, rows[0].payment_id);
  });
  update();

  if (nextStatus === 'success') {
    for (const row of rows) ensureInvoice(row.order_id);
  }
  return { orders: rows.map((row) => getOrderView(row.order_id)), idempotent: false };
}
