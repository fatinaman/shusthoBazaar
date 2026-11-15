import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProductContext } from './productState';
import { api } from '../services/api';

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.products.list({ limit: 100 })
      .then(({ products: catalogue }) => {
        if (active) setProducts(catalogue);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const saveProduct = useCallback((product) => {
    setProducts((current) => {
      const exists = current.some((entry) => entry.id === product.id);
      return exists
        ? current.map((entry) => (entry.id === product.id ? product : entry))
        : [product, ...current];
    });
  }, []);

  const removeProduct = useCallback((id) => {
    setProducts((current) => current.filter((product) => product.id !== id));
  }, []);

  const toggleProductAvailability = useCallback((id) => {
    setProducts((current) => current.map((product) =>
      product.id === id ? { ...product, isAvailable: !product.isAvailable } : product,
    ));
  }, []);

  const value = useMemo(() => ({
    products,
    loading,
    error,
    saveProduct,
    removeProduct,
    toggleProductAvailability,
  }), [products, loading, error, saveProduct, removeProduct, toggleProductAvailability]);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}
