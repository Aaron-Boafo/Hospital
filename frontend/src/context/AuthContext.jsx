import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup,
  signOut, sendPasswordResetEmail, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider, firebaseConfigError } from '../config/firebase';
import { login as exchangeToken, logout as clearBackendSession } from '../services/auth';
import { ROLE_ACCESS, FIREBASE_ERROR_MESSAGES } from '../constants';
import { SESSION_KEY } from '../constants';

const AuthContext = createContext(null);

function firebaseErrorMessage(err) {
  return FIREBASE_ERROR_MESSAGES[err?.code] || err?.message || 'Authentication failed';
}

function normalizeUser(user) {
  if (!user) return null;
  return { ...user, role: String(user.role || '').toLowerCase() };
}

function loadCachedUser() {
  try {
    const cached = JSON.parse(localStorage.getItem(SESSION_KEY));
    return cached && cached.id ? cached : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--color-bg)',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-lg)',
        background: 'var(--color-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', fontWeight: 700, color: '#ffffff',
      }}>M</div>
      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Loading...</div>
    </div>
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadCachedUser);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const exchangeAndSetUser = useCallback(async (idToken) => {
    const backendUser = await exchangeToken(idToken);
    const normalized = normalizeUser(backendUser);
    setUser(normalized);
    saveSession(normalized);
    return normalized;
  }, []);

  useEffect(() => {
    if (!auth) {
      setAuthError(firebaseConfigError);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          await exchangeAndSetUser(idToken);
          setAuthError('');
        } else {
          setUser(null);
          clearSession();
        }
      } catch (err) {
        setUser(null);
        clearSession();
        setAuthError(err?.message || 'Session could not be restored');
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [exchangeAndSetUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      clearSession();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    if (!auth) throw new Error(firebaseConfigError || 'Firebase is not configured');
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      await exchangeAndSetUser(idToken);
      setAuthError('');
    } catch (err) {
      throw new Error(firebaseErrorMessage(err));
    }
  }, [exchangeAndSetUser]);

  const loginWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider) throw new Error(firebaseConfigError || 'Firebase is not configured');
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const idToken = await credential.user.getIdToken();
      await exchangeAndSetUser(idToken);
      setAuthError('');
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        throw new Error(firebaseErrorMessage(err));
      }
    }
  }, [exchangeAndSetUser]);

  const logout = useCallback(async () => {
    try {
      if (auth) await signOut(auth);
    } finally {
      try {
        await clearBackendSession();
      } catch {
        // backend session cookie is cleared on the next failed request
      }
      setUser(null);
      clearSession();
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!auth) throw new Error(firebaseConfigError || 'Firebase is not configured');
    await sendPasswordResetEmail(auth, email);
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!auth?.currentUser?.email) throw new Error('No active session');
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  }, []);

  const hasAccess = useCallback((feature) => {
    if (!user) return false;
    return ROLE_ACCESS[user.role]?.includes(feature) ?? false;
  }, [user]);

  const isAdmin = useCallback(() => user?.role === 'admin', [user]);

  return (
    <AuthContext.Provider value={{
      user, loading, authError,
      login, loginWithGoogle, logout, resetPassword, changePassword,
      hasAccess, isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
