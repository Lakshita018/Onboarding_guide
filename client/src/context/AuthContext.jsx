import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to load authenticated user session:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Authentication login failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      // POST /auth/signup creates account but does not issue JWT
      await api.post('/auth/signup', { name, email, password });
      
      // Auto-login to obtain JWT token session
      return await login(email, password);
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration signup failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const token = localStorage.getItem('token');

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
