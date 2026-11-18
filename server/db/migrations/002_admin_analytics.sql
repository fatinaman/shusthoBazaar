PRAGMA foreign_keys = ON;

-- Doctors table for Feature 20 BMDC Verification
CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  specialty TEXT NOT NULL,
  bmdc_reg_no TEXT NOT NULL UNIQUE,
  consultation_fee INTEGER NOT NULL DEFAULT 50000,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Marketplace reviews for Feature 20 Moderation
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  seller_id INTEGER REFERENCES sellers(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  is_visible INTEGER NOT NULL DEFAULT 1 CHECK (is_visible IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Customer complaints for Feature 20 Resolution
CREATE TABLE IF NOT EXISTS complaints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id INTEGER REFERENCES sellers(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved')),
  admin_action_taken TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Conversion funnel events for Feature 19 Analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view_product', 'add_to_cart', 'checkout_started', 'payment_success')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Standalone seed (idempotent & no foreign keys)
INSERT OR IGNORE INTO doctors (full_name, email, phone, specialty, bmdc_reg_no, consultation_fee, status) VALUES
  ('Dr. Farhana Rahman', 'dr.farhana@shusthobazaar.demo', '01911000001', 'Internal Medicine', 'BMDC-A-54321', 60000, 'approved'),
  ('Dr. Tanvir Ahmed',   'dr.tanvir@shusthobazaar.demo',  '01911000002', 'Cardiology',        'BMDC-A-98765', 80000, 'pending');