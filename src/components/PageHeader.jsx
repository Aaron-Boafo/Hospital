import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PageHeader({ title, subtitle, children }) {
  const { user } = useAuth();

  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && (
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {children}
      <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="header-profile">
          <div className="profile-avatar">
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="profile-info">
            <div className="profile-name">{user?.name}</div>
            <div className="profile-role">{user?.role}</div>
          </div>
        </div>
      </Link>
      </div>
    </div>
  );
}
