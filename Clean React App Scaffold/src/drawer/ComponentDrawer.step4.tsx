// Step 4: Test actual component rendering and ErrorBoundary
import * as React from 'react';
import { devLog } from '../utils/devLog';

// Import ErrorBoundary separately to test it
let ErrorBoundaryComponent: any = null;
let errorBoundaryError: string | null = null;

try {
  const errorBoundaryModule = require('../../preview/ErrorBoundary');
  ErrorBoundaryComponent = errorBoundaryModule.ErrorBoundary;
  devLog('[Step4] ✓ ErrorBoundary imported successfully');
} catch (error) {
  errorBoundaryError = String(error);
  devLog('[Step4] ❌ ErrorBoundary import failed:', error);
}

// Test all other imports
let controllerImports: any = {};
let registryImports: any = {};

try {
  controllerImports = require('./controller');
  devLog('[Step4] ✓ Controller imported successfully');
} catch (error) {
  devLog('[Step4] ❌ Controller import failed:', error);
}

try {
  registryImports = require('../components/registry');
  devLog('[Step4] ✓ Registry imported successfully');
} catch (error) {
  devLog('[Step4] ❌ Registry import failed:', error);
}

// Simple test component that might cause issues
const TestComponent = ({ variant = 'primary' }: { variant?: string }) => {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <div style={{
      padding: '1rem',
      background: 'var(--color-accent, #374151)',
      border: '1px solid var(--color-border, #4b5563)',
      borderRadius: 'var(--radius-md, 8px)',
      margin: '0.5rem 0'
    }}>
      <h5 style={{ margin: '0 0 0.5rem 0' }}>Test Component</h5>
      <p style={{ margin: '0', fontSize: '0.8rem' }}>
        Variant: {variant}<br/>
        Mounted: {mounted ? '✓' : '⏳'}
      </p>
    </div>
  );
};

// Test component that uses lazy loading
const LazyTestComponent = React.lazy(async () => {
  devLog('[Step4] LazyTestComponent loading...');
  
  // Simulate potential async loading issues
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    default: TestComponent
  };
});

// Test component using actual button import
let ActualButtonComponent: any = null;
try {
  const buttonModule = require('../../components/atoms/Button');
  ActualButtonComponent = React.lazy(async () => {
    devLog('[Step4] ActualButtonComponent loading...');
    return {
      default: () => React.createElement(buttonModule.Button, { variant: 'primary' }, 'Actual Button')
    };
  });
  devLog('[Step4] ✓ Button component imported successfully');
} catch (error) {
  devLog('[Step4] ❌ Button component import failed:', error);
}

export default function ComponentDrawerStep4() {
  devLog('[Step4] ComponentDrawerStep4 rendering...');
  
  const [state, setState] = React.useState(() => {
    try {
      if (controllerImports.getDrawerState) {
        return controllerImports.getDrawerState();
      }
      return { open: false, item: null };
    } catch (error) {
      return { open: false, item: null };
    }
  });

  const [testMode, setTestMode] = React.useState<'simple' | 'lazy' | 'button' | 'registry'>('simple');
  const [renderError, setRenderError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (controllerImports.subscribe) {
      try {
        return controllerImports.subscribe(setState);
      } catch (error) {
        devLog('[Step4] ❌ Failed to subscribe:', error);
      }
    }
    return () => {};
  }, []);

  const renderTestComponent = () => {
    try {
      setRenderError(null);
      
      switch (testMode) {
        case 'simple':
          return React.createElement(TestComponent, { variant: 'test' });
        
        case 'lazy':
          return React.createElement(
            React.Suspense,
            { fallback: React.createElement('div', {}, 'Loading lazy component...') },
            React.createElement(LazyTestComponent, { variant: 'lazy' })
          );
        
        case 'button':
          if (!ActualButtonComponent) {
            return React.createElement('div', { style: { color: '#ef4444' } }, 'Button component not available');
          }
          return React.createElement(
            React.Suspense,
            { fallback: React.createElement('div', {}, 'Loading button...') },
            React.createElement(ActualButtonComponent)
          );
        
        case 'registry':
          try {
            if (registryImports.getComponentPreview) {
              const PreviewComponent = registryImports.getComponentPreview('atom-button-primary');
              if (!PreviewComponent) {
                return React.createElement('div', { style: { color: '#ef4444' } }, 'No preview component found');
              }
              return React.createElement(
                React.Suspense,
                { fallback: React.createElement('div', {}, 'Loading registry component...') },
                React.createElement(PreviewComponent)
              );
            }
            return React.createElement('div', { style: { color: '#ef4444' } }, 'Registry getComponentPreview not available');
          } catch (error) {
            devLog('[Step4] Registry render error:', error);
            return React.createElement('div', { style: { color: '#ef4444' } }, `Registry error: ${error}`);
          }
        
        default:
          return React.createElement('div', {}, 'Unknown test mode');
      }
    } catch (error) {
      devLog('[Step4] ❌ Render error:', error);
      setRenderError(String(error));
      return React.createElement('div', { style: { color: '#ef4444' } }, `Render error: ${error}`);
    }
  };

  const testComponent = renderTestComponent();

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
        minWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      <h4 style={{ margin: '0 0 0.5rem 0' }}>ComponentDrawer Step 4</h4>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>ErrorBoundary Status:</strong>
        <div style={{ 
          color: errorBoundaryError ? '#ef4444' : '#10b981',
          marginLeft: '1rem',
          fontSize: '0.7rem'
        }}>
          {errorBoundaryError ? `❌ ${errorBoundaryError}` : '✓ Available'}
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Test Mode:</strong>
        <div style={{ display: 'flex', gap: '0.5rem', margin: '0.25rem 0' }}>
          {['simple', 'lazy', 'button', 'registry'].map(mode => (
            <button
              key={mode}
              onClick={() => setTestMode(mode as any)}
              style={{
                padding: '0.25rem 0.5rem',
                background: testMode === mode ? 'var(--color-primary, #3b82f6)' : 'var(--color-secondary, #6b7280)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.7rem'
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {renderError && (
        <div style={{ 
          marginBottom: '0.5rem',
          padding: '0.5rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '4px',
          color: '#ef4444'
        }}>
          <strong>Render Error:</strong><br/>
          {renderError}
        </div>
      )}

      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Component Test ({testMode}):</strong>
        <div style={{
          border: '1px solid var(--color-border, #333)',
          borderRadius: '4px',
          padding: '0.5rem',
          margin: '0.25rem 0',
          background: 'var(--color-bg, #111)'
        }}>
          {ErrorBoundaryComponent ? (
            React.createElement(
              ErrorBoundaryComponent,
              {
                fallback: () => React.createElement('div', { style: { color: '#ef4444' } }, 'Component crashed in ErrorBoundary')
              },
              testComponent
            )
          ) : (
            testComponent
          )}
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Drawer State:</strong>
        <pre style={{ fontSize: '0.7rem', margin: '0.25rem 0' }}>
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => {
            try {
              if (controllerImports.openDrawer) {
                controllerImports.openDrawer({ 
                  id: 'atom-button-primary', 
                  name: 'Test Button', 
                  level: 'atom' as const 
                });
              }
            } catch (error) {
              devLog('[Step4] ❌ Failed to open drawer:', error);
            }
          }}
          style={{
            padding: '0.25rem 0.5rem',
            background: 'var(--color-primary, #3b82f6)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.7rem'
          }}
        >
          Open Drawer
        </button>
        <button 
          onClick={() => {
            try {
              if (controllerImports.closeDrawer) {
                controllerImports.closeDrawer();
              }
            } catch (error) {
              devLog('[Step4] ❌ Failed to close drawer:', error);
            }
          }}
          style={{
            padding: '0.25rem 0.5rem',
            background: 'var(--color-secondary, #6b7280)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.7rem'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}