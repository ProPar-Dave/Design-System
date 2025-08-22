import React, { Suspense } from 'react';
import { CommandPalette, useCommands } from './components/CommandPalette';
import { Layout } from './components/Layout';
import { Router } from './components/Router';
import { initializeApp, handleInitializationError } from './utils/appInitialization';
import { createCommandPaletteActions } from './utils/commandPaletteActions';
import { initializeTheme } from './src/theme/themeManager';
import './styles/drawer.css';
import './styles/preview.css';

export default function App() {
  // Initialize theme FIRST, before any rendering
  React.useLayoutEffect(() => {
    initializeTheme();
  }, []);

  // Initialize other systems on app start
  React.useEffect(() => {
    let initStarted = false;
    
    const initializeAppSafely = async () => {
      if (initStarted) return;
      initStarted = true;
      
      try {
        await initializeApp();
      } catch (error) {
        handleInitializationError(error);
      }
    };

    initializeAppSafely();
  }, []);

  // Command palette actions with memoization and logging
  const actions = React.useMemo(() => createCommandPaletteActions(), []);
  const commands = useCommands(actions);

  // Determine if we're in debug mode
  const isDebugMode = process.env.NODE_ENV === 'development';

  return (
    <div 
      id="adsm-root" 
      className={`app min-h-screen ${isDebugMode ? 'adsm-debug-container' : ''}`}
      style={{ 
        background:'var(--color-bg)', 
        color:'var(--color-text)', 
        fontFamily:'var(--font-sans)', 
        minHeight:'100vh' 
      }}
      role="application"
      aria-label="Atomic Design System Manager"
    >
      <Suspense fallback={
        <div 
          className="content" 
          style={{padding:20, background:'var(--color-bg)'}}
          role="status"
          aria-live="polite"
        >
          Loading application…
        </div>
      }>
        <Layout>
          <Router />
        </Layout>
        <CommandPalette commands={commands} />
      </Suspense>
      
      {isDebugMode && (
        <div className="adsm-debug">
          <div className="debug-mode-indicator">
            DEV MODE
          </div>
        </div>
      )}
    </div>
  );
}