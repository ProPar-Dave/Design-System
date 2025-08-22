export type ThemeName = 'light' | 'dark';
const LS_KEY = 'adsm:theme';

const LIGHT = {
  '--color-bg': '#FFFFFF',
  '--color-panel': '#F7FAFF',
  '--color-text': '#0B1020',
  '--color-muted': '#475569',
  '--color-border': '#CBD5E1',
  '--input-bg': '#FFFFFF',
  '--input-text': '#0F172A',
  '--input-border': '#CBD5E1',
  '--btn-primary-bg': '#2563EB',
  '--btn-primary-text': '#FFFFFF',
};

const DARK = {
  '--color-bg': '#0B1020',
  '--color-panel': '#0F162E',
  '--color-text': '#E2E8F0',
  '--color-muted': '#94A3B8',
  '--color-border': '#334155',
  '--input-bg': '#1A223C',
  '--input-text': '#F1F5F9',
  '--input-border': '#334155',
  '--btn-primary-bg': '#3B82F6',
  '--btn-primary-text': '#0B1020',
};

export function applyTheme(theme: ThemeName) {
  const map = theme === 'dark' ? DARK : LIGHT;
  const root = document.documentElement;
  root.dataset.theme = theme;
  const style = root.style;
  Object.entries(map).forEach(([k,v]) => style.setProperty(k, v));
  localStorage.setItem(LS_KEY, theme);
  verifyBodyContrast(); // guard
  
  // Diagnostics logging
  console.log('🎨 Theme applied:', {
    theme,
    '--color-bg': style.getPropertyValue('--color-bg'),
    '--color-text': style.getPropertyValue('--color-text'),
    timestamp: new Date().toISOString()
  });
  
  // Dispatch event for components that need to react to theme changes
  document.dispatchEvent(new CustomEvent('adsm:theme:changed', { 
    detail: { theme, tokens: map } 
  }));
}

export function getTheme(): ThemeName {
  const t = (localStorage.getItem(LS_KEY) as ThemeName) || 'dark';
  return t;
}

// WCAG guard to avoid mixed-state UIs
function verifyBodyContrast() {
  const cs = getComputedStyle(document.documentElement);
  const bg = cs.getPropertyValue('--color-bg').trim();
  const fg = cs.getPropertyValue('--color-text').trim();
  const ratio = (window as any).__adsmContrast?.(fg, bg) ?? 21;
  
  console.log('🔍 Contrast verification:', {
    background: bg,
    foreground: fg,
    ratio: ratio.toFixed(2),
    passes: ratio >= 4.5
  });
  
  if (ratio < 4.5) {
    console.warn('⚠️ Low contrast detected, applying fallback colors');
    // fallback to safe pairs
    const isDark = document.documentElement.dataset.theme === 'dark';
    document.documentElement.style.setProperty('--color-text', isDark ? '#FFFFFF' : '#0B1020');
    
    // Show debug banner in development
    if (process.env.NODE_ENV === 'development') {
      showContrastWarning();
    }
    
    // Dispatch contrast correction event
    document.dispatchEvent(new CustomEvent('adsm:theme:contrast-corrected', {
      detail: { originalRatio: ratio, fallbackColor: isDark ? '#FFFFFF' : '#0B1020' }
    }));
  }
}

// Development-only debug banner for contrast issues
function showContrastWarning() {
  const existingBanner = document.getElementById('adsm-contrast-warning');
  if (existingBanner) return;
  
  const banner = document.createElement('div');
  banner.id = 'adsm-contrast-warning';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #dc2626;
    color: white;
    padding: 8px 16px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
    text-align: center;
    border-bottom: 2px solid #991b1b;
  `;
  banner.textContent = '⚠️ DEV: Body contrast < 4.5 - fallback applied';
  
  document.body.prepend(banner);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    banner.remove();
  }, 5000);
}

// Utility to toggle between themes
export function toggleTheme(): ThemeName {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

// Initialize theme on app start
export function initializeTheme() {
  const theme = getTheme();
  console.log('🚀 Initializing theme system:', theme);
  applyTheme(theme);
}

// Export for global access (useful for contrast calculations)
export function getContrastRatio(foreground: string, background: string): number {
  // Simple luminance calculation for contrast ratio
  const getLuminance = (color: string) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Make contrast function globally available
(window as any).__adsmContrast = getContrastRatio;