import { useState, useEffect } from 'react';
import { AuthContext } from './auth-context';
import { authAPI } from '../services/api';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const { data } = await authAPI.me();
        if (isMounted) setUser(data.usuario);
      } catch {
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    setUser(data.usuario);
    return data.usuario;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
