// utils/tokenUtils.ts
// Single source of truth for reading/writing design tokens with live CSS updates and persistence

const STORAGE_KEY = 'adsm:tokens:v1';

export type TokenMap = Record<string, string>;

const EL_SELECTOR = '.adsm-ui'; // root element that owns CSS vars (update if yours differs)

/** Get current tokens from localStorage (if any) merged with computed CSS values as fallback */
export function loadTokens(): TokenMap {
  const saved = safeParse<TokenMap>(localStorage.getItem(STORAGE_KEY));
  return saved ?? {};
}

/** Persist tokens */
export function saveTokens(tokens: TokenMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

/** Apply a single token to the DOM immediately */
export function applyToken(name: string, value: string) {
  const root = document.querySelector<HTMLElement>(EL_SELECTOR) ?? document.documentElement;
  // allow bare hex, rgb[a], named colors, and "transparent"
  const v = value.trim();
  if (!v) return;
  root.style.setProperty(`--${name.replace(/^--/, '')}`, v);
}

/** Apply many tokens at once (on boot) */
export function applyTokens(tokens: TokenMap) {
  Object.entries(tokens).forEach(([k, v]) => applyToken(k, v));
}

/** Set + persist a token, apply instantly */
export function setToken(name: string, value: string) {
  const tokens = loadTokens();
  tokens[name.replace(/^--/, '')] = normalizeColor(value);
  saveTokens(tokens);
  applyToken(name, tokens[name.replace(/^--/, '')]);
}

/** On first load, re-apply saved tokens so the app picks up live values */
export function bootTokens() {
  const tokens = loadTokens();
  if (tokens && Object.keys(tokens).length) {
    applyTokens(tokens);
  }
}

/** Convert "#abc" -> "#aabbcc"; pass-through rgb/rgba/transparent/named */
function normalizeColor(input: string): string {
  const v = input.trim();
  if (v === 'transparent') return v;
  if (/^#([0-9a-f]{3})$/i.test(v)) {
    return '#' + v.slice(1).split('').map(c => c + c).join('');
  }
  return v;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}