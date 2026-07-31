import { FiSliders, FiBell, FiDatabase, FiSun, FiMoon, FiMonitor, FiUser, FiLock } from 'react-icons/fi'

export const TABS = [
  { id: 'general', label: 'General', icon: FiSliders },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'data', label: 'Data Management', icon: FiDatabase },
]

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light Mode', icon: FiSun },
  { value: 'dark', label: 'Dark Mode', icon: FiMoon },
  { value: 'system', label: 'System Default', icon: FiMonitor },
]

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
]

export const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
]

export const PROFILE_TABS = [
  { id: 'personal', label: 'Personal Info', icon: FiUser },
  { id: 'security', label: 'Security', icon: FiLock },
]
