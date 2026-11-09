# ShusthoBazaar

A frontend-only pharmacy marketplace showcase built with React and Vite. Product, cart, address, order, and demo sign-in state is stored in the browser; this is not a production pharmacy, authentication system, or payment application.

## Run locally

```sh
npm install
npm run dev
```

Build for static hosting with `npm run build`. Configure the host to serve `index.html` for application routes (SPA fallback).

## Demo accounts

Use the **Sign in** buttons to quick-fill the public demo accounts. The sample email/password pairs are in [`src/data/demoAccounts.js`](./src/data/demoAccounts.js). They are intentionally bundled with the frontend and are not secrets. Do not reuse these credentials or use this authentication pattern in production.

The customer can browse and add products to cart without signing in. Checkout and order history require a customer or admin demo account. Seller and admin workspaces use the seller/admin demo accounts.

## Payment sandbox

Without additional configuration, checkout provides a local-only bKash, Nagad, and card simulation. It never requests or stores a wallet PIN or real card details; the success and decline actions only exercise the showcase order flow.

To hand payment selection to a separately hosted instance of [`fatinaman/paymentSandbox`](https://github.com/fatinaman/paymentSandbox), set `VITE_PAYMENT_SANDBOX_URL` to that instance's payment-selection URL (for example `https://payments.example.com/`). Checkout sends amount, invoice, demo user, and a return URL. The sandbox's own API must be configured and reachable at that origin. The local demo fallback works without that service.

This integration was adapted to the repository's query-driven payment session and return URL flow. Do not submit real payment credentials to a sandbox or treat a client-side return status as verified payment. A production integration needs server-side order creation, transaction verification, and secure authentication.

## Showcase limitations

- Data is isolated to the current browser and can be cleared with browser site data.
- Sign-in is role switching against the public demo accounts, not secure authentication.
- Prescription uploads are validated and previewed in the browser; files are not uploaded or persisted.
- Order, inventory, and prescription changes are simulated.
- No real payment is processed.
