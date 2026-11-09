import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout';
import SellerLayout from '../layouts/SellerLayout';

// Customer Pages
import Home from '../pages/customer/Home';
import ProductCatalog from '../pages/customer/ProductCatalog';
import ProductDetails from '../pages/customer/ProductDetails';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import OrderTracking from '../pages/customer/OrderTracking';
import Invoice from '../pages/customer/Invoice';

// Seller Pages
import SellerDashboard from '../pages/seller/SellerDashboard';
import ProductManagement from '../pages/seller/ProductManagement';
import OrderManagement from '../pages/seller/OrderManagement';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Layout & Routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
          <Route path="/orders/:id/invoice" element={<Invoice />} />
        </Route>

        {/* Seller Layout & Routes */}
        <Route element={<SellerLayout />}>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<ProductManagement />} />
          <Route path="/seller/orders" element={<OrderManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}