import * as React from 'react';
import type { DsComponent } from "../utils/catalog";

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

export function PreviewPanel({ item }: { item: DsComponent }) {
  const node = registry[item.id];
  return (
    <div className="preview-frame">
      {node || <div className="empty">No preview available.</div>}
    </div>
  );
}