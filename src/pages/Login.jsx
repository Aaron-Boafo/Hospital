import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiZap, FiUser, FiLock } from 'react-icons/fi';

const DEMO_ACCOUNTS = [
  { username: 'admin', label: 'Admin' },
  { username: 'doctor', label: 'Doctor' },
  { username: 'receptionist', label: 'Receptionist' },
  { username: 'accountant', label: 'Accountant' },
];

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

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
      </div>
    </div>
  );
}
