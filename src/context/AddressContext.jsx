import { useMemo, useState } from 'react';

import { AddressContext } from './addressState';
const STORAGE_KEY = 'shusthobazaar_addresses';
const demoAddresses = [
  {
    id: 'addr-home',
    label: 'Home',
    recipient: 'Aminul Islam',
    phone: '01712345678',
    street: 'House 42, Road 11, Banani',
    city: 'Dhaka',
    postalCode: '1213',
  },
];

function getStoredAddresses() {
  if (typeof window === 'undefined') return [];

  try {
    const addresses = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(addresses) ? addresses : demoAddresses;
  } catch (error) {
    console.error('Unable to restore saved delivery addresses.', error);
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function AddressProvider({ children }) {
  const [addresses, setAddresses] = useState(getStoredAddresses);

  const value = useMemo(() => ({
    addresses,
    addAddress(address) {
      const savedAddress = { ...address, id: `addr-${Date.now()}` };
      const updated = [savedAddress, ...addresses];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setAddresses(updated);
      return savedAddress;
    },
    removeAddress(id) {
      const updated = addresses.filter((address) => address.id !== id);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setAddresses(updated);
    },
  }), [addresses]);

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}
