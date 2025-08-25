// src/drawer/ComponentDrawer.tsx
import * as React from 'react';
import { getComponentById } from '../utils/lazyFromComponent';
import { getDrawerState, subscribe, closeDrawer, type DrawerItem } from './controller';
import { getComponentPreview } from '../components/registry';
import { ErrorBoundary } from '../../preview/ErrorBoundary';
import { getSimpleTheme } from '../theme/themeManager';

// Simple useTheme hook
function useTheme() {
  const [theme, setTheme] = React.useState(getSimpleTheme());
  
  React.useEffect(() => {
    const handleThemeChange = () => {
      setTheme(getSimpleTheme());
    };

    document.addEventListener('adsm:theme:changed', handleThemeChange);
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

  return { theme };
}



// Main ComponentDrawer wrapper that connects to the controller
export default function ComponentDrawer() {
  const [state, setState] = React.useState(getDrawerState());

  React.useEffect(() => {
    return subscribe(setState);
  }, []);

  if (!state.open || !state.item) {
    return null;
  }

  return <ComponentDrawerContent item={state.item} onClose={closeDrawer} />;
}

// Registry will give us the component constructor (not a path)
type Renderable = React.ComponentType<any> | null;

function LivePreview({ Comp, props }: { Comp: Renderable; props?: any }) {
  if (!Comp) {
    return (
      <div className="adsm-drawer__preview">
        <div>No preview available<br/>Component not found in registry</div>
      </div>
    );
  }
  return (
    <div className="adsm-drawer__preview">
      <ErrorBoundary fallback={() => <div>Drawer failed to load</div>}>
        <React.Suspense fallback={<div>Loading…</div>}>
          <Comp {...(props ?? {})} />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );
}

function resolvePreview(id: string) {
  // returns a React component or null
  return getComponentPreview(id);
}



// Internal component that handles the actual drawer rendering
function ComponentDrawerContent({ item, onClose }: { 
  item: DrawerItem; 
  onClose: () => void; 
}) {
  const [tab, setTab] = React.useState<'preview' | 'notes' | 'props' | 'json'>('preview');
  
  if (!item) return null;

  const reg = getComponentById(item.id);
  const entry = reg || {};

  const propsSchema = entry?.propsSchema ?? null;
  const hasProps = !!propsSchema;

  React.useEffect(() => {
    if (tab === "props" && !hasProps) {
      setTab("preview");
    }
  }, [tab, hasProps]);

  const displayName = item?.name ?? entry?.name ?? item?.id ?? 'Component';

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
        {tab === 'preview' && <LivePreview Comp={resolvePreview(item.id)} />}
        {tab === 'notes'   && <NotesView item={item} />}
        {tab === 'props'   && <PropsView item={item} propsSchema={propsSchema} />}
        {tab === 'json'    && <JsonView item={item} entry={entry} />}
      </section>
    </aside>
  );
}

function NotesView({ item }: { item: DrawerItem }) {
  return (
    <div style={{ 
      padding: 'var(--space-md)',
      background: 'var(--color-panel)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      color: 'var(--color-muted-foreground)'
    }}>
      Notes functionality coming soon...
    </div>
  );
}

function PropsView({ item, propsSchema }: { item: DrawerItem; propsSchema: any }) {
  if (!propsSchema) {
    return (
      <div className="muted" style={{ color: 'var(--color-muted-foreground)' }}>
        No props defined for this component.
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

function JsonView({ item, entry }: { item: DrawerItem; entry: any }) {
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





