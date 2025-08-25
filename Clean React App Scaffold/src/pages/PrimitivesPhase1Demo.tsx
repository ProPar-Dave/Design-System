import React from 'react';
import ThemeToggle from '../components/ThemeToggle';

export default function PrimitivesPhase1Demo() {
  return (
    <div style={{ padding: 'var(--space-4)' }}>
      {/* Header with theme toggle */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 'var(--space-4)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: '600' }}>
            Phase 1: Theme Primitives
          </h1>
          <p className="adsm-text-muted" style={{ margin: '0', fontSize: 'var(--text-sm)' }}>
            Testing scoped CSS structure with token-driven theming
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Panel showcase */}
      <div className="adsm-panel" style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-lg)' }}>
          Panel Component
        </h2>
        <p style={{ margin: '0', fontSize: 'var(--text-base)' }}>
          This panel uses <code>.adsm-panel</code> class with token-driven background, 
          border, and spacing that automatically responds to theme changes.
        </p>
      </div>

      {/* Button variants */}
      <div className="adsm-panel" style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-lg)' }}>
          Button Primitives
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="adsm-btn adsm-btn-primary">
            Primary Button
          </button>
          <button className="adsm-btn adsm-btn-secondary">
            Secondary Button  
          </button>
          <button className="adsm-btn adsm-btn-danger">
            Danger Button
          </button>
        </div>
      </div>

      {/* Text variants */}
      <div className="adsm-panel" style={{ marginBottom: 'var(--space-4)' }}>
        <h2 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-lg)' }}>
          Text Primitives
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-base)' }}>
            Default text using theme tokens
          </p>
          <p className="adsm-text-muted" style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
            Muted text with .adsm-text-muted class
          </p>
          <p className="adsm-text-accent" style={{ margin: 0, fontSize: 'var(--text-base)' }}>
            Accent text with .adsm-text-accent class
          </p>
          <p className="adsm-text-danger" style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
            Danger text with .adsm-text-danger class
          </p>
        </div>
      </div>

      {/* Card component */}
      <div className="adsm-card" style={{ marginBottom: 'var(--space-4)' }}>
        <h3 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-lg)' }}>
          Card Component
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--text-base)' }}>
          This card uses <code>.adsm-card</code> class with hover effects. 
          All styling uses CSS custom properties that automatically switch between light and dark themes.
        </p>
      </div>

      {/* Theme test section */}
      <div className="adsm-panel">
        <h2 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-lg)' }}>
          Theme Testing
        </h2>
        <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-base)' }}>
          All components above are scoped under <code>.adsm-ui</code> namespace and use 
          token-driven styling. Toggle the theme to see instant updates without any flashing or conflicts.
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-3)',
          fontSize: 'var(--text-sm)'
        }}>
          <div>
            <strong>Background:</strong> <code>var(--color-bg)</code>
          </div>
          <div>
            <strong>Text:</strong> <code>var(--color-text)</code>
          </div>
          <div>
            <strong>Panel:</strong> <code>var(--color-panel)</code>
          </div>
          <div>
            <strong>Border:</strong> <code>var(--color-border)</code>
          </div>
        </div>
      </div>
    </div>
  );
}