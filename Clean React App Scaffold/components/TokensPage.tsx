import React from 'react';
import { getTheme, ensureThemeTokens } from '../boot';
import { safeLogEvent } from '../diagnostics/logger';
import { announceToScreenReader, safePingTokenOperation } from '../utils/appHelpers';
import { TokenShowcase } from './TokenShowcase';

// Custom hook for token values using boot.tsx system
function useTokenValues() {
  const get = React.useCallback(() => {
    const source = document.getElementById('adsm-root') ?? document.documentElement;
    const cs = getComputedStyle(source);
    const out: Record<string, string> = {};
    // Get core tokens that are guaranteed by boot.tsx
    const coreKeys = [
      // Base tokens
      '--color-bg', '--color-panel', '--color-text', '--color-accent', 
      '--color-muted', '--color-border', '--space-4', '--radius-md', 
      '--font-size-base', '--button-bg', '--button-fg', '--color-background', 
      '--color-foreground', '--color-primary', '--color-secondary',
      
      // Interactive state tokens
      '--color-hover-bg', '--color-active-bg', '--color-disabled-bg', 
      '--color-disabled-text', '--color-focus-ring',
      
      // Component semantic tokens
      '--chip-bg', '--chip-text', '--chip-hover', '--chip-active', '--chip-border',
      '--tab-active-fg', '--tab-active-bg', '--tab-inactive-fg', '--tab-inactive-bg', '--tab-hover-bg',
      '--input-bg', '--input-text', '--input-placeholder', '--input-border', 
      '--input-focus-border', '--input-disabled-bg', '--input-disabled-text',
      '--button-primary-bg', '--button-primary-text', '--button-primary-hover', 
      '--button-primary-active', '--button-primary-disabled',
      '--button-secondary-bg', '--button-secondary-text', '--button-secondary-border',
      '--button-secondary-hover', '--button-secondary-active', '--button-secondary-disabled',
      '--card-bg', '--card-border', '--card-hover',
      '--link-text', '--link-hover', '--link-active',
      '--success-bg', '--success-text', '--success-border',
      '--warning-bg', '--warning-text', '--warning-border',
      '--error-bg', '--error-text', '--error-border',
      '--info-bg', '--info-text', '--info-border',
      
      // Navigation tokens
      '--nav-link-text', '--nav-link-hover-bg', '--nav-link-hover-text',
      '--nav-active-bg', '--nav-active-text', '--nav-focus-ring'
    ];
    for (const k of coreKeys) out[k] = cs.getPropertyValue(k).trim();
    return out;
  }, []);

  const [vals, setVals] = React.useState<Record<string, string>>(get);
  
  React.useEffect(() => {
    const h = () => setVals(get());
    window.addEventListener('adsm:tokens-ready', h);
    document.addEventListener('adsm:tokens:updated', h);
    document.addEventListener('adsm:theme:changed', h);
    return () => {
      window.removeEventListener('adsm:tokens-ready', h);
      document.removeEventListener('adsm:tokens:updated', h);
      document.removeEventListener('adsm:theme:changed', h);
    };
  }, [get]);
  
  return [vals, setVals] as const;
}

export default function TokensPage() {
  const [vals] = useTokenValues();
  const [msg, setMsg] = React.useState('');
  const [statusRegion, setStatusRegion] = React.useState('');
  
  const copy = React.useCallback(async (text: string) => { 
    try { 
      await navigator.clipboard.writeText(text); 
      setMsg('Copied'); 
      setStatusRegion('Content copied to clipboard');
      safeLogEvent('info', 'perf/measure', { metric: 'token-copy', length: text.length });
      setTimeout(() => {
        setMsg('');
        setStatusRegion('');
      }, 1200);
    } catch { 
      setMsg('Copy failed'); 
      setStatusRegion('Copy operation failed');
      safeLogEvent('error', 'perf/measure', { metric: 'token-copy-error' });
      setTimeout(() => {
        setMsg('');
        setStatusRegion('');
      }, 1200);
    } 
  }, []);
  
  const download = React.useCallback((text: string, filename: string, type = 'text/plain') => {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); 
    a.download = filename; 
    a.click(); 
    URL.revokeObjectURL(a.href);
    setStatusRegion(`Downloaded ${filename}`);
    safeLogEvent('info', 'catalog/export', { 
      kind: type === 'text/css' ? 'tokens-css' : 'tokens-json',
      filename,
      size: text.length 
    });
    setTimeout(() => setStatusRegion(''), 2000);
  }, []);

  // Generate exports from current computed values (includes overrides)
  const cssOut = React.useMemo(() => `:root{\n${Object.entries(vals).map(([k,v]) => `  ${k}: ${v};`).join('\n')}\n}`, [vals]);
  const jsonOut = React.useMemo(() => JSON.stringify(vals, null, 2), [vals]);

  const handleCopyCSS = React.useCallback(() => copy(cssOut), [copy, cssOut]);
  const handleCopyJSON = React.useCallback(() => copy(jsonOut), [copy, jsonOut]);

  // Group tokens for display
  const colors = React.useMemo(() => Object.fromEntries(Object.entries(vals).filter(([k]) => k.includes('color') || k.includes('bg') || k.includes('text') || k.includes('border') || k.includes('fg'))), [vals]);
  const spacing = React.useMemo(() => Object.fromEntries(Object.entries(vals).filter(([k]) => k.includes('space'))), [vals]);
  const components = React.useMemo(() => Object.fromEntries(Object.entries(vals).filter(([k]) => k.includes('chip') || k.includes('tab') || k.includes('button') || k.includes('input') || k.includes('card') || k.includes('link'))), [vals]);

  return (
    <div className="content space-y-8">
      <header>
        <h1>Design Tokens</h1>
        <p className="text-muted-foreground">
          Manage and export your design system tokens. Changes are applied instantly with live preview.
        </p>
      </header>

      {/* Status announcements for screen readers */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {statusRegion}
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <button 
          onClick={handleCopyCSS} 
          className="adsm-button-primary"
        >
          Copy as CSS
        </button>
        <button 
          onClick={handleCopyJSON} 
          className="adsm-button-primary"
        >
          Copy as JSON
        </button>
        <button 
          onClick={() => download(cssOut, `tokens-${getTheme()}.css`, 'text/css')} 
          className="adsm-button-primary"
        >
          Download CSS
        </button>
        <button 
          onClick={() => download(jsonOut, `tokens-${getTheme()}.json`, 'application/json')} 
          className="adsm-button-primary"
        >
          Download JSON
        </button>
        {msg && (
          <span className="text-muted-foreground" role="status">
            {msg}
          </span>
        )}
      </div>

      <TokenShowcase />

      {/* Colors Section */}
      <section>
        <h2>Colors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(colors).map(([name, value]) => (
            <button 
              key={name} 
              onClick={() => copy(`var(${name})`)} 
              className="text-left p-4 border rounded-lg bg-card hover:bg-accent transition-colors"
            >
              <div className="font-semibold text-sm">{name}</div>
              <div className="text-xs text-muted-foreground mt-1">{value || 'unset'}</div>
              <div 
                className="w-full h-6 mt-2 rounded border"
                style={{ backgroundColor: value || 'transparent' }}
              />
            </button>
          ))}
        </div>
      </section>

      {/* Spacing Section */}
      <section>
        <h2>Spacing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(spacing).map(([name, value]) => (
            <button 
              key={name} 
              onClick={() => copy(`var(${name})`)} 
              className="text-left p-4 border rounded-lg bg-card hover:bg-accent transition-colors"
            >
              <div className="font-semibold text-sm">{name}</div>
              <div className="text-xs text-muted-foreground mt-1">{value || 'unset'}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Components Section */}
      <section>
        <h2>Component Tokens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(components).map(([name, value]) => (
            <button 
              key={name} 
              onClick={() => copy(`var(${name})`)} 
              className="text-left p-4 border rounded-lg bg-card hover:bg-accent transition-colors"
            >
              <div className="font-semibold text-sm">{name}</div>
              <div className="text-xs text-muted-foreground mt-1">{value || 'unset'}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}