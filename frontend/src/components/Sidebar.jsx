import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, ROLE_ACCESS } from '../context/AuthContext';
import {
  FiGrid, FiUsers, FiCalendar, FiUserPlus,
  FiDollarSign, FiLogOut, FiMenu, FiX, FiZap, FiSettings, FiUser, FiActivity, FiShield, FiBarChart2, FiClipboard, FiFileText, FiPackage
} from 'react-icons/fi';
import { useState } from 'react';

const NAV_ITEMS = [
  { to: '/', icon: <FiGrid />, label: 'Dashboard', feature: 'dashboard' },
  { to: '/patients', icon: <FiUsers />, label: 'Patients', feature: 'patients' },
  { to: '/appointments', icon: <FiCalendar />, label: 'Appointments', feature: 'appointments' },
  { to: '/doctors', icon: <FiShield />, label: 'Doctors', feature: 'doctors' },
  { to: '/billing', icon: <FiDollarSign />, label: 'Billing', feature: 'billing' },
  { to: '/decision-support', icon: <FiActivity />, label: 'AI Diagnosis', feature: 'clinical' },
  { to: '/staff', icon: <FiUserPlus />, label: 'Staff', feature: 'staff' },
  { to: '/reports', icon: <FiBarChart2 />, label: 'Reports', feature: 'reports' },
  { to: '/laboratory', icon: <FiFileText />, label: 'Laboratory', feature: 'laboratory' },
  { to: '/pharmacy', icon: <FiPackage />, label: 'Pharmacy', feature: 'pharmacy' },
  { to: '/prescriptions', icon: <FiClipboard />, label: 'Prescriptions', feature: 'prescriptions' },
  { to: '/beds', icon: <FiGrid />, label: 'Bed Space', feature: 'beds' },
  { to: '/profile', icon: <FiUser />, label: 'Profile', feature: null },
  { to: '/settings', icon: <FiSettings />, label: 'Settings', feature: null },
];

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
