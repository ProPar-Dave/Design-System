# Atomic DS – Successor Setup Form

Use this form to collect the key details required to set up a successor implementation of Atomic DS. Fill out each section with the relevant repository, authentication, and component information. If a field does not apply, leave it blank or mark it as "N/A".

## 1. Repository Destination
- Provider: (GitHub / GitLab / other)  
- Owner/Org:  
- Repo Name:  
- Target Branch:  
- Path layout for `dist/`: (e.g., `/dist/`, `/packages/ads/`)

---

## 2. Authentication
- Preferred method: (Option A – PAT in Make / Option B – Edge Function proxy)
- If Option A: Provide PAT scope (e.g., `repo` (with `contents:write`)).
- If Option B: Provide endpoint URL + auth expectations.

---

## 3. Component Priorities
- **Atoms (first)**:  
- **Molecules (next)**:
- **Organisms (later)**:
- Must-mirror Figma components: (e.g., `Core/Button – https://www.figma.com/file/xyz#component=123` — use `Library/ComponentName` naming and include direct component links)

---

## 4. Design Tokens Expansion
- Additional Figma Variables to sync (hover, active, disabled, elevations, semantic slots):  
- Any special naming conventions:  

---

## 5. Accessibility Targets
- Baseline: WCAG (AA / AAA)  
- Screen reader specifics (if any):  
- Keyboard navigation expectations:  

---

## 6. Distribution Format
- Module format: (ESM only / ESM + CJS / UMD)  
- CSS: (single consolidated file / per-component modules)  
- Include tokens JSON: (yes/no)  

---

## 7. Licensing / Legal Headers
- License type: (MIT, Apache-2.0, internal only, etc.)  
- Required headers/banner text for each file:  

---

## Optional
- CI/CD trigger (manual publish, on commit, nightly, etc.):  
- Docs scope (drawer notes only / full guidelines page / external site):  
- Error tracking/logging (yes/no, preferred tool):  
