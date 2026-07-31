import { FiUserPlus, FiAlertTriangle, FiShield } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';

export default function Staff() {
  return (
    <>
      <PageHeader title="Staff Management" subtitle="Manage user accounts and role assignments" />

      <div className="page-body fade-in">
        <div className="card" style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-full)',
            background: 'var(--color-warning-bg)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <FiAlertTriangle style={{ fontSize: '1.6rem', color: 'var(--color-warning)' }} />
          </div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Staff management is coming soon</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: 420, lineHeight: 1.6, margin: 0 }}>
            Staff accounts are now created through Firebase Authentication when staff sign in for
            the first time. Role management (admin, doctor, receptionist, accountant) is handled by
            the system administrator and will be available here in a future update.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            <FiUserPlus /> <FiShield />
          </div>
        </div>
      </div>
    </>
  );
}
