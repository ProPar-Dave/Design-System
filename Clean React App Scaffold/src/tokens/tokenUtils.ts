// src/tokens/tokenUtils.ts
type TokenMap = Record<string, string>;

const TOKEN_STORAGE_KEY = "adsm:tokens:v1";

/** Accepts "#RRGGBB", "transparent", valid CSS color, or empty -> removes token. */
export function normalizeTokenValue(raw: string): string | null {
  const v = (raw || "").trim();
  if (!v) return null;
  if (v === "transparent") return v;
  // allow leading '#', short or long hex, or any valid css color string
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return v;
  // fallback: trust CSS engine — if invalid the setProperty is a no-op
  return v;
}

/** Apply a single token to :root (or `[data-theme]` if you use one). */
export function applyToken(name: string, value: string | null) {
  const target = document.documentElement; // or document.querySelector('[data-theme]')!
  const cssVar = `--${name.replace(/^--/, "")}`;
  if (value === null) {
    target.style.removeProperty(cssVar);
  } else {
    target.style.setProperty(cssVar, value);
  }
}

/** Apply multiple tokens in one pass (minimal layout thrash). */
export function applyTokens(tokens: TokenMap) {
  const target = document.documentElement;
  const style = target.style;
  for (const [k, vRaw] of Object.entries(tokens)) {
    const v = normalizeTokenValue(vRaw);
    const cssVar = `--${k.replace(/^--/, "")}`;
    if (v === null) style.removeProperty(cssVar);
    else style.setProperty(cssVar, v);
  }
}

/** Load/save from localStorage. */
export function loadTokens(): TokenMap {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveTokens(tokens: TokenMap) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.warn('[tokenUtils] Failed to save tokens:', error);
  }
}

/** Set + persist + broadcast. */
export function setToken(name: string, raw: string) {
  const tokens = loadTokens();
  const v = normalizeTokenValue(raw);
  const cleanName = name.replace(/^--/, "");
  
  if (v === null) {
    delete tokens[cleanName];
  } else {
    tokens[cleanName] = v;
  }
  
  applyTokens(tokens);
  saveTokens(tokens);
  window.dispatchEvent(new CustomEvent("adsm:tokens:updated", { detail: tokens }));
}

/** Boot-time reapply (idempotent). */
export function reapplyPersistedTokens() {
  const tokens = loadTokens();
  applyTokens(tokens);
}

/** Reset a token to its default value */
export function resetToken(name: string) {
  const tokens = loadTokens();
  const cleanName = name.replace(/^--/, "");
  delete tokens[cleanName];
  
  applyTokens(tokens);
  saveTokens(tokens);
  window.dispatchEvent(new CustomEvent("adsm:tokens:updated", { detail: tokens }));
}

/** Get all current tokens */
export function getAllTokens(): TokenMap {
  return loadTokens();
}

/** Export tokens as JSON string */
export function exportTokens(): string {
  const tokens = getAllTokens();
  return JSON.stringify(tokens, null, 2);
}

/** Import tokens from JSON string */
export function importTokens(jsonString: string): void {
  try {
    const tokens = JSON.parse(jsonString);
    if (typeof tokens !== 'object' || tokens === null) {
      throw new Error('Invalid token format');
    }
    
    // Validate all tokens before applying
    const validated: TokenMap = {};
    for (const [name, value] of Object.entries(tokens)) {
      if (typeof value === 'string') {
        const normalized = normalizeTokenValue(value);
        if (normalized !== null) {
          validated[name] = normalized;
        }
      }
    }
    
    // Apply and persist
    applyTokens(validated);
    saveTokens(validated);
    
    // Broadcast change event
    window.dispatchEvent(new CustomEvent("adsm:tokens:updated", { detail: validated }));
  } catch (error) {
    throw new Error(`Failed to import tokens: ${(error as Error).message}`);
  }
}