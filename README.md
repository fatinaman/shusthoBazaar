# ShusthoBazaar

A React/Vite medicine marketplace with a TypeScript NestJS API and SQLite persistence. The current payment option is a **local mock only**: it records a chosen success or failure in SQLite and does not contact a payment gateway or move real money.

## Setup and run

Requires Node.js 20.19+ (or 22.12+) and npm.

```sh
npm install
npm --prefix server install
cp .env.example .env
```

Set `JWT_SECRET` in `.env` to a random secret of at least 32 characters. Then initialize the database and start both apps:

```sh
npm run db:reset
npm run dev:full
```

The Vite frontend runs at `http://localhost:5173` and proxies `/api` requests to NestJS at `http://localhost:3001`. Other useful commands:

| Command | Purpose |
|---|---|
| `npm run dev` | Frontend only |
| `npm run server:dev` | NestJS API in TypeScript watch mode |
| `npm --prefix server run build` | Compile the API to `server/dist` |
| `npm run db:reset` | Delete the configured local database, migrate, and reseed |
| `npm --prefix server test` | Run API/database integration tests |
| `npm run lint` | Lint frontend and server |
| `npm run build` | Build frontend |

`db:reset` is destructive to the database at `DB_PATH`; it does not delete other files.

## Environment

Copy `.env.example` to `.env`. `.env` is ignored by Git.

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | API port | `3001` |
| `CLIENT_URL` | Allowed browser origin for CORS | `http://localhost:5173` |
| `SERVER_URL` | API base URL | `http://localhost:3001` |
| `JWT_SECRET` | JWT signing secret (required) | — |
| `DB_PATH` | SQLite database file | `server/db/shusthobazaar.db` |

No SSLCommerz credentials are used. The mock payment screen never asks for card numbers, wallet credentials, or PINs.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | `customer@shusthobazaar.demo` | `Customer123!` |
| Seller | `seller@shusthobazaar.demo` | `Seller123!` |
| Admin | `admin@shusthobazaar.demo` | `Admin123!` |

These are public local-development accounts. Passwords are bcrypt-hashed in the database, but the values are also included in the frontend for quick-fill; never reuse them or treat this demo as production authentication.

## Payment behavior

Checkout supports Cash on Delivery and a local **Mock payment**. The mock screen has success and decline actions. Results are saved in the `payments` table (`method=mock`, `status=pending|success|failed`); repeated success is idempotent and a failed mock can be retried. COD payments become successful when an authorized seller/admin marks the order delivered.

For multi-seller carts, checkout creates one order per seller and applies the flat ৳60 delivery fee to each seller order. Coupon discounts are calculated server-side and allocated proportionally across those orders. Prices and totals are sent to the frontend in Taka and stored in SQLite as integer paisa.

## API

All endpoints return JSON except that the mock payment screen is a frontend route. Authentication uses the `httpOnly` `sb_session` cookie (also accepts `Authorization: Bearer <JWT>`). Authenticated customer endpoints are scoped to that customer; seller order views and status updates are scoped to their pharmacy; admins can access all orders.

| Method | Path | Access / purpose |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register a customer |
| `POST` | `/api/auth/login` | Sign in |
| `POST` | `/api/auth/logout` | Clear session |
| `GET` | `/api/auth/me` | Current session |
| `GET` | `/api/products?q=&category=&page=&limit=` | Search/filter paginated catalogue |
| `GET` | `/api/products/:id` | Product detail |
| `GET` | `/api/categories` | Categories |
| `GET` | `/api/cart` | Customer's active cart |
| `POST` | `/api/cart/items` | Add `{ "productId": "p001", "quantity": 1 }` |
| `PATCH` | `/api/cart/items/:productId` | Set `{ "quantity": 2 }` |
| `DELETE` | `/api/cart/items/:productId` | Remove an item |
| `DELETE` | `/api/cart` | Clear items and coupon |
| `POST` | `/api/cart/coupon` | Apply `{ "code": "WELCOME10" }` |
| `DELETE` | `/api/cart/coupon` | Remove coupon |
| `GET` | `/api/addresses` | Customer's addresses |
| `POST` | `/api/addresses` | Add a delivery address |
| `POST` | `/api/checkout` | Create seller-split orders, COD or mock |
| `GET` | `/api/orders` | Customer's, seller's, or admin's orders |
| `GET` | `/api/orders/:id` | Order details and status history |
| `PATCH` | `/api/orders/:id/status` | Seller/admin advances `placed` → `confirmed` → `out_for_delivery` → `delivered` |
| `GET` | `/api/orders/:id/invoice` | Generate if needed and return invoice JSON |
| `POST` | `/api/payments/mock/complete` | Persist mock `{ "checkoutReference": "...", "result": "success" }` or `"failed"` |

The example request collection in [`api.http`](./api.http) covers the API. Seed coupons are `WELCOME10` (10% off, ৳50 minimum) and `SAVE50` (৳50 off, ৳200 minimum).

## Database notes

`server/db/schema.sql` is the SQLite schema adapted from [`shusthobazaar_schema.sql`](./shusthobazaar_schema.sql). It contains only the tables used for accounts, catalogue, carts, orders, payment, and invoices. As agreed for frontend compatibility, it adds `recipient`, `phone`, and `postal_code` to addresses, `coupon_id` to carts, and `checkout_reference` to payments. Address coordinates default to a Dhaka map point because the existing form does not collect coordinates.

SQLite foreign keys and WAL mode are enabled on the server connection. Seed data includes the three demo roles/accounts, six categories, 22 products, local image paths, and two coupons.

## Project structure

```text
.
├── public/                 # Static assets and medicine images
├── server/
│   ├── config/
│   ├── db/                 # SQLite schema, migration, seed and reset
│   └── src/                # NestJS controllers, guards and TypeScript API
├── src/
│   ├── components/
│   ├── context/            # API-backed auth, catalogue, cart and addresses
│   ├── data/               # Public demo-account quick-fill
│   ├── layouts/
│   ├── pages/
│   └── routes/
├── .env.example
├── api.http
├── package.json
├── vite.config.js
└── README.md
```

## Not implemented

Real SSLCommerz integration, prescriptions, doctors, appointments, notifications, analytics, admin verification, and seller dashboard APIs are intentionally out of scope. The seller order screen only uses the API needed to advance tracking status.
