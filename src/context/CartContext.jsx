import { useCallback, useEffect, useMemo, useState } from 'react';
import { CartContext } from './cartState';
import { useAuth } from './authState';
import { api } from '../services/api';

const EMPTY_CART = { items: [], subtotal: 0, totalItems: 0, shippingFee: 0, discount: 0, total: 0, couponCode: null };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [savedCart, setSavedCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshCart = useCallback(async () => {
    if (user?.role !== 'customer') {
      return;
    }
    setLoading(true);
    try {
      setSavedCart(await api.cart.get());
      setError('');
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    let active = true;
    if (user?.role !== 'customer') return undefined;
    api.cart.get()
      .then((nextCart) => {
        if (active) {
          setSavedCart(nextCart);
          setError('');
        }
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id, user?.role]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!product.isAvailable || product.stock < 1) return false;
    setSavedCart(await api.cart.add({ productId: product.id, quantity }));
    return true;
  }, []);

  const removeFromCart = useCallback(async (id) => {
    setSavedCart(await api.cart.remove(id));
  }, []);

  const updateQuantity = useCallback(async (id, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    setSavedCart(await api.cart.update(id, { quantity }));
  }, [removeFromCart]);

  const applyCoupon = useCallback(async (code) => {
    setSavedCart(await api.cart.applyCoupon({ code }));
  }, []);

  const removeCoupon = useCallback(async () => {
    setSavedCart(await api.cart.removeCoupon());
  }, []);

  const clearCart = useCallback(async () => {
    if (user?.role === 'customer') setSavedCart(await api.cart.clear());
  }, [user?.role]);

  const cart = user?.role === 'customer' ? savedCart : EMPTY_CART;
  const value = useMemo(() => ({
    cartItems: cart.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon,
    clearCart,
    refreshCart,
    loading,
    error,
    subtotal: cart.subtotal,
    discount: cart.discount,
    couponCode: cart.couponCode,
    shippingFee: cart.shippingFee,
    total: cart.total,
    totalItems: cart.totalItems,
  }), [cart, addToCart, removeFromCart, updateQuantity, applyCoupon, removeCoupon, clearCart, refreshCart, loading, error]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}