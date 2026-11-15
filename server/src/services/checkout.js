import { randomUUID } from 'node:crypto';
import { db } from '../../db/index.js';
import { config } from '../../config/index.js';
import { AppError } from '../middleware/errors.js';
import { parseAddressId } from '../utils/ids.js';
import { calculateDiscount } from './cart.js';
import { getOrderView } from './orders.js';

export function createOrdersFromCart(userId, { addressId, paymentMethod }) {
  const addressInternalId = parseAddressId(addressId);
  const checkoutReference = `SB-CHECKOUT-${randomUUID()}`;
  const transaction = db.transaction(() => {
    const cart = db.prepare("SELECT id, coupon_id FROM carts WHERE user_id = ? AND status = 'active'").get(userId);
    if (!cart) throw new AppError(422, 'Your cart is empty.');

    const address = db.prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ?')
      .get(addressInternalId, userId);
    if (!address) throw new AppError(404, 'Delivery address not found.');

    const items = db.prepare(`
      SELECT ci.product_id, ci.quantity, p.price, p.stock_qty, p.is_active,
             p.seller_id, p.name
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY p.seller_id, p.id
    `).all(cart.id);
    if (items.length === 0) throw new AppError(422, 'Your cart is empty.');
    for (const item of items) {
      if (!item.is_active) throw new AppError(409, `${item.name} is no longer available.`);
      if (item.quantity > item.stock_qty) throw new AppError(409, `${item.name} no longer has enough stock.`);
    }

    const cartSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let coupon = null;
    if (cart.coupon_id) {
      coupon = db.prepare(`
        SELECT id, discount_type, discount_value, min_order_amt
        FROM coupons
        WHERE id = ? AND is_active = 1 AND valid_from <= ? AND valid_to >= ?
      `).get(cart.coupon_id, new Date().toISOString(), new Date().toISOString());
      if (!coupon) throw new AppError(409, 'The applied coupon is no longer valid.');
      if (cartSubtotal < coupon.min_order_amt) throw new AppError(422, 'Cart subtotal no longer meets the coupon minimum.');
    }

    const totalDiscount = calculateDiscount(cartSubtotal, coupon);
    const groups = new Map();
    for (const item of items) {
      const group = groups.get(item.seller_id) || { sellerId: item.seller_id, items: [], subtotal: 0 };
      group.items.push(item);
      group.subtotal += item.price * item.quantity;
      groups.set(item.seller_id, group);
    }
    const sellerGroups = [...groups.values()];
    let allocatedDiscount = 0;
    for (const group of sellerGroups) {
      group.discount = Math.floor((totalDiscount * group.subtotal) / cartSubtotal);
      allocatedDiscount += group.discount;
    }
    for (let remainder = totalDiscount - allocatedDiscount, index = 0; remainder > 0; remainder -= 1, index += 1) {
      sellerGroups[index % sellerGroups.length].discount += 1;
    }

    const insertOrder = db.prepare(`
      INSERT INTO orders
        (customer_id, seller_id, address_id, coupon_id, status, subtotal, discount_amt, delivery_fee, total_amt)
      VALUES (?, ?, ?, ?, 'placed', ?, ?, ?, ?)
    `);
    const insertOrderItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
    );
    const insertHistory = db.prepare(
      "INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, 'placed', ?)",
    );
    const insertPayment = db.prepare(`
      INSERT INTO payments (order_id, checkout_reference, method, status, amount)
      VALUES (?, ?, ?, 'pending', ?)
    `);
    const updateStock = db.prepare(
      'UPDATE products SET stock_qty = stock_qty - ? WHERE id = ? AND stock_qty >= ? AND is_active = 1',
    );
    const orderIds = [];

    for (const group of sellerGroups) {
      const deliveryFee = config.deliveryFee * 100;
      const total = group.subtotal - group.discount + deliveryFee;
      const orderResult = insertOrder.run(
        userId,
        group.sellerId,
        addressInternalId,
        coupon?.id || null,
        group.subtotal,
        group.discount,
        deliveryFee,
        total,
      );
      const orderId = Number(orderResult.lastInsertRowid);
      orderIds.push(orderId);
      insertHistory.run(orderId, userId);
      insertPayment.run(orderId, checkoutReference, paymentMethod, total);
      for (const item of group.items) {
        const stockResult = updateStock.run(item.quantity, item.product_id, item.quantity);
        if (!stockResult.changes) throw new AppError(409, `${item.name} no longer has enough stock.`);
        insertOrderItem.run(orderId, item.product_id, item.quantity, item.price);
      }
    }

    const checkedOut = db.prepare(
      "UPDATE carts SET status = 'checked_out', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'active'",
    ).run(cart.id);
    if (!checkedOut.changes) throw new AppError(409, 'Cart has already been checked out.');
    return { orderIds, checkoutReference };
  });

  const { orderIds: createdOrderIds, checkoutReference: reference } = transaction();
  return {
    checkoutReference: reference,
    orders: createdOrderIds.map((id) => getOrderView(id)),
  };
}
