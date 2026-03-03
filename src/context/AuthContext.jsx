import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Pre-seeded demo users
const DEMO_USERS = [
  { id: 'usr-001', username: 'admin', password: 'password123', name: 'Dr. Sarah Admin', role: 'admin' },
  { id: 'usr-002', username: 'doctor', password: 'password123', name: 'Dr. James Wilson', role: 'doctor' },
  { id: 'usr-003', username: 'receptionist', password: 'password123', name: 'Emily Carter', role: 'receptionist' },
  { id: 'usr-004', username: 'accountant', password: 'password123', name: 'Michael Brown', role: 'accountant' },
];

// Role-based access configuration
export const ROLE_ACCESS = {
  admin: ['dashboard', 'patients', 'appointments', 'doctors', 'billing'],
  doctor: ['dashboard', 'patients', 'appointments'],
  receptionist: ['dashboard', 'patients', 'appointments'],
  accountant: ['dashboard', 'billing'],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('hms_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {}
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const found = DEMO_USERS.find(
      u => u.username === username && u.password === password
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

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
