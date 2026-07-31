import {
  FiGrid, FiUsers, FiCalendar, FiUserPlus,
  FiDollarSign, FiZap, FiSettings, FiUser, FiActivity,
  FiShield, FiBarChart2, FiClipboard, FiFileText, FiPackage,
} from 'react-icons/fi'

export const NAV_ITEMS = [
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
]
