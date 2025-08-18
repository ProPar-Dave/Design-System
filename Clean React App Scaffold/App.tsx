import React, { Suspense } from 'react';
import ComponentsCatalog from './components/ComponentsCatalog';
import Releases from './components/Releases';
import Diagnostics from './components/Diagnostics';
import NotFound from './components/NotFound';
import { setTheme, getTheme, ensureThemeTokens } from './boot';
import { migrateCatalogStorage } from './utils/catalog';
import { ThemeToggle } from './components/ThemeToggle';
import { TokenBadge } from './components/TokenBadge';
import { CommandPalette, useCommands } from './components/CommandPalette';
import { initPingSystem, ping, pingThemeOperation, pingTokenOperation } from './utils/ping';
import './styles/drawer.css';
import './styles/preview.css';

// Development detection - same logic as ping.ts to ensure consistency
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || 
         location.hostname === 'localhost' || 
         location.hostname === '127.0.0.1' ||
         location.port !== '' ||
         location.protocol === 'file:';
}

// Safe ping wrapper that prevents calls in development
function safePing(stage: any, payload?: any): Promise<void> {
  if (isDevelopment()) {
    return Promise.resolve(); // Silent return in development
  }
  return ping(stage, payload).catch(() => {}); // Ignore all ping failures
}

// Safe ping operation wrappers
function safePingThemeOperation(operation: string, theme?: string, error?: Error): void {
  if (isDevelopment()) return;
  pingThemeOperation(operation, theme, error);
}

function safePingTokenOperation(operation: string, tokenCount?: number, error?: Error): void {
  if (isDevelopment()) return;
  pingTokenOperation(operation, tokenCount, error);
}

function safeInitPingSystem(): void {
  if (isDevelopment()) return;
  try {
    initPingSystem();
  } catch (error) {
    // Ping system initialization failed - continue without it
    console.warn('Ping system initialization failed:', error);
  }
}

// Memoized Layout component for performance
const Layout = React.memo(({ children }:{ children: React.ReactNode }) => {
  const [currentPath, setCurrentPath] = React.useState(window.location.hash.slice(1) || '/');
  
  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const linkBase: React.CSSProperties = { 
    padding:'6px 8px', 
    borderRadius:6, 
    textDecoration:'none', 
    color:'var(--color-text)', 
    display:'block' 
  };
  const active: React.CSSProperties = { 
    background:'rgba(59,130,246,.15)', 
    border:'1px solid rgba(59,130,246,.35)' 
  };
  
  return (
    <div style={{display:'grid',gridTemplateColumns:'280px 1fr',height:'100vh'}}>
      <aside style={{background:'var(--color-panel)',borderRight:'1px solid var(--color-border)',padding:'16px'}}>
        <h2 style={{margin:'0 0 12px'}}>Atomic DS</h2>
        <nav style={{display:'grid',gap:8}}>
          <a href="#/" style={{...linkBase, ...(currentPath === '/' ? active : {})}} aria-current={currentPath === '/' ? 'page' : undefined}>Overview</a>
          <a href="#/guidelines" style={{...linkBase, ...(currentPath === '/guidelines' ? active : {})}} aria-current={currentPath === '/guidelines' ? 'page' : undefined}>Guidelines</a>
          <a href="#/tokens" style={{...linkBase, ...(currentPath === '/tokens' ? active : {})}} aria-current={currentPath === '/tokens' ? 'page' : undefined}>Tokens</a>
          <a href="#/components" style={{...linkBase, ...(currentPath.startsWith('/components') ? active : {})}} aria-current={currentPath.startsWith('/components') ? 'page' : undefined}>Components</a>
          <a href="#/releases" style={{...linkBase, ...(currentPath === '/releases' ? active : {})}} aria-current={currentPath === '/releases' ? 'page' : undefined}>Releases</a>
          <a href="#/diagnostics" style={{...linkBase, ...(currentPath === '/diagnostics' ? active : {})}} aria-current={currentPath === '/diagnostics' ? 'page' : undefined}>Diagnostics</a>
        </nav>
      </aside>
      <main className="app-shell" style={{background:'var(--color-bg)',minHeight:'100vh'}}>
        <header className="app-topbar" style={{ position:'sticky', top:0, zIndex:'var(--z-topbar)', background:'var(--color-bg)', borderBottom:'1px solid var(--color-border)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:12, padding:'8px 12px' }}>
            <TokenBadge />
            <div style={{ color:'var(--color-muted)' }}>v1.2.0 • Live Preview System</div>
            <ThemeToggle />
          </div>
        </header>
        <div className="page content" style={{padding:'16px 16px 32px 16px',background:'var(--color-bg)',minHeight:'calc(100vh - 64px)'}}>{children}</div>
      </main>
    </div>
  );
});

function Overview(){ return <div>Welcome to Atomic DS Manager. Use the navigation to explore components, tokens, and guidelines.</div>; }

// Memoized Guidelines component
const GuidelinesViewer = React.memo(() => {
  const [html,setHtml] = React.useState('');
  const [err,setErr] = React.useState('');

  // tiny MD → HTML with memoization
  const mdToHtml = React.useCallback((md:string)=>{
    const esc = (s:string)=>s.replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]!));
    md = md.replace(/```([\s\S]*?)```/g,(_,c)=>`<pre><code>${esc(c)}</code></pre>`)
           .replace(/^###\s+(.+)$/gm,'<h3>$1</h3>')
           .replace(/^##\s+(.+)$/gm,'<h2>$1</h2>')
           .replace(/^#\s+(.+)$/gm,'<h1>$1</h1>')
           .replace(/^(?:- |\* )(.*)(?:\n(?!\n)(?:- |\* ).*)*/gm,b=>`<ul>`+b.split(/\n/).map(l=>l.replace(/^(?:- |\* )/,'')).map(t=>`<li>${esc(t)}</li>`).join('')+`</ul>`)
           .replace(/^(?!<h\d|<ul|<pre)([^\n][^\n]*)$/gm,'<p>$1</p>')
           .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
           .replace(/\*(.+?)\*/g,'<em>$1</em>')
           .replace(/`([^`]+)`/g,'<code>$1</code>');
    return md;
  },[]);

  React.useEffect(()=>{(async()=>{
    try{
      // 1) Try multiple relative paths; some hosts rewrite absolute "/..." to index.html
      const candidates = [
        'guidelines.md', './guidelines.md', '/guidelines.md',
        'guidelines/guidelines.md', '/guidelines/guidelines.md'
      ];
      let text = '';
      for (const p of candidates){
        try {
          const r = await fetch(p + (p.includes('?')?'':'?b='+Date.now()), { cache:'no-store' });
          if (r.ok){
            const t = await r.text();
            // Skip HTML fallbacks ("This site requires JavaScript" etc.)
            if (!/^\s*</.test(t) || /<article|<h1|<p>/.test(t)===false){ text = t; break; }
          }
        } catch {}
      }
      // 2) Inline fallback via <script type="text/plain" id="adsm-guidelines">
      if (!text){
        const s = document.getElementById('adsm-guidelines') as HTMLScriptElement | null;
        if (s) text = s.textContent || '';
      }
      // 3) Final starter content so the page is never empty
      if (!text){
        text = `# Atomic DS — Starter Guidelines\n\nReplace this file with your documentation.\n\n## Tokens\n- Colors, typography, spacing, radii\n\n## Components\n- Atoms → Molecules → Organisms\n\n## Versioning\n- Semantic versioning; document breaking changes`;
      }
      
      // Publish loaded text for diagnostics
      (window as any).__adsmGuidelinesText = text;
      try { localStorage.setItem('adsm:guidelines:lastText', text); } catch {}
      
      const looksHtml = /^\s*</.test(text.trim());
      setHtml( looksHtml ? text : mdToHtml(text) );
    }catch(e:any){ setErr(e?.message||String(e)); }
  })()},[mdToHtml]);

  if (err) return <div style={{color:'var(--color-muted)'}}>Failed to load guidelines: {err}</div>;
  if (!html) return <div style={{color:'var(--color-muted)'}}>Loading…</div>;
  return <article style={{lineHeight:1.6}} dangerouslySetInnerHTML={{__html: html}}/>;
});

// Custom hook for token values using boot.tsx system
function useTokenValues(){
  const get = React.useCallback(() => {
    const source = document.getElementById('adsm-root') ?? document.documentElement;
    const cs = getComputedStyle(source);
    const out: Record<string,string> = {};
    // Get core tokens that are guaranteed by boot.tsx
    const coreKeys = [
      '--color-bg', '--color-panel', '--color-text', '--color-accent', 
      '--color-muted', '--color-border', '--space-4', '--radius-md', 
      '--font-size-base', '--button-bg', '--button-fg', '--color-background', 
      '--color-foreground', '--color-primary', '--color-secondary'
    ];
    for (const k of coreKeys) out[k] = cs.getPropertyValue(k).trim();
    return out;
  }, []);

  const [vals, setVals] = React.useState<Record<string,string>>(get);
  
  React.useEffect(()=>{
    const h = ()=> setVals(get());
    window.addEventListener('adsm:tokens-ready', h);
    document.addEventListener('adsm:tokens:updated', h);
    document.addEventListener('adsm:theme:changed', h);
    return ()=> {
      window.removeEventListener('adsm:tokens-ready', h);
      document.removeEventListener('adsm:tokens:updated', h);
      document.removeEventListener('adsm:theme:changed', h);
    };
  },[get]);
  
  return [vals, setVals] as const;
}

// Debounced token update function
let tokenUpdateTimeout: number | null = null;

const TokenEditor = React.memo(() => {
  const [vals] = useTokenValues();
  const theme = getTheme();
  const root = (document.getElementById('adsm-root') as HTMLElement) || document.documentElement;

  const update = React.useCallback((k: string, v: string) => {
    // Clear previous timeout
    if (tokenUpdateTimeout) clearTimeout(tokenUpdateTimeout);
    
    // Apply immediately for instant feedback
    root.style.setProperty(k, v);
    
    // Debounce localStorage writes
    tokenUpdateTimeout = setTimeout(() => {
      try {
        const key = `adsm:overrides:${theme}`;
        const existing = JSON.parse(localStorage.getItem(key) || '{}');
        const updated = { ...existing, [k]: v };
        localStorage.setItem(key, JSON.stringify(updated));
        // Trigger tokens update event
        document.dispatchEvent(new CustomEvent('adsm:tokens:updated'));
        // Track token update
        safePingTokenOperation('update', Object.keys(updated).length);
      } catch (e) {
        console.warn('Failed to save theme overrides:', e);
        safePingTokenOperation('update', undefined, e as Error);
      }
    }, 100) as any;
  }, [root, theme]);

  const reset = React.useCallback(() => { 
    try {
      // Clear overrides
      localStorage.removeItem(`adsm:overrides:${theme}`);
      // Re-inject clean theme
      ensureThemeTokens(theme);
      // Clear any inline styles
      const coreKeys = [
        '--color-bg', '--color-panel', '--color-text', '--color-accent', 
        '--color-muted', '--color-border', '--space-4', '--radius-md', 
        '--font-size-base'
      ];
      coreKeys.forEach(key => {
        root.style.removeProperty(key);
      });
      // Trigger tokens update event
      document.dispatchEvent(new CustomEvent('adsm:tokens:updated'));
      // Track token reset
      safePingTokenOperation('reset', coreKeys.length);
    } catch (error) {
      safePingTokenOperation('reset', undefined, error as Error);
    }
  }, [theme, root]);

  const ColorField = React.memo(({name,label}:{name:string;label:string}) => (
    <label style={{display:'grid',gridTemplateColumns:'140px 1fr',alignItems:'center',gap:8}}>
      <span style={{color:'var(--color-muted)'}}>{label}</span>
      <input type="color" value={vals[name]||'#000000'} onChange={e=>update(name,e.target.value)}
        style={{height:36,border:'1px solid var(--color-border)',borderRadius:8,background:'var(--color-panel)'}}/>
    </label>
  ));

  const TextField = React.memo(({name,label,placeholder}:{name:string;label:string;placeholder?:string}) => (
    <label style={{display:'grid',gridTemplateColumns:'140px 1fr',alignItems:'center',gap:8}}>
      <span style={{color:'var(--color-muted)'}}>{label}</span>
      <input value={vals[name]||''} placeholder={placeholder||''} onChange={e=>update(name,e.target.value)}
        style={{padding:'8px 10px',border:'1px solid var(--color-border)',borderRadius:8,background:'var(--color-panel)',color:'var(--color-text)'}}/>
    </label>
  ));

  return (
    <section style={{display:'grid',gap:12,marginTop:12}}>
      <h3 style={{margin:'8px 0'}}>Edit tokens (local)</h3>
      <ColorField name="--color-bg" label="Background"/>
      <ColorField name="--color-panel" label="Panel"/>
      <ColorField name="--color-text" label="Text"/>
      <ColorField name="--color-accent" label="Accent"/>
      <ColorField name="--color-border" label="Border"/>
      <ColorField name="--color-muted" label="Muted"/>
      <TextField name="--space-4" label="Space‑4" placeholder="16px"/>
      <TextField name="--radius-md" label="Radius‑md" placeholder="10px"/>
      <TextField name="--font-size-base" label="Font size" placeholder="16px"/>

      <div style={{display:'flex',gap:8,marginTop:4}}>
        <button onClick={reset} style={{padding:'8px 12px',border:'1px solid var(--color-border)',borderRadius:8,background:'transparent',color:'var(--color-text)'}}>Reset overrides</button>
        <span style={{color:'var(--color-muted)'}}>Overrides are saved locally per theme.</span>
      </div>
    </section>
  );
});

// Memoized Tokens component for performance
const Tokens = React.memo(() => {
  const [vals, setVals] = useTokenValues();
  const [msg,setMsg] = React.useState('');
  
  const copy = React.useCallback(async (text:string) => { 
    try{ 
      await navigator.clipboard.writeText(text); 
      setMsg('Copied'); 
      setTimeout(()=>setMsg(''),1200);
    }catch{ 
      setMsg('Copy failed'); 
      setTimeout(()=>setMsg(''),1200);
    } 
  }, []);
  
  const download = React.useCallback((text:string, filename:string, type='text/plain') => {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href);
  }, []);

  // Generate exports from current computed values (includes overrides)
  const cssOut = React.useMemo(() => `:root{\n${Object.entries(vals).map(([k,v])=>`  ${k}: ${v};`).join('\n')}\n}`, [vals]);
  const jsonOut = React.useMemo(() => JSON.stringify(vals, null, 2), [vals]);

  const handleRescan = React.useCallback(() => {
    // Re-read token values from computed styles
    const get = () => {
      const source = document.getElementById('adsm-root') ?? document.documentElement;
      const cs = getComputedStyle(source);
      const out: Record<string,string> = {};
      const coreKeys = [
        '--color-bg', '--color-panel', '--color-text', '--color-accent', 
        '--color-muted', '--color-border', '--space-4', '--radius-md', 
        '--font-size-base', '--button-bg', '--button-fg', '--color-background', 
        '--color-foreground', '--color-primary', '--color-secondary'
      ];
      for (const k of coreKeys) out[k] = cs.getPropertyValue(k).trim();
      return out;
    };
    setVals(get());
    setMsg('Tokens rescanned');
    setTimeout(() => setMsg(''), 1200);
  }, [setVals]);

  const handleCopyCSS = React.useCallback(() => copy(cssOut), [copy, cssOut]);
  const handleCopyJSON = React.useCallback(() => copy(jsonOut), [copy, jsonOut]);

  // Listen for command palette events
  React.useEffect(()=>{
    const onRescan = () => handleRescan();
    const onCopyCSS= () => handleCopyCSS();
    const onCopyJS = () => handleCopyJSON();
    document.addEventListener('adsm:tokens:rescan', onRescan);
    document.addEventListener('adsm:tokens:copycss', onCopyCSS);
    document.addEventListener('adsm:tokens:copyjson', onCopyJS);
    return ()=>{
      document.removeEventListener('adsm:tokens:rescan', onRescan);
      document.removeEventListener('adsm:tokens:copycss', onCopyCSS);
      document.removeEventListener('adsm:tokens:copyjson', onCopyJS);
    };
  },[handleRescan, handleCopyCSS, handleCopyJSON]);

  // Group tokens for display
  const colors = React.useMemo(() => Object.fromEntries(Object.entries(vals).filter(([k])=>k.includes('color'))), [vals]);
  const spacing = React.useMemo(() => Object.fromEntries(Object.entries(vals).filter(([k])=>k.includes('space'))), [vals]);
  const radii = React.useMemo(() => Object.fromEntries(Object.entries(vals).filter(([k])=>k.includes('radius'))), [vals]);
  const typography = React.useMemo(() => Object.fromEntries(Object.entries(vals).filter(([k])=>k.includes('font')||k.includes('line-height'))), [vals]);

  return (
    <div className="content scroll-region" style={{
      display:'grid',
      gap:16,
      minHeight:'100%',
      background:'var(--color-bg)'
    }}>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <button onClick={()=>copy(cssOut)} style={{background:'var(--button-bg)',color:'var(--button-fg)',border:'1px solid var(--button-border)',borderRadius:6,padding:'8px 12px'}}>Copy as CSS</button>
        <button onClick={()=>copy(jsonOut)} style={{background:'var(--button-bg)',color:'var(--button-fg)',border:'1px solid var(--button-border)',borderRadius:6,padding:'8px 12px'}}>Copy as JSON</button>
        <button onClick={()=> download(cssOut, `tokens-${getTheme()}.css`, 'text/css')} style={{background:'var(--button-bg)',color:'var(--button-fg)',border:'1px solid var(--button-border)',borderRadius:6,padding:'8px 12px'}}>Download CSS</button>
        <button onClick={()=> download(jsonOut, `tokens-${getTheme()}.json`, 'application/json')} style={{background:'var(--button-bg)',color:'var(--button-fg)',border:'1px solid var(--button-border)',borderRadius:6,padding:'8px 12px'}}>Download JSON</button>
        {msg && <span style={{color:'var(--color-muted)'}} aria-live="polite">{msg}</span>}
      </div>

      <TokenEditor />

      {/* Colors */}
      <section>
        <h2 style={{margin:'0 0 8px'}}>Colors</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:12}}>
          {Object.entries(colors).map(([name,value])=> (
            <button key={name} onClick={()=>copy(`var(${name})`)} title={`Click to copy var(${name})`} className="token-card" style={{textAlign:'left',background:'var(--color-panel)',border:'1px solid var(--color-border)',borderRadius:10,padding:12,color:'var(--color-text)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{width:28,height:28,borderRadius:6,background:`var(${name})`,border:'1px solid rgba(255,255,255,.1)'}}></span>
                <div>
                  <div style={{fontWeight:600}}>{name}</div>
                  <div style={{fontSize:12,opacity:.8,color:'var(--color-muted)'}}>{value || '(unset)'}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Spacing */}
      <section>
        <h2 style={{margin:'16px 0 8px'}}>Spacing</h2>
        <div style={{display:'grid',gap:8}}>
          {Object.entries(spacing).map(([name,value])=> (
            <div key={name} style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{minWidth:110,color:'var(--color-text)'}}>{name}</div>
              <div style={{width:200,background:'var(--color-panel)',border:'1px solid var(--color-border)',borderRadius:6,height:10,position:'relative'}}>
                <div style={{position:'absolute',left:0,top:0,bottom:0,width:value,background:'var(--color-accent)',opacity:0.6}} />
              </div>
              <div style={{fontSize:12,opacity:.8,color:'var(--color-muted)'}}>{value}</div>
              <button onClick={()=>copy(`var(${name})`)} style={{marginLeft:'auto',background:'var(--color-accent)',color:'var(--color-bg)',border:'none',borderRadius:6,padding:'4px 8px'}}>Copy</button>
            </div>
          ))}
        </div>
      </section>

      {/* Radii */}
      <section>
        <h2 style={{margin:'16px 0 8px'}}>Radii</h2>
        <div style={{display:'grid',gap:8}}>
          {Object.entries(radii).map(([name,value])=> (
            <div key={name} style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{minWidth:110,color:'var(--color-text)'}}>{name}</div>
              <div style={{width:60,height:36,background:'var(--color-panel)',border:'1px solid var(--color-border)',borderRadius:value}} />
              <div style={{fontSize:12,opacity:.8,color:'var(--color-muted)'}}>{value}</div>
              <button onClick={()=>copy(`var(${name})`)} style={{marginLeft:'auto',background:'var(--color-accent)',color:'var(--color-bg)',border:'none',borderRadius:6,padding:'4px 8px'}}>Copy</button>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 style={{margin:'16px 0 8px'}}>Typography</h2>
        <div className="surface" style={{background:'var(--color-panel)',border:'1px solid var(--color-border)',borderRadius:10,padding:12}}>
          <div className="token-sample" style={{fontFamily:'var(--font-sans)',fontSize:'var(--font-size-base)',lineHeight:'var(--line-height-base)',background:'var(--color-panel)',color:'var(--color-text)'}}>The quick brown fox jumps over the lazy dog.</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:8}}>
            {Object.entries(typography).map(([name,value])=> (
              <button key={name} onClick={()=>copy(`var(${name})`)} title={`Copy var(${name})`} style={{textAlign:'left',background:'transparent',border:'1px solid var(--color-border)',borderRadius:8,padding:8,color:'var(--color-text)'}}>
                <div style={{fontWeight:600}}>{name}</div>
                <div style={{fontSize:12,opacity:.8,color:'var(--color-muted)'}}>{value}</div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
});

// Clean Router component with query parameter support
const Router = React.memo(() => {
  const [currentPath, setCurrentPath] = React.useState(window.location.hash.slice(1) || '/');
  
  React.useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  React.useEffect(() => {
    const map: Record<string, string> = {
      '/': 'Atomic DS Manager',
      '/guidelines': 'Atomic DS Manager • Guidelines',
      '/tokens': 'Atomic DS Manager • Tokens',
      '/components': 'Atomic DS Manager • Components',
      '/releases': 'Atomic DS Manager • Releases',
      '/diagnostics': 'Atomic DS Manager • Diagnostics'
    };
    
    const basePath = currentPath.split('?')[0];
    document.title = map[basePath] || (basePath.startsWith('/components') ? 'Atomic DS Manager • Components' : 'Atomic DS Manager');
  }, [currentPath]);

  const renderContent = React.useCallback(() => {
    // Parse base path and query parameters
    const [basePath, queryString] = currentPath.split('?', 2);
    
    // Clean routing - no aliases or redirects
    if (basePath === '/') {
      return <Overview />;
    } else if (basePath === '/guidelines') {
      return <GuidelinesViewer />;
    } else if (basePath === '/tokens') {
      return <Tokens />;
    } else if (basePath === '/components' || basePath.startsWith('/components/')) {
      // Support both old style (/components/id) and new style (/components?id=id)
      let selectedId: string | null = null;
      
      if (basePath.startsWith('/components/')) {
        // Old style: /components/button-v1
        selectedId = basePath.slice('/components/'.length);
      } else if (queryString) {
        // New style: /components?id=button-v1
        const params = new URLSearchParams(queryString);
        selectedId = params.get('id');
      }
      
      return <ComponentsCatalog selectedId={selectedId} />;
    } else if (basePath === '/releases') {
      return <Releases />;
    } else if (basePath === '/diagnostics') {
      return <Diagnostics />;
    } else {
      return <NotFound />;
    }
  }, [currentPath]);

  return renderContent();
});

export default function App(){
  // Initialize systems on app start
  React.useEffect(() => {
    let initStarted = false;
    
    const initializeApp = async () => {
      if (initStarted) return;
      initStarted = true;
      
      try {
        // Initialize ping system first (will be silent if disabled)
        safeInitPingSystem();
        
        // Track app initialization start (don't await to avoid blocking)
        safePing('start', { 
          job: 'app-bootstrap',
          timestamp: Date.now()
        });

        // Initialize theme system
        ensureThemeTokens();
        
        // Run catalog migration once
        try {
          migrateCatalogStorage();
        } catch (error) {
          console.warn('Catalog migration failed:', error);
          safePing('error', {
            job: 'catalog-migration',
            message: error instanceof Error ? error.message : String(error)
          });
        }

        // Track successful initialization (don't await to avoid blocking)
        safePing('done', { 
          job: 'app-bootstrap',
          timestamp: Date.now()
        });

        // Send notification about drawer enhancements
        setTimeout(() => {
          safePing('publish', {
            id: 'latest',
            event: 'publish',
            message: 'Live Preview System with interactive props editor, localStorage persistence, and error boundaries',
            url: window.location.origin,
            version: 'v1.2.0',
            features: [
              'New preview registry with Button, Input, Search Bar, Form Row renderers',
              'Interactive props editor with schema-driven controls',
              'Props persistence via localStorage per component',
              'Error boundaries for safe preview rendering',
              'Enhanced diagnostics with preview system metrics',
              'Demo props seeding for built-in components'
            ]
          });
        }, 1000);
      
        
      } catch (error) {
        console.error('App initialization failed:', error);
        safePing('error', {
          job: 'app-bootstrap',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    };

    initializeApp();
  }, []);

  // Command palette actions with memoization
  const actions = React.useMemo(()=>({
    onRescanTokens: async ()=> {
      safePing('start', { job: 'tokens-rescan' });
      document.dispatchEvent(new CustomEvent('adsm:tokens:rescan'));
    },
    onCopyCSS: async ()=> {
      safePing('start', { job: 'tokens-copy-css' });
      document.dispatchEvent(new CustomEvent('adsm:tokens:copycss'));
    },
    onCopyJSON: async ()=> {
      safePing('start', { job: 'tokens-copy-json' });
      document.dispatchEvent(new CustomEvent('adsm:tokens:copyjson'));
    },
    onNewComponent: async ()=> {
      safePing('start', { job: 'component-create' });
      document.dispatchEvent(new CustomEvent('adsm:components:new'));
    },
    onImportJSON: async ()=> {
      safePing('start', { job: 'component-import' });
      document.dispatchEvent(new CustomEvent('adsm:components:import'));
    },
    onExportJSON: async ()=> {
      safePing('start', { job: 'component-export' });
      document.dispatchEvent(new CustomEvent('adsm:components:export'));
    },
    onToggleTheme: async ()=> {
      try {
        const current = getTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        safePing('start', { job: 'theme-toggle', from: current, to: next });
        setTheme(next);
        safePingThemeOperation('toggle', next);
      } catch (error) {
        safePingThemeOperation('toggle', undefined, error as Error);
      }
    },
    onClearLocal: async ()=> { 
      if (confirm('Clear all local data? You can re‑import later.')) {
        try {
          safePing('start', { job: 'data-clear' });
          localStorage.clear();
          safePing('done', { job: 'data-clear' });
          location.reload();
        } catch (error) {
          safePing('error', { 
            job: 'data-clear', 
            message: error instanceof Error ? error.message : String(error)
          });
        }
      }
    },
  }),[]);
  
  const commands = useCommands(actions);

  return (
    <div id="adsm-root" className="app min-h-screen" style={{ background:'var(--color-bg)', color:'var(--color-text)', fontFamily:'var(--font-sans)', minHeight:'100vh' }}>
      <Suspense fallback={<div className="content" style={{padding:16,background:'var(--color-bg)'}}>Loading…</div>}>
        <Layout><Router /></Layout>
        <CommandPalette commands={commands} />
      </Suspense>
    </div>
  );
}