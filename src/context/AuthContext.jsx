import { useEffect, useMemo, useState } from 'react';
import { AuthContext } from './authState';
import { api } from '../services/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.auth.me()
      .then(({ user: sessionUser }) => {
        if (active) {
          setUser(sessionUser);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active && requestError.status !== 401) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    error,
    async login(email, password) {
      try {
        const { user: sessionUser } = await api.auth.login({ email, password });
        setUser(sessionUser);
        setError('');
        return { success: true, user: sessionUser };
      } catch (requestError) {
        return { success: false, error: requestError.message };
      }
    },
    async logout() {
      setUser(null);
      try {
        await api.auth.logout();
        setError('');
      } catch (requestError) {
        setError(requestError.message);
      }
    },
  }), [user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
