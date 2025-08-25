import * as React from 'react';
import { setToken, loadTokens } from '../utils/tokenUtils';

type TokenRow = { name: string; value: string };

const DEFAULTS: TokenRow[] = [
  { name: 'color-bg', value: '#0B1020' },
  { name: 'color-panel', value: '#0F162E' },
  { name: 'color-text', value: '#E2E8F0' },
  { name: 'color-accent', value: '#3B82F6' },
  { name: 'color-border', value: '#1e293b' },
  { name: 'color-muted', value: '#1E293B' },
  { name: 'color-hover-bg', value: '#334155' },
  { name: 'color-active-bg', value: '#475569' },
  { name: 'color-focus-ring', value: '#60A5FA' },
  { name: 'btn-primary-bg', value: '#E2E8F0' },
  { name: 'input-bg', value: '#1E293B' },
  { name: 'chip-bg', value: '#1E293B' },
  { name: 'color-primary', value: '#E2E8F0' },
  { name: 'color-secondary', value: '#94A3B8' },
  { name: 'color-success', value: '#10B981' },
  { name: 'color-warning', value: '#F59E0B' },
  { name: 'color-error', value: '#EF4444' },
  { name: 'color-info', value: '#3B82F6' },
  { name: 'color-muted-foreground', value: '#94A3B8' },
  { name: 'button-primary-bg', value: '#E2E8F0' },
  { name: 'button-primary-text', value: '#0B1020' },
  { name: 'button-primary-hover', value: '#F1F5F9' },
  { name: 'button-secondary-bg', value: 'transparent' },
  { name: 'button-secondary-text', value: '#E2E8F0' },
  { name: 'button-secondary-border', value: '#475569' },
  { name: 'input-background', value: '#1E293B' },
  { name: 'input-border', value: '#475569' },
  { name: 'input-text', value: '#E2E8F0' },
];

export default function TokensPage() {
  const [values, setValues] = React.useState(loadTokens());

  // called on input change
  const onChange = (name: string, raw: string) => {
    const cleaned = raw.replace(/\s+/g, '');
    // allow leading "#"
    setToken(name, cleaned);
    setValues(prev => ({ ...prev, [name.replace(/^--/, '')]: cleaned }));
  };

  const onReset = (name: string) => {
    const defaultValue = DEFAULTS.find(d => d.name === name)?.value || '';
    onChange(name, defaultValue);
  };

  const handleExport = () => {
    try {
      const tokens = loadTokens();
      const json = JSON.stringify(tokens, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'design-tokens.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const importedTokens = JSON.parse(json);
        Object.entries(importedTokens).forEach(([name, value]) => {
          if (typeof value === 'string') {
            setToken(name, value);
          }
        });
        // Update local state
        setValues(loadTokens());
      } catch (error) {
        console.error('Import failed:', error);
      }
    };
    reader.readAsText(file);
    
    // Clear the input
    event.target.value = '';
  };

  // Get current token values or defaults
  const getTokenValue = (name: string) => {
    return values[name] || DEFAULTS.find(d => d.name === name)?.value || '';
  };

  return (
    <div className="content">
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h1>Design Tokens</h1>
        <p style={{ color: 'var(--color-muted-foreground)', marginTop: 'var(--space-sm)' }}>
          Edit design tokens to see live changes throughout the application. 
          Changes are automatically saved and applied to the entire design system.
        </p>
      </div>

      <div style={{ 
        marginBottom: 'var(--space-lg)',
        display: 'flex',
        gap: 'var(--space-sm)',
        flexWrap: 'wrap'
      }}>
        <button 
          className="adsm-btn-secondary"
          onClick={handleExport}
        >
          Export Tokens
        </button>
        <label className="adsm-btn-secondary" style={{ cursor: 'pointer' }}>
          Import Tokens
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="tokens-grid">
        {DEFAULTS.map((defaultToken) => (
          <TokenCell 
            key={defaultToken.name} 
            name={defaultToken.name}
            value={getTokenValue(defaultToken.name)}
            onChange={onChange} 
            onReset={() => onReset(defaultToken.name)} 
          />
        ))}
      </div>

      <div style={{ 
        marginTop: 'var(--space-xl)', 
        padding: 'var(--space-md)',
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)'
      }}>
        <h3 style={{ marginBottom: 'var(--space-sm)' }}>Token Usage</h3>
        <p style={{ 
          fontSize: 'var(--font-size-sm)', 
          color: 'var(--color-muted-foreground)',
          lineHeight: 'var(--line-height-relaxed)'
        }}>
          Tokens are CSS custom properties that can be used throughout your components. 
          For example: <code style={{ 
            background: 'var(--color-accent)', 
            padding: '2px 4px', 
            borderRadius: '4px',
            fontSize: 'var(--font-size-xs)'
          }}>background: var(--color-primary)</code>
        </p>
        <div style={{ marginTop: 'var(--space-sm)' }}>
          <h4 style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-xs)' }}>Supported Formats:</h4>
          <ul style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: 'var(--color-muted-foreground)',
            paddingLeft: 'var(--space-md)'
          }}>
            <li>Hex: <code>#3B82F6</code> or <code>#fff</code></li>
            <li>RGB: <code>rgb(59, 130, 246)</code> or <code>rgba(59, 130, 246, 0.5)</code></li>
            <li>Keywords: <code>transparent</code>, <code>currentColor</code>, <code>inherit</code></li>
            <li>CSS Variables: <code>var(--other-token)</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TokenCell({ 
  name,
  value,
  onChange, 
  onReset 
}: { 
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  onReset: () => void;
}) {
  return (
    <label className="token-cell">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px'
      }}>
        <div className="token-name">--{name}</div>
        {value && (
          <button
            onClick={onReset}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-muted-foreground)',
              cursor: 'pointer',
              fontSize: 'var(--font-size-xs)',
              padding: '2px 4px'
            }}
            title="Reset to default"
          >
            Reset
          </button>
        )}
      </div>
      <input
        type="text"
        inputMode="text"
        value={value}
        onChange={e => onChange(name, e.target.value)}
        placeholder="e.g. #3B82F6 or transparent"
        aria-label={`value for --${name}`}
        style={{
          background: 'var(--input-bg, var(--color-bg))',
          color: 'var(--input-text, var(--color-text))',
          border: '1px solid var(--input-border, var(--color-border))',
          borderRadius: '8px',
          padding: '8px 10px',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 'var(--font-size-sm)',
          width: '100%'
        }}
      />
      {value && (
        <div style={{
          marginTop: '6px',
          height: '20px',
          borderRadius: '4px',
          background: value,
          border: '1px solid var(--color-border)'
        }} />
      )}
    </label>
  );
}