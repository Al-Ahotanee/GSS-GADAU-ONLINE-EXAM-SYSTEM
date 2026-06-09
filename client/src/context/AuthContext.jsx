import React, { createContext, useContext, useState } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('gss_user')); } catch { return null; }
  });

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('gss_token', data.token);
    localStorage.setItem('gss_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem('gss_token', data.token);
    localStorage.setItem('gss_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('gss_token');
    localStorage.removeItem('gss_user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await authAPI.me();
      setUser(data);
      localStorage.setItem('gss_user', JSON.stringify(data));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
