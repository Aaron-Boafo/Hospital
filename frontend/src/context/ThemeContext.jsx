import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

const LS_KEY = 'hms_theme';

function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved) {
  document.documentElement.setAttribute('data-theme', resolved);
}

function readStoredTheme() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === 'dark' || saved === 'light' || saved === 'system') return saved;
  } catch {
    // localStorage unavailable (private mode)
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try { localStorage.setItem(LS_KEY, newTheme); } catch {
      // localStorage unavailable (private mode)
    }
  }, []);

  useEffect(() => {
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    applyTheme(resolved);

    if (theme !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => applyTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
