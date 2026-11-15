-- ShusthoBazaar: normalized (3NF) PostgreSQL schema
-- Run: psql -U postgres -c "CREATE DATABASE shusthobazaar;"
--      psql -U postgres -d shusthobazaar -f shusthobazaar_schema.sql

BEGIN;

-- ============ ENUM TYPES ============
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE order_status        AS ENUM ('placed', 'confirmed', 'out_for_delivery', 'delivered', 'rejected', 'cancelled');
CREATE TYPE payment_method      AS ENUM ('sslcommerz', 'cod');
CREATE TYPE payment_status      AS ENUM ('pending', 'success', 'failed');
CREATE TYPE delivery_status     AS ENUM ('pending', 'dispatched', 'out_for_delivery', 'delivered');
CREATE TYPE cart_status         AS ENUM ('active', 'checked_out', 'abandoned');
CREATE TYPE discount_type       AS ENUM ('percent', 'fixed');
CREATE TYPE slot_period         AS ENUM ('morning', 'afternoon', 'after_hours');
CREATE TYPE appointment_status  AS ENUM ('booked', 'completed', 'cancelled', 'no_show');
CREATE TYPE file_type           AS ENUM ('jpeg', 'png', 'pdf');

-- ============ USERS & ROLES ============
CREATE TABLE roles (
    id   SMALLSERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE   -- customer, seller, doctor, admin
);

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    role_id       SMALLINT     NOT NULL REFERENCES roles(id),
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(20)  UNIQUE,
    password_hash TEXT         NOT NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE notification_settings (
    user_id          BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_reminders  BOOLEAN NOT NULL DEFAULT TRUE,
    sms_reminders    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE addresses (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label        VARCHAR(40),
    address_line TEXT         NOT NULL,
    area         VARCHAR(80),
    city         VARCHAR(80)  NOT NULL,
    latitude     NUMERIC(9,6) NOT NULL,
    longitude    NUMERIC(9,6) NOT NULL,
    is_default   BOOLEAN      NOT NULL DEFAULT FALSE
);

-- ============ SELLERS (PHARMACIES) ============
CREATE TABLE sellers (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    pharmacy_name       VARCHAR(150) NOT NULL,
    drug_license_no     VARCHAR(60)  NOT NULL UNIQUE,
    address_line        TEXT         NOT NULL,
    city                VARCHAR(80)  NOT NULL,
    latitude            NUMERIC(9,6) NOT NULL,
    longitude           NUMERIC(9,6) NOT NULL,
    status              verification_status NOT NULL DEFAULT 'pending',
    rejection_reason    TEXT,
    reviewed_by         BIGINT REFERENCES users(id),
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ============ CATALOGUE ============
CREATE TABLE categories (
    id        SERIAL PRIMARY KEY,
    parent_id INT REFERENCES categories(id),
    name      VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    id                    BIGSERIAL PRIMARY KEY,
    seller_id             BIGINT       NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    category_id           INT          NOT NULL REFERENCES categories(id),
    name                  VARCHAR(200) NOT NULL,
    generic_name          VARCHAR(200),
    description           TEXT,
    price                 NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    stock_qty             INT          NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    low_stock_threshold   INT          NOT NULL DEFAULT 10,
    requires_prescription BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_name_search ON products USING gin (to_tsvector('simple', name || ' ' || coalesce(generic_name, '')));
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);

CREATE TABLE product_images (
    id         BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url  TEXT   NOT NULL,
    sort_order SMALLINT NOT NULL DEFAULT 0
);

-- ============ CART & COUPONS ============
CREATE TABLE coupons (
    id             SERIAL PRIMARY KEY,
    code           VARCHAR(30) NOT NULL UNIQUE,
    discount_type  discount_type NOT NULL,
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    min_order_amt  NUMERIC(10,2) NOT NULL DEFAULT 0,
    valid_from     TIMESTAMPTZ NOT NULL,
    valid_to       TIMESTAMPTZ NOT NULL,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE carts (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status     cart_status NOT NULL DEFAULT 'active',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()   -- drives abandoned-cart reminders
);
CREATE UNIQUE INDEX uq_one_active_cart ON carts(user_id) WHERE status = 'active';

CREATE TABLE cart_items (
    cart_id    BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity   INT    NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (cart_id, product_id)
);

-- ============ PRESCRIPTIONS ============
CREATE TABLE prescriptions (
    id               BIGSERIAL PRIMARY KEY,
    customer_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_url         TEXT   NOT NULL,
    file_type        file_type NOT NULL,
    status           verification_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by      BIGINT REFERENCES users(id),
    reviewed_at      TIMESTAMPTZ,
    uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ DELIVERY FEE RULES ============
CREATE TABLE delivery_fee_rules (
    id      SERIAL PRIMARY KEY,
    min_km  NUMERIC(5,2) NOT NULL,
    max_km  NUMERIC(5,2) NOT NULL,
    fee     NUMERIC(8,2) NOT NULL CHECK (fee >= 0),
    CHECK (max_km > min_km)
);

-- ============ ORDERS (one order per seller; checkout splits a multi-vendor cart) ============
CREATE TABLE orders (
    id            BIGSERIAL PRIMARY KEY,
    customer_id   BIGINT NOT NULL REFERENCES users(id),
    seller_id     BIGINT NOT NULL REFERENCES sellers(id),
    address_id    BIGINT NOT NULL REFERENCES addresses(id),
    coupon_id     INT REFERENCES coupons(id),
    status        order_status NOT NULL DEFAULT 'placed',
    subtotal      NUMERIC(10,2) NOT NULL,
    discount_amt  NUMERIC(10,2) NOT NULL DEFAULT 0,
    delivery_fee  NUMERIC(8,2)  NOT NULL DEFAULT 0,
    total_amt     NUMERIC(10,2) NOT NULL,
    placed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_seller_status ON orders(seller_id, status);

CREATE TABLE order_items (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity   INT    NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL   -- price snapshot at purchase time
);

CREATE TABLE order_status_history (   -- powers the tracking stepper
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status     order_status NOT NULL,
    changed_by BIGINT REFERENCES users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_prescriptions (
    order_id        BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    prescription_id BIGINT NOT NULL REFERENCES prescriptions(id),
    PRIMARY KEY (order_id, prescription_id)
);

CREATE TABLE deliveries (
    id           BIGSERIAL PRIMARY KEY,
    order_id     BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    distance_km  NUMERIC(6,2) NOT NULL,
    fee_rule_id  INT REFERENCES delivery_fee_rules(id),
    status       delivery_status NOT NULL DEFAULT 'pending',
    dispatched_at TIMESTAMPTZ,
    delivered_at  TIMESTAMPTZ
);

CREATE TABLE payments (
    id             BIGSERIAL PRIMARY KEY,
    order_id       BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method         payment_method NOT NULL,
    status         payment_status NOT NULL DEFAULT 'pending',
    amount         NUMERIC(10,2) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,    -- SSLCommerz tran_id / val_id
    paid_at        TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    invoice_no VARCHAR(30) NOT NULL UNIQUE,
    issued_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ DOCTORS ============
CREATE TABLE specialities (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE doctors (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bmdc_reg_no      VARCHAR(30) NOT NULL UNIQUE,
    bio              TEXT,
    consultation_fee NUMERIC(8,2) NOT NULL DEFAULT 0,
    status           verification_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by      BIGINT REFERENCES users(id),
    reviewed_at      TIMESTAMPTZ
);

CREATE TABLE doctor_specialities (
    doctor_id     BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    speciality_id INT    NOT NULL REFERENCES specialities(id),
    PRIMARY KEY (doctor_id, speciality_id)
);

CREATE TABLE doctor_documents (   -- degree certificates etc.
    id          BIGSERIAL PRIMARY KEY,
    doctor_id   BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    doc_type    VARCHAR(40) NOT NULL,
    file_url    TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE doctor_availability (
    id        BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    weekday   SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    period    slot_period NOT NULL,
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,
    CHECK (end_time > start_time),
    UNIQUE (doctor_id, weekday, start_time)
);

-- ============ APPOINTMENTS & CONSULTATION ============
CREATE TABLE appointments (
    id           BIGSERIAL PRIMARY KEY,
    patient_id   BIGINT NOT NULL REFERENCES users(id),
    doctor_id    BIGINT NOT NULL REFERENCES doctors(id),
    slot_date    DATE   NOT NULL,
    period       slot_period NOT NULL,
    start_time   TIME   NOT NULL,
    end_time     TIME   NOT NULL,
    status       appointment_status NOT NULL DEFAULT 'booked',
    fee          NUMERIC(8,2) NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (doctor_id, slot_date, start_time)     -- prevents double booking
);
CREATE INDEX idx_appointments_patient ON appointments(patient_id, slot_date);

CREATE TABLE consultations (
    id             BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    medical_notes  TEXT,
    started_at     TIMESTAMPTZ,
    ended_at       TIMESTAMPTZ
);

CREATE TABLE consultation_messages (
    id              BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    sender_id       BIGINT NOT NULL REFERENCES users(id),
    body            TEXT,
    attachment_url  TEXT,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (body IS NOT NULL OR attachment_url IS NOT NULL)
);

CREATE TABLE doctor_reviews (
    id             BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    rating         SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ NOTIFICATIONS ============
CREATE TABLE notifications (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(30) NOT NULL,   -- abandoned_cart, refill_reminder, order_update, ...
    title      VARCHAR(150) NOT NULL,
    body       TEXT,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- ============ SEED DATA ============
INSERT INTO roles (name) VALUES ('customer'), ('seller'), ('doctor'), ('admin');

COMMIT;
