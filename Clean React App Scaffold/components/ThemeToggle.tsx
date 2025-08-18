import React from 'react';
import { setTheme, getTheme } from '../boot';

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark'>(getTheme);

  React.useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail as 'light' | 'dark');
    };
    
    document.addEventListener('adsm:theme:changed', handleThemeChange as EventListener);
    return () => {
      document.removeEventListener('adsm:theme:changed', handleThemeChange as EventListener);
    };
  }, []);

  const handleToggle = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        background: 'var(--button-bg)',
        color: 'var(--button-fg)',
        border: '1px solid var(--button-border)',
        borderRadius: '8px',
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
      title={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {currentTheme === 'dark' ? '🌙' : '☀️'}
      {currentTheme === 'dark' ? 'Dark' : 'Light'}
    </button>
  );
}