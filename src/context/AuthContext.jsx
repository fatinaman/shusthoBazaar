import { useMemo, useState } from 'react';
import { demoAccounts } from '../data/demoAccounts';
import { AuthContext } from './authState';
const STORAGE_KEY = 'shusthobazaar_demo_user';

function getPublicUser(account) {
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    sellerId: account.sellerId || null,
    storeName: account.storeName,
  };
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const storedUser = window.localStorage.getItem(STORAGE_KEY);
    if (!storedUser) return null;

    const user = JSON.parse(storedUser);
    const account = demoAccounts.find((entry) => entry.id === user.id);
    if (!account) return null;
    return getPublicUser(account);
  } catch (error) {
    console.error('Unable to restore the demo sign-in session.', error);
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);

  const value = useMemo(() => ({
    user,
    login(email, password) {
      const account = demoAccounts.find(
        (entry) =>
          entry.email.toLowerCase() === email.trim().toLowerCase() &&
          entry.password === password,
      );

      if (!account) {
        return { success: false, error: 'Email or password is incorrect.' };
      }

      const safeUser = getPublicUser(account);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
      setUser(safeUser);
      return { success: true, user: safeUser };
    },
    logout() {
      window.localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
