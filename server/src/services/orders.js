import { db } from '../../db/index.js';
import { AppError } from '../middleware/errors.js';
import { orderPublicId } from '../utils/ids.js';

export function displayOrderStatus(status) {
  const labels = {
    placed: 'Placed',
    confirmed: 'Confirmed',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  };
  return labels[status] || status;
}

function displayPaymentStatus(status) {
  if (status === 'success') return 'Paid';
  if (status === 'failed') return 'Failed';
  return 'Pending';
}

export function getOrderView(orderId) {
  const order = db.prepare(`
    SELECT o.*, u.full_name AS customer_name, u.email AS customer_email,
           a.id AS delivery_address_id, a.label AS address_label,
           a.recipient, a.phone, a.address_line, a.area, a.city, a.postal_code,
           s.id AS seller_internal_id, s.pharmacy_name AS seller_name,
           p.method AS payment_method, p.status AS payment_status,
           p.transaction_id, p.checkout_reference, p.paid_at,
           i.invoice_no, i.issued_at AS invoice_issued_at
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    JOIN addresses a ON a.id = o.address_id
    JOIN sellers s ON s.id = o.seller_id
    LEFT JOIN payments p ON p.order_id = o.id
    LEFT JOIN invoices i ON i.order_id = o.id
    WHERE o.id = ?
  `).get(orderId);
  if (!order) return null;

  const items = db.prepare(`
    SELECT oi.product_id, oi.quantity, oi.unit_price, p.name, p.generic_name,
           p.requires_prescription, p.seller_id, s.pharmacy_name,
           (SELECT image_url FROM product_images pi
            WHERE pi.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS image
    FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    JOIN sellers s ON s.id = p.seller_id
    WHERE oi.order_id = ?
    ORDER BY oi.id
  `).all(orderId).map((item) => ({
    id: `p${String(item.product_id).padStart(3, '0')}`,
    name: item.name,
    generic: item.generic_name || '',
    quantity: item.quantity,
    price: item.unit_price / 100,
    unitPrice: item.unit_price / 100,
    sellerId: `s${String(item.seller_id).padStart(3, '0')}`,
    sellerName: item.pharmacy_name,
    requiresPrescription: Boolean(item.requires_prescription),
    image: item.image || '/images/napa-extra-paracetamol-box-and-tablet-strip.webp',
  }));
  const statusHistory = db.prepare(`
    SELECT status, changed_at FROM order_status_history
    WHERE order_id = ? ORDER BY changed_at, id
  `).all(orderId).map((entry) => ({
    status: displayOrderStatus(entry.status),
    changedAt: entry.changed_at,
  }));
  const paymentMethod = order.payment_method === 'mock'
    ? 'Mock payment'
    : 'Cash on Delivery';
  const paymentStatus = order.payment_method === 'mock' && order.payment_status === 'success'
    ? 'Paid (mock)'
    : displayPaymentStatus(order.payment_status);

  return {
    id: orderPublicId(order.id),
    customer: order.customer_name,
    customerEmail: order.customer_email,
    address: {
      id: `addr-${order.delivery_address_id}`,
      label: order.address_label || 'Address',
      recipient: order.recipient,
      phone: order.phone,
      street: order.address_line,
      area: order.area || '',
      city: order.city,
      postalCode: order.postal_code || '',
    },
    items,
    subtotal: order.subtotal / 100,
    discount: order.discount_amt / 100,
    shippingFee: order.delivery_fee / 100,
    total: order.total_amt / 100,
    paymentMethod,
    paymentStatus,
    paymentReference: order.transaction_id,
    payment: {
      method: order.payment_method,
      status: order.payment_status,
      transactionId: order.transaction_id,
      checkoutReference: order.checkout_reference,
      paidAt: order.paid_at,
    },
    status: displayOrderStatus(order.status),
    orderStatus: displayOrderStatus(order.status),
    statusHistory,
    invoice: order.invoice_no ? { invoiceNo: order.invoice_no, issuedAt: order.invoice_issued_at } : null,
    createdAt: order.placed_at,
    sellerId: `s${String(order.seller_internal_id).padStart(3, '0')}`,
    sellerName: order.seller_name,
  };
}

export function ensureInvoice(orderId) {
  const existing = db.prepare('SELECT invoice_no, issued_at FROM invoices WHERE order_id = ?').get(orderId);
  if (existing) return existing;

  const year = new Date().getFullYear();
  const invoiceNo = `INV-${year}-${String(orderId).padStart(6, '0')}`;
  try {
    db.prepare('INSERT INTO invoices (order_id, invoice_no) VALUES (?, ?)').run(orderId, invoiceNo);
  } catch (error) {
    if (error.code !== 'SQLITE_CONSTRAINT_UNIQUE') throw error;
  }
  return db.prepare('SELECT invoice_no, issued_at FROM invoices WHERE order_id = ?').get(orderId);
}

export function assertOrderAccess(orderId, auth) {
  const order = db.prepare('SELECT customer_id, seller_id FROM orders WHERE id = ?').get(orderId);
  if (!order) throw new AppError(404, 'Order not found.');
  if (auth.role === 'admin') return order;
  if (auth.role === 'customer' && order.customer_id === auth.id) return order;
  if (auth.role === 'seller' && order.seller_id === auth.sellerId) return order;
  throw new AppError(404, 'Order not found.');
}
