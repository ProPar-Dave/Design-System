import React from 'react';
import { rank } from '../utils/fuzzy';

export type Cmd = { id:string; label:string; hint?:string; run:()=>void; group?:string; };

export function useCommands(base: Partial<{
  onRescanTokens: ()=>void;
  onCopyCSS: ()=>void;
  onCopyJSON: ()=>void;
  onMigrateTokens: ()=>void;
  onNewComponent: ()=>void;
  onImportJSON: ()=>void;
  onExportJSON: ()=>void;
  onToggleTheme: ()=>void;
  onClearLocal: ()=>void;
}> = {}) {
  const navigate = (path: string) => () => {
    window.location.hash = path;
  };

  const cmds: Cmd[] = [
    { id:'go:overview',   label:'Go: Overview',   group:'Navigate', run: navigate('#/') },
    { id:'go:guidelines', label:'Go: Guidelines', group:'Navigate', run: navigate('#/guidelines') },
    { id:'go:tokens',     label:'Go: Tokens',     group:'Navigate', run: navigate('#/tokens') },
    { id:'go:components', label:'Go: Components', group:'Navigate', run: navigate('#/components') },
    { id:'go:releases',   label:'Go: Releases',   group:'Navigate', run: navigate('#/releases') },
    { id:'go:diagnostics',label:'Go: Diagnostics',group:'Navigate', run: navigate('#/diagnostics') },

    base.onRescanTokens && { id:'tokens:rescan', label:'Tokens: Re‑scan', group:'Tokens', run: base.onRescanTokens },
    base.onCopyCSS     && { id:'tokens:copycss', label:'Tokens: Copy as CSS', group:'Tokens', run: base.onCopyCSS },
    base.onCopyJSON    && { id:'tokens:copyjson',label:'Tokens: Copy as JSON', group:'Tokens', run: base.onCopyJSON },
    base.onMigrateTokens && { id:'tokens:migrate', label:'Tokens: Migrate Legacy', group:'Tokens', hint:'Migrate old token names to semantic variables', run: base.onMigrateTokens },

    base.onNewComponent&& { id:'comp:new',       label:'Components: New', group:'Components', run: base.onNewComponent },
    base.onImportJSON  && { id:'comp:import',    label:'Components: Import JSON', group:'Components', run: base.onImportJSON },
    base.onExportJSON  && { id:'comp:export',    label:'Components: Export JSON', group:'Components', run: base.onExportJSON },

    base.onToggleTheme && { id:'theme:toggle',   label:'Theme: Toggle Light/Dark', group:'Theme', run: base.onToggleTheme },
    base.onClearLocal  && { id:'app:clear',      label:'App: Clear local data (with confirm)', group:'Admin', run: base.onClearLocal },
  ].filter(Boolean) as Cmd[];
  return cmds;
}

export function CommandPalette({ commands }: { commands: Cmd[] }) {
  const [open,setOpen] = React.useState(false);
  const [q,setQ] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(()=>{
    const onKey = (e: KeyboardEvent)=>{
      const mod = navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') { 
        e.preventDefault(); 
        setOpen(o=>!o); 
      }
      if (open && e.key === 'Escape') { 
        setOpen(false); 
      }
      if (open && e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      }
      if (open && e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (open && e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          run(results[selectedIndex]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return ()=>window.removeEventListener('keydown', onKey);
  },[open]);

  React.useEffect(()=>{ 
    if (open) { 
      setTimeout(()=>inputRef.current?.focus(), 0); 
      setQ(''); 
      setSelectedIndex(0);
    }
  },[open]);

  const results = React.useMemo(()=> {
    const filtered = q ? rank(commands, c=>c.label, q) : commands;
    return filtered.slice(0,12);
  }, [commands,q]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [q]);

  const run = (c:Cmd)=>{ setOpen(false); setTimeout(c.run, 0); };

  if (!open) return null;
  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="command-palette-title"
      className="adsm-modal-overlay"
      onClick={()=>setOpen(false)}
    >
      <div 
        className="adsm-modal-content"
        onClick={(e)=>e.stopPropagation()}
        style={{
          background: 'var(--modal-content-bg)',
          border: '2px solid var(--modal-content-border)',
          maxWidth: '600px',
          padding: 0
        }}
      >
        <div className="adsm-modal-header" style={{borderBottom: '1px solid var(--modal-content-border)'}}>
          <h2 id="command-palette-title" className="adsm-modal-title" style={{margin: 0}}>
            Command Palette
          </h2>
        </div>
        <div style={{padding: '16px', borderBottom: '1px solid var(--modal-content-border)'}}>
          <input 
            ref={inputRef} 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            placeholder="Type a command… (Esc to close)"
            className="adsm-modal-input"
            style={{
              background: 'var(--input-bg)',
              color: 'var(--modal-body-text)',
              border: '2px solid var(--input-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '14px',
              width: '100%',
              boxSizing: 'border-box'
            }}
            aria-label="Search commands"
          />
        </div>
        <div className="adsm-modal-body" style={{padding: 0, maxHeight: '320px', overflow: 'auto'}}>
          <ul role="listbox" aria-label="Command options">
            {results.map((c,idx)=> (
              <li key={c.id} role="option" aria-selected={idx === selectedIndex}>
                <button 
                  onClick={()=>run(c)} 
                  className="w-full text-left focus:outline-none"
                  style={{
                    color: 'var(--modal-body-text)',
                    background: idx === selectedIndex ? 'var(--color-accent)' : 'transparent',
                    padding: '12px 20px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '44px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px'
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onFocus={() => setSelectedIndex(idx)}
                  aria-describedby={c.hint ? `hint-${c.id}` : undefined}
                >
                  <div style={{fontSize: '14px', fontWeight: '500'}}>{c.label}</div>
                  {c.hint && (
                    <div 
                      id={`hint-${c.id}`}
                      style={{
                        fontSize: '12px', 
                        color: 'var(--modal-description-text)',
                        lineHeight: '1.4'
                      }}
                    >
                      {c.hint}
                    </div>
                  )}
                  {c.group && (
                    <div style={{
                      fontSize: '11px', 
                      color: 'var(--modal-description-text)',
                      opacity: 0.8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {c.group}
                    </div>
                  )}
                </button>
              </li>
            ))}
            {!results.length && (
              <li style={{
                padding: '20px',
                textAlign: 'center',
                color: 'var(--modal-description-text)',
                fontSize: '14px'
              }}>
                No commands match your search
              </li>
            )}
          </ul>
        </div>
        <div className="adsm-modal-footer" style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--modal-content-border)',
          fontSize: '12px',
          color: 'var(--modal-description-text)',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center'}}>
            <span><kbd style={{background: 'var(--color-muted)', padding: '2px 6px', borderRadius: '4px'}}>
              {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
            </kbd> to open</span>
            <span><kbd style={{background: 'var(--color-muted)', padding: '2px 6px', borderRadius: '4px'}}>↑↓</kbd> to navigate</span>
            <span><kbd style={{background: 'var(--color-muted)', padding: '2px 6px', borderRadius: '4px'}}>Enter</kbd> to select</span>
            <span><kbd style={{background: 'var(--color-muted)', padding: '2px 6px', borderRadius: '4px'}}>Esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}