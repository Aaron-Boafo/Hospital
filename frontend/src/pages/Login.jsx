import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiZap, FiUser, FiLock, FiArrowLeft, FiCheck, FiAlertTriangle, FiMail } from 'react-icons/fi';

const DEMO_ACCOUNTS = [
  { username: 'admin', label: 'Admin' },
  { username: 'doctor', label: 'Doctor' },
  { username: 'receptionist', label: 'Receptionist' },
  { username: 'accountant', label: 'Accountant' },
];

export default function Login() {
  const { login, user, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState('login');
  const [resetUsername, setResetUsername] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    const result = login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetUsername || !resetEmail) {
      setResetError('Please enter both username and email');
      return;
    }
    const result = resetPassword(resetUsername, resetEmail);
    if (result.success) {
      setTempPassword(result.tempPassword);
    } else {
      setResetError(result.error);
    }
  };

  const fillDemo = (uname) => {
    setUsername(uname);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon"><FiZap /></div>
          <h1>MediCare</h1>
          <p>Hospital Management System</p>
        </div>

        {view === 'login' && (
          <>
            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">
                  <FiUser style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Username
                </label>
                <input
                  id="username"
                  className="form-control"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <FiLock style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Password
                </label>
                <input
                  id="password"
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Sign In
              </button>
            </form>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setView('forgot'); setResetError(''); setTempPassword(''); }}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, fontSize: '0.85rem' }}
            >
              <FiLock /> Forgot Password?
            </button>

            <div className="demo-accounts">
              <h4>Demo Accounts (password: password123)</h4>
              <div className="demo-grid">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.username}
                    className="demo-btn"
                    onClick={() => fillDemo(acc.username)}
                    type="button"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {view === 'forgot' && (
          <>
            {!tempPassword ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => setView('login')}
                    style={{ padding: 6 }}
                  >
                    <FiArrowLeft />
                  </button>
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>Reset Password</h3>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                  Enter your username and registered email. A temporary password will be generated for you.
                </p>

                {resetError && <div className="login-error">{resetError}</div>}

                <form onSubmit={handleReset}>
                  <div className="form-group">
                    <label htmlFor="reset-username">
                      <FiUser style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Username
                    </label>
                    <input
                      id="reset-username"
                      className="form-control"
                      type="text"
                      value={resetUsername}
                      onChange={e => setResetUsername(e.target.value)}
                      placeholder="Enter your username"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reset-email">
                      <FiMail style={{ marginRight: 6, verticalAlign: 'middle' }} />
                      Email
                    </label>
                    <input
                      id="reset-email"
                      className="form-control"
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="Enter your registered email"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Reset Password
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-full)',
                  background: 'var(--color-success-bg)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <FiCheck style={{ fontSize: '1.5rem', color: 'var(--color-success)' }} />
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Password Reset</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                  Your temporary password is:
                </p>
                <div style={{
                  background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)', padding: '12px 20px', marginBottom: 20,
                  fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700,
                  color: 'var(--color-accent)', letterSpacing: '1px',
                }}>
                  {tempPassword}
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-warning-bg)', border: '1px solid rgba(245, 158, 11, 0.2)',
                  display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20, textAlign: 'left',
                }}>
                  <FiAlertTriangle style={{ color: 'var(--color-warning)', marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    Use this temporary password to sign in, then change it immediately from your Profile.
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => { setView('login'); setUsername(''); setPassword(''); }}
                  style={{ width: '100%' }}
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
