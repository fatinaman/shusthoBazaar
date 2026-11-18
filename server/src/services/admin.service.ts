import { db } from '../../db/index.js';

let initialized = false;

export function ensureAdminPrototypeData() {
  if (initialized) return;
  initialized = true;

  // Safely add tin_number column if it doesn't exist yet
  try {
    db.exec(`ALTER TABLE sellers ADD COLUMN tin_number TEXT;`);
  } catch {
    // Column already exists
  }

  db.exec(`
    UPDATE sellers SET tin_number = 'TIN-884920192' WHERE id = 1 AND tin_number IS NULL;
    UPDATE sellers SET tin_number = 'TIN-773819204' WHERE id = 2 AND tin_number IS NULL;
  `);

  const customer = db.prepare(`SELECT id FROM users ORDER BY id ASC LIMIT 1`).get() as { id: number } | undefined;
  const seller1 = db.prepare(`SELECT id FROM sellers ORDER BY id ASC LIMIT 1`).get() as { id: number } | undefined;
  const prod1 = db.prepare(`SELECT id FROM products ORDER BY id ASC LIMIT 1`).get() as { id: number } | undefined;

  if (customer && seller1 && prod1) {
    db.prepare(
      `INSERT OR IGNORE INTO marketplace_reviews (id, user_id, product_id, seller_id, rating, comment, is_visible)
       VALUES (1, ?, ?, ?, 5, 'Fast delivery and authentic medicine packaging.', 1),
              (2, ?, ?, ?, 3, 'Box arrived slightly dented during delivery.', 1)`
    ).run(customer.id, prod1.id, seller1.id, customer.id, prod1.id, seller1.id);

    db.prepare(
      `INSERT OR IGNORE INTO complaints (id, user_id, seller_id, subject, description, status)
       VALUES (1, ?, ?, 'Delayed Delivery', 'Order arrived 1 hour later than estimated.', 'open'),
              (2, ?, ?, 'Missing Strip', 'Ordered 2 strips, received 1 strip.', 'in_review')`
    ).run(customer.id, seller1.id, customer.id, seller1.id);

    db.prepare(
      `INSERT OR IGNORE INTO analytics_events (id, seller_id, product_id, event_type)
       VALUES (1, ?, ?, 'view_product'), (2, ?, ?, 'view_product'), (3, ?, ?, 'view_product'), (4, ?, ?, 'view_product'),
              (5, ?, ?, 'add_to_cart'), (6, ?, ?, 'add_to_cart'), (7, ?, ?, 'add_to_cart'),
              (8, ?, ?, 'checkout_started'), (9, ?, ?, 'checkout_started'),
              (10, ?, ?, 'payment_success')`
    ).run(
      seller1.id, prod1.id, seller1.id, prod1.id, seller1.id, prod1.id, seller1.id, prod1.id,
      seller1.id, prod1.id, seller1.id, prod1.id, seller1.id, prod1.id,
      seller1.id, prod1.id, seller1.id, prod1.id,
      seller1.id, prod1.id
    );
  }
}

export function listAllUsers() {
  ensureAdminPrototypeData();
  return db
    .prepare(
      `SELECT u.id, u.full_name AS fullName, u.email, u.phone, u.is_active AS isActive, r.name AS role, u.created_at AS createdAt
       FROM users u
       JOIN roles r ON r.id = u.role_id
       ORDER BY u.id DESC`
    )
    .all();
}

export function setUserActiveStatus(userId: number, isActive: boolean) {
  db.prepare(`UPDATE users SET is_active = ? WHERE id = ?`).run(isActive ? 1 : 0, userId);
  return { success: true };
}

export function listAllSellersAdmin() {
  ensureAdminPrototypeData();
  return db
    .prepare(
      `SELECT s.id, s.pharmacy_name AS pharmacyName, s.drug_license_no AS drugLicenseNo,
              s.tin_number AS tinNumber, s.city, s.status, s.rejection_reason AS rejectionReason,
              u.full_name AS ownerName, u.email
       FROM sellers s
       JOIN users u ON u.id = s.user_id
       ORDER BY s.id DESC`
    )
    .all();
}

export function verifySellerAccount(
  sellerId: number,
  adminUserId: number | null,
  status: 'approved' | 'rejected',
  reason?: string
) {
  db.prepare(
    `UPDATE sellers
     SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(status, status === 'rejected' ? reason || 'Rejected by admin' : null, adminUserId, sellerId);
  return { success: true };
}

export function listAllDoctorsAdmin() {
  return db
    .prepare(
      `SELECT id, full_name AS fullName, email, phone, specialty, bmdc_reg_no AS bmdcRegNo,
              ROUND(consultation_fee / 100.0, 2) AS consultationFee, status, rejection_reason AS rejectionReason
       FROM doctors
       ORDER BY id DESC`
    )
    .all();
}

export function verifyDoctorAccount(doctorId: number, status: 'approved' | 'rejected', reason?: string) {
  db.prepare(
    `UPDATE doctors
     SET status = ?, rejection_reason = ?, reviewed_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(status, status === 'rejected' ? reason || 'Invalid BMDC credentials' : null, doctorId);
  return { success: true };
}

export function listCouponsAdmin() {
  return db
    .prepare(
      `SELECT id, code, discount_type AS discountType,
              CASE WHEN discount_type = 'fixed' THEN ROUND(discount_value / 100.0, 2) ELSE discount_value END AS discountValue,
              ROUND(min_order_amt / 100.0, 2) AS minOrderAmt,
              valid_from AS validFrom, valid_to AS validTo, is_active AS isActive
       FROM coupons
       ORDER BY id DESC`
    )
    .all();
}

export function createCouponAdmin(input: {
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmt: number;
  validTo: string;
}) {
  const storedDiscount = input.discountType === 'fixed' ? Math.round(input.discountValue * 100) : Math.round(input.discountValue);
  const storedMinOrder = Math.round(input.minOrderAmt * 100);
  db.prepare(
    `INSERT INTO coupons (code, discount_type, discount_value, min_order_amt, valid_from, valid_to, is_active)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 1)`
  ).run(input.code.toUpperCase(), input.discountType, storedDiscount, storedMinOrder, input.validTo);
  return { success: true };
}

export function toggleCouponAdmin(couponId: number, isActive: boolean) {
  db.prepare(`UPDATE coupons SET is_active = ? WHERE id = ?`).run(isActive ? 1 : 0, couponId);
  return { success: true };
}

export function listReviewsAdmin() {
  ensureAdminPrototypeData();
  return db
    .prepare(
      `SELECT mr.id, mr.rating, mr.comment, mr.is_visible AS isVisible, mr.created_at AS createdAt,
              u.full_name AS authorName, p.name AS productName, s.pharmacy_name AS pharmacyName
       FROM marketplace_reviews mr
       JOIN users u ON u.id = mr.user_id
       LEFT JOIN products p ON p.id = mr.product_id
       LEFT JOIN sellers s ON s.id = mr.seller_id
       ORDER BY mr.id DESC`
    )
    .all();
}

export function toggleReviewVisibilityAdmin(reviewId: number, isVisible: boolean) {
  db.prepare(`UPDATE marketplace_reviews SET is_visible = ? WHERE id = ?`).run(isVisible ? 1 : 0, reviewId);
  return { success: true };
}

export function listComplaintsAdmin() {
  ensureAdminPrototypeData();
  return db
    .prepare(
      `SELECT c.id, c.subject, c.description, c.status, c.admin_action_taken AS adminActionTaken, c.created_at AS createdAt,
              u.full_name AS customerName, s.pharmacy_name AS pharmacyName
       FROM complaints c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN sellers s ON s.id = c.seller_id
       ORDER BY c.id DESC`
    )
    .all();
}

export function resolveComplaintAdmin(complaintId: number, actionTaken: string) {
  db.prepare(`UPDATE complaints SET status = 'resolved', admin_action_taken = ? WHERE id = ?`).run(actionTaken, complaintId);
  return { success: true };
}