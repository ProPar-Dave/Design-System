// Working version of ComponentDrawer with minimal functionality
import React from 'react';

// Simple in-file devLog to avoid any import issues during debugging
function devLog(...args: unknown[]) {
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    console.log('[ComponentDrawer]', ...args);
  }
}

// Import dependencies with error handling
let drawerController: any = null;
let registryModule: any = null;

try {
  drawerController = require('./DrawerController');
  devLog('✓ Controller imported successfully');
} catch (error) {
  devLog('❌ Controller import failed:', error);
  // Provide fallback functions
  drawerController = {
    getCurrent: () => null,
    subscribe: () => () => {},
    close: () => {}
  };
}

try {
  registryModule = require('../components/registry');
  devLog('✓ Registry imported successfully');
} catch (error) {
  devLog('❌ Registry import failed:', error);
}

// Main ComponentDrawer component
export default function ComponentDrawer() {
  devLog('Rendering...');
  
  // State management with safe fallbacks
  const [state, setState] = React.useState(() => {
    try {
      if (drawerController?.getCurrent) {
        const current = drawerController.getCurrent();
        const initialState = { current };
        devLog('✓ Initial state:', initialState);
        return initialState;
      }
    } catch (error) {
      devLog('❌ Failed to get initial state:', error);
    }
    return { current: null };
  });

  // Subscription effect
  React.useEffect(() => {
    try {
      if (drawerController?.subscribe) {
        const unsubscribe = drawerController.subscribe(setState);
        devLog('✓ Subscription established');
        return unsubscribe;
      }
    } catch (error) {
      devLog('❌ Failed to subscribe:', error);
    }
    return () => {};
  }, []);

  // Early return if not open
  if (!state.current) {
    devLog('No current item, returning null');
    return null;
  }

  devLog('Rendering drawer for item:', state.current);

  // Safe close handler
  const handleClose = () => {
    try {
      if (drawerController?.close) {
        drawerController.close();
      }
    } catch (error) {
      devLog('❌ Failed to close drawer:', error);
    }
  };

  return (
    <aside
      className="adsm-drawer"
      data-theme="panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adsm-drawer-title"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        background: 'var(--color-panel, #1a1a1a)',
        border: '1px solid var(--color-border, #333)',
        zIndex: 9999,
        padding: 'var(--space-md, 16px)',
        overflow: 'auto',
        color: 'var(--color-text, #ffffff)'
      }}
    >
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--space-md, 16px)',
        borderBottom: '1px solid var(--color-border, #333)',
        paddingBottom: 'var(--space-sm, 12px)'
      }}>
        <h3 
          id="adsm-drawer-title"
          style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-lg, 18px)',
            color: 'var(--color-text, #ffffff)'
          }}
        >
          {state.current?.name || state.current?.id || 'Component'}
        </h3>
        <button 
          onClick={handleClose} 
          aria-label="Close drawer"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text, #ffffff)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: 'var(--space-xs, 8px)',
            borderRadius: 'var(--radius-sm, 4px)'
          }}
        >
          ×
        </button>
      </header>

      <div style={{
        padding: 'var(--space-md, 16px)',
        background: 'var(--color-accent, #2a2a2a)',
        border: '1px solid var(--color-border, #333)',
        borderRadius: 'var(--radius-md, 8px)',
        color: 'var(--color-text, #ffffff)'
      }}>
        <h4 style={{ margin: '0 0 var(--space-sm, 12px) 0' }}>Component Details</h4>
        <div style={{ fontSize: 'var(--font-size-sm, 14px)' }}>
          <p style={{ margin: '0 0 8px 0' }}><strong>ID:</strong> {state.current?.id}</p>
          <p style={{ margin: '0 0 8px 0' }}><strong>Name:</strong> {state.current?.name}</p>
          <p style={{ margin: '0 0 8px 0' }}><strong>Level:</strong> {state.current?.level}</p>
          {state.current?.description && (
            <p style={{ margin: '0 0 8px 0' }}><strong>Description:</strong> {state.current.description}</p>
          )}
        </div>
        
        <div style={{ 
          marginTop: 'var(--space-md, 16px)',
          padding: 'var(--space-sm, 12px)',
          background: 'var(--color-panel, #1a1a1a)',
          border: '1px solid var(--color-border, #333)',
          borderRadius: 'var(--radius-sm, 4px)'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-sm, 14px)',
            color: 'var(--color-muted-foreground, #888)'
          }}>
            Component preview functionality will be restored once import issues are resolved.
          </p>
        </div>
      </div>
    </aside>
  );
}