import * as React from 'react';
import type { DsComponent } from "../utils/catalog";
import { getSimpleTheme } from '../src/theme/themeManager';

// Simple useTheme hook - matching the one in ComponentDrawer
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

const registry: Record<string, React.ReactNode> = {
  btn: <button className="demo-btn" style={{
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-primary)',
    color: 'var(--color-primary-foreground)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  }} onMouseOver={(e) => {
    e.currentTarget.style.background = 'var(--color-secondary)';
  }} onMouseOut={(e) => {
    e.currentTarget.style.background = 'var(--color-primary)';
  }}>Primary</button>,
  
  'text-field': <input className="demo-input" placeholder="Type…" style={{
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-input-background)',
    color: 'var(--color-text)',
    minWidth: '200px',
    fontSize: '14px'
  }} />,
  
  'button-primary': <button style={{
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    background: 'var(--color-primary)',
    color: 'var(--color-primary-foreground)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
  }}>Primary Button</button>,
  
  'button-secondary': <button style={{
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px'
  }}>Secondary Button</button>,
};

// Type definition for ComponentDef to match the diff
interface ComponentDef {
  demo?: React.ComponentType;
  id?: string;
}

export function PreviewPanel({ component }: { component: ComponentDef }) {
  const { theme } = useTheme();
  if (!component) return <div className="text-muted">No preview available</div>;
  const Demo = component.demo;
  if (!Demo) return <div className="text-muted">No preview registered</div>;

  return (
    <div
      className="
        preview-panel
        bg-[var(--color-panel)]
        text-[var(--color-text)]
        border border-[var(--color-border)]
        rounded-md p-4
      "
      data-theme={theme ?? "light"}
    >
      <Demo />
    </div>
  );
}

// Keep the old function for backward compatibility if needed elsewhere
export function PreviewPanelLegacy({ item }: { item: DsComponent }) {
  const node = registry[item.id];
  return (
    <div className="preview-frame">
      {node || <div className="empty">No preview available.</div>}
    </div>
  );
}