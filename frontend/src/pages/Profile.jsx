import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiMail, FiPhone, FiShield, FiCalendar, FiCheck,
  FiEdit2, FiX, FiCamera, FiKey, FiAlertTriangle
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { PROFILE_TABS } from '../constants';
import { notify } from '../lib/notify';

export default function Profile() {
  const { user, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [passwordError, setPasswordError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const initials = formData.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  const handleSubmit = (e) => {
    e.preventDefault();
    notify.success('Profile details updated successfully');
    setEditing(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Please fill in all password fields');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword === passwordData.currentPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    const ok = await notify.promise(changePassword(passwordData.currentPassword, passwordData.newPassword), {
      loading: 'Updating password...',
      success: 'Password updated successfully',
    });
    if (ok) setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setEditing(false);
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your personal information and credentials" />

      <div className="page-body fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 30, alignItems: 'start' }}>

          {/* Left: Avatar and Summary Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 24px' }}>
            <div className="avatar-wrapper" style={{ marginBottom: 16, cursor: editing ? 'pointer' : 'default' }} onClick={() => editing && document.getElementById('avatar-upload').click()}>
              {avatar ? (
                <img src={avatar} alt="Avatar" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', boxShadow: 'var(--shadow-md)' }} />
              ) : (
                <div style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-accent), #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem', fontWeight: 700, color: '#ffffff',
                  boxShadow: 'var(--shadow-md)',
                }}>
                  {initials}
                </div>
              )}
              {editing && (
                <div className="avatar-upload-overlay">
                  <FiCamera />
                </div>
              )}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setAvatar(reader.result);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <h2 style={{ fontSize: '1.25rem', marginBottom: 4 }}>{formData.name}</h2>
            <div className="badge badge-info" style={{ textTransform: 'capitalize', fontSize: '0.8rem', padding: '4px 12px', marginBottom: 16 }}>
              {user?.role}
            </div>

            <div style={{ width: '100%', borderTop: '1px solid var(--color-border)', margin: '0 0 20px' }} />

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', display: 'flex' }}><FiMail /></span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>Email</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{formData.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', display: 'flex' }}><FiPhone /></span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>Phone</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{formData.phone}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', display: 'flex' }}><FiShield /></span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>Account Role</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize' }}>{user?.role}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', display: 'flex' }}><FiCalendar /></span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>Member Since</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>January 2026</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Tabbed Form Card */}
          <div className="card">
            <div className="tabs" style={{ marginBottom: 0 }}>
              {PROFILE_TABS.map(tab => (
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

            <div style={{ paddingTop: 24 }}>
              {activeTab === 'personal' && (
                <div className="settings-section">
                  {!editing ? (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 8 }}>
                        <div>
                          <div className="profile-field-label">Full Name</div>
                          <div className="profile-field-value">{formData.name}</div>
                        </div>
                        <div>
                          <div className="profile-field-label">Username</div>
                          <div className="profile-field-value">{formData.username}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 24 }}>
                        <div>
                          <div className="profile-field-label">Email Address</div>
                          <div className="profile-field-value">{formData.email}</div>
                        </div>
                        <div>
                          <div className="profile-field-label">Phone Number</div>
                          <div className="profile-field-value">{formData.phone}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setEditing(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                          <FiEdit2 /> Edit Profile
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 20 }}>
                        <div className="form-group">
                          <label>Full Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 28 }}>
                        <div className="form-group">
                          <label>Email Address</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone Number</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleCancel}
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                          <FiX /> Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FiCheck /> Save Changes
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-section">
                  {passwordError && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      backgroundColor: 'var(--color-danger-bg)',
                      color: 'var(--color-danger)',
                      padding: '12px 16px', borderRadius: 'var(--radius-md)',
                      marginBottom: 20, fontSize: '0.9rem', fontWeight: 500,
                    }}>
                      <FiAlertTriangle /> {passwordError}
                    </div>
                  )}

                  <div style={{ marginBottom: 28 }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>Change Password</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      Ensure your account stays secure with a strong password
                    </p>
                  </div>

                  <form onSubmit={handlePasswordSubmit}>
                    <div style={{ maxWidth: 480 }}>
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter current password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Enter new password (min 6 characters)"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiKey /> Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
