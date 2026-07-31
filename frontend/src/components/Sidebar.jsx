import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS } from '../constants';
import { ROLE_ACCESS } from '../constants';
import { FiLogOut, FiMenu, FiX, FiZap } from 'react-icons/fi';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout, hasAccess } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(item => !item.feature || hasAccess(item.feature));

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
          <button
            className="btn logout-btn"
            onClick={handleLogout}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
