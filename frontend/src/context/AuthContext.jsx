import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup,
  signOut, sendPasswordResetEmail, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider,
} from 'firebase/auth';
import { auth, googleProvider, firebaseConfigError } from '../config/firebase';
import { login as exchangeToken, logout as clearBackendSession } from '../services/auth';

const AuthContext = createContext(null);

const SESSION_KEY = 'hms_user';

export const ROLE_ACCESS = {
  admin: ['dashboard', 'patients', 'appointments', 'doctors', 'billing', 'clinical', 'staff', 'reports', 'laboratory', 'pharmacy', 'prescriptions', 'beds'],
  doctor: ['dashboard', 'patients', 'appointments', 'clinical', 'reports', 'laboratory', 'prescriptions', 'beds'],
  receptionist: ['dashboard', 'patients', 'appointments', 'beds'],
  accountant: ['dashboard', 'billing', 'reports'],
};

export const ROLES = ['admin', 'doctor', 'receptionist', 'accountant'];

const FIREBASE_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Invalid email or password',
  'auth/wrong-password': 'Invalid email or password',
  'auth/user-not-found': 'No account found with this email',
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/too-many-requests': 'Too many attempts — try again later',
  'auth/popup-closed-by-user': 'Sign-in cancelled',
  'auth/network-request-failed': 'Network error — check your connection',
  'auth/email-already-in-use': 'An account with this email already exists',
  'auth/weak-password': 'Password must be at least 6 characters',
};

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
