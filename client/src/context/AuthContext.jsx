/**
 * AuthContext.jsx
 * Authentication via Firebase Auth (client SDK) + backend role lookup.
 *
 * Flow:
 *   signup  → POST /api/auth/signup (creates Firebase Auth user + Firestore docs)
 *             → then signs in via Firebase Auth to get an ID token
 *             → calls /api/auth/login with idToken to get role info
 *
 *   login   → signInWithEmailAndPassword via Firebase Auth
 *             → getIdToken() from the Firebase user
 *             → POST /api/auth/login { idToken } → backend returns { token, user }
 *             → token is the same idToken; stored in localStorage
 *
 *   The axios interceptor picks up `token` from localStorage and sends it as
 *   Bearer on every request. The backend verifies it with Firebase Admin SDK.
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Always get a fresh ID token (auto-refreshed by Firebase SDK)
        const idToken = await firebaseUser.getIdToken();
        localStorage.setItem('token', idToken);

        // Fetch role from backend
        const response = await api.get('/auth/profile');
        setUser(response.data);
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Authenticate with Firebase
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken    = await credential.user.getIdToken();

      // 2. Exchange token with backend to get role
      const response = await api.post('/auth/login', { idToken });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error code:', error.code, '| message:', error.message);
      let msg = 'Authentication failed.';
      if (error.response?.data?.error)            msg = error.response.data.error;
      else if (error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      else if (error.code === 'auth/user-not-found')     msg = 'No account found for this email.';
      else if (error.code === 'auth/wrong-password')     msg = 'Incorrect password.';
      else if (error.code === 'auth/network-request-failed') msg = 'Network error. Check your connection.';
      else if (error.message)                            msg = error.message;
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  // ── Signup ────────────────────────────────────────────────────────────────
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      // 1. Create Firebase Auth user + Firestore docs via backend
      await api.post('/auth/signup', { name, email, password });

      // 2. Auto-login to get a token + role
      return await login(email, password);
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
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
