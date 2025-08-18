// utils/releases.ts
import { THEMES, getTheme } from './theme';
import { mergeCatalog } from './catalog';
import type { ComponentMeta } from './catalog';
import { loadUserComponents } from './catalog';
import { componentsData } from '../data/components';

export type Release = {
  id: string;           // e.g. "0.1.0"
  date: string;         // ISO
  notes?: string;
  tokens: Record<string,string>;
  components: ComponentMeta[];
};

const KEY = 'adsm:releases:v1';

export function loadReleases(): Release[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
export function saveReleases(list: Release[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function getCurrentTokens(): Record<string,string> {
  const source = document.getElementById('adsm-root') ?? document.documentElement;
  const cs = getComputedStyle(source);
  const out: Record<string,string> = {};
  // Get all tokens from both themes
  const allKeys = [...new Set([...Object.keys(THEMES.dark), ...Object.keys(THEMES.light)])];
  for (const k of allKeys) out[k] = cs.getPropertyValue(k).trim();
  return out;
}

export function captureSnapshot(version: string, notes?: string): Release {
  const tokens = getCurrentTokens();
  const components = mergeCatalog(componentsData as any, loadUserComponents());
  return { id: version, date: new Date().toISOString(), notes, tokens, components };
}

// ------ Diffing ------
export type Diff = {
  tokensChanged: Array<{ key: string; from: string; to: string }>;
  components: {
    added: ComponentMeta[];
    removed: ComponentMeta[];
    changed: Array<{ id: string; before: ComponentMeta; after: ComponentMeta; fields: string[] }>;
  }
}

function cmp(a:any,b:any){ return JSON.stringify(a)===JSON.stringify(b); }

export function diffReleases(prev: Release|undefined, curr: Release): Diff {
  const tokensChanged: Diff['tokensChanged'] = [];
  if (prev){
    for (const k of Object.keys(curr.tokens)){
      const a = (prev.tokens||{})[k]||'';
      const b = curr.tokens[k]||'';
      if (a!==b) tokensChanged.push({ key: k, from: a, to: b });
    }
  }
  const byIdPrev = new Map((prev?.components||[]).map(c=>[c.id,c] as const));
  const byIdCurr = new Map((curr.components||[]).map(c=>[c.id,c] as const));

  const added: ComponentMeta[] = [];
  const removed: ComponentMeta[] = [];
  const changed: Diff['components']['changed'] = [];

  for (const [id,c] of byIdCurr){ if (!byIdPrev.has(id)) added.push(c); }
  for (const [id,c] of byIdPrev){ if (!byIdCurr.has(id)) removed.push(c); }
  for (const [id,after] of byIdCurr){
    const before = byIdPrev.get(id);
    if (!before) continue;
    const fields: (keyof ComponentMeta)[] = ['name','level','version','status','tags','description','deps','exampleProps'];
    const changedFields: string[] = [];
    for (const f of fields){ if (!cmp((before as any)[f], (after as any)[f])) changedFields.push(String(f)); }
    if (changedFields.length) changed.push({ id, before: before!, after, fields: changedFields });
  }

  return { tokensChanged, components: { added, removed, changed } };
}

// ------ Changelog ------
export function changelogMD(prev: Release|undefined, curr: Release, diff: Diff): string {
  const lines: string[] = [];
  lines.push(`# Release ${curr.id}`);
  lines.push('');
  lines.push(`Date: ${new Date(curr.date).toLocaleString()}`);
  if (curr.notes) { lines.push(''); lines.push(curr.notes); }
  lines.push('');

  // Tokens
  lines.push('## Tokens');
  if (!prev) {
    lines.push('- Initial snapshot of tokens.');
  } else if (!diff.tokensChanged.length) {
    lines.push('- No token changes.');
  } else {
    for (const t of diff.tokensChanged){ lines.push(`- \`${t.key}\` changed: \`${t.from}\` → \`${t.to}\``); }
  }

  // Components
  lines.push('');
  lines.push('## Components');
  if (!prev) {
    lines.push(`- Initial catalog: ${curr.components.length} components.`);
  } else {
    if (diff.components.added.length){
      lines.push('### Added');
      for (const c of diff.components.added){ lines.push(`- ${c.level}: **${c.name}** (\`${c.id}\`) v${c.version}`); }
    }
    if (diff.components.removed.length){
      lines.push('### Removed');
      for (const c of diff.components.removed){ lines.push(`- ${c.level}: **${c.name}** (\`${c.id}\`)`); }
    }
    if (diff.components.changed.length){
      lines.push('### Changed');
      for (const c of diff.components.changed){ lines.push(`- **${c.after.name}** (\`${c.id}\`): ${c.fields.join(', ')}`); }
    }
    if (!diff.components.added.length && !diff.components.removed.length && !diff.components.changed.length){
      lines.push('- No component changes.');
    }
  }

  return lines.join('\n');
}