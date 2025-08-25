// Debug version of ComponentDrawer with comprehensive error tracking
import * as React from 'react';
import { devLog } from '../utils/devLog';

// Import dependencies one by one with error handling
let getComponentById: any;
let getDrawerState: any;
let subscribe: any;
let closeDrawer: any;
let getComponentPreview: any;
let ErrorBoundary: any;
let getSimpleTheme: any;

try {
  ({ getComponentById } = require('../utils/lazyFromComponent'));
  devLog('[Debug] ✓ lazyFromComponent imported successfully');
} catch (error) {
  devLog('[Debug] ❌ Failed to import lazyFromComponent:', error);
  getComponentById = () => null;
}

try {
  ({ getDrawerState, subscribe, closeDrawer } = require('./controller'));
  devLog('[Debug] ✓ controller imported successfully');
} catch (error) {
  devLog('[Debug] ❌ Failed to import controller:', error);
  getDrawerState = () => ({ open: false, item: null });
  subscribe = () => () => {};
  closeDrawer = () => {};
}

try {
  ({ getComponentPreview } = require('../components/registry'));
  devLog('[Debug] ✓ registry imported successfully');
} catch (error) {
  devLog('[Debug] ❌ Failed to import registry:', error);
  getComponentPreview = () => null;
}

try {
  ({ ErrorBoundary } = require('../../preview/ErrorBoundary'));
  devLog('[Debug] ✓ ErrorBoundary imported successfully');
} catch (error) {
  devLog('[Debug] ❌ Failed to import ErrorBoundary:', error);
  ErrorBoundary = ({ children, fallback }: any) => {
    const [hasError, setHasError] = React.useState(false);
    if (hasError) {
      return fallback ? fallback() : <div>Error occurred</div>;
    }
    return children;
  };
}

try {
  ({ getSimpleTheme } = require('../theme/themeManager'));
  devLog('[Debug] ✓ themeManager imported successfully');
} catch (error) {
  devLog('[Debug] ❌ Failed to import themeManager:', error);
  getSimpleTheme = () => 'dark';
}

// Debug component that validates each step
export default function ComponentDrawerDebug() {
  devLog('[Debug] ComponentDrawerDebug rendering...');
  
  const [state, setState] = React.useState(() => {
    try {
      const initialState = getDrawerState();
      devLog('[Debug] ✓ Initial state retrieved:', initialState);
      return initialState;
    } catch (error) {
      devLog('[Debug] ❌ Failed to get initial state:', error);
      return { open: false, item: null };
    }
  });

  React.useEffect(() => {
    devLog('[Debug] Setting up subscription...');
    try {
      const unsubscribe = subscribe(setState);
      devLog('[Debug] ✓ Subscription established');
      return unsubscribe;
    } catch (error) {
      devLog('[Debug] ❌ Failed to subscribe:', error);
      return () => {};
    }
  }, []);

  devLog('[Debug] Render state:', { open: state.open, hasItem: !!state.item });

  if (!state.open || !state.item) {
    devLog('[Debug] Drawer closed or no item, returning null');
    return null;
  }

  devLog('[Debug] Rendering ComponentDrawerContent with item:', state.item);

  return (
    <ErrorBoundary fallback={() => {
      devLog('[Debug] ❌ ComponentDrawerContent crashed');
      return <div>ComponentDrawer crashed during rendering</div>;
    }}>
      <ComponentDrawerContentDebug item={state.item} onClose={closeDrawer} />
    </ErrorBoundary>
  );
}

function ComponentDrawerContentDebug({ item, onClose }: { 
  item: any; 
  onClose: () => void; 
}) {
  devLog('[Debug] ComponentDrawerContentDebug rendering with item:', item);
  
  const [tab, setTab] = React.useState<'preview' | 'notes' | 'props' | 'json'>('preview');
  
  if (!item) {
    devLog('[Debug] ❌ No item provided to ComponentDrawerContentDebug');
    return null;
  }

  let reg: any;
  try {
    reg = getComponentById(item.id);
    devLog('[Debug] ✓ Component registry entry:', reg);
  } catch (error) {
    devLog('[Debug] ❌ Failed to get component by ID:', error);
    reg = {};
  }

  const entry = reg || {};
  const propsSchema = entry?.propsSchema ?? null;
  const hasProps = !!propsSchema;
  const displayName = item?.name ?? entry?.name ?? item?.id ?? 'Component';

  devLog('[Debug] Component details:', { displayName, hasProps, tab });

  React.useEffect(() => {
    if (tab === "props" && !hasProps) {
      devLog('[Debug] Switching from props tab to preview (no props available)');
      setTab("preview");
    }
  }, [tab, hasProps]);

  return (
    <aside
      className="adsm-drawer"
      data-theme="panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adsm-drawer-title"
    >
      <header className="adsm-drawer-header">
        <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{displayName}</h3>
        <button 
          onClick={onClose} 
          aria-label="Close"
          className="adsm-drawer-close"
        >
          ×
        </button>
      </header>

      <nav className="adsm-drawer-tabs" role="tablist" aria-label="Component details">
        <button 
          role="tab" 
          aria-selected={tab==='preview'} 
          onClick={()=>setTab('preview')}
          className="adsm-tab"
        >
          Preview
        </button>
        <button 
          role="tab" 
          aria-selected={tab==='notes'} 
          onClick={()=>setTab('notes')}
          className="adsm-tab"
        >
          Notes
        </button>
        <button 
          role="tab" 
          aria-selected={tab==='props'} 
          onClick={()=>setTab('props')} 
          disabled={!hasProps}
          className="adsm-tab"
        >
          Props
        </button>
        <button 
          role="tab" 
          aria-selected={tab==='json'} 
          onClick={()=>setTab('json')}
          className="adsm-tab"
        >
          JSON
        </button>
      </nav>

      <section className="adsm-drawer-content" role="tabpanel">
        {tab === 'preview' && <LivePreviewDebug itemId={item.id} />}
        {tab === 'notes'   && <NotesViewDebug item={item} />}
        {tab === 'props'   && <PropsViewDebug item={item} propsSchema={propsSchema} />}
        {tab === 'json'    && <JsonViewDebug item={item} entry={entry} />}
      </section>
    </aside>
  );
}

function LivePreviewDebug({ itemId }: { itemId: string }) {
  devLog('[Debug] LivePreviewDebug rendering for:', itemId);
  
  let Comp: any;
  try {
    Comp = getComponentPreview(itemId);
    devLog('[Debug] ✓ Component preview retrieved:', !!Comp);
  } catch (error) {
    devLog('[Debug] ❌ Failed to get component preview:', error);
    Comp = null;
  }

  if (!Comp) {
    devLog('[Debug] No component available for preview');
    return (
      <div className="adsm-drawer__preview">
        <div>No preview available<br/>Component not found in registry</div>
      </div>
    );
  }

  devLog('[Debug] Attempting to render component preview...');

  return (
    <div className="adsm-drawer__preview">
      <ErrorBoundary fallback={() => {
        devLog('[Debug] ❌ Component preview crashed');
        return <div>Preview failed to load</div>;
      }}>
        <React.Suspense fallback={<div>Loading preview…</div>}>
          <ComponentWrapper Comp={Comp} />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );
}

function ComponentWrapper({ Comp }: { Comp: any }) {
  try {
    devLog('[Debug] ComponentWrapper rendering with Comp:', typeof Comp);
    
    if (typeof Comp !== 'function' && typeof Comp !== 'object') {
      devLog('[Debug] ❌ Invalid component type:', typeof Comp);
      return <div>Invalid component type: {typeof Comp}</div>;
    }

    return <Comp />;
  } catch (error) {
    devLog('[Debug] ❌ Error rendering component:', error);
    return <div>Component render error: {String(error)}</div>;
  }
}

function NotesViewDebug({ item }: { item: any }) {
  devLog('[Debug] NotesViewDebug rendering');
  return (
    <div style={{ 
      padding: 'var(--space-md)',
      background: 'var(--color-panel)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--color-muted-foreground)'
    }}>
      Notes functionality coming soon... (Debug Mode)
    </div>
  );
}

function PropsViewDebug({ item, propsSchema }: { item: any; propsSchema: any }) {
  devLog('[Debug] PropsViewDebug rendering with schema:', !!propsSchema);
  
  if (!propsSchema) {
    return (
      <div className="muted" style={{ color: 'var(--color-muted-foreground)' }}>
        No props defined for this component. (Debug Mode)
      </div>
    );
  }
  
  return (
    <pre className="code small" style={{
      whiteSpace: "pre-wrap",
      fontSize: 'var(--font-size-sm)',
      background: 'var(--color-panel)',
      padding: 'var(--space-md)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'auto',
      maxHeight: '300px'
    }}>
      {JSON.stringify(propsSchema, null, 2)}
    </pre>
  );
}

function JsonViewDebug({ item, entry }: { item: any; entry: any }) {
  devLog('[Debug] JsonViewDebug rendering');
  return (
    <pre className="code" style={{
      whiteSpace: "pre-wrap",
      fontSize: 'var(--font-size-sm)',
      background: 'var(--color-panel)',
      padding: 'var(--space-md)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'auto',
      maxHeight: '400px'
    }}>
      {JSON.stringify(entry?.meta ?? {}, null, 2)}
    </pre>
  );
}