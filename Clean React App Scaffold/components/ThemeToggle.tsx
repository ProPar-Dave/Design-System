import React from 'react';
import { toggleTheme, getTheme, type ThemeName } from '../src/theme/themeManager';

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = React.useState<ThemeName>(getTheme);

  React.useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setCurrentTheme(e.detail.theme as ThemeName);
    };
    
    document.addEventListener('adsm:theme:changed', handleThemeChange as EventListener);
    return () => {
      document.removeEventListener('adsm:theme:changed', handleThemeChange as EventListener);
    };
  }, []);

  const handleToggle = () => {
    const nextTheme = toggleTheme();
    setCurrentTheme(nextTheme);
  };

  return (
    <button
      onClick={handleToggle}
      className="adsm-button-secondary"
      style={{
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