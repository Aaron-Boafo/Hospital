import { useState } from 'react';
import {
  FiCheck, FiSliders, FiBell, FiDatabase,
  FiSun, FiMoon, FiMonitor, FiTrash2,
  FiDownload, FiAlertTriangle, FiHardDrive,
  FiRefreshCw, FiClock, FiUser, FiFileText,
  FiInfo, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/PageHeader';

const TABS = [
  { id: 'general', label: 'General', icon: FiSliders },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'data', label: 'Data Management', icon: FiDatabase },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light Mode', icon: FiSun },
  { value: 'dark', label: 'Dark Mode', icon: FiMoon },
  { value: 'system', label: 'System Default', icon: FiMonitor },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
];


const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
];

export default function Settings() {
  const { activities, patients, doctors, appointments, bills } = useData();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');
  const [cacheMsg, setCacheMsg] = useState('');

  const [settings, setSettings] = useState({
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    emailNotif: true,
    smsNotif: false,
    dailyReport: true,
    pushNotif: true,
    appointmentReminder: true,
    autoBackup: false,
    backupTime: '02:00',
  });

  const visibleTabs = TABS.filter(t => t.id !== 'data' || user?.role === 'admin');

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleBackupNow = () => {
    const snapshot = { patients, doctors, appointments, bills, backedUpAt: new Date().toISOString() };
    localStorage.setItem('hms_backup', JSON.stringify(snapshot));
    setBackupMsg('Backup saved at ' + new Date().toLocaleTimeString());
    setTimeout(() => setBackupMsg(''), 4000);
  };

  const handleExportData = () => {
    const data = JSON.stringify({ patients, doctors, appointments, bills, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medicare-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setCacheMsg('Data exported successfully!');
    setTimeout(() => setCacheMsg(''), 4000);
  };

  const handleClearCache = () => {
    if (!confirm('This will clear all cached data and reload the page. Are you sure?')) return;
    localStorage.removeItem('hms_user');
    localStorage.removeItem('hms_data');
    localStorage.removeItem('hms_settings');
    setCacheMsg('Cache cleared! Reloading...');
    setTimeout(() => window.location.reload(), 1500);
  };

  const activityIcon = (type) => {
    switch (type) {
      case 'success': return { icon: FiCheckCircle, color: 'var(--color-success)' };
      case 'warning': return { icon: FiAlertCircle, color: 'var(--color-warning)' };
      case 'danger': return { icon: FiAlertTriangle, color: 'var(--color-danger)' };
      default: return { icon: FiInfo, color: 'var(--color-accent)' };
    }
  };

  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section" key="general">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Appearance</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Customize how the application looks on your device
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {THEME_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: `2px solid ${theme === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      background: theme === opt.value ? 'var(--color-accent-light)' : 'var(--color-bg-secondary)',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={opt.value}
                      checked={theme === opt.value}
                      onChange={() => setTheme(opt.value)}
                      style={{ display: 'none' }}
                    />
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-md)',
                      background: theme === opt.value ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: theme === opt.value ? 'white' : 'var(--color-text-muted)',
                    }}>
                      <opt.icon />
                    </div>
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{opt.label}</span>
                    {theme === opt.value && (
                      <FiCheck style={{ marginLeft: 'auto', color: 'var(--color-accent)' }} />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24, marginTop: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Regional</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Language and date format preferences
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 400 }}>
                <div className="form-group">
                  <label>System Language</label>
                  <select
                    className="form-control"
                    value={settings.language}
                    onChange={(e) => handleSelect('language', e.target.value)}
                  >
                    {LANGUAGE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date Format</label>
                  <select
                    className="form-control"
                    value={settings.dateFormat}
                    onChange={(e) => handleSelect('dateFormat', e.target.value)}
                  >
                    {DATE_FORMAT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section" key="notifications">
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Notification Channels</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Choose how you want to receive alerts and updates
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { key: 'emailNotif', title: 'Email Notifications', desc: 'Receive email alerts for new patient registrations, bookings, and important updates.' },
                { key: 'smsNotif', title: 'SMS Alerts', desc: 'Send automated reminders to patients via SMS for upcoming appointments.' },
                { key: 'pushNotif', title: 'Push Notifications', desc: 'Browser push notifications for real-time alerts and urgent messages.' },
                { key: 'dailyReport', title: 'Daily Summary Reports', desc: 'Receive a daily digest of financial and appointment statistics at end of day.' },
                { key: 'appointmentReminder', title: 'Appointment Reminders', desc: 'Send automatic reminders to patients 24 hours before their scheduled appointment.' },
              ].map(item => (
                <div key={item.key} className="settings-row">
                  <div className="settings-row-info">
                    <div className="settings-row-title">{item.title}</div>
                    <div className="settings-row-desc">{item.desc}</div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={() => handleToggle(item.key)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="settings-section" key="data">
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Database Backup</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Create a full backup of all system data
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <button type="button" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleBackupNow}>
                <FiHardDrive /> Backup Now
              </button>
              {backupMsg && <span style={{ fontSize: '0.82rem', color: 'var(--color-success)', fontWeight: 500 }}>{backupMsg}</span>}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Auto-Backup</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Automatically backup your data on a daily schedule
                </p>
              </div>

              <div className="settings-row">
                <div className="settings-row-info">
                  <div className="settings-row-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiRefreshCw style={{ color: 'var(--color-accent)' }} />
                    Enable Daily Auto-Backup
                  </div>
                  <div className="settings-row-desc">
                    System will automatically create a backup at the scheduled time each day.
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={() => handleToggle('autoBackup')}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {settings.autoBackup && (
                <div style={{ marginTop: 16, maxWidth: 300 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Backup Time</label>
                    <select
                      className="form-control"
                      value={settings.backupTime}
                      onChange={(e) => handleSelect('backupTime', e.target.value)}
                    >
                      <option value="00:00">12:00 AM</option>
                      <option value="02:00">2:00 AM</option>
                      <option value="04:00">4:00 AM</option>
                      <option value="06:00">6:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24, marginTop: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Audit Log</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                  Recent system activity and changes
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {activities.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', padding: '12px 0' }}>No activity recorded yet</p>
                ) : (
                  activities.slice(0, 10).map((entry, i) => {
                    const { icon: IconComp, color } = activityIcon(entry.type);
                    return (
                      <div key={entry.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 0',
                        borderBottom: i < Math.min(activities.length, 10) - 1 ? '1px solid var(--color-border)' : 'none',
                      }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 'var(--radius-full)',
                          background: color + '18',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: color, flexShrink: 0,
                        }}>
                          <IconComp style={{ fontSize: '0.9rem' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                            {entry.text}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                          {formatTime(entry.time)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 24, marginTop: 20 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleExportData}>
                  <FiDownload /> Export Data
                </button>
                <button type="button" className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={handleClearCache}>
                  <FiTrash2 /> Clear Cache
                </button>
              </div>

              {cacheMsg && (
                <div style={{
                  marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-success-bg)', color: 'var(--color-success)',
                  fontSize: '0.85rem', fontWeight: 500,
                }}>
                  <FiCheck /> {cacheMsg}
                </div>
              )}

              <div style={{
                marginTop: 20, padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-warning-bg)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <FiAlertTriangle style={{ color: 'var(--color-warning)', marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  <strong>Account Deletion</strong> is permanent and cannot be undone.
                  Please contact your system administrator to request account removal.
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Configure your application preferences and security settings" />

      <div className="page-body fade-in">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {saved && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem', fontWeight: 500, width: 'fit-content',
            }}>
              <FiCheck /> Settings updated successfully!
            </div>
          )}

          <div className="tabs" style={{ marginBottom: 0 }}>
            {visibleTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <tab.icon style={{ fontSize: '1rem' }} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: 28 }}>
            {renderTabContent()}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button type="submit" className="btn btn-primary">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
