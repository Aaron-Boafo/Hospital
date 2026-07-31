import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiZap, FiMail, FiLock, FiArrowLeft, FiCheck, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';
import { notify } from '../lib/notify';

export default function Login() {
  const { login, loginWithGoogle, resetPassword, user, authError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    const ok = await notify.promise(login(email, password), {
      loading: 'Signing in...',
      success: 'Welcome back!',
    });
    if (ok) navigate('/');
  };

  const handleGoogle = async () => {
    setError('');
    const ok = await notify.promise(loginWithGoogle(), {
      loading: 'Signing in with Google...',
      success: 'Welcome back!',
    });
    if (ok) navigate('/');
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSent(false);
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }
    const ok = await notify.promise(resetPassword(resetEmail), {
      loading: 'Sending reset link...',
      success: 'Password reset link sent',
    });
    if (ok) setResetSent(true);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon"><FiZap /></div>
          <h1>MediCare</h1>
          <p>Hospital Management System</p>
        </div>

        {authError && (
          <div className="login-error">
            <FiAlertCircle style={{ marginRight: 6, verticalAlign: 'middle' }} />
            {authError}
          </div>
        )}

        {view === 'login' && (
          <>
            {error && <div className="login-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">
                  <FiMail style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Email
                </label>
                <input
                  id="email"
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 4px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleGoogle}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Continue with Google
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => { setView('forgot'); setResetError(''); setResetSent(false); }}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4, fontSize: '0.85rem' }}
            >
              <FiLock /> Forgot Password?
            </button>
          </>
        )}

        {view === 'forgot' && (
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

            {!resetSent ? (
              <>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                  Enter your registered email address and we will send you a password reset link.
                </p>

                {resetError && <div className="login-error">{resetError}</div>}

                <form onSubmit={handleReset}>
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
                    Send Reset Link
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
                <h3 style={{ fontSize: '1rem', marginBottom: 8 }}>Reset Link Sent</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                  If an account exists for <strong>{resetEmail}</strong>, a password reset link has been sent to it.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => { setView('login'); setEmail(''); setPassword(''); }}
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
