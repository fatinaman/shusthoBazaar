import { db } from '../../db/index.js';
import { config } from '../../config/index.js';
import { AppError } from '../middleware/errors.js';
import { mapProduct } from './catalogue.js';

const cartIdForUser = db.prepare("SELECT id FROM carts WHERE user_id = ? AND status = 'active'");

export function getOrCreateCartId(userId) {
  let cart = cartIdForUser.get(userId);
  if (!cart) {
    const result = db.prepare(
      "INSERT INTO carts (user_id, status) VALUES (?, 'active')",
    ).run(userId);
    cart = { id: Number(result.lastInsertRowid) };
  }
  return cart.id;
}

function cartRows(cartId) {
  return db.prepare(`
    SELECT p.id, p.name, p.generic_name, p.description, p.price, p.stock_qty,
           p.requires_prescription, p.is_active, c.name AS category,
           s.id AS seller_id, s.pharmacy_name AS seller_name,
           (SELECT image_url FROM product_images pi
            WHERE pi.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS image,
           ci.quantity
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    JOIN categories c ON c.id = p.category_id
    JOIN sellers s ON s.id = p.seller_id
    WHERE ci.cart_id = ?
    ORDER BY p.id
  `).all(cartId);
}

function validCoupon(couponId) {
  if (!couponId) return null;
  const coupon = db.prepare(`
    SELECT id, code, discount_type, discount_value, min_order_amt, valid_from, valid_to
    FROM coupons
    WHERE id = ? AND is_active = 1
      AND valid_from <= ? AND valid_to >= ?
  `).get(couponId, new Date().toISOString(), new Date().toISOString());
  return coupon || null;
}

export function calculateDiscount(subtotal, coupon, allowBelowMinimum = false) {
  if (!coupon || (subtotal < coupon.min_order_amt && !allowBelowMinimum)) return 0;
  const discount = coupon.discount_type === 'percent'
    ? Math.round((subtotal * coupon.discount_value) / 100)
    : coupon.discount_value;
  return Math.min(subtotal, discount);
}

export function getCart(userId) {
  const cartId = getOrCreateCartId(userId);
  const rows = cartRows(cartId);
  const items = rows.map((row) => ({ ...mapProduct(row), quantity: row.quantity }));
  const subtotal = rows.reduce((sum, row) => sum + row.price * row.quantity, 0);
  const couponId = db.prepare('SELECT coupon_id FROM carts WHERE id = ?').get(cartId).coupon_id;
  const coupon = validCoupon(couponId);
  const discount = calculateDiscount(subtotal, coupon);
  const sellerCount = new Set(rows.map((row) => row.seller_id)).size;
  const shippingFee = sellerCount * config.deliveryFee * 100;
  return {
    items,
    subtotal: subtotal / 100,
    discount: discount / 100,
    couponCode: coupon?.code || null,
    sellerCount,
    shippingFee: shippingFee / 100,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    total: (subtotal - discount + shippingFee) / 100,
  };
}

export function addCartItem(userId, productId, quantity) {
  const cartId = getOrCreateCartId(userId);
  const product = db.prepare(
    'SELECT id, stock_qty, is_active FROM products WHERE id = ?',
  ).get(productId);
  if (!product || !product.is_active) throw new AppError(404, 'Product is unavailable.');

  const existing = db.prepare(
    'SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
  ).get(cartId, productId);
  const newQuantity = (existing?.quantity || 0) + quantity;
  if (newQuantity > product.stock_qty) throw new AppError(409, 'Requested quantity exceeds available stock.');

  db.prepare(`
    INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)
    ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = excluded.quantity
  `).run(cartId, productId, newQuantity);
  db.prepare('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(cartId);
}

export function updateCartItem(userId, productId, quantity) {
  const cartId = getOrCreateCartId(userId);
  const product = db.prepare('SELECT stock_qty, is_active FROM products WHERE id = ?').get(productId);
  if (!product?.is_active) throw new AppError(404, 'Product is unavailable.');
  if (quantity > product.stock_qty) throw new AppError(409, 'Requested quantity exceeds available stock.');
  const result = db.prepare(
    'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?',
  ).run(quantity, cartId, productId);
  if (!result.changes) throw new AppError(404, 'Cart item not found.');
  db.prepare('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(cartId);
}

export function removeCartItem(userId, productId) {
  const cartId = getOrCreateCartId(userId);
  const result = db.prepare(
    'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
  ).run(cartId, productId);
  if (!result.changes) throw new AppError(404, 'Cart item not found.');
  db.prepare('UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(cartId);
}

export function applyCartCoupon(userId, code) {
  const cartId = getOrCreateCartId(userId);
  const coupon = db.prepare(`
    SELECT id, code, discount_type, discount_value, min_order_amt, valid_from, valid_to
    FROM coupons
    WHERE upper(code) = upper(?) AND is_active = 1
      AND valid_from <= ? AND valid_to >= ?
  `).get(code, new Date().toISOString(), new Date().toISOString());
  if (!coupon) throw new AppError(404, 'Coupon is invalid or expired.');

  const subtotal = db.prepare(`
    SELECT COALESCE(SUM(p.price * ci.quantity), 0) AS subtotal
    FROM cart_items ci JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = ?
  `).get(cartId).subtotal;
  if (subtotal < coupon.min_order_amt) {
    throw new AppError(422, 'Cart subtotal does not meet the coupon minimum.');
  }
  db.prepare('UPDATE carts SET coupon_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(coupon.id, cartId);
}

export function removeCartCoupon(userId) {
  const cartId = getOrCreateCartId(userId);
  db.prepare('UPDATE carts SET coupon_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(cartId);
}

export function clearCartItems(userId) {
  const cartId = getOrCreateCartId(userId);
  const clear = db.transaction(() => {
    db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cartId);
    db.prepare('UPDATE carts SET coupon_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(cartId);
  });
  clear();
}
