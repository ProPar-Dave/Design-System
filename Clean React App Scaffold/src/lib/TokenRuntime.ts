// src/lib/TokenRuntime.ts
export type TokenMap = Record<string, string>;

const KEY = 'adsm:tokens';

// Low-risk defaults (you can change later)
export const DEFAULT_TOKENS: TokenMap = {
  '--color-bg': '#0b1020',
  '--color-panel': '#0f162e',
  '--color-text': '#e2e8f0',
  '--color-muted': '#94a3b8',
  '--color-border': '#1e293b',
  '--color-accent': '#3b82f6',
  '--input-bg': '#121a33',
  '--input-text': '#e6edf7',
  '--input-border': '#2a3853',
  '--btn-primary-bg': '#3b82f6',
  '--btn-primary-text': '#0b1020',
  // Spacing tokens - ensure proper values
  '--space-1': '4px',
  '--space-2': '8px', 
  '--space-3': '12px',
  '--space-4': '16px',
  
  // Border radius tokens
  '--radius-sm': '6px',
  '--radius-md': '10px', 
  '--radius-lg': '16px',
  
  // Typography tokens
  '--font-size': '16px',
  
  // Legacy focus ring (keep for compatibility)
  '--focus-ring': '#3b82f6',
  
  // Interactive state tokens
  '--color-hover-bg': '#1e293b',
  '--color-active-bg': '#334155',
  '--color-focus-ring': '#60a5fa',
  '--color-disabled-bg': '#64748b',
  '--color-disabled-text': '#94a3b8',
  
  // Component semantic tokens - Chip
  '--chip-bg': '#1e293b',
  '--chip-text': '#cbd5e1',
  '--chip-border': '#475569',
  '--chip-hover': '#334155',
  '--chip-active': '#475569',
  
  // Component semantic tokens - Tab
  '--tab-active-fg': '#60a5fa',
  '--tab-active-bg': '#1e293b',
  '--tab-inactive-fg': '#94a3b8',
  '--tab-inactive-bg': 'transparent',
  '--tab-hover-bg': '#1e293b',
  
  // Additional missing button tokens
  '--button-primary-hover': '#2563eb',
  '--button-primary-active': '#1d4ed8',
  '--button-primary-disabled': '#64748b',
  '--button-primary-disabled-text': '#94a3b8',
  '--button-secondary-bg': 'transparent',
  '--button-secondary-text': '#cbd5e1',
  '--button-secondary-border': '#475569',
  '--button-secondary-hover': '#1e293b',
  '--button-secondary-active': '#334155',
  '--button-secondary-disabled': '#64748b',
  '--button-secondary-disabled-text': '#94a3b8',
  
  // Missing commonly referenced tokens
  '--color-foreground': '#e2e8f0',
  '--color-background': '#0b1020',
  '--color-muted-foreground': '#94a3b8',
  '--color-primary': '#3b82f6',
  '--color-destructive': '#ef4444',
  '--color-ring': '#60a5fa',
  '--touch-target-md': '44px',
  '--line-height-tight': '1.25',
  '--line-height-normal': '1.5',
  '--line-height-relaxed': '1.75',
  '--font-weight-normal': '400',
  '--font-weight-medium': '500',
  '--font-weight-semibold': '600',
  '--font-weight-bold': '700',
  '--font-size-xs': '12px',
  '--font-size-sm': '14px',
  '--font-size-base': '16px',
  '--font-size-lg': '18px',
  '--font-size-xl': '20px',
  '--font-size-2xl': '24px',
  '--font-size-3xl': '30px',
  
  // Status/semantic color tokens
  '--success-bg': '#16a34a',
  '--success-text': '#dcfce7',
  '--success-border': '#22c55e',
  '--warning-bg': '#d97706',
  '--warning-text': '#fef3c7',
  '--warning-border': '#f59e0b',
  '--error-bg': '#dc2626',
  '--error-text': '#fecaca',
  '--error-border': '#ef4444',
  '--info-bg': '#2563eb',
  '--info-text': '#dbeafe',
  '--info-border': '#3b82f6',
  
  // Input enhanced tokens
  '--input-background': '#121a33',
  '--input-focus-border': '#60a5fa',
  
  // Missing chip status tokens
  '--chip-info-bg': '#1e293b',
  '--chip-info-text': '#dbeafe',
  '--chip-info-border': '#3b82f6',
  '--chip-success-bg': '#1e293b',
  '--chip-success-text': '#dcfce7',
  '--chip-success-border': '#22c55e',
  '--chip-warning-bg': '#1e293b',
  '--chip-warning-text': '#fef3c7',
  '--chip-warning-border': '#f59e0b',
  '--chip-danger-bg': '#1e293b',
  '--chip-danger-text': '#fecaca',
  '--chip-danger-border': '#ef4444'
};

export function loadTokens(): TokenMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_TOKENS, ...JSON.parse(raw) } : { ...DEFAULT_TOKENS };
  } catch { return { ...DEFAULT_TOKENS }; }
}

export function saveTokens(tokens: TokenMap) {
  localStorage.setItem(KEY, JSON.stringify(tokens));
}

export function applyTokens(tokens: TokenMap, rootSelector = '#adsm-root') {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return; // graceful no-op
  Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function updateToken(name: string, value: string, rootSelector = '#adsm-root') {
  // Defensive: ignore obviously bad inputs
  if (!name || typeof value !== 'string') return loadTokens();
  
  // Clean value: remove newlines and extra whitespace that might cause parsing issues
  const cleanValue = value.replace(/[\r\n\t]/g, '').trim();
  if (!cleanValue) {
    console.warn('[tokens] rejected empty value for', name);
    return loadTokens();
  }
  
  // For spacing tokens, ensure valid CSS units (px, rem, em, %, etc.)
  if (name.includes('space') || name.includes('radius') || name.includes('font-size')) {
    const isValidUnit = /^[0-9]*\.?[0-9]+(px|rem|em|%|vh|vw|ch|ex|cm|mm|in|pt|pc)$/i.test(cleanValue);
    if (!isValidUnit) {
      console.warn('[tokens] rejected invalid unit value for', name, cleanValue);
      return loadTokens();
    }
  }
  
  // Optional color sanity: allow #rgb/#rrggbb, rgb(), rgba(), hsl(), hsla(), and CSS named colors
  if (name.includes('color') || name.endsWith('-bg') || name.endsWith('-text') || name.endsWith('-border')) {
    const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleanValue);
    const isRgb = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/i.test(cleanValue);
    const isHsl = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/i.test(cleanValue);
    const isTransparent = cleanValue.toLowerCase() === 'transparent';
    
    if (!isHex && !isRgb && !isHsl && !isTransparent) {
      console.warn('[tokens] rejected invalid color value for', name, cleanValue);
      return loadTokens();
    }
  }
  
  const next = { ...loadTokens(), [name]: cleanValue };
  saveTokens(next);
  applyTokens(next, rootSelector);
  return next;
}

export function resetTokens(rootSelector = '#adsm-root') {
  saveTokens(DEFAULT_TOKENS);
  applyTokens(DEFAULT_TOKENS, rootSelector);
  return { ...DEFAULT_TOKENS };
}

// Export functions for TokensPage
export function exportTokensToCSS(rootSelector = '#adsm-root'): string {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return '';
  
  const computedStyle = getComputedStyle(root);
  const tokens = loadTokens();
  
  const cssLines = Object.keys(tokens).map(token => {
    const value = computedStyle.getPropertyValue(token).trim() || tokens[token];
    return `  ${token}: ${value};`;
  });
  
  return `:root {\n${cssLines.join('\n')}\n}`;
}

export function exportTokensToJSON(rootSelector = '#adsm-root'): string {
  const root = document.querySelector<HTMLElement>(rootSelector);
  if (!root) return '{}';
  
  const computedStyle = getComputedStyle(root);
  const tokens = loadTokens();
  
  const exportObj = Object.fromEntries(
    Object.keys(tokens).map(token => {
      const value = computedStyle.getPropertyValue(token).trim() || tokens[token];
      return [token, value];
    })
  );
  
  return JSON.stringify(exportObj, null, 2);
}

// Tiny WCAG check for body text
export function bodyContrastOK(rootSelector = '#adsm-root') {
  const root = (document.querySelector(rootSelector) || document.documentElement) as HTMLElement;
  const get = (n: string) => getComputedStyle(root).getPropertyValue(n).trim();
  const ratio = contrast(get('--color-text'), get('--color-bg'));
  return { ratio, ok: ratio >= 4.5 };
}

function contrast(f: string, b: string) {
  const hex = (x: string) => {
    const c = x.replace('#', '');
    const n = parseInt(c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c, 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, bl = n & 255;
    const L = (v: number) => {
      v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4);
    };
    return 0.2126 * L(r) + 0.7152 * L(g) + 0.0722 * L(bl);
  };
  const L1 = hex(f) + .05, L2 = hex(b) + .05;
  return +(Math.max(L1, L2) / Math.min(L1, L2)).toFixed(2);
}