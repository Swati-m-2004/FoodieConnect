import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('foodie_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('foodie_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token and check user profile on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          if (data.success) {
            setUser(data.user);
            localStorage.setItem('foodie_user', JSON.stringify(data.user));
          }
        } catch (error) {
          console.error('Session expired or error verifying auth:', error.message);
          logout();
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('foodie_token', data.token);
      localStorage.setItem('foodie_user', JSON.stringify(data.user));
      return data.user;
    }
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('foodie_token', data.token);
      localStorage.setItem('foodie_user', JSON.stringify(data.user));
      return data.user;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('foodie_token');
    localStorage.removeItem('foodie_user');
  };

  const addAddress = async (addressData) => {
    const { data } = await api.post('/auth/addresses', addressData);
    if (data.success && user) {
      const updatedUser = { ...user, addresses: data.addresses };
      setUser(updatedUser);
      localStorage.setItem('foodie_user', JSON.stringify(updatedUser));
    }
  };

  const deleteAddress = async (addressId) => {
    const { data } = await api.delete(`/auth/addresses/${addressId}`);
    if (data.success && user) {
      const updatedUser = { ...user, addresses: data.addresses };
      setUser(updatedUser);
      localStorage.setItem('foodie_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        addAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
