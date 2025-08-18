# Atomic DS — Technical Handoff (v1)

A concise but complete engineering handoff so another AI/teammate can continue building the **Atomic Design System** (ADS) you’ve started in **Figma Make**, with a hardened runtime and clear extension points.

---

## 0) Project Quick Facts

- **Primary goals**
  - Ship a bottom‑up, true Atomic Design System (atoms → molecules → organisms) that other apps can consume.
  - Keep the UI runtime robust: normalize data, defensive rendering, zero‑crash drawers.
  - Provide live component previews + editable props to validate design decisions quickly.
  - Maintain a dark theme with accessible contrast.
- **Stack surface (current)**
  - **Figma Make** project (Claude builds code inside Make).
  - **Figma Site** deployment: `https://daily-stem-67845579.figma.site/` (cache‑bust on publish).
  - **Local persistence**: `localStorage` (catalog snapshots, UI state, diagnostics).
  - **(Infra note)** Supabase Edge Function exists for build pings, but ADS work should be decoupled from it.
- **Nav/Routes** (observed)
  - `#/components`, `#/diagnostics`, 404 route present, hash routing OK.
- **State of Catalog** (latest diagnostics sample)
  - `components.total = 7` (atoms 5, molecules 1, organisms 1)
  - `withNotes = 1`, `withProps = 0` (pre‑playground)
  - `missingDeps = []`, `malformed = []` (after normalization pass)

---

## 1) Theming & Tokens (CSS variables)

Dark theme tokens in use (from diagnostics + runtime):

```css
:root {
  /* Base */
  --color-bg: #0B1020;          /* page background */
  --color-panel: #0F162E;       /* panels/drawers */
  --color-text: #E6ECFF;        /* primary text */
  --color-muted: #A0ABCF;       /* secondary text */
  --color-border: #202A44;      /* borders/dividers */

  /* Brand */
  --color-accent: #3B82F6;      /* primary accent */
  --color-primary: #3B82F6;     /* synonym */
  --color-secondary: #A0ABCF;

  /* Controls */
  --button-bg: #3B82F6;
  --button-fg: #E6ECFF;

  /* Spacing/shape/type */
  --space-4: 16px;
  --radius-md: 10px;
  --font-size-base: 16px;

  /* Inputs (drawer fix) */
  --adsm-input-bg: #0F162E;
  --adsm-input-fg: #E2E8F0;
  --adsm-input-border: #334155;
  --adsm-input-focus: #3B82F6;
}
```

**Mapping Figma Variables → CSS Vars**

- Keep Figma Variables as the single source of truth; export/sync them to the CSS custom properties above.
- Naming convention: `--color-*` for palette, `--adsm-*` for DS runtime internals.
- When introducing new component tokens, prefer semantic names (e.g., `--chip-bg`, `--tab-active-fg`) over raw brand colors.

**Contrast status (latest)**

- `buttonAA: false` (needs improvement), `panelTextAA: true`. Continue to target WCAG AA for text and interactive controls.

---

## 2) Architecture at a Glance

```
src/
├─ ui/
│  ├─ ComponentsGrid.tsx         # safe card grid
│  └─ ComponentsDrawer.tsx       # tabs: Preview / Props / Notes / JSON
├─ preview/
│  ├─ registry.tsx               # per‑component schema + defaults + renderers
│  ├─ PreviewPane.tsx            # renders live preview via registry
│  ├─ PropsEditor.tsx            # generic editor (text/number/boolean/select)
│  └─ ErrorBoundary.tsx          # sandbox around preview
├─ utils/
│  └─ catalog.ts                 # types + normalization + (optional) migration
├─ styles/
│  ├─ drawer.css                 # dark inputs, focus, layout
│  └─ preview.css                # minimal styles for preview/editor
└─ importer.ts                   # safeImport(fileText) → validated items
```

**Key runtime contracts**

- `DsComponent` (catalog item) — **normalized, crash‑safe**
- `registry` (preview) — component `schema`, `defaults`, `render`
- `PropsEditor` — schema‑driven editor; persists per‑component props in `localStorage`

---

## 3) Data Model & Normalization (canonical)

```ts
// utils/catalog.ts
export type Level = 'atom' | 'molecule' | 'organism';
export type Status = 'draft' | 'ready';
export type DemoSpec = { props?: Record<string, any> };

export interface DsComponent {
  id: string;
  name: string;
  description?: string;
  level: Level;
  version: string;
  status: Status;
  tags: string[];
  dependencies: string[];
  notes?: string;
  demo?: DemoSpec; // optional demo props for preview
}

const ensureArray = <T,>(v: unknown): T[] => Array.isArray(v) ? (v as T[]).filter(Boolean) : [];

export function normalizeComponent(raw: any): DsComponent | null {
  if (!raw || typeof raw !== 'object') return null;
  const id = String(raw.id ?? crypto.randomUUID());
  const name = String(raw.name ?? 'Untitled');
  const level: Level = raw.level === 'molecule' || raw.level === 'organism' ? raw.level : 'atom';
  const version = typeof raw.version === 'string' ? raw.version : (raw.version?.toString?.() || '0.1.0');
  const status: Status = raw.status === 'ready' ? 'ready' : 'draft';
  const description = typeof raw.description === 'string' ? raw.description : '';
  const tags = ensureArray<string>(raw.tags).map(String);
  const dependencies = ensureArray<string>(raw.dependencies).map(String);
  const notes = typeof raw.notes === 'string' ? raw.notes : undefined;
  const demo = typeof raw.demo === 'object' && raw.demo ? { props: raw.demo.props ?? {} } : undefined;
  return { id, name, description, level, version, status, tags, dependencies, notes, demo };
}

export function normalizeCatalog(list: any[]): DsComponent[] {
  return ensureArray<any>(list).map(normalizeComponent).filter(Boolean) as DsComponent[];
}

export function migrateCatalogStorage() {
  try {
    const KEYS = ['adsm:catalog:current', 'adsm:userComponents:v1'];
    for (const key of KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : parsed?.items || [];
      const normalized = normalizeCatalog(list);
      if (Array.isArray(parsed)) {
        localStorage.setItem(key, JSON.stringify(normalized));
      } else {
        localStorage.setItem(key, JSON.stringify({ ...parsed, items: normalized }));
      }
    }
  } catch (e) {
    console.warn('Catalog migration skipped:', e);
  }
}
```

**LocalStorage keys in use (observed)**

- `adsm:catalog:builtins`
- `adsm:catalog:current`
- `adsm:userComponents:v1`
- `adsm:guidelines:lastText`
- `adsm:lastRoute`
- `adsm:releases:v1`
- `adsm:theme`

---

## 4) Component Drawer: Preview + Props

**Registry pattern** (example entries)

```tsx
// preview/registry.tsx
export type PropKind = 'text' | 'number' | 'boolean' | 'select';
export type PropSpec = { kind: PropKind; label?: string; options?: {label:string; value:any}[]; min?:number; max?:number; step?:number };
export type RegistryEntry = { schema: Record<string, PropSpec>; defaults: Record<string, any>; render: (p:Record<string,any>)=>React.ReactNode };

export const registry: Record<string, RegistryEntry> = {
  btn: {
    schema: { label: { kind: 'text', label: 'Label' }, disabled: { kind: 'boolean', label: 'Disabled' } },
    defaults: { label: 'Primary', disabled: false },
    render: (p) => <button disabled={p.disabled} className="adsm-btn">{p.label}</button>,
  },
  'text-field': {
    schema: { placeholder: { kind: 'text' }, value: { kind: 'text' }, disabled: { kind: 'boolean' } },
    defaults: { placeholder: 'Type…', value: '', disabled: false },
    render: (p) => <input placeholder={p.placeholder} defaultValue={p.value} disabled={p.disabled} />,
  },
  // ... add molecules/organisms similarly
};
```

**Props editor** (persist per component)

```tsx
// preview/PropsEditor.tsx (essentials)
const keyFor = (id:string)=>`adsm:preview:props:${id}`;
export function useStoredProps(id?:string, initial?:Record<string,any>) {
  const [value, setValue] = React.useState<Record<string,any>>(initial||{});
  React.useEffect(()=>{ if(!id) return; try{ const raw = localStorage.getItem(keyFor(id)); if(raw) setValue(JSON.parse(raw)); }catch{} },[id]);
  React.useEffect(()=>{ if(!id) return; try{ localStorage.setItem(keyFor(id), JSON.stringify(value)); }catch{} },[id,value]);
  return [value, setValue] as const;
}
```

**Drawer input styling** (dark, accessible)

```css
/* styles/drawer.css (fragment) */
.adsm-input, .adsm-select {
  padding: 8px 10px; border-radius: 8px; border: 1px solid var(--adsm-input-border);
  background: var(--adsm-input-bg); color: var(--adsm-input-fg);
}
.adsm-input:focus, .adsm-select:focus {
  outline: none; border-color: var(--adsm-input-focus);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--adsm-input-focus) 30%, transparent);
}
/* Avoid external background-image on <select> */
.adsm-select { appearance: none; background-image: none; }
```

---

## 5) Importer Hardening (malformed JSON guard)

```ts
// importer.ts
import { normalizeCatalog, DsComponent } from './utils/catalog';

export function safeImport(fileText: string): DsComponent[] {
  const parsed = JSON.parse(fileText);
  if (!Array.isArray(parsed)) throw new Error('Invalid JSON: expected an array of components');
  return normalizeCatalog(parsed);
}
```

**Diagnostics hook**

```ts
const offenders = catalog
  .map((c:any,i:number)=>({ i, id:c?.id, tagsIsArray:Array.isArray(c?.tags), depsIsArray:Array.isArray(c?.dependencies) }))
  .filter(x=>!x.tagsIsArray || !x.depsIsArray);
// Render offenders on /diagnostics if non‑empty
```

---

## 6) Publishing & Cache Busting

- **Figma Site URL**: `https://daily-stem-67845579.figma.site/`
- **Cache bust**: append `?v=${Date.now()}#/components` on publish to bypass CDN caches for QA.
- **Regression checks** (fast):
  - Components grid renders; open a card updates hash route.
  - Drawer header visible; no overlap with page header.
  - Preview & Props render for known components; unknowns don’t crash.
  - Inputs readable (no white‑on‑white), focus ring visible.
  - Import invalid JSON → proper error; valid array → merged and persisted.

---

## 7) How to Add a New Component (checklist)

1. **Catalog**: Add a new item (id, name, level, version, status, tags, dependencies, notes, optional `demo`).
2. **Normalization**: No changes needed if fields follow `DsComponent`.
3. **Preview**: Add a `registry` entry with `schema`, `defaults`, and a small `render` shim.
4. **Props**: The editor will auto‑render inputs from your `schema`.
5. **Demo defaults**: Optionally add `demo.props` to the catalog for first‑time preview.
6. **A11y**: Verify contrast, focus states, and keyboard navigation.
7. **Docs**: Add notes in the drawer and (optionally) update Guidelines.

---

## 8) Roadmap (proposed next steps)

- **Atoms**: Button (variants), Input/TextArea, Select, Checkbox/Radio, Chip, Badge, Icon, Avatar.
- **Molecules**: Field Row + validation states; Search Bar (debounce, clear); Tabs; Breadcrumbs.
- **Organisms**: Drawer, Modal, Toolbar, Pagination.
- **Theming**: introduce semantic tokens for interactive states (`--*‑hover`, `--*‑active`, `--*‑disabled`).
- **Docs**: “Guidelines” page expansion (usage, do/don’t, code snippets).
- **Packaging**: build a consumable bundle (ESM + CSS) and a copy step to a repo you control.

---

## 9) Final Pipeline (push artifacts to your repo)

**Goal**: after publish, push the built bundle to a repository you control (GitHub/GitLab). Implementation options:

**A. Direct GitHub Content API (simple)**

- Create a **fine‑grained PAT** with `contents:write` on the target repo.
- Have the build/export step produce `dist/` (ESM + CSS + tokens JSON).
- HTTP **PUT** to: `https://api.github.com/repos/<owner>/<repo>/contents/<path>` with base64 content + `message` + SHA (if updating). Store PAT as secret in your Figma Make environment.

**B. Supabase Edge Function bridge**

- Expose an authenticated endpoint that accepts `{ files:[{path,content_base64}] }` and performs the Git push via the GitHub API. Keep PAT server‑side only.

> Choose A if you’re comfortable putting the PAT in Make env (safer with fine‑grained, repo‑only). Choose B to keep tokens entirely server‑side.

Artifacts to publish:

- `dist/adsm.css` (compiled CSS tokens + component styles)
- `dist/index.js` (ESM entry), plus per‑component modules
- `dist/tokens.json` (design tokens snapshot)
- `catalog.json` (normalized)

---

## 10) Known Issues & Fix Log (current)

- **Fixed**: Drawer white‑on‑white inputs → added input vars + CSS; simplified `<select>` styling (no external background image).
- **Fixed**: `PropsEditor.tsx` malformed JS (escaped `\n` & quotes) → rebuilt clean component.
- **Fixed**: Drawer header clipping under page header → z‑index/offset corrected.
- **Open**: Button color contrast AA for text on brand blue; add hover/pressed tokens.

---

## 11) Acceptance / Regression Suite (quick)

- No uncaught exceptions opening any drawer.
- Unknown component IDs render a safe fallback (no preview) instead of crashing.
- Props changes persist across reloads.
- Import rejects non‑array JSON with a clear message.
- All focusable elements show visible focus (keyboard‑navigable).
- Hash router updates when opening a card; not‑found route still renders.

---

## 12) What a successor AI needs from you (fill‑ins)

1. **Repo destination**: Provider (GitHub/GitLab), `<owner>/<repo>`, target branch, path layout for `dist/`.
2. **Auth**: Do you prefer PAT in Make (Option A) or a server‑side Edge Function (Option B)? If A, provide a PAT with `contents:write` to that repo only.
3. **Component list & priorities**: Which atoms/molecules next? Any Figma components to mirror exactly?
4. **Design tokens**: Any additional Figma Variables to map (states, elevations, semantic slots)? Provide names/values if they exist.
5. **Accessibility target**: Baseline (AA) vs stricter? Any screen‑reader specifics to enforce?
6. **Distribution format**: ESM only, or also CJS/UMD? CSS as single file or CSS Modules?
7. **Licensing header**: Any legal headers required in published files?

If you paste the answers, the next assistant can wire the repo push and start shipping new components immediately.

---

## 13) Hand‑off TL;DR

- Normalized `DsComponent` model; importer and storage migration are in place.
- Drawer now has **Preview** + **Props** (persisted) with dark, accessible inputs.
- Theme tokens live as CSS variables; add semantic tokens for states next.
- Publishing uses Figma Site; add a final step to export `dist/` and push to your repo.
- Fill in the seven items above to let the next AI finalize CI/CD and keep building components.

