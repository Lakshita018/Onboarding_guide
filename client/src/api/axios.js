import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor — attach a fresh Firebase ID token on every request
api.interceptors.request.use(
  async (config) => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      // getIdToken(false) returns the cached token; pass true to force refresh
      const token = await firebaseUser.getIdToken(false);
      localStorage.setItem('token', token);
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Fallback to localStorage (e.g. during initial load before Firebase resolves)
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Try to force-refresh the Firebase token once before redirecting
      const firebaseUser = auth.currentUser;
      if (firebaseUser && !error.config._retried) {
        try {
          error.config._retried = true;
          const freshToken = await firebaseUser.getIdToken(true);
          localStorage.setItem('token', freshToken);
          error.config.headers.Authorization = `Bearer ${freshToken}`;
          return api(error.config);
        } catch (_) {
          // Token refresh failed; fall through to redirect
        }
      }
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
