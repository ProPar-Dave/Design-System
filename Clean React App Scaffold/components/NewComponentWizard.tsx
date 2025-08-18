import * as React from 'react';
import type { ComponentMeta, Level } from '../utils/catalog';
import { addComponent } from '../utils/catalog';

export function NewComponentWizard({
  open, onClose, existingIds
}:{ open: boolean; onClose: ()=>void; existingIds: string[]; }){
  const [form, setForm] = React.useState<ComponentMeta>({
    id: '', name: '', level: 'atom', version: '0.1.0', status: 'draft',
    tags: [], description: '', deps: [], exampleProps: { label: 'Example' }
  });
  const [err, setErr] = React.useState('');

  const onChange = (k: keyof ComponentMeta, v: any)=> setForm(f=>({ ...f, [k]: v }));
  const onCSV = (v: string)=> v.split(',').map(s=>s.trim()).filter(Boolean);

  const submit = ()=>{
    try {
      if (!form.id.match(/^[a-z][a-z0-9-]*$/)) throw new Error('Id must be kebab-case (a-z, 0-9, -)');
      if (existingIds.includes(form.id)) throw new Error('Id already exists');
      if (!form.name) throw new Error('Name is required');
      addComponent({ ...form, tags: form.tags||[], deps: form.deps||[] });
      onClose();
    } catch(e:any){ setErr(e.message || String(e)); }
  };

  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', zIndex:5000 }}>
      <div onClick={e=>e.stopPropagation()} style={{
        position:'absolute', right:16, top:16, bottom:16, width:'min(560px,96vw)',
        background:'var(--color-panel)', border:'1px solid var(--color-border)',
        borderRadius:12, padding:16, overflow:'auto'
      }}>
        <h2 style={{marginTop:0}}>New Component</h2>
        {err && <div style={{ color:'#ef4444', marginBottom:8 }}>{err}</div>}
        <label style={row}><span>Id</span><input value={form.id} onChange={e=>onChange('id', e.target.value)} placeholder="search-bar" style={input}/></label>
        <label style={row}><span>Name</span><input value={form.name} onChange={e=>onChange('name', e.target.value)} placeholder="Search Bar" style={input}/></label>
        <label style={row}><span>Level</span>
          <select value={form.level} onChange={e=>onChange('level', e.target.value as Level)} style={input}>
            <option value="atom">Atom</option>
            <option value="molecule">Molecule</option>
            <option value="organism">Organism</option>
          </select>
        </label>
        <label style={row}><span>Version</span><input value={form.version} onChange={e=>onChange('version', e.target.value)} placeholder="0.1.0" style={input}/></label>
        <label style={row}><span>Status</span>
          <select value={form.status} onChange={e=>onChange('status', e.target.value as any)} style={input}>
            <option>draft</option><option>ready</option><option>deprecated</option>
          </select>
        </label>
        <label style={row}><span>Tags</span><input onChange={e=>onChange('tags', onCSV(e.target.value))} placeholder="search, form" style={input}/></label>
        <label style={row}><span>Depends on</span><input onChange={e=>onChange('deps', onCSV(e.target.value))} placeholder="button, input" style={input}/></label>
        <label style={row}><span>Description</span><textarea value={form.description} onChange={e=>onChange('description', e.target.value)} rows={3} style={{...input, resize:'vertical'}}/></label>
        <label style={row}><span>Example props (JSON)</span><textarea defaultValue={JSON.stringify(form.exampleProps, null, 2)} onBlur={e=>{ try{ onChange('exampleProps', JSON.parse(e.target.value||'{}')); }catch{ setErr('Invalid JSON in example props'); } }} rows={4} style={{...input, fontFamily:'ui-monospace, monospace'}}/></label>

        <div style={{ display:'flex', gap:8, marginTop:8 }}>
          <button onClick={submit} style={btnPrimary}>Create</button>
          <button onClick={onClose} style={btnSecondary}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const row: React.CSSProperties = { display:'grid', gridTemplateColumns:'140px 1fr', alignItems:'center', gap:8, margin:'8px 0' };
const input: React.CSSProperties = { padding:'8px 10px', border:'1px solid var(--color-border)', borderRadius:8, background:'var(--color-bg)', color:'var(--color-text)' };
const btnPrimary: React.CSSProperties = { padding:'8px 12px', borderRadius:8, border:'1px solid var(--color-border)', background:'var(--color-accent)', color:'#fff' };
const btnSecondary: React.CSSProperties = { padding:'8px 12px', borderRadius:8, border:'1px solid var(--color-border)', background:'transparent', color:'var(--color-text)' };