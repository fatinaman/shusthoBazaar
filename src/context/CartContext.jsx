import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartContext } from './cartState';
const STORAGE_KEY = 'shusthobazaar_cart';

function getStoredCart() {
  if (typeof window === 'undefined') return [];
  try {
    const items = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error('Unable to restore the saved cart.', error);
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getStoredCart);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product.isAvailable || product.stock < 1) return false;
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        return prevItems.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item,
        );
      }
      return [...prevItems, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
    return true;
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(quantity, item.stock) } : item,
      ),
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCartItems([]), []);

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  const totalItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    totalItems,
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, totalItems]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}