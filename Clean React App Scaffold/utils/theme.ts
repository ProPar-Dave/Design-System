// utils/theme.ts

export const THEMES = {
  dark: {
    '--color-bg': '#0A0B10',
    '--color-panel': '#0F1117',
    '--color-text': '#E6ECFF',
    '--color-accent': '#3B82F6',
    '--color-muted': '#8B95A7',
    '--color-border': '#1F2332',
    '--space-4': '16px',
    '--radius-md': '10px',
    '--font-size-base': '14px',
    '--color-background': '#0A0B10',
    '--color-foreground': '#E6ECFF',
    '--color-primary': '#3B82F6',
    '--color-secondary': '#1F2332'
  },
  light: {
    '--color-bg': '#FFFFFF',
    '--color-panel': '#F9FAFB',
    '--color-text': '#111827',
    '--color-accent': '#3B82F6',
    '--color-muted': '#6B7280',
    '--color-border': '#E5E7EB',
    '--space-4': '16px',
    '--radius-md': '10px',
    '--font-size-base': '14px',
    '--color-background': '#FFFFFF',
    '--color-foreground': '#111827',
    '--color-primary': '#3B82F6',
    '--color-secondary': '#F3F4F6'
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
  const text = base['--color-text'] || base['--color-foreground'] || '#E6ECFF';
  const { bg, fg } = deriveButtonPair(accent, text, 4.5);
  
  return {
    '--button-bg': bg,
    '--button-fg': fg,
    '--button-bg-hover': theme === 'dark' ? lighten(hexToRgb(bg), 1.1) : darken(hexToRgb(bg), 0.9),
    '--button-border': base['--color-border'] || '#1F2332'
  };
}

function ensureStyleEl(): HTMLStyleElement {
  let el = document.getElementById('adsm-theme') as HTMLStyleElement;
  if (!el) {
    el = document.createElement('style');
    el.id = 'adsm-theme';
    document.head.appendChild(el);
  }
  return el;
}

export function injectThemeTokens(theme: Theme = currentTheme) {
  const el = ensureStyleEl();
  const vars = { ...THEMES[theme], ...readOverrides(theme) };
  const interactive = computeInteractive(theme, vars);
  Object.assign(vars, interactive);
  
  const css = `html[data-theme="${theme}"]{` + 
    Object.entries(vars).map(([k, v]) => `${k}:${v}!important;`).join('') + 
    `}\n`;
  
  // Guard re-injection to prevent unnecessary DOM writes
  if (css !== lastCss) {
    el.textContent = css;
    lastCss = css;
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
  currentTheme = theme;
  localStorage.setItem('adsm:theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  injectThemeTokens(theme);
  document.dispatchEvent(new CustomEvent('adsm:theme:changed', { detail: theme }));
}

export function toggleTheme() {
  const newTheme: Theme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

// Token overrides with debounced writes
let writeTimeout: number | null = null;

export function applyOverrides(root: HTMLElement, theme: Theme, overrides: Record<string, string>) {
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
  window.location.reload(); // Ensure clean state
}

// Initialize theme system
export function initTheme() {
  const theme = getTheme();
  document.documentElement.setAttribute('data-theme', theme);
  injectThemeTokens(theme);
  
  // Listen for theme toggle events
  document.addEventListener('adsm:theme:toggle', () => {
    toggleTheme();
  });
  
  // Dispatch ready event
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('adsm:tokens-ready'));
  }, 50);
}