// Step 2: Test controller imports only
import * as React from 'react';
import { devLog } from '../utils/devLog';

// Test controller imports specifically
let controllerImports: any = {};
let controllerError: string | null = null;

try {
  controllerImports = require('./controller');
  devLog('[Step2] ✓ Controller imported successfully');
} catch (error) {
  controllerError = String(error);
  devLog('[Step2] ❌ Controller import failed:', error);
}

export default function ComponentDrawerStep2() {
  devLog('[Step2] ComponentDrawerStep2 rendering...');
  
  const [state, setState] = React.useState(() => {
    try {
      if (controllerImports.getDrawerState) {
        const initialState = controllerImports.getDrawerState();
        devLog('[Step2] ✓ Initial state retrieved:', initialState);
        return initialState;
      }
      return { open: false, item: null };
    } catch (error) {
      devLog('[Step2] ❌ Failed to get initial state:', error);
      return { open: false, item: null };
    }
  });

  React.useEffect(() => {
    devLog('[Step2] Setting up subscription...');
    try {
      if (controllerImports.subscribe) {
        const unsubscribe = controllerImports.subscribe(setState);
        devLog('[Step2] ✓ Subscription established');
        return unsubscribe;
      }
    } catch (error) {
      devLog('[Step2] ❌ Failed to subscribe:', error);
    }
    return () => {};
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        padding: '1rem',
        background: 'var(--color-panel, #1a1a1a)',
        color: 'var(--color-text, #ffffff)',
        border: '1px solid var(--color-border, #333)',
        borderRadius: 'var(--radius-md, 8px)',
        zIndex: 9999,
        fontSize: '0.8rem',
        minWidth: '300px'
      }}
    >
      <h4 style={{ margin: '0 0 0.5rem 0' }}>ComponentDrawer Step 2</h4>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Controller Test:</strong>
        {controllerError ? (
          <div style={{ color: '#ef4444', marginTop: '0.25rem' }}>
            ❌ Error: {controllerError}
          </div>
        ) : (
          <div style={{ color: '#10b981', marginTop: '0.25rem' }}>
            ✓ Controller imported successfully
          </div>
        )}
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>State:</strong>
        <pre style={{ fontSize: '0.7rem', margin: '0.25rem 0' }}>
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Available methods:</strong>
        <ul style={{ margin: '0.25rem 0', paddingLeft: '1rem' }}>
          {Object.keys(controllerImports).map(key => (
            <li key={key} style={{ fontSize: '0.7rem' }}>
              {key}: {typeof controllerImports[key]}
            </li>
          ))}
        </ul>
      </div>
      <button 
        onClick={() => {
          try {
            if (controllerImports.openDrawer) {
              controllerImports.openDrawer({ 
                id: 'test-button', 
                name: 'Test Button', 
                level: 'atom' as const 
              });
              devLog('[Step2] ✓ Test drawer opened');
            }
          } catch (error) {
            devLog('[Step2] ❌ Failed to open drawer:', error);
          }
        }}
        style={{
          padding: '0.25rem 0.5rem',
          background: 'var(--color-primary, #3b82f6)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '0.5rem'
        }}
      >
        Test Open
      </button>
      <button 
        onClick={() => {
          try {
            if (controllerImports.closeDrawer) {
              controllerImports.closeDrawer();
              devLog('[Step2] ✓ Test drawer closed');
            }
          } catch (error) {
            devLog('[Step2] ❌ Failed to close drawer:', error);
          }
        }}
        style={{
          padding: '0.25rem 0.5rem',
          background: 'var(--color-secondary, #6b7280)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Close
      </button>
    </div>
  );
}