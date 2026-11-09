import { useCallback, useEffect, useMemo, useState } from 'react';
import { initialProducts } from '../data/seed';
import { ProductContext } from './productState';

const STORAGE_KEY = 'shusthobazaar_products';

function getStoredProducts() {
  try {
    const products = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(products) ? products : initialProducts;
  } catch (error) {
    console.error('Unable to restore the saved product catalogue.', error);
    window.localStorage.removeItem(STORAGE_KEY);
    return initialProducts;
  }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(getStoredProducts);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

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
    saveProduct,
    removeProduct,
    toggleProductAvailability,
  }), [products, saveProduct, removeProduct, toggleProductAvailability]);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}
