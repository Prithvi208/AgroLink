import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthContext] Checking auth token...');
    const token = localStorage.getItem('agrolink_token');
    if (token) {
      console.log('[AuthContext] Token found, fetching /auth/me');
      api.get('/auth/me')
        .then(u => {
          console.log('[AuthContext] User loaded:', u);
          setUser(u);
        })
        .catch(err => {
          console.warn('[AuthContext] Auth check failed, clearing token:', err.message);
          localStorage.removeItem('agrolink_token');
        })
        .finally(() => {
          console.log('[AuthContext] Auth check complete, loading=false');
          setLoading(false);
        });
    } else {
      console.log('[AuthContext] No token, loading=false');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    console.log('[AuthContext] Login attempt:', email);
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem('agrolink_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    console.log('[AuthContext] Register attempt:', userData.email);
    const data = await api.post('/auth/register', userData);
    localStorage.setItem('agrolink_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('agrolink_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
