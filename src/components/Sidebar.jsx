import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_ACCESS } from '../context/AuthContext';
import {
  FiGrid, FiUsers, FiCalendar, FiUserPlus,
  FiDollarSign, FiLogOut, FiMenu, FiX, FiZap
} from 'react-icons/fi';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: <FiGrid />, label: 'Dashboard', feature: 'dashboard' },
  { to: '/patients', icon: <FiUsers />, label: 'Patients', feature: 'patients' },
  { to: '/appointments', icon: <FiCalendar />, label: 'Appointments', feature: 'appointments' },
  { to: '/doctors', icon: <FiUserPlus />, label: 'Doctors', feature: 'doctors' },
  { to: '/billing', icon: <FiDollarSign />, label: 'Billing', feature: 'billing' },
];

export default function Sidebar() {
  const { user, logout, hasAccess } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item => hasAccess(item.feature));

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        {open ? <FiX /> : <FiMenu />}
      </button>

      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon"><FiZap /></div>
          <h2>MediCare</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Navigation</div>
            {visibleItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost"
            onClick={handleLogout}
            style={{ width: '100%', marginTop: 10, justifyContent: 'center' }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
