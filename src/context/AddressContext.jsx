import { useEffect, useMemo, useState } from 'react';
import { AddressContext } from './addressState';
import { useAuth } from './authState';
import { api } from '../services/api';

export function AddressProvider({ children }) {
  const { user } = useAuth();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (user?.role !== 'customer') return undefined;
    api.addresses.list()
      .then(({ addresses }) => {
        if (active) {
          setSavedAddresses(addresses);
          setError('');
        }
      })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, [user?.id, user?.role]);

  const addresses = useMemo(
    () => user?.role === 'customer' ? savedAddresses : [],
    [user?.role, savedAddresses],
  );
  const value = useMemo(() => ({
    addresses,
    error,
    async addAddress(address) {
      const previousIds = new Set(addresses.map((entry) => entry.id));
      const { addresses: nextAddresses } = await api.addresses.add(address);
      setSavedAddresses(nextAddresses);
      return nextAddresses.find((entry) => !previousIds.has(entry.id)) || nextAddresses[0];
    },
  }), [addresses, error]);

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>;
}
