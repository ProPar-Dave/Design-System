import React, { Suspense } from 'react';
import { CommandPalette, useCommands } from './components/CommandPalette';
import { Layout } from './components/Layout';
import { Router } from './components/Router';
import { ContrastWarning } from './components/ContrastWarning';
import ComponentDrawer from './src/drawer/ComponentDrawer';
import { AppFrame } from './src/layout/AppFrame';
import { initializeApp } from './src/utils/initializeApp';
import { handleInitializationError } from './utils/appInitialization';
import { createCommandPaletteActions } from './utils/commandPaletteActions';
import { initializeTheme, applySimpleTheme, getSimpleTheme } from './src/theme/themeManager';
import { bootTokens } from './utils/tokenUtils';
import './styles/preview.css';
import './styles/command-palette.css';
import './src/styles/forms.css';
import './src/styles/badges.css';
import './src/styles/nav.css';
import './styles/drawer.css';
import './src/styles/primitives.css';

export default function App() {
  const [currentTheme, setCurrentTheme] = React.useState(getSimpleTheme());
  const [booted, setBooted] = React.useState(false);

  // Boot sequence runs exactly once
  React.useEffect(() => {
    let timeout = setTimeout(() => setBooted(true), 4000); // safety
    (async () => {
      try {
        applySimpleTheme(getSimpleTheme());
        await initializeApp();
      } catch (err) {
        console.warn("[App] Initialization error (continuing):", err);
      } finally {
        clearTimeout(timeout);
        setBooted(true);
      }
    })();
  }, []);

  // Apply token system on boot - reapply persisted tokens instantly on load
  React.useEffect(() => {
    bootTokens();
  }, []);

  // Initialize theme FIRST, before any rendering
  React.useLayoutEffect(() => {
    initializeTheme();
  }, []);

  // Apply deterministic theme on boot
  React.useEffect(() => {
    const theme = getSimpleTheme();
    applySimpleTheme(theme);

    // Always apply data attributes at root <html> for token resolution
    const root = document.documentElement;
    root.setAttribute("data-theme", theme ?? "light");
    root.setAttribute("data-ns", "adsm-ui");
  }, []);

  // Listen for theme changes to update the data-theme attribute
  React.useEffect(() => {
    const handleThemeChange = () => {
      setCurrentTheme(getSimpleTheme());
    };

    // Listen for both manual theme changes and system preference changes
    document.addEventListener('adsm:theme:changed', handleThemeChange);
    
    // Also listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'adsm:theme') {
        handleThemeChange();
      }
    });

    return () => {
      document.removeEventListener('adsm:theme:changed', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, []);

  // Listen for token updates to trigger any dependent systems
  React.useEffect(() => {
    const onTokenUpdate = () => {
      // If you have derived styles or caches, trigger them here.
      // For most apps, doing nothing is fine because CSS vars update instantly.
    };
    window.addEventListener("adsm:tokens:updated", onTokenUpdate);
    return () => window.removeEventListener("adsm:tokens:updated", onTokenUpdate);
  }, []);

  // Initialize other systems on app start
  React.useEffect(() => {
    let initStarted = false;
    
    const initializeAppSafely = async () => {
      if (initStarted) return;
      initStarted = true;
      
      try {
        // Run namespace regression check on startup
        setTimeout(() => {
          const root = document.getElementById('adsm-root');
          const hasNs = root?.classList.contains('adsm-ui');
          const theme = root?.getAttribute('data-theme');
          if (!hasNs || !theme) {
            console.warn('[ADSM] Regression detected: Missing namespace or theme attribute', { hasNs, theme });
          }
        }, 1000);

        // Run tripwire diagnostics first (non-blocking)
        try {
          const { getCatalogIdsSafely } = await import('./src/utils/catalogIds');
          const { runTripwire } = await import('./src/diagnostics/tripwire');
          const { armTripwires } = await import('./src/qa/tripwires');
          const { registry } = await import('./src/components/registry');
          
          const ids = getCatalogIdsSafely();
          await runTripwire(ids);
          
          // Arm runtime tripwires for ongoing monitoring
          armTripwires(registry);
          
          console.log('[Tripwires] Registry diagnostics complete and runtime monitoring armed');
        } catch (tripwireError) {
          console.warn('[Tripwire] Error running registry diagnostics (continuing):', tripwireError);
          // Continue app initialization even if tripwires fail
        }

        // QA and Snapshot Integration - only if environment supports it (non-blocking)
        const isDevMode = /\bdebug(=1|=true)?\b/i.test(window.location.search) || window.location.hash.includes('debug') || (!window.location.href.includes('vercel.app') && !window.location.href.includes('netlify.app'));
        if (isDevMode) {
          // Development mode: Run QA and save golden snapshots on pass
          setTimeout(async () => {
            try {
              console.log('[Dev QA] Running smoke tests...');
              const { runSmokeQA } = await import('./src/qa/smoke');
              const qaResult = await runSmokeQA();
              
              if (qaResult.pass) {
                console.log('[Dev QA] ✓ All tests passed');
                
                // Save golden snapshots for future rollback (non-blocking)
                try {
                  const { saveGoldenSnapshots } = await import('./src/lib/safetyBoot');
                  await saveGoldenSnapshots('dev pass');
                  console.log('[Dev QA] Golden snapshots saved');
                } catch (snapError) {
                  console.warn('[Dev QA] Failed to save snapshots (Supabase not configured - continuing):', snapError);
                }
              } else {
                console.warn('[Dev QA] ❌ Some tests failed');
                console.table(qaResult.items.filter(item => !item.ok));
                console.warn('[Dev QA] See Diagnostics → QA for details');
              }
            } catch (qaError) {
              console.warn('[Dev QA] QA system error (continuing app initialization):', qaError);
            }
          }, 2000); // Give app time to fully initialize
        }

        const isProdMode = window.location.href.includes('vercel.app') || window.location.href.includes('netlify.app');
        if (isProdMode) {
          // Production mode: Run safety boot with auto-recovery (non-blocking)
          setTimeout(async () => {
            try {
              const { guardedBoot } = await import('./src/lib/safetyBoot');
              await guardedBoot();
            } catch (bootError) {
              console.warn('[Prod Safety] Boot guard error (Supabase not configured - continuing):', bootError);
            }
          }, 1000);
        }
        
      } catch (error) {
        handleInitializationError(error);
      }
    };

    initializeAppSafely();
  }, []);

  // Command palette actions with memoization and logging
  const actions = React.useMemo(() => createCommandPaletteActions(), []);
  const commands = useCommands(actions);

  // Determine if we're in debug mode - use simple detection
  const isDebugMode = !window.location.href.includes('vercel.app') && !window.location.href.includes('netlify.app');

  if (!booted) {
    return <div className="app-boot-overlay">Loading application… DEV MODE</div>;
  }

  return (
    <AppFrame 
      isDebugMode={isDebugMode}
      className={`app min-h-screen ${isDebugMode ? 'adsm-debug-container' : ''}`}
    >
      <Layout>
        <Router />
      </Layout>
      <CommandPalette commands={commands} />
      <ComponentDrawer />
      
      {isDebugMode && (
        <div className="adsm-debug">
          <ContrastWarning />
        </div>
      )}
    </AppFrame>
  );
}