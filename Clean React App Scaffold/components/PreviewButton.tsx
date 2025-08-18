import * as React from 'react';

export function PreviewButton({ label = 'Primary' }: { label?: string }) {
  return (
    <button
      style={{
        background: 'var(--button-bg, var(--color-accent))',
        color: 'var(--button-fg, var(--color-text))',
        border: '1px solid var(--color-border)',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '14px',
        boxShadow: '0 1px 0 rgba(0,0,0,.15), 0 0 0 1px inset rgba(255,255,255,.04)',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,.2), 0 0 0 1px inset rgba(255,255,255,.06)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,.15), 0 0 0 1px inset rgba(255,255,255,.04)';
      }}
    >
      {label}
    </button>
  );
}