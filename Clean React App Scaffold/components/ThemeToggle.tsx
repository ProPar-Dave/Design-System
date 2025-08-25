import React from 'react';
import { applyTheme, getTheme, getResolvedTheme, onThemeChange, type ThemeType } from '../src/theme/themeManager';

export function ThemeToggle() {
  const [currentTheme, setCurrentTheme] = React.useState<ThemeType>(getTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(getResolvedTheme);

  React.useEffect(() => {
    const unsubscribe = onThemeChange((theme, resolved) => {
      setCurrentTheme(theme);
      setResolvedTheme(resolved);
    });
    
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    // Cycle through: light -> dark -> auto -> light
    let nextTheme: ThemeType;
    if (currentTheme === 'light') {
      nextTheme = 'dark';
    } else if (currentTheme === 'dark') {
      nextTheme = 'auto';
    } else {
      nextTheme = 'light';
    }
    
    applyTheme(nextTheme);
  };

  const getDisplayText = () => {
    if (currentTheme === 'auto') {
      return `Auto (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
    return currentTheme === 'dark' ? 'Dark' : 'Light';
  };

  const getIcon = () => {
    if (currentTheme === 'auto') {
      return '🌓'; // Half moon for auto
    }
    return resolvedTheme === 'dark' ? '🌙' : '☀️';
  };

  const getNextThemeText = () => {
    if (currentTheme === 'light') return 'dark';
    if (currentTheme === 'dark') return 'auto';
    return 'light';
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
      title={`Switch to ${getNextThemeText()} theme`}
    >
      {getIcon()}
      {getDisplayText()}
    </button>
  );
}