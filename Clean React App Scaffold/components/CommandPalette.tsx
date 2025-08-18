import React from 'react';
import { rank } from '../utils/fuzzy';

export type Cmd = { id:string; label:string; hint?:string; run:()=>void; group?:string; };

export function useCommands(base: Partial<{
  onRescanTokens: ()=>void;
  onCopyCSS: ()=>void;
  onCopyJSON: ()=>void;
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
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[9999] flex items-start justify-center p-6"
         style={{background:'rgba(0,0,0,.35)'}} onClick={()=>setOpen(false)}>
      <div className="w-full max-w-xl rounded-2xl border" onClick={(e)=>e.stopPropagation()}
           style={{background:'var(--color-panel)', borderColor:'var(--color-border)'}}>
        <div className="p-3 border-b" style={{borderColor:'var(--color-border)'}}>
          <input 
            ref={inputRef} 
            value={q} 
            onChange={e=>setQ(e.target.value)} 
            placeholder="Type a command… (Esc to close)"
            className="w-full bg-transparent outline-none" 
            style={{color:'var(--color-text)'}} 
          />
        </div>
        <ul className="max-h-80 overflow-auto">
          {results.map((c,idx)=> (
            <li key={c.id}>
              <button 
                onClick={()=>run(c)} 
                className="w-full text-left px-4 py-2 focus:outline-none"
                style={{
                  color:'var(--color-text)',
                  background: idx === selectedIndex ? 'var(--color-accent)' : 'transparent'
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="text-[14px]">{c.label}</div>
                {c.hint && <div className="text-[12px] opacity-60">{c.hint}</div>}
                {c.group && <div className="text-[11px] opacity-40">{c.group}</div>}
              </button>
            </li>
          ))}
          {!results.length && <li className="px-4 py-3 text-[13px]" style={{color:'var(--color-muted)'}}>No matches</li>}
        </ul>
        <div className="px-4 py-2 border-t text-[11px] opacity-60" style={{borderColor:'var(--color-border)', color:'var(--color-muted)'}}>
          {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'} to open • ↑↓ to navigate • Enter to select • Esc to close
        </div>
      </div>
    </div>
  );
}