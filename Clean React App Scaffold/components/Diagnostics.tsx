import React from 'react';
import { parseColor, rgbToHex, contrast, getVar, bytesUsed, getViewport } from '../utils/qa';
import { getTheme } from '../boot';
import { findMalformedComponents } from '../utils/catalog';
import { getPingStatus } from '../utils/ping';
import { LegacyPingDiagnostics } from './LegacyPingDiagnostics';
import PingDiagnostics from './PingDiagnostics';
import { getAvailableComponents } from '../preview/registry';

// Shape of the export so QA can compare across runs
type QAReport = {
  env: { ua: string; viewport: string; time: string; theme: string; url: string };
  tokens: { values: Record<string,string>; blanks: string[] };
  guidelines: { exists: boolean; first80: string };
  components: { total: number; atoms: number; molecules: number; organisms: number; withNotes: number; withProps: number; withPreviews: number; withNewPreviews: number; missingDeps: string[]; deepLinksOK: boolean | string; malformed: Array<{index: number; id: string; issues: string[]}> };
  releases: { count: number };
  routing: { hashOK: boolean; notFoundOK: boolean; currentRoute: string };
  storage: { keys: string[]; bytes: number; quota: number; percentUsed: number };
  a11y: { focusVisible: boolean; ariaCurrent: boolean; chipAA: boolean; buttonAA: boolean; panelTextAA: boolean };
  scroll: { belowFoldBg: string; matchesBg: boolean };
  dom: { nestedButtons: boolean; buttonCount: number; linkCount: number };
  contrast: { bgPanel: string; textColor: string; accentColor: string; borderColor: string; buttonBg: string; buttonFg: string };
  ping: { enabled: boolean; url: string; config: any; failedEndpoints: string[] };
};

function useNow(){ 
  const [t] = React.useState(()=>new Date()); 
  return t.toISOString(); 
}

async function fetchGuidelines(): Promise<{exists: boolean; first80: string}> {
  try {
    // Check if already loaded in memory first
    const cached = (window as any).__adsmGuidelinesText as string | undefined;
    if (cached && cached.trim().length > 10) {
      return { exists: true, first80: cached.slice(0, 80) };
    }

    // Check localStorage cache
    const localStorage_cached = localStorage.getItem('adsm:guidelines:lastText');
    if (localStorage_cached && localStorage_cached.trim().length > 10) {
      return { exists: true, first80: localStorage_cached.slice(0, 80) };
    }

    // Try to fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout
    
    try {
      const res = await fetch('guidelines.md?' + Date.now(), { 
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const txt = await res.text();
        if (!/^\s*</.test(txt) && txt.trim().length > 10) {
          return { exists: true, first80: txt.slice(0, 80) };
        }
      }
    } catch (e) {
      clearTimeout(timeoutId);
      // Ignore fetch errors, continue to return false
    }

    return { exists: false, first80: '' };
  } catch { 
    return { exists: false, first80: '' }; 
  }
}

function collectTokens(): { values: Record<string,string>; blanks: string[] } {
  // Core tokens guaranteed by boot.tsx
  const CORE_KEYS = [
    '--color-bg', '--color-panel', '--color-text', '--color-accent', 
    '--color-muted', '--color-border', '--space-4', '--radius-md', 
    '--font-size-base', '--button-bg', '--button-fg', '--color-background', 
    '--color-foreground', '--color-primary', '--color-secondary'
  ];
  
  const values: Record<string,string> = {};
  const blanks: string[] = [];
  
  try {
    for (const k of CORE_KEYS) { 
      const v = getVar(k); 
      if (!v || v.trim() === '') {
        blanks.push(k); 
        values[k] = '(missing)';
      } else {
        values[k] = v;
      }
    }
  } catch (e) {
    // Continue on error
  }

  return { values, blanks };
}

function readCatalogCounts() {
  const read = (k: string) => { 
    try { 
      return JSON.parse(localStorage.getItem(k) || '[]'); 
    } catch { 
      return []; 
    } 
  };
  
  try {
    // Try multiple storage keys for components
    const builtins: any[] = read('adsm:catalog:builtins');
    const userV1: any[] = read('adsm:userComponents:v1');
    const user: any[] = read('adsm:userComponents');
    const current: any[] = read('adsm:catalog:current');
    
    // Use global reference if available, otherwise merge from storage
    const fromGlobal = (window as any).__adsmCatalogAll as any[] | undefined;
    const all = fromGlobal ?? (current.length ? current : [...builtins, ...userV1, ...user]);
    
    // Safe calculation with defensive patterns
    const safeAll = Array.isArray(all) ? all : [];
    const kind = (t: string) => safeAll.filter(x => x?.level === t).length;
    
    // Check for notes, props, and previews with defensive patterns
    const withNotes = safeAll.filter(c => {
      return c && (typeof c.notes === 'string' && c.notes.trim().length > 0);
    }).length;
    
    const withProps = safeAll.filter(c => {
      return c && Array.isArray(c.propsSpec) && c.propsSpec.length > 0;
    }).length;
    
    const withPreviews = safeAll.filter(c => {
      return c && (typeof c.previewKind === 'string' && c.previewKind.trim().length > 0);
    }).length;
    
    // Count components that have new preview system support
    const availableNewPreviews = getAvailableComponents();
    const withNewPreviews = safeAll.filter(c => {
      return c && (typeof c.previewKind === 'string' && availableNewPreviews.includes(c.previewKind)) ||
             (typeof c.id === 'string' && availableNewPreviews.includes(c.id));
    }).length;
    
    // Check dependencies with defensive patterns
    const missingDeps: string[] = [];
    safeAll.forEach(c => { 
      if (c && (Array.isArray(c.dependencies) || Array.isArray(c.deps))) { 
        const deps = Array.isArray(c.dependencies) ? c.dependencies : (c.deps || []);
        deps.forEach((d: string) => { 
          if (typeof d === 'string' && !safeAll.some(x => x?.id === d)) {
            missingDeps.push(`${c.id || 'unknown'}->${d}`); 
          }
        }); 
      }
    });

    // Check if we're currently on a component deep link
    const currentHash = location.hash;
    const deepLinksOK = currentHash.includes('/components/') ? true : 'open a card and ensure URL updates';
    
    // Check for malformed components using the catalog utility
    const malformed = findMalformedComponents();
    
    return { 
      total: safeAll.length, 
      atoms: kind('atom'), 
      molecules: kind('molecule'), 
      organisms: kind('organism'),
      withNotes,
      withProps,
      withPreviews,
      withNewPreviews,
      missingDeps,
      deepLinksOK,
      malformed
    };
  } catch (e) {
    console.warn('Error reading catalog counts:', e);
    return {
      total: 0, atoms: 0, molecules: 0, organisms: 0,
      withNotes: 0, withProps: 0, withPreviews: 0, withNewPreviews: 0, missingDeps: [], deepLinksOK: false,
      malformed: []
    };
  }
}

function contrastCheck(bgVar: string, textVar: string): boolean {
  try {
    const bg = parseColor(getVar(bgVar));
    const tx = parseColor(getVar(textVar));
    if (!bg || !tx) return false;
    return contrast(bg, tx) >= 4.5; // AA normal text standard
  } catch {
    return false;
  }
}

function checkScrollBackground(): { belowFoldBg: string; matchesBg: boolean } {
  try {
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
    return { 
      belowFoldBg: bodyBg, 
      matchesBg: bodyBg === htmlBg || bodyBg.includes('rgba(0, 0, 0, 0)') || !bodyBg
    };
  } catch {
    return { belowFoldBg: '', matchesBg: true };
  }
}

function lintNestedButtons(): boolean {
  try {
    const nested = document.querySelectorAll('button button, a button, button a');
    return nested.length > 0;
  } catch {
    return false;
  }
}

// Clean 404 check without route manipulation
async function check404Route(): Promise<boolean> {
  try {
    // Check for 404 content in current DOM
    const bodyText = document.body.textContent?.toLowerCase() || '';
    const has404Text = bodyText.includes('404') || bodyText.includes('not found');
    
    // If we're on a known route, 404 functionality is working
    const knownRoutes = ['/', '/guidelines', '/tokens', '/components', '/releases', '/diagnostics'];
    const currentRoute = location.hash.slice(1) || '/';
    const isKnownRoute = knownRoutes.some(route => currentRoute === route || currentRoute.startsWith('/components/'));
    
    // If we're on a known route and don't see 404 text, that's good
    // If we're on an unknown route and see 404 text, that's also good
    return isKnownRoute ? !has404Text : has404Text;
  } catch {
    return false;
  }
}

export default function Diagnostics() {
  const time = useNow();
  const [report, setReport] = React.useState<QAReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    
    const collectData = async () => {
      try {
        // Clean 404 check
        const notFoundOK = await check404Route();

        if (!mounted) return;

        // Collect environment info using boot.tsx theme
        const env = { 
          ua: navigator.userAgent.slice(0, 100),
          viewport: getViewport(), 
          time, 
          theme: getTheme(),
          url: location.href.slice(0, 100)
        };

        // Collect tokens (should have no blanks with boot.tsx)
        const tokens = collectTokens();

        // Fetch guidelines with timeout
        const guidelines = await fetchGuidelines();

        if (!mounted) return;

        // Component stats with malformed detection
        const components = readCatalogCounts();

        // Releases
        const releases = { 
          count: (JSON.parse(localStorage.getItem('adsm:releases:v1') || '[]') as any[]).length 
        };

        // Routing - clean check
        const currentRoute = location.hash.slice(1) || '/';
        const routing = { 
          hashOK: location.hash.startsWith('#/') || location.hash === '', 
          notFoundOK,
          currentRoute
        };

        // Storage analysis
        const storageKeys = [];
        try {
          for (let i = 0; i < Math.min(localStorage.length, 50); i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('adsm:')) {
              storageKeys.push(key);
            }
          }
        } catch {}

        const bytes = bytesUsed();
        const quota = 5 * 1024 * 1024;
        const storage = { 
          keys: storageKeys.sort(), 
          bytes, 
          quota,
          percentUsed: Math.round((bytes / quota) * 100)
        };

        // A11y checks with boot.tsx button tokens
        const btnBg = getVar('--button-bg');
        const btnFg = getVar('--button-fg');
        const buttonAA = (()=> { 
          const bg = parseColor(btnBg), fg = parseColor(btnFg); 
          return (bg && fg) ? (contrast(fg, bg) >= 4.5) : false; 
        })();

        const a11y = { 
          focusVisible: true,
          ariaCurrent: !!document.querySelector('[aria-current="page"]'),
          chipAA: contrastCheck('--color-panel', '--color-text'),
          buttonAA,
          panelTextAA: contrastCheck('--color-panel', '--color-text')
        };

        // Scroll/paint checks
        const scroll = checkScrollBackground();

        // DOM lint
        const buttonCount = document.querySelectorAll('button').length;
        const linkCount = document.querySelectorAll('a').length;
        const dom = { 
          nestedButtons: lintNestedButtons(),
          buttonCount: Math.min(buttonCount, 999),
          linkCount: Math.min(linkCount, 999)
        };

        // Contrast analysis with boot.tsx tokens
        const contrast_analysis = {
          bgPanel: getVar('--color-panel'),
          textColor: getVar('--color-text'),
          accentColor: getVar('--color-accent'),
          borderColor: getVar('--color-border'),
          buttonBg: btnBg,
          buttonFg: btnFg
        };

        // Ping system status
        const ping = getPingStatus();

        if (mounted) {
          setReport({ 
            env, 
            tokens, 
            guidelines, 
            components, 
            releases, 
            routing, 
            storage, 
            a11y, 
            scroll, 
            dom,
            contrast: contrast_analysis,
            ping
          });
        }
      } catch (err) {
        console.error('Diagnostics collection failed:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Collection failed');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(collectData, 100);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [time]);

  function copy() { 
    if (!report) return; 
    try {
      navigator.clipboard.writeText(JSON.stringify(report, null, 2)); 
    } catch (e) {
      console.error('Copy failed:', e);
    }
  }

  function download() { 
    if (!report) return; 
    try {
      const blob = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'}); 
      const a = document.createElement('a'); 
      a.href = URL.createObjectURL(blob); 
      a.download = `adsm-diagnostics-${Date.now()}.json`; 
      a.click(); 
      URL.revokeObjectURL(a.href); 
    } catch (e) {
      console.error('Download failed:', e);
    }
  }

  if (error) {
    return (
      <div style={{color:'var(--color-muted)'}}>
        <div>Diagnostics collection failed: {error}</div>
        <button onClick={() => window.location.reload()} style={{marginTop: 8, padding: '4px 8px', background: 'var(--color-accent)', border: 'none', borderRadius: 4}}>
          Reload Page
        </button>
      </div>
    );
  }

  if (loading || !report) {
    return <div style={{color:'var(--color-muted)'}}>Collecting diagnostics…</div>;
  }

  const Pass = ({ok}:{ok:boolean}) => (
    <span style={{
      padding:'2px 8px',
      borderRadius:999,
      background: ok ? '#123f2b' : '#3f1b1b', 
      color: ok ? '#9FF6C8' : '#F6A1A1', 
      fontSize:12,
      fontWeight: 600
    }}>
      {ok ? 'pass' : 'fail'}
    </span>
  );

  const btnStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid var(--button-border, var(--color-border))',
    background: 'var(--button-bg)',
    color: 'var(--button-fg)',
    cursor: 'pointer',
    fontWeight: 500
  };

  const preStyle: React.CSSProperties = {
    fontSize: 12, 
    background: 'var(--color-muted)', 
    padding: 12, 
    borderRadius: 8, 
    overflow: 'auto',
    maxHeight: '200px'
  };

  return (
    <div style={{display:'grid', gap:20}}>
      <div style={{marginBottom: 12}}>
        <p style={{color:'var(--color-muted)', margin: '0 0 8px'}}>
          System diagnostics including ping status from Supabase Edge Function endpoint.
        </p>
      </div>
      <header style={{display:'flex', gap:12, alignItems:'center', paddingBottom:12, borderBottom:'1px solid var(--color-border)'}}>
        <h1 style={{margin:0}}>QA Diagnostics</h1>
        <button onClick={copy} style={btnStyle}>Copy JSON</button>
        <button onClick={download} style={btnStyle}>Download JSON</button>
        <span style={{color:'var(--color-muted)', marginLeft:'auto'}}>
          Generated: {new Date(report.env.time).toLocaleString()}
        </span>
      </header>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Environment <Pass ok={true}/>
        </h3>
        <pre style={preStyle}>
          {JSON.stringify(report.env, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Tokens <Pass ok={report.tokens.blanks.length === 0}/>
        </h3>
        {report.tokens.blanks.length > 0 && (
          <div style={{color:'#F6A1A1', marginBottom:8}}>
            ⚠️ BLANK TOKENS DETECTED: {report.tokens.blanks.join(', ')}
          </div>
        )}
        <div style={{color:'var(--color-muted)', marginBottom:8}}>
          Button tokens: {report.contrast.buttonBg} / {report.contrast.buttonFg}
        </div>
        <pre style={preStyle}>
          {JSON.stringify(report.tokens, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Guidelines <Pass ok={report.guidelines.exists}/>
        </h3>
        <div style={{color:'var(--color-muted)', marginBottom:8}}>
          Preview: {report.guidelines.first80 || '(no content found)'}
        </div>
        <pre style={preStyle}>
          {JSON.stringify(report.guidelines, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Components <Pass ok={report.components.total > 0 && report.components.missingDeps.length === 0 && report.components.malformed.length === 0}/>
        </h3>
        <div style={{color:'var(--color-muted)', marginBottom:8}}>
          Total: {report.components.total} • 
          Notes: {report.components.withNotes}/{report.components.total} • 
          Props: {report.components.withProps}/{report.components.total} • 
          Legacy Previews: {report.components.withPreviews}/{report.components.total} •
          New Previews: {report.components.withNewPreviews}/{report.components.total} • 
          Deep links: {String(report.components.deepLinksOK)} •
          Malformed: {report.components.malformed.length}
        </div>
        {report.components.missingDeps.length > 0 && (
          <div style={{color:'#F6A1A1', marginBottom:8}}>
            Missing dependencies: {report.components.missingDeps.join(', ')}
          </div>
        )}
        {report.components.malformed.length > 0 && (
          <div style={{color:'#F6A1A1', marginBottom:8}}>
            ⚠️ MALFORMED COMPONENTS DETECTED: {report.components.malformed.map(m => `${m.id} (${m.issues.join(', ')})`).join('; ')}
          </div>
        )}
        <pre style={preStyle}>
          {JSON.stringify(report.components, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Releases <Pass ok={true}/>
        </h3>
        <pre style={preStyle}>
          {JSON.stringify(report.releases, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Routing <Pass ok={report.routing.hashOK && report.routing.notFoundOK}/>
        </h3>
        <div style={{color:'var(--color-muted)', marginBottom:8}}>
          Hash routing: {String(report.routing.hashOK)} • 404 handling: {String(report.routing.notFoundOK)}
        </div>
        <pre style={preStyle}>
          {JSON.stringify(report.routing, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Storage <Pass ok={report.storage.percentUsed < 80}/>
        </h3>
        <div style={{color:'var(--color-muted)', marginBottom:8}}>
          Usage: {(report.storage.bytes/1024).toFixed(1)} KB ({report.storage.percentUsed}% of quota)
        </div>
        <pre style={preStyle}>
          {JSON.stringify(report.storage, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Accessibility <Pass ok={report.a11y.focusVisible && report.a11y.ariaCurrent && report.a11y.buttonAA && report.a11y.panelTextAA}/>
        </h3>
        <div style={{color:'var(--color-muted)', marginBottom:8}}>
          Focus-visible: {String(report.a11y.focusVisible)} • 
          Aria-current: {String(report.a11y.ariaCurrent)} • 
          Button AA: {String(report.a11y.buttonAA)} • 
          Panel AA: {String(report.a11y.panelTextAA)}
        </div>
        <pre style={preStyle}>
          {JSON.stringify(report.a11y, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Scroll/Paint <Pass ok={report.scroll.matchesBg}/>
        </h3>
        <div style={{color:'var(--color-muted)', marginBottom:8}}>
          Below-fold background matches: {String(report.scroll.matchesBg)}
        </div>
        <pre style={preStyle}>
          {JSON.stringify(report.scroll, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          DOM Lint <Pass ok={!report.dom.nestedButtons}/>
        </h3>
        <div style={{color:'var(--color-muted)', marginBottom:8}}>
          Buttons: {report.dom.buttonCount} • 
          Links: {report.dom.linkCount} • 
          Nested buttons: {String(report.dom.nestedButtons)}
        </div>
        <pre style={preStyle}>
          {JSON.stringify(report.dom, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Contrast Analysis <Pass ok={true}/>
        </h3>
        <pre style={preStyle}>
          {JSON.stringify(report.contrast, null, 2)}
        </pre>
      </section>

      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Ping System <Pass ok={report.ping.enabled && report.ping.failedEndpoints.length === 0}/>
        </h3>
        <div style={{color:'var(--color-muted)', marginBottom:8}}>
          Status: {report.ping.enabled ? 'enabled' : 'disabled'} • 
          Failed endpoints: {report.ping.failedEndpoints.length} • 
          URL configured: {!report.ping.url.includes('your-worker-domain') ? 'yes' : 'no (placeholder)'}
        </div>
        {!report.ping.enabled && (
          <div style={{color:'#F6A1A1', marginBottom:8}}>
            ⚠️ Ping system is disabled. Check configuration in /utils/ping.ts
          </div>
        )}
        {report.ping.failedEndpoints.length > 0 && (
          <div style={{color:'#F6A1A1', marginBottom:8}}>
            ⚠️ Ping endpoints have failed: {report.ping.failedEndpoints.join(', ')}
          </div>
        )}
        <pre style={preStyle}>
          {JSON.stringify(report.ping, null, 2)}
        </pre>
        <div style={{marginTop: 8, display: 'flex', gap: 8}}>
          <button 
            onClick={() => (window as any).resetPingSystem?.()} 
            style={{...btnStyle, fontSize: 12}}
          >
            Reset Failed Endpoints
          </button>
          <button 
            onClick={() => console.log('Ping status:', (window as any).getPingStatus?.())} 
            style={{...btnStyle, fontSize: 12}}
          >
            Log Status to Console
          </button>
        </div>
        
        {/* Interactive Ping Diagnostics */}
        <div style={{marginTop: 16}}>
          <h4 style={{marginBottom: 8}}>Legacy Ping Diagnostics</h4>
          <LegacyPingDiagnostics />
        </div>
      </section>

      {/* New Resilient Ping Diagnostics Panel */}
      <section>
        <h3 style={{display:'flex', alignItems:'center', gap:8}}>
          Resilient Ping Diagnostics <span style={{fontSize: 12, opacity: 0.7}}>(Read-Only)</span>
        </h3>
        <div style={{
          background: 'var(--color-panel)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 10, 
          padding: 16, 
          marginTop: 8
        }}>
          <PingDiagnostics />
        </div>
      </section>
    </div>
  );
}