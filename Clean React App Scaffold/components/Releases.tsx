import * as React from 'react';
import { captureSnapshot, loadReleases, saveReleases, diffReleases, changelogMD, type Release } from '../utils/releases';

function download(text:string, name:string, type='text/plain'){
  const blob = new Blob([text], { type });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
}

function openFile(accept: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const inp = Object.assign(document.createElement('input'), { type: 'file', accept });
    inp.onchange = async () => {
      try { const f = inp.files?.[0]; if (!f) return reject('No file'); resolve(await f.text()); }
      catch (e) { reject(String(e)); }
    };
    inp.click();
  });
}

function versionBumps(latest: string){
  const [maj, min, patch] = latest.split('.').map(n=>parseInt(n||'0',10));
  return {
    patch: `${maj}.${min}.${(patch||0)+1}`,
    minor: `${maj}.${(min||0)+1}.0`,
    major: `${(maj||0)+1}.0.0`
  };
}

export default function Releases(){
  const [releases, setReleases] = React.useState<Release[]>(loadReleases());
  const latest = releases[releases.length-1]?.id || '0.0.0';
  const bumps = versionBumps(latest);
  const [version, setVersion] = React.useState(bumps.patch);
  const [notes, setNotes] = React.useState('');
  const [selected, setSelected] = React.useState<number>(releases.length-1);

  const hasReleases = releases.length > 0;

  const create = ()=>{
    const snap = captureSnapshot(version, notes);
    const next = [...releases, snap];
    saveReleases(next); setReleases(next); setSelected(next.length-1); setNotes('');
  };

  const clearHistory = () => {
    if (!confirm('Clear all local releases? This only affects your browser.')) return;
    saveReleases([]);            // persist empty
    setReleases([]);             // update UI
    setSelected(0);
  };

  const exportJSON = () => {
    if (!hasReleases) { alert('Create at least one release before exporting history.'); return; }
    download(JSON.stringify(releases, null, 2), 'releases.json', 'application/json');
  };

  const exportMD = () => {
    if (!hasReleases) { alert('No releases yet — create one, then export a changelog.'); return; }
    const selRel = releases[selected] ?? releases[releases.length - 1];
    const prevRel = releases[releases.indexOf(selRel) - 1];
    const df = diffReleases(prevRel, selRel);
    const md = changelogMD(prevRel, selRel, df);
    download(md, `CHANGELOG-${selRel.id}.md`, 'text/markdown');
  };

  const importJSON = async () => {
    try {
      const text = await openFile('application/json');
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('Invalid releases file: expected an array');
      saveReleases(parsed); setReleases(parsed); setSelected(Math.max(0, parsed.length - 1));
    } catch (e:any) {
      alert(e?.message || String(e));
    }
  };

  const sel = releases[selected];
  const prev = selected>0 ? releases[selected-1] : undefined;
  const diff = sel ? diffReleases(prev, sel) : undefined;

  return (
    <div style={{ display:'grid', gap:12 }}>
      <div style={{ display:'grid', gap:8, border:'1px solid var(--color-border)', borderRadius:12, padding:12, background:'var(--color-panel)' }}>
        <strong>Create release</strong>
        <div style={{ display:'grid', gridTemplateColumns:'160px 1fr', alignItems:'center', gap:8 }}>
          <label>Version</label>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input value={version} onChange={e=>setVersion(e.target.value)} placeholder="0.1.1" style={{ padding:'8px 10px', border:'1px solid var(--color-border)', borderRadius:8, background:'var(--color-bg)', color:'var(--color-text)' }} />
            <button onClick={()=>setVersion(bumps.patch)} style={btn}>Patch {bumps.patch}</button>
            <button onClick={()=>setVersion(bumps.minor)} style={btn}>Minor {bumps.minor}</button>
            <button onClick={()=>setVersion(bumps.major)} style={btn}>Major {bumps.major}</button>
          </div>
          <label>Notes</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Highlights, breaking changes…"
            style={{ padding:'8px 10px', border:'1px solid var(--color-border)', borderRadius:8, background:'var(--color-bg)', color:'var(--color-text)', resize:'vertical' }} />
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={create} style={btnPrimary}>Create release</button>
          <button onClick={exportMD} style={btn} disabled={!hasReleases} title={!hasReleases ? 'Create a release first' : ''}>Export changelog (MD)</button>
          <button onClick={exportJSON} style={btn} disabled={!hasReleases} title={!hasReleases ? 'Create a release first' : ''}>Export releases (JSON)</button>
          <button onClick={importJSON} style={btn}>Import releases (JSON)</button>
          <button onClick={clearHistory} style={{ ...btn, borderColor:'#ef4444', color:'#ef4444' }} title="Clear local release history">Clear history (local)</button>
        </div>
      </div>

      <div style={{ display:'grid', gap:8 }}>
        <strong>History</strong>
        {!hasReleases && (
          <div style={{ color:'var(--color-muted)' }}>
            No releases yet — create one or use <strong>Import releases (JSON)</strong> to restore a saved history.
          </div>
        )}
        {!releases.length && <div style={{ color:'var(--color-muted)' }}>No releases yet.</div>}
        {releases.length>0 && (
          <div style={{ display:'grid', gap:8 }}>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {releases.map((r,i)=> (
                <button key={r.id} onClick={()=>setSelected(i)}
                  style={{ padding:'6px 10px', borderRadius:8, border:'1px solid var(--color-border)', background: i===selected ? 'rgba(59,130,246,.18)' : 'transparent', color:'var(--color-text)' }}>
                  {r.id} <span style={{ opacity:.7, marginLeft:6 }}>{new Date(r.date).toLocaleDateString()}</span>
                </button>
              ))}
            </div>

            {sel && (
              <div style={{ display:'grid', gap:12, border:'1px solid var(--color-border)', borderRadius:12, padding:12 }}>
                <div style={{ color:'var(--color-muted)' }}>
                  <div><strong>Selected:</strong> {sel.id} • {new Date(sel.date).toLocaleString()}</div>
                  {sel.notes && <div style={{ whiteSpace:'pre-wrap' }}>{sel.notes}</div>}
                </div>

                {/* Tokens diff */}
                <div>
                  <strong>Token changes</strong>
                  {!diff || !diff.tokensChanged.length ? (
                    <div style={{ color:'var(--color-muted)' }}>None</div>
                  ) : (
                    <ul>
                      {diff.tokensChanged.map(t=> (
                        <li key={t.key}><code>{t.key}</code>: <code>{t.from||'—'}</code> → <code>{t.to||'—'}</code></li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Component changes */}
                <div>
                  <strong>Component changes</strong>
                  {diff && (diff.components.added.length+diff.components.removed.length+diff.components.changed.length)>0 ? (
                    <div style={{ display:'grid', gap:8 }}>
                      {diff.components.added.length>0 && (
                        <div>
                          <em>Added</em>
                          <ul>{diff.components.added.map(c=> (<li key={c.id}>{c.level}: <strong>{c.name}</strong> (<code>{c.id}</code>) v{c.version}</li>))}</ul>
                        </div>
                      )}
                      {diff.components.removed.length>0 && (
                        <div>
                          <em>Removed</em>
                          <ul>{diff.components.removed.map(c=> (<li key={c.id}>{c.level}: <strong>{c.name}</strong> (<code>{c.id}</code>)</li>))}</ul>
                        </div>
                      )}
                      {diff.components.changed.length>0 && (
                        <div>
                          <em>Changed</em>
                          <ul>{diff.components.changed.map(c=> (<li key={c.id}><strong>{c.after.name}</strong> (<code>{c.id}</code>): {c.fields.join(', ')}</li>))}</ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color:'var(--color-muted)' }}>None</div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = { padding:'8px 12px', borderRadius:8, border:'1px solid var(--color-border)', background:'transparent', color:'var(--color-text)' };
const btnPrimary: React.CSSProperties = { ...btn, background:'var(--color-accent)', color:'#fff' };