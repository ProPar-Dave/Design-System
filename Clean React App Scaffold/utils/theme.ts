// utils/theme.ts

import { ensureThemeContrast, getThemeContrastDiagnostics } from './themeContrast';

export const THEMES = {
  dark: {
    '--color-bg': '#0B1020',
    '--color-panel': '#0F162E',
    '--color-text': '#E2E8F0',
    '--color-accent': '#3B82F6',
    '--color-muted': '#94A3B8',
    '--color-border': '#334155',
    '--space-4': '16px',
    '--radius-md': '10px',
    '--font-size-base': '14px',
    '--color-background': '#0B1020',
    '--color-foreground': '#E2E8F0',
    '--color-primary': '#3B82F6',
    '--color-secondary': '#1E293B'
  },
  light: {
    '--color-bg': '#FFFFFF',
    '--color-panel': '#F8FAFC',
    '--color-text': '#0B1020',
    '--color-accent': '#3B82F6',
    '--color-muted': '#475569',
    '--color-border': '#E2E8F0',
    '--space-4': '16px',
    '--radius-md': '10px',
    '--font-size-base': '14px',
    '--color-background': '#FFFFFF',
    '--color-foreground': '#0B1020',
    '--color-primary': '#3B82F6',
    '--color-secondary': '#F1F5F9'
  }
} as const;

export type Theme = keyof typeof THEMES;

let currentTheme: Theme = 'dark';
let lastCss = '';

// Color utility functions for WCAG AA compliance
function hexToRgb(h: string): {r: number; g: number; b: number} {
  h = h.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const hx = (n: number) => n.toString(16).padStart(2, '0');
  return `#${hx(r)}${hx(g)}${hx(b)}`;
}

function relLum(r: number, g: number, b: number): number {
  const lin = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const L1 = relLum(...fg), L2 = relLum(...bg);
  const [hi, lo] = L1 >= L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}

function darken({r, g, b}: {r: number; g: number; b: number}, f = 0.9): {r: number; g: number; b: number} {
  return {
    r: Math.max(0, Math.round(r * f)),
    g: Math.max(0, Math.round(g * f)),
    b: Math.max(0, Math.round(b * f))
  };
}

function lighten({r, g, b}: {r: number; g: number; b: number}, f = 1.1): {r: number; g: number; b: number} {
  return {
    r: Math.min(255, Math.round(r * f)),
    g: Math.min(255, Math.round(g * f)),
    b: Math.min(255, Math.round(b * f))
  };
}

function deriveButtonPair(accentHex: string, textHex: string, min = 4.5) {
  let bg = hexToRgb(accentHex);
  const fg = hexToRgb(textHex);
  let i = 0;
  
  // Try darkening first (for light backgrounds)
  while (contrastRatio([fg.r, fg.g, fg.b], [bg.r, bg.g, bg.b]) < min && i < 12) {
    bg = darken(bg, 0.85);
    i++;
  }
  
  // If still not enough contrast, try with white text
  if (contrastRatio([fg.r, fg.g, fg.b], [bg.r, bg.g, bg.b]) < min) {
    const whiteContrast = contrastRatio([255, 255, 255], [bg.r, bg.g, bg.b]);
    if (whiteContrast >= min) {
      return { bg: rgbToHex(bg.r, bg.g, bg.b), fg: '#FFFFFF' };
    }
  }
  
  return { bg: rgbToHex(bg.r, bg.g, bg.b), fg: rgbToHex(fg.r, fg.g, fg.b) };
}

export function computeInteractive(theme: Theme, base: Record<string, string>) {
  const accent = base['--color-accent'] || '#3B82F6';
  const text = base['--color-text'] || base['--color-foreground'] || (theme === 'dark' ? '#E2E8F0' : '#0B1020');
  const { bg, fg } = deriveButtonPair(accent, text, 4.5);
  
  return {
    '--button-bg': bg,
    '--button-fg': fg,
    '--button-bg-hover': theme === 'dark' ? lighten(hexToRgb(bg), 1.1) : darken(hexToRgb(bg), 0.9),
    '--button-border': base['--color-border'] || (theme === 'dark' ? '#334155' : '#E2E8F0')
  };
}

function ensureStyleEl(): HTMLStyleElement {
  let el = document.getElementById('adsm-theme-override') as HTMLStyleElement;
  if (!el) {
    el = document.createElement('style');
    el.id = 'adsm-theme-override';
    document.head.appendChild(el);
  }
  return el;
}

export function injectThemeTokens(theme: Theme = currentTheme) {
  const el = ensureStyleEl();
  const vars = { ...THEMES[theme], ...readOverrides(theme) };
  const interactive = computeInteractive(theme, vars);
  Object.assign(vars, interactive);
  
  const css = `html[data-theme="${theme}"] {` + 
    Object.entries(vars).map(([k, v]) => `${k}: ${v} !important;`).join('') + 
    `}\n`;
  
  // Guard re-injection to prevent unnecessary DOM writes
  if (css !== lastCss) {
    el.textContent = css;
    lastCss = css;
    console.log(`Injected theme tokens for ${theme}`);
  }
}

export function getTheme(): Theme {
  const stored = localStorage.getItem('adsm:theme') as Theme;
  if (stored && stored in THEMES) {
    currentTheme = stored;
    return stored;
  }
  
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  currentTheme = prefersDark ? 'dark' : 'light';
  return currentTheme;
}

export function setTheme(theme: Theme) {
  console.log(`Setting theme to: ${theme}`);
  currentTheme = theme;
  localStorage.setItem('adsm:theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  
  // Apply CSS-defined theme first
  injectThemeTokens(theme);
  
  // Then verify and auto-correct contrast if needed
  setTimeout(() => {
    const correctionMade = ensureThemeContrast();
    if (correctionMade) {
      console.log('Theme contrast auto-correction applied');
    }
    
    // Log final diagnostics
    const diagnostics = getThemeContrastDiagnostics();
    console.log('Final theme diagnostics:', diagnostics);
  }, 100);
  
  document.dispatchEvent(new CustomEvent('adsm:theme:changed', { detail: theme }));
}

export function toggleTheme() {
  const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

// Token overrides with debounced writes
let writeTimeout: number | null = null;

export function applyOverrides(root: HTMLElement, theme: Theme, overrides: Record<string, string>) {
  console.log('Applying overrides:', overrides);
  
  // Apply immediately to DOM for instant feedback
  Object.entries(overrides).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Debounce localStorage writes
  if (writeTimeout) clearTimeout(writeTimeout);
  writeTimeout = setTimeout(() => {
    try {
      const key = `adsm:overrides:${theme}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      const updated = { ...existing, ...overrides };
      localStorage.setItem(key, JSON.stringify(updated));
      injectThemeTokens(theme);
      
      // Verify contrast after applying overrides
      setTimeout(() => ensureThemeContrast(), 50);
    } catch (e) {
      console.warn('Failed to save theme overrides:', e);
    }
  }, 100) as any;
}

export function readOverrides(theme: Theme): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(`adsm:overrides:${theme}`) || '{}');
  } catch {
    return {};
  }
}

export function clearOverrides(theme: Theme) {
  localStorage.removeItem(`adsm:overrides:${theme}`);
  // Re-inject clean theme
  injectThemeTokens(theme);
  // Clear any inline styles
  const root = document.getElementById('adsm-root') || document.documentElement;
  Object.keys(THEMES[theme]).forEach(key => {
    root.style.removeProperty(key);
  });
  
  // Verify contrast after clearing
  setTimeout(() => ensureThemeContrast(), 50);
}

// Initialize theme system
export function initTheme() {
  console.log('Initializing theme system...');
  const theme = getTheme();
  
  // Set attribute first
  document.documentElement.setAttribute('data-theme', theme);
  
  // Apply theme tokens
  injectThemeTokens(theme);
  
  // Verify contrast after initial load
  setTimeout(() => {
    const correctionMade = ensureThemeContrast();
    console.log('Theme initialized:', theme, correctionMade ? '(with corrections)' : '(no corrections needed)');
  }, 100);
  
  // Listen for theme toggle events
  document.addEventListener('adsm:theme:toggle', () => {
    toggleTheme();
  });
  
  // Dispatch ready event
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('adsm:tokens-ready'));
  }, 150);
  
  return theme;
}