import { useState } from 'react';
import { FiShield } from 'react-icons/fi';
import { CONSENT_KEY } from '../constants';

function getStoredConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => getStoredConsent() === null);

  const decide = (value) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // storage unavailable — hide the banner anyway for this visit
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
      zIndex: 1000, maxWidth: 560, width: 'calc(100% - 32px)',
      background: 'var(--color-card)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
      padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center',
    }}>
      <div style={{ fontSize: '1.4rem', color: 'var(--color-accent)', flexShrink: 0 }}>
        <FiShield />
      </div>
      <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text)' }}>
        <strong>We use cookies to keep you signed in.</strong>{' '}
        This site sets a single strictly-necessary session cookie so you can
        log in and stay authenticated. No tracking or third-party cookies are used.
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button className="btn btn-ghost" onClick={() => decide('declined')}>Decline</button>
        <button className="btn btn-primary" onClick={() => decide('accepted')}>Accept</button>
      </div>
    </div>
  );
}
