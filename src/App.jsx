import AppRoutes from './routes/AppRoutes';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { AddressProvider } from './context/AddressContext';
import { ProductProvider } from './context/ProductContext';

export default function App() {
  return (
    <AuthProvider>
      <AddressProvider>
        <ProductProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </ProductProvider>
      </AddressProvider>
    </AuthProvider>
  );
}