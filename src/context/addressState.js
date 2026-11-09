import { createContext, useContext } from 'react';

export const AddressContext = createContext(null);

export function useAddresses() {
  const context = useContext(AddressContext);
  if (!context) throw new Error('useAddresses must be used within AddressProvider.');
  return context;
}
