# Shushtobazaar — Project Documentation

> A multi-vendor online pharmacy and medicine marketplace.

## 1. Project Overview

**Shushtobazaar** is a multi-vendor medicine e-commerce platform that connects customers with multiple pharmacies and medicine sellers through a unified online marketplace.

Customers can browse medicines, search for products, add items to their shopping cart, upload prescriptions when required, place orders, select payment methods, and track deliveries.

Multiple sellers can register (simulated in the MVP), manage their product catalogues, update inventory, process incoming orders, and verify uploaded prescriptions.

The project will initially be developed as a **frontend-only MVP using React**, with mock data and LocalStorage for persistence. A Node.js, Express, and MongoDB backend can be integrated in a later development phase.

### Main objectives

- Build a complete multi-vendor e-commerce experience.
- Implement realistic customer shopping workflows.
- Develop a dedicated seller dashboard.
- Implement prescription upload and verification workflows.
- Practice real-world React architecture and state management.
- Create a foundation that can later evolve into a full MERN application.

---

## 2. User Roles

The application has two primary interfaces.

### 2.1 Customer

Customers can:

- Browse available medicines.
- Search and filter products.
- View product details.
- Add products to their shopping cart.
- Apply discount coupons.
- Manage delivery addresses.
- Upload prescriptions for applicable medicines.
- Place orders.
- Select payment methods.
- Track order progress.
- View and print invoices.

### 2.2 Seller

Sellers can:

- View their dashboard.
- Manage their product catalogue.
- Add, edit, and delete products.
- Update prices and inventory.
- Monitor low-stock products.
- View incoming orders.
- Accept or reject orders.
- Update order statuses.
- Review uploaded prescriptions.
- Approve or reject prescription submissions.
- View sales and order metrics.

---

## 3. Application Modules

### Module 1: Product Catalogue, Shopping Cart & Checkout

#### Product Listing Page (PLP)

Features:

- Responsive product grid.
- Product image previews.
- Product name and description.
- Product pricing.
- Seller information and tags.
- Stock availability.
- Prescription requirement indicators.
- Real-time search.
- Category dropdown filters.
- Price sorting.
- Add-to-cart functionality.

#### Product Detail Page (PDP)

Features:

- Product image gallery.
- Product information.
- Description.
- Price and seller information.
- Stock availability.
- Prescription requirement.
- Quantity selector.
- Add-to-cart button.

#### Shopping Cart

Features:

- Cart drawer or dedicated cart page.
- Product listing.
- Quantity increment/decrement.
- Remove items.
- Subtotal calculation.
- Coupon input.
- Discount calculation.
- Total calculation.
- Persistent cart using LocalStorage.

#### Multi-step Checkout

Checkout consists of the following steps:

1. **Delivery Address**
   - Select an existing address.
   - Add a new address.
   - Edit or remove addresses.

2. **Prescription Upload**
   - Identify products requiring prescriptions.
   - Upload supporting documents.
   - Preview uploaded files.

3. **Order Review**
   - Review selected products.
   - Review quantities and pricing.
   - Review delivery address.
   - Review discounts and total.

4. **Payment Selection**
   - Cash on Delivery.
   - Simulated SSLCommerz payment option.

5. **Order Confirmation**
   - Generate order ID.
   - Display order summary.
   - Show payment status.

---

### Module 2: Order Tracking & Payment Integration

#### Order Confirmation Page

Features:

- Order ID.
- Order summary.
- Customer information.
- Delivery address.
- Payment method.
- Payment status.
- Order status.

#### Order Details & Tracking

Order progression:

`Placed → Confirmed → Out for Delivery → Delivered`

Features:

- Visual progress stepper.
- Order status indicators.
- Order item information.
- Seller information.
- Payment information.
- Delivery details.

#### Payment Interface

Payment methods:

- SSLCommerz (simulated in frontend MVP).
- Cash on Delivery (COD).

Payment statuses:

- Success.
- Failed.
- Pending.

Actual SSLCommerz integration will require a secure backend to initiate and verify transactions.

#### Digital Invoice

Features:

- Invoice number.
- Order information.
- Customer information.
- Product details.
- Quantity and pricing.
- Discounts.
- Final payable amount.
- Printable invoice.
- PDF export functionality.

---

### Module 3: Multi-Vendor Seller Dashboard & Inventory Management

#### Seller Dashboard

Overview metric cards:

- Total Sales.
- Total Orders.
- Pending Orders.
- Low Stock Alerts.

Additional features:

- Sales overview.
- Recent orders.
- Inventory summary.
- Order statistics.

#### Product Management

Features:

- Product management table.
- Add product modal.
- Edit product modal.
- Delete product.
- Update price.
- Update available stock.
- Toggle product availability.
- Product image management.
- Prescription requirement configuration.

#### Order Management

Features:

- Incoming orders panel.
- Order details.
- Accept order.
- Reject order.
- Update order status.
- View associated prescription status.

#### Multi-Vendor Logic

Each product belongs to a specific seller through a `sellerId`.

Example:

```javascript
{
  id: "p101",
  name: "Medicine A",
  price: 150,
  stock: 50,
  sellerId: "s001"
}
```

Sellers should only manage their own products and relevant order items.

For multi-vendor orders, individual order items should maintain their seller association and processing status.

---

### Module 4: Prescription Upload & Validation

This module provides a prescription submission and human-review workflow.

#### Customer Side

Features:

- Drag-and-drop file uploader.
- JPEG support.
- PNG support.
- PDF support.
- Image preview.
- PDF preview.
- Upload validation.
- Prescription submission.
- Verification status display.

#### Prescription Statuses

- Pending Verification.
- Approved.
- Rejected.

#### Seller Side

Features:

- Prescription verification queue.
- View submitted prescriptions.
- Image preview.
- Zoom and inspect uploaded documents.
- Approve prescription.
- Reject prescription.
- Provide rejection reason.
- Update associated order-item verification status.

Prescription verification is simulated in the frontend MVP and must not be treated as automated medical validation.

---

## 4. Technology Stack

### Frontend MVP

| Technology | Purpose |
|---|---|
| React | UI development |
| Vite | Development environment and build tool |
| JavaScript | Application logic |
| Tailwind CSS | Styling |
| React Router DOM | Navigation and routing |
| Context API | Global state management |
| useReducer | Complex state transitions |
| LocalStorage | Mock data persistence |
| IndexedDB | Browser-side file persistence when needed |
| React Hook Form | Form management |
| Lucide React | Icons |
| Recharts | Dashboard charts |
| Sonner | Toast notifications |
| jsPDF / Browser Print | Invoice generation |

### Future Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB | Database |
| Mongoose | Database modeling |
| JWT / Secure Sessions | Authentication |
| Cloudinary or equivalent | File storage |
| SSLCommerz | Payment integration |
| REST API | Frontend-backend communication |

---

## 5. Application Routes

### Customer Routes

| Route | Page |
|---|---|
| `/` | Homepage |
| `/products` | Product Listing |
| `/products/:id` | Product Details |
| `/cart` | Shopping Cart |
| `/checkout` | Checkout Flow |
| `/orders` | Customer Order History |
| `/orders/:id` | Order Details & Tracking |
| `/orders/:id/invoice` | Digital Invoice |

### Seller Routes

| Route | Page |
|---|---|
| `/seller/dashboard` | Seller Dashboard |
| `/seller/products` | Product Management |
| `/seller/orders` | Order Management |
| `/seller/prescriptions` | Prescription Verification |

---

## 6. Data Models

The frontend mock data should follow a structure that can later be migrated to MongoDB.

### User

```javascript
{
  id: "u001",
  name: "Customer Name",
  email: "customer@example.com",
  role: "customer"
}
```

### Seller

```javascript
{
  id: "s001",
  userId: "u002",
  storeName: "Shushto Pharmacy",
  contact: "017XXXXXXXX",
  address: "Dhaka, Bangladesh"
}
```

### Product

```javascript
{
  id: "p001",
  name: "Medicine A",
  description: "Product description",
  price: 150,
  category: "Medicine",
  stock: 50,
  sellerId: "s001",
  image: "/images/medicine-a.jpg",
  requiresPrescription: false,
  isAvailable: true
}
```

### Cart

```javascript
{
  id: "cart001",
  customerId: "u001",
  items: [
    {
      productId: "p001",
      sellerId: "s001",
      quantity: 2
    }
  ],
  couponCode: null
}
```

### Order

```javascript
{
  id: "ord001",
  customerId: "u001",
  items: [],
  addressId: "addr001",
  subtotal: 300,
  discount: 0,
  total: 300,
  paymentMethod: "cod",
  paymentStatus: "pending",
  orderStatus: "placed",
  createdAt: "2026-11-09T12:00:00Z"
}
```

### Order Item

```javascript
{
  id: "oi001",
  orderId: "ord001",
  productId: "p001",
  sellerId: "s001",
  quantity: 2,
  unitPrice: 150,
  status: "placed",
  prescriptionId: null
}
```

### Prescription

```javascript
{
  id: "pres001",
  orderItemId: "oi001",
  fileName: "prescription.jpg",
  fileType: "image/jpeg",
  status: "pending",
  reviewedBy: null,
  rejectionReason: null
}
```

### Address

```javascript
{
  id: "addr001",
  customerId: "u001",
  recipient: "Customer Name",
  phone: "017XXXXXXXX",
  street: "Example Road",
  city: "Dhaka",
  postalCode: "1230"
}
```

---

## 7. Suggested Project Structure

```text
shushtobazaar/
│
├── public/
│   └── images/
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── prescription/
│   │   └── seller/
│   │
│   ├── pages/
│   │   ├── customer/
│   │   └── seller/
│   │
│   ├── layouts/
│   │   ├── CustomerLayout.jsx
│   │   └── SellerLayout.jsx
│   │
│   ├── context/
│   │   ├── CartContext.jsx
│   │   ├── ProductContext.jsx
│   │   └── OrderContext.jsx
│   │
│   ├── hooks/
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── services/
│   │   └── storage.js
│   │
│   ├── data/
│   │   └── seed.js
│   │
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
├── .gitignore
├── .env.example
├── package.json
├── package-lock.json
├── README.md
└── PROJECT.md
```

---

## 8. Development Roadmap

Development will be divided into seven phases.

| Phase | Scope | Estimated Time |
|---|---|---|
| Phase 1 | Project setup, React Router, layouts | 3–4 hours |
| Phase 2 | Product catalogue and product details | 4–5 hours |
| Phase 3 | Shopping cart and state management | 4–5 hours |
| Phase 4 | Checkout, orders and invoices | 4–5 hours |
| Phase 5 | Seller dashboard and inventory | 5–6 hours |
| Phase 6 | Prescription upload and verification | 3–4 hours |
| Phase 7 | Testing, responsive design and deployment | 3–5 hours |

**Estimated total: 26–34 focused development hours.**

The application should be developed incrementally, with each phase building upon the previous one.

---

## 9. GitHub Workflow

Use Git and GitHub throughout development.

### Conventional Commit Messages

| Prefix | Purpose |
|---|---|
| `feat:` | New functionality |
| `fix:` | Bug fixes |
| `refactor:` | Code restructuring |
| `style:` | Styling and formatting |
| `docs:` | Documentation |
| `test:` | Tests |
| `chore:` | Configuration and maintenance |

Examples:

```text
chore: initialize vite project
feat: configure react router
feat: create customer layout
feat: implement product listing
feat: add product search and filtering
feat: implement cart context
feat: persist cart in local storage
feat: implement checkout flow
fix: correct cart subtotal calculation
docs: update project documentation
```

### Git Practices

- Commit after small, meaningful, working units.
- Push changes regularly.
- Use feature branches when appropriate.
- Keep `node_modules` and `.env` out of Git.
- Maintain an updated README.
- Include screenshots and a live demo link.
- Avoid giant commits containing unrelated changes.

---

## 10. MVP Scope and Limitations

The first release will be a frontend-only demonstration.

| Feature | Frontend MVP | Future Version |
|---|---|---|
| Product catalogue | Seed data | MongoDB |
| Search and filters | React state | API queries |
| Cart | LocalStorage | Backend persistence |
| Checkout | Simulated | Real order creation |
| Order tracking | Mock statuses | Server-side updates |
| Seller dashboard | Mock seller accounts | Secure authentication |
| Inventory | LocalStorage | Shared database |
| Payments | Simulated | SSLCommerz |
| Prescriptions | Browser preview | Secure cloud storage |
| Invoice | Browser print | Server-generated PDF |

**Important:** LocalStorage is not a secure database. It is only for demonstrating the frontend workflow. Real payments, inventory, prescriptions and seller authorization must be handled securely by a backend.

---

## 11. Quality and Development Principles

The project should follow these principles:

1. Component-based architecture.
2. Reusable UI components.
3. Separation of business logic and presentation.
4. Centralized state management where appropriate.
5. Consistent naming conventions.
6. Responsive design.
7. Accessible forms and interactive elements.
8. Proper loading, error and empty states.
9. Meaningful Git commits.
10. Incremental development and testing.

### Important business logic

- Products must belong to sellers.
- Orders can contain products from multiple sellers.
- Sellers should only manage their own order items.
- Prescription requirements should be associated with individual products.
- Orders containing prescription-required products should respect verification status.
- Inventory must be updated consistently.
- Payment status and order status should be separate.
- Rejected orders and prescriptions should have clear reasons.

---

## 12. Final Project Goal

The final objective is to build **Shushtobazaar**, a polished and responsive multi-vendor pharmacy marketplace featuring:

- A complete customer shopping experience.
- A functional seller dashboard.
- Product and inventory management.
- Multi-step checkout.
- Order management and tracking.
- Prescription upload and human verification.
- Payment workflow simulation.
- Digital invoices.
- Persistent frontend mock data.
- Public deployment.

Once the frontend MVP is complete, the application can evolve into a full MERN project by integrating Express, MongoDB, secure authentication, file storage and actual payment processing.

**The priority is not simply to create attractive pages. It is to build a connected application where customer actions, seller actions, orders, inventory and prescription workflows interact correctly.**