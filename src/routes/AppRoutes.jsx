import { BrowserRouter, Routes, Route } from 'react-router-dom';

import CustomerLayout from '../layouts/CustomerLayout';
import SellerLayout from '../layouts/SellerLayout';

import Home from '../pages/customer/Home';
import ProductCatalog from '../pages/customer/ProductCatalog';
import ProductDetails from '../pages/customer/ProductDetails';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import OrderTracking from '../pages/customer/OrderTracking';
import OrderHistory from '../pages/customer/OrderHistory';
import Invoice from '../pages/customer/Invoice';
import PaymentSandbox from '../pages/customer/PaymentSandbox';
import Login from '../pages/Login';

import SellerDashboard from '../pages/seller/SellerDashboard';
import ProductManagement from '../pages/seller/ProductManagement';
import OrderManagement from '../pages/seller/OrderManagement';
import PrescriptionVerification from '../pages/seller/PrescriptionVerification';
import AdminDashboard from '../pages/AdminDashboard';
import ProtectedRoute from './ProtectedRoute';

import AnalyticsReports from '../pages/admin/AnalyticsReports';
import AdminControlPanel from '../pages/admin/AdminControlPanel';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AnalyticsReports /></ProtectedRoute>} />
        <Route path="/admin/manage" element={<ProtectedRoute allowedRoles={['admin']}><AdminControlPanel /></ProtectedRoute>} />
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<ProtectedRoute allowedRoles={['customer']}><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><OrderHistory /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><OrderTracking /></ProtectedRoute>} />
          <Route path="/orders/:id/invoice" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><Invoice /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute allowedRoles={['customer']}><PaymentSandbox /></ProtectedRoute>} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']}><SellerLayout /></ProtectedRoute>}>
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<ProductManagement />} />
          <Route path="/seller/orders" element={<OrderManagement />} />
          <Route path="/seller/prescriptions" element={<PrescriptionVerification />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}