// Step 3: Test registry imports and component loading
import * as React from 'react';
import { devLog } from '../utils/devLog';

// Test all imports step by step
let controllerImports: any = {};
let registryImports: any = {};
let lazyImports: any = {};
let themeImports: any = {};

let controllerError: string | null = null;
let registryError: string | null = null;
let lazyError: string | null = null;
let themeError: string | null = null;

try {
  controllerImports = require('./controller');
  devLog('[Step3] ✓ Controller imported successfully');
} catch (error) {
  controllerError = String(error);
  devLog('[Step3] ❌ Controller import failed:', error);
}

try {
  registryImports = require('../components/registry');
  devLog('[Step3] ✓ Registry imported successfully');
} catch (error) {
  registryError = String(error);
  devLog('[Step3] ❌ Registry import failed:', error);
}

try {
  lazyImports = require('../utils/lazyFromComponent');
  devLog('[Step3] ✓ LazyFromComponent imported successfully');
} catch (error) {
  lazyError = String(error);
  devLog('[Step3] ❌ LazyFromComponent import failed:', error);
}

try {
  themeImports = require('../theme/themeManager');
  devLog('[Step3] ✓ ThemeManager imported successfully');
} catch (error) {
  themeError = String(error);
  devLog('[Step3] ❌ ThemeManager import failed:', error);
}

export default function ComponentDrawerStep3() {
  devLog('[Step3] ComponentDrawerStep3 rendering...');
  
  const [testComponentId, setTestComponentId] = React.useState('atom-button-primary');
  const [testResult, setTestResult] = React.useState<any>(null);
  
  const [state, setState] = React.useState(() => {
    try {
      if (controllerImports.getDrawerState) {
        return controllerImports.getDrawerState();
      }
      return { open: false, item: null };
    } catch (error) {
      devLog('[Step3] ❌ Failed to get initial state:', error);
      return { open: false, item: null };
    }
  });

  React.useEffect(() => {
    if (controllerImports.subscribe) {
      try {
        return controllerImports.subscribe(setState);
      } catch (error) {
        devLog('[Step3] ❌ Failed to subscribe:', error);
      }
    }
    return () => {};
  }, []);

  const testComponentLoad = (componentId: string) => {
    devLog('[Step3] Testing component load for:', componentId);
    
    const results: any = {
      componentId,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test registry lookup
    try {
      if (registryImports.registry) {
        const entry = registryImports.registry[componentId];
        results.tests.registryLookup = {
          success: !!entry,
          data: entry ? { id: entry.id, name: entry.name, level: entry.level } : null
        };
        devLog('[Step3] Registry lookup:', results.tests.registryLookup);
      } else {
        results.tests.registryLookup = { success: false, error: 'Registry not available' };
      }
    } catch (error) {
      results.tests.registryLookup = { success: false, error: String(error) };
    }

    // Test getComponentById
    try {
      if (lazyImports.getComponentById) {
        const component = lazyImports.getComponentById(componentId);
        results.tests.getComponentById = {
          success: !!component,
          data: component ? { name: component.name, id: component.id } : null
        };
        devLog('[Step3] getComponentById:', results.tests.getComponentById);
      } else {
        results.tests.getComponentById = { success: false, error: 'getComponentById not available' };
      }
    } catch (error) {
      results.tests.getComponentById = { success: false, error: String(error) };
    }

    // Test getComponentPreview
    try {
      if (registryImports.getComponentPreview) {
        const preview = registryImports.getComponentPreview(componentId);
        results.tests.getComponentPreview = {
          success: !!preview,
          data: preview ? { type: typeof preview, name: preview.name } : null
        };
        devLog('[Step3] getComponentPreview:', results.tests.getComponentPreview);
      } else {
        results.tests.getComponentPreview = { success: false, error: 'getComponentPreview not available' };
      }
    } catch (error) {
      results.tests.getComponentPreview = { success: false, error: String(error) };
    }

    setTestResult(results);
  };

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
        minWidth: '400px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      <h4 style={{ margin: '0 0 0.5rem 0' }}>ComponentDrawer Step 3</h4>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Import Status:</strong>
        <div style={{ marginLeft: '1rem', fontSize: '0.7rem' }}>
          <div style={{ color: controllerError ? '#ef4444' : '#10b981' }}>
            Controller: {controllerError ? `❌ ${controllerError}` : '✓ OK'}
          </div>
          <div style={{ color: registryError ? '#ef4444' : '#10b981' }}>
            Registry: {registryError ? `❌ ${registryError}` : '✓ OK'}
          </div>
          <div style={{ color: lazyError ? '#ef4444' : '#10b981' }}>
            LazyFromComponent: {lazyError ? `❌ ${lazyError}` : '✓ OK'}
          </div>
          <div style={{ color: themeError ? '#ef4444' : '#10b981' }}>
            ThemeManager: {themeError ? `❌ ${themeError}` : '✓ OK'}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Component Test:</strong>
        <div style={{ display: 'flex', gap: '0.5rem', margin: '0.25rem 0' }}>
          <input
            value={testComponentId}
            onChange={(e) => setTestComponentId(e.target.value)}
            style={{
              padding: '0.25rem',
              background: 'var(--color-bg, #111)',
              color: 'var(--color-text, #fff)',
              border: '1px solid var(--color-border, #333)',
              borderRadius: '4px',
              fontSize: '0.7rem'
            }}
          />
          <button 
            onClick={() => testComponentLoad(testComponentId)}
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
            Test Load
          </button>
        </div>
      </div>

      {testResult && (
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Test Results:</strong>
          <pre style={{ 
            fontSize: '0.6rem', 
            margin: '0.25rem 0', 
            background: 'var(--color-bg, #111)', 
            padding: '0.5rem',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginBottom: '0.5rem' }}>
        <strong>State:</strong>
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
                  id: testComponentId, 
                  name: `Test ${testComponentId}`, 
                  level: 'atom' as const 
                });
              }
            } catch (error) {
              devLog('[Step3] ❌ Failed to open drawer:', error);
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
          Open Test
        </button>
        <button 
          onClick={() => {
            try {
              if (controllerImports.closeDrawer) {
                controllerImports.closeDrawer();
              }
            } catch (error) {
              devLog('[Step3] ❌ Failed to close drawer:', error);
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