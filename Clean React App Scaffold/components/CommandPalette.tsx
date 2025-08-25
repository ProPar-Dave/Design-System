import React from 'react';
import { rank } from '../utils/fuzzy';
import { navigate } from '../src/router/hashUtils';

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
  const createNavigator = (path: string) => () => {
    navigate(path as any);
  };

  const cmds: Cmd[] = [
    { id:'go:overview',   label:'Go: Overview',   group:'Navigate', run: createNavigator('#/') },
    { id:'go:guidelines', label:'Go: Guidelines', group:'Navigate', run: createNavigator('#/guidelines') },
    { id:'go:tokens',     label:'Go: Tokens',     group:'Navigate', run: createNavigator('#/tokens') },
    { id:'go:components', label:'Go: Components', group:'Navigate', run: createNavigator('#/components') },
    { id:'go:releases',   label:'Go: Releases',   group:'Navigate', run: createNavigator('#/releases') },
    { id:'go:diagnostics',label:'Go: Diagnostics',group:'Navigate', run: createNavigator('#/diagnostics') },

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
      >
        <div className="adsm-modal-header">
          <h2 id="command-palette-title" className="adsm-modal-title">
            Command Palette
          </h2>
        </div>
        
        <div className="cmdp-input-section">
          <input 
            ref={inputRef} 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            placeholder="Type a command… (Esc to close)"
            className="cmdp-input"
            aria-label="Search commands"
          />
        </div>
        
        <div className="cmdp-results">
          <ul role="listbox" aria-label="Command options" className="cmdp-list">
            {results.map((c,idx)=> (
              <li key={c.id} role="option" aria-selected={idx === selectedIndex}>
                <button 
                  onClick={()=>run(c)} 
                  className={`cmdp-item ${idx === selectedIndex ? 'cmdp-item-selected' : ''}`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onFocus={() => setSelectedIndex(idx)}
                  aria-describedby={c.hint ? `hint-${c.id}` : undefined}
                  aria-selected={idx === selectedIndex}
                >
                  <div className="cmdp-item-label">{c.label}</div>
                  {c.hint && (
                    <div 
                      id={`hint-${c.id}`}
                      className="cmdp-item-hint"
                    >
                      {c.hint}
                    </div>
                  )}
                  {c.group && (
                    <div className="cmdp-item-group">
                      {c.group}
                    </div>
                  )}
                </button>
              </li>
            ))}
            {!results.length && (
              <li className="cmdp-empty">
                No commands match your search
              </li>
            )}
          </ul>
        </div>
        
        <div className="cmdp-footer">
          <div className="cmdp-shortcuts">
            <span className="cmdp-shortcut">
              <kbd className="cmdp-kbd">
                {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
              </kbd> 
              to open
            </span>
            <span className="cmdp-shortcut">
              <kbd className="cmdp-kbd">↑↓</kbd> 
              to navigate
            </span>
            <span className="cmdp-shortcut">
              <kbd className="cmdp-kbd">Enter</kbd> 
              to select
            </span>
            <span className="cmdp-shortcut">
              <kbd className="cmdp-kbd">Esc</kbd> 
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}