import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext(null);

const USERS_STORAGE_KEY = 'hms_users';

const DEFAULT_USERS = [
  { id: 'usr-001', username: 'admin', password: 'password123', name: 'Dr. Sarah Admin', role: 'admin', email: 'admin@medicare.com', phone: '+233 54 000 0001', active: true, createdAt: '2026-01-01' },
  { id: 'usr-002', username: 'doctor', password: 'password123', name: 'Dr. James Wilson', role: 'doctor', email: 'wilson@medicare.com', phone: '+233 54 000 0002', active: true, createdAt: '2026-01-01' },
  { id: 'usr-003', username: 'receptionist', password: 'password123', name: 'Emily Carter', role: 'receptionist', email: 'carter@medicare.com', phone: '+233 54 000 0003', active: true, createdAt: '2026-01-01' },
  { id: 'usr-004', username: 'accountant', password: 'password123', name: 'Michael Brown', role: 'accountant', email: 'brown@medicare.com', phone: '+233 54 000 0004', active: true, createdAt: '2026-01-01' },
];

function loadUsers() {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export const ROLE_ACCESS = {
  admin: ['dashboard', 'patients', 'appointments', 'doctors', 'billing', 'clinical', 'staff', 'reports', 'laboratory', 'pharmacy', 'prescriptions', 'beds'],
  doctor: ['dashboard', 'patients', 'appointments', 'clinical', 'reports', 'laboratory', 'prescriptions', 'beds'],
  receptionist: ['dashboard', 'patients', 'appointments', 'beds'],
  accountant: ['dashboard', 'billing', 'reports'],
};

export const ROLES = ['admin', 'doctor', 'receptionist', 'accountant'];

function LoadingScreen() {
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
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(loadUsers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('hms_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.role && users.some(u => u.id === parsed.id)) {
          setUser(parsed);
        }
      } catch {}
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  const login = (username, password) => {
    const found = users.find(
      u => u.username === username && u.password === password && u.active
    );
    if (!found) return { success: false, error: 'Invalid username or password' };

    const session = { id: found.id, username: found.username, name: found.name, role: found.role };
    setUser(session);
    localStorage.setItem('hms_user', JSON.stringify(session));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hms_user');
  };

  const hasAccess = (feature) => {
    if (!user) return false;
    return ROLE_ACCESS[user.role]?.includes(feature) ?? false;
  };

  const isAdmin = () => user?.role === 'admin';

  const changePassword = useCallback((userId, currentPassword, newPassword) => {
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return { success: false, error: 'User not found' };
    if (users[idx].password !== currentPassword) return { success: false, error: 'Current password is incorrect' };
    if (newPassword.length < 6) return { success: false, error: 'New password must be at least 6 characters' };

    const updated = [...users];
    updated[idx] = { ...updated[idx], password: newPassword };
    setUsers(updated);
    return { success: true };
  }, [users]);

  const resetPassword = useCallback((username, email) => {
    const found = users.find(u => u.username === username && u.email === email);
    if (!found) return { success: false, error: 'No account found with that username and email' };

    const tempPassword = 'reset-' + Math.random().toString(36).slice(-8);
    const updated = users.map(u => u.id === found.id ? { ...u, password: tempPassword } : u);
    setUsers(updated);
    return { success: true, tempPassword };
  }, [users]);

  const registerUser = useCallback((userData) => {
    if (users.some(u => u.username === userData.username)) {
      return { success: false, error: 'Username already exists' };
    }
    if (users.some(u => u.email === userData.email)) {
      return { success: false, error: 'Email already exists' };
    }
    if (!userData.password || userData.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const newUser = {
      id: 'usr-' + uuidv4().slice(0, 8),
      username: userData.username,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      email: userData.email,
      phone: userData.phone || '',
      active: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsers(prev => [...prev, newUser]);
    return { success: true, user: newUser };
  }, [users]);

  const updateUser = useCallback((id, updates) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback((id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <AuthContext.Provider value={{ user, users, login, logout, hasAccess, isAdmin, changePassword, resetPassword, registerUser, updateUser, deleteUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
