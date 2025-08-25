# Atomic DS — Starter Guidelines

Replace this file with your real documentation. This starter exists to prove rendering works.

## Tokens
- Colors, typography, spacing, radii

## Components
- Atoms → Molecules → Organisms

## Versioning
- Semantic versioning; document breaking changes
- 
🩺 “Surgical Patch Protocol” (paste this as your task preamble)

You are operating in patch mode. Do not rewrite files wholesale.
Return changes as unified diffs that can be applied with git apply --index (or the patch tool).

Rules

Only touch the files I list. Add new files only if explicitly requested.

Keep edits minimal. Prefer line-level changes over refactors.

Preserve imports, exports, and public types unless necessary for the fix.

Include enough context lines in each hunk so git apply can find the spot.

After diffs, print a short verification guide (what to run/click to prove it works).

If you must create a new file, include a diff that adds it.

Never collapse whitespace or reformat unrelated code.

Output format
Return one or more diff blocks. Each must start with:

*** Begin Patch
*** Update File: path/to/file.tsx
@@ <context lines> @@
<changes>
*** End Patch


For new files, use:

*** Begin Patch
*** Add File: path/to/newFile.ts
<file contents>
*** End Patch


If you remove a file:

*** Begin Patch
*** Delete File: path/to/oldFile.ts
*** End Patch


Success criteria (guardrails)

Build passes.

No console errors introduced.

Existing exported APIs unchanged unless specified.

Token edits are instant and persisted.

Drawer renders with tabs and preview; no layout overflow.

1) Patch contract

Mode: “Unified-diff only.” Never paste full files unless *** Add File.

Scope: Touch only files explicitly listed by the user. No silent edits elsewhere.

Granularity: Prefer line-level changes; preserve imports/exports and public types unless asked.

Context: Include enough unchanged lines in each hunk for git apply to succeed.

No drive-bys: Don’t reformat or reorder unrelated code/props/styles.

2) Stable public contracts (do not change without explicit approval)

Component Registry shape (IDs must remain stable):

type RegistryEntry = {
  id: string;            // e.g., "atom-button-primary"
  level: 'atom'|'molecule'|'organism';
  version: string;       // semver string
  status: 'ready'|'draft';
  tags?: string[];
  demo?: React.FC | null;
  notes?: string;
  propsSchema?: Record<string, any>; // optional, JSON-schema-ish
};


Routes & hash format: keep existing hash routes; do not rename segments.

Drawer contract: controlled by the central controller (no local open state).

Design tokens: all UI consumes CSS custom properties. No hardcoded colors or spacing outside tokens.

Import style: don’t switch named ↔ default imports unless a build error proves it’s wrong.

Env access: never use import.meta.env. Use getEnvVar('KEY', fallback) from supabaseClient.ts (or env.ts) only.

3) Token system invariants

Names: --color-*, --space-*, --radius-*, --button-*, --input-* (kebab case).

Values accepted:

Colors: hex #RRGGBB or #RGB, rgb(a), hsl(a), or transparent.

Spacing/radius: numbers with units (px, rem, em).

Persistence: token edits must apply immediately (mutate document.documentElement.style) and persist to localStorage key adsm:tokens:v1.

No side styles: never set inline styles outside the token applier. Components read tokens only.

4) Drawer + preview invariants

Open/Close: via drawerController.open(id) / drawerController.close(). No prop drilling.

Tabs: exact labels Preview | Notes | Props | JSON.

Preview resolution: preview looks up registry[id].demo. If absent, show the uniform “No preview available” stub—don’t throw, don’t lazy-import arbitrary modules.

No layout glitches: the drawer content area must not overflow; respect container padding; avoid 100vh blue bars, etc.

5) Supabase & diagnostics

Health check: isSupabaseConfigured() returns tri-state: 'ok' | 'warn' | 'off'. In dev, warn; never block UI if missing.

Audits: Diagnostics may log “not configured” as warning only. Do not fail QA on configuration absence.

6) Tripwires (fast checks Claude must keep green)

Token instant apply: changing --color-primary updates the “Semantic Token Showcase” button bg within 1 animation frame and survives page reload (localStorage).

Drawer integrity: clicking a component card opens the drawer; tabs switch; Preview mounts a component if demo exists.

Registry sanity: registry.componentsAreRenderable true (all demo entries are valid React components or null).

No import.meta.env: static check; zero occurrences outside env/getEnvVar.

7) File boundaries (ownership map)

Claude must not change files outside the listed ownership without explicit permission.

Tokens system: src/utils/tokenUtils.ts, src/theme/themeManager.ts, src/pages/TokensPage.tsx.

Drawer system: src/drawer/ComponentDrawer.tsx, src/drawer/controller.ts.

Registry: src/components/registry.ts.

Supabase: src/lib/supabaseClient.ts, src/lib/env.ts.

App boot: src/App.tsx, src/layout/AppFrame.tsx.

Styles: src/styles/*.css, src/tokens/*.css.

Diagnostics: src/diagnostics/* (read-only unless asked).

8) Error handling & logging

Never throw in UI for missing previews/tokens; fall back gracefully and log console.warn with a single-line message.

No verbose logs in production: guard behind if (process.env.NODE_ENV !== 'production').

9) Commit/patch hygiene (Claude output)

Diff blocks only using the provided *** Begin Patch protocol.

One concern per patch (e.g., “tokens instant apply”). Additional concerns require separate patches.

Verification steps: after diffs, include a 3–5 line checklist to manually confirm the fix.

Optional “boilerplate” snippets (drop in your Guidelines)

Allowed token value regex (for Claude to validate inputs):

Colors:  ^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})|rgba?\\([^)]+\\)|hsla?\\([^)]+\\)|transparent)$
Spacing: ^\\d+(\\.\\d+)?(px|rem|em)$


LocalStorage keys:

adsm:tokens:v1 – JSON map of token → value

adsm:theme – 'light' | 'dark'

adsm:lastRoute – hash string

adsm:previewProps:{componentId} – JSON props for drawer preview

Uniform “no preview” stub contract:

// ComponentPreviewFallback.tsx
export function PreviewFallback() {
  return (
    <div role="status" aria-live="polite" className="preview-fallback">
      <span aria-hidden>📦</span>
      <div>No preview available</div>
      <div className="muted">Component not found in registry</div>
    </div>
  );
}


