import { db } from '../../db/index.js';
import { AppError } from '../middleware/errors.js';
import { assertOrderAccess, ensureInvoice, getOrderView } from './orders.js';

const forwardTransitions = {
  placed: 'confirmed',
  confirmed: 'out_for_delivery',
  out_for_delivery: 'delivered',
};

function assertRoleAccess(order, auth) {
  if (auth.role === 'admin') return;
  if (auth.role === 'customer' && order.customer_id === auth.id) return;
  if (auth.role === 'seller' && order.seller_id === auth.sellerId) return;
  throw new AppError(404, 'Order not found.');
}

export function listOrders(auth) {
  let rows;
  if (auth.role === 'admin') {
    rows = db.prepare('SELECT id FROM orders ORDER BY placed_at DESC, id DESC').all();
  } else if (auth.role === 'seller') {
    rows = db.prepare('SELECT id FROM orders WHERE seller_id = ? ORDER BY placed_at DESC, id DESC')
      .all(auth.sellerId);
  } else {
    rows = db.prepare('SELECT id FROM orders WHERE customer_id = ? ORDER BY placed_at DESC, id DESC')
      .all(auth.id);
  }
  return rows.map(({ id }) => getOrderView(id));
}

export function getAuthorizedOrder(orderId, auth) {
  const order = assertOrderAccess(orderId, auth);
  assertRoleAccess(order, auth);
  ensureInvoice(orderId);
  return getOrderView(orderId);
}

export function getAuthorizedInvoice(orderId, auth) {
  const order = assertOrderAccess(orderId, auth);
  assertRoleAccess(order, auth);
  const invoice = ensureInvoice(orderId);
  const view = getOrderView(orderId);
  return {
    id: invoice.invoice_no,
    invoiceNo: invoice.invoice_no,
    orderId: view.id,
    customer: view.customer,
    customerEmail: view.customerEmail,
    address: view.address,
    paymentMethod: view.paymentMethod,
    paymentStatus: view.paymentStatus,
    paymentReference: view.paymentReference,
    createdAt: view.createdAt,
    issuedAt: invoice.issued_at,
    items: view.items.map(({ name, quantity, unitPrice }) => ({ name, quantity, unitPrice })),
    subtotal: view.subtotal,
    discount: view.discount,
    deliveryFee: view.shippingFee,
    shippingFee: view.shippingFee,
    total: view.total,
  };
}

export function advanceOrderStatus(orderId, nextStatus, auth) {
  const transaction = db.transaction(() => {
    const order = db.prepare('SELECT id, customer_id, seller_id, status FROM orders WHERE id = ?').get(orderId);
    if (!order) throw new AppError(404, 'Order not found.');
    assertRoleAccess(order, auth);
    if (forwardTransitions[order.status] !== nextStatus) {
      throw new AppError(409, `Order cannot move from ${order.status} to ${nextStatus}.`);
    }

    db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(nextStatus, orderId);
    db.prepare(
      'INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, ?, ?)',
    ).run(orderId, nextStatus, auth.id);

    if (nextStatus === 'delivered') {
      db.prepare(`
        UPDATE payments SET status = 'success', paid_at = CURRENT_TIMESTAMP
        WHERE order_id = ? AND method = 'cod' AND status = 'pending'
      `).run(orderId);
    }
  });
  transaction();
  const view = getOrderView(orderId);
  if (view.payment?.method === 'cod' && view.payment.status === 'success') ensureInvoice(orderId);
  return getOrderView(orderId);
}
