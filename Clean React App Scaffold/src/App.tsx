import React, { Suspense } from 'react';
import AppFrame from './layout/AppFrame';
import Router from './components/Router';
import './styles/globals.css';
import { getSimpleTheme, applySimpleTheme } from './theme/themeManager';

export default function App() {
  // Ensure namespace + theme are always present so tokens resolve
  const theme = getSimpleTheme();
  React.useEffect(() => {
    applySimpleTheme(theme);
    const root = document.documentElement;
    root.classList.add('adsm-ui');
    if (!root.getAttribute('data-theme')) root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="adsm-ui" data-theme={theme}>
      <AppFrame sidebar={<Router.Sidebar />}>
        <Suspense fallback={null}>
          <Router.Content />
        </Suspense>
      </AppFrame>
    </div>
  );
}