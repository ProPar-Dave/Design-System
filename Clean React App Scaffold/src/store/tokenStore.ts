type TokenMap = Record<string, string>;

const LS_KEY = "adsm:tokens:v1";
let cache: TokenMap | null = null;
const listeners = new Set<() => void>();

const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());

export function getTokens(): TokenMap {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(LS_KEY);
    cache = raw ? (JSON.parse(raw) as TokenMap) : {};
  } catch {
    cache = {};
  }
  return cache!;
}

export function setToken(name: string, value: string) {
  const tokens = getTokens();
  // Allow transparent / css keywords too; only validate if it looks like hex
  if (value.trim().startsWith("#") && !isHex(value)) return; // ignore invalid hex
  tokens[name] = value.trim();
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(tokens));
  } catch {}
  applyTokensToRoot(tokens);
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function applyTokensToRoot(tokens = getTokens()) {
  const root = document.documentElement;
  Object.entries(tokens).forEach(([k, v]) => {
    if (v == null || v === "") return;
    // Normalize --color-X naming only if user didn't pass leading dashes
    const cssVar = k.startsWith("--") ? k : `--${k}`;
    root.style.setProperty(cssVar, v);
  });
}

// one-time apply on import
try {
  applyTokensToRoot();
} catch {}