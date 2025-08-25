/**
 * Theme Manager - Single source of truth for theme application
 * Clean implementation without window globals or console spam
 */

import { devLog, devGroup, devGroupEnd, devError } from '../utils/log';
import { applyTokens, loadTokens } from '../utils/tokenUtils';

export type ThemeName = 'light' | 'dark';
export type ThemeType = 'light' | 'dark' | 'auto';

const KEY = 'adsm:theme';
export function getSimpleTheme(): ThemeName {
  const t = (localStorage.getItem(KEY) as ThemeName) || 'dark';
  return (t==='light'||t==='dark') ? t : 'dark';
}
export function applySimpleTheme(theme:ThemeName){
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  localStorage.setItem(KEY, theme);
  // Mirror theme to the app namespace root so namespaced CSS reacts
  const appRoot =
    document.getElementById('adsm-root') || document.querySelector('.adsm-ui');
  if (appRoot) {
    (appRoot as HTMLElement).setAttribute('data-theme', theme);
  }
  // guard: ensure readable body contrast
  if (process.env.NODE_ENV !== 'production'){
    const cs = getComputedStyle(root);
    const fg = cs.getPropertyValue('--color-text'); const bg = cs.getPropertyValue('--color-bg');
    const ratio = wcagContrast(fg,bg);
    if (ratio < 4.5) console.warn('[theme] low body contrast', {fg,bg,ratio});
  }
}
export function toggleSimpleTheme(){
  applySimpleTheme(getSimpleTheme()==='dark'?'light':'dark');
}
function wcagContrast(f:string,b:string){
  const p = (x:string)=>{ const c=x.trim().replace('#',''); const n=parseInt(c.length===3?c.split('').map(ch=>ch+ch).join(''):c,16); return [n>>16&255,n>>8&255,n&255];};
  const l = (r:number,g:number,b:number)=>{ const to=(v:number)=>{v/=255; return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}; const [R,G,B]=[to(r),to(g),to(b)]; return 0.2126*R+0.7152*G+0.0722*B; };
  const [r1,g1,b1]=p(f), [r2,g2,b2]=p(b); const L1=l(r1,g1,b1)+0.05, L2=l(r2,g2,b2)+0.05;
  return +(Math.max(L1,L2)/Math.min(L1,L2)).toFixed(2);
}

// Define explicit color tokens for each theme
const LIGHT_TOKENS = {
  // Core colors
  '--color-bg': '#ffffff',
  '--color-panel': '#f8fafc', 
  '--color-text': '#0B1020',
  '--color-muted': '#f1f5f9',
  '--color-muted-foreground': '#475569',
  '--color-border': 'rgba(0, 0, 0, 0.1)',
  '--color-primary': '#0B1020',
  '--color-primary-foreground': '#ffffff',
  '--color-accent': '#e2e8f0',
  '--color-accent-foreground': '#0B1020',
  '--color-ring': '#3b82f6',
  
  // Input colors
  '--input-bg': '#f8fafc',
  '--input-text': '#0B1020',
  '--input-border': '#cbd5e1',
  '--input-placeholder': '#94a3b8',
  
  // Button colors
  '--btn-primary-bg': '#0B1020',
  '--btn-primary-text': '#ffffff',
  '--btn-primary-hover': '#1e293b',
  '--btn-primary-active': '#0f172a',
  '--btn-secondary-bg': 'transparent',
  '--btn-secondary-text': '#0B1020',
  '--btn-secondary-border': '#cbd5e1',
  '--btn-secondary-hover': '#f1f5f9',
  
  // Component tokens
  '--chip-bg': '#f1f5f9',
  '--chip-text': '#334155',
  '--chip-border': '#cbd5e1',
  '--divider-color': 'rgba(0, 0, 0, 0.1)',
  
  // Legacy aliases for compatibility
  '--background': '#ffffff',
  '--foreground': '#0B1020',
  '--card': '#ffffff',
  '--card-foreground': '#0B1020',
  '--muted': '#f1f5f9',
  '--sidebar': '#f8fafc',
  '--sidebar-foreground': '#0B1020',
  '--sidebar-border': '#e2e8f0',
} as const;

const DARK_TOKENS = {
  // Core colors  
  '--color-bg': '#0B1020',
  '--color-panel': '#0F162E',
  '--color-text': '#E2E8F0', 
  '--color-muted': '#1E293B',
  '--color-muted-foreground': '#94A3B8',
  '--color-border': '#334155',
  '--color-primary': '#E2E8F0',
  '--color-primary-foreground': '#0B1020',
  '--color-accent': '#334155',
  '--color-accent-foreground': '#E2E8F0',
  '--color-ring': '#60A5FA',
  
  // Input colors
  '--input-bg': '#1E293B',
  '--input-text': '#E2E8F0',
  '--input-border': '#475569',
  '--input-placeholder': '#64748B',
  
  // Button colors
  '--btn-primary-bg': '#E2E8F0',
  '--btn-primary-text': '#0B1020',
  '--btn-primary-hover': '#F1F5F9',
  '--btn-primary-active': '#F8FAFC',
  '--btn-secondary-bg': 'transparent',
  '--btn-secondary-text': '#E2E8F0',
  '--btn-secondary-border': '#475569',
  '--btn-secondary-hover': '#1E293B',
  
  // Component tokens
  '--chip-bg': '#1E293B',
  '--chip-text': '#CBD5E1',
  '--chip-border': '#475569',
  '--divider-color': '#334155',
  
  // Legacy aliases for compatibility
  '--background': '#0B1020',
  '--foreground': '#E2E8F0',
  '--card': '#0F162E',
  '--card-foreground': '#E2E8F0',
  '--muted': '#1E293B',
  '--sidebar': '#0B1020',
  '--sidebar-foreground': '#E2E8F0',
  '--sidebar-border': '#334155',
} as const;

/**
 * Pure function to parse color hex values
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  color = color.replace('#', '');
  
  // Handle 3-digit hex
  if (color.length === 3) {
    color = color.split('').map(char => char + char).join('');
  }
  
  // Handle 6-digit hex
  if (color.length === 6) {
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    return { r, g, b };
  }
  
  return null;
}

/**
 * Pure function to calculate relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  // Convert to relative luminance
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

/**
 * Pure function to calculate WCAG contrast ratio between two colors
 * @param fg Foreground color (hex string)
 * @param bg Background color (hex string) 
 * @returns Contrast ratio (1-21)
 */
export function contrastRatio(fg: string, bg: string): number {
  const c1 = parseColor(fg);
  const c2 = parseColor(bg);
  
  if (!c1 || !c2) return 1; // Fallback if parsing fails
  
  const l1 = getLuminance(c1.r, c1.g, c1.b);
  const l2 = getLuminance(c2.r, c2.g, c2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Theme state management
let currentTheme: ThemeType = 'auto';
let resolvedTheme: 'light' | 'dark' = 'light';
const changeCallbacks: Array<(theme: ThemeType, resolved: 'light' | 'dark') => void> = [];

/**
 * Verify body contrast once, optionally logging in development
 */
function verifyBodyContrast(): { ratio: number; passes: boolean; corrected: boolean } {
  const docElement = document.documentElement;
  const style = getComputedStyle(docElement);
  
  const bgColor = style.getPropertyValue('--color-bg').trim();
  const textColor = style.getPropertyValue('--color-text').trim();
  
  if (!bgColor || !textColor) {
    devError('Theme Manager: Missing color tokens for contrast verification');
    return { ratio: 1, passes: false, corrected: false };
  }
  
  const ratio = contrastRatio(textColor, bgColor);
  const passes = ratio >= 4.5;
  
  devLog(`Theme Manager: Contrast ratio ${ratio.toFixed(2)}:1 (${passes ? 'PASS' : 'FAIL'})`);
  
  if (!passes) {
    devError('Theme Manager: Contrast ratio below 4.5:1 WCAG AA standard');
    // Apply safe fallback colors
    const safeTokens = resolvedTheme === 'dark' 
      ? { '--color-bg': '#000000', '--color-text': '#ffffff' }
      : { '--color-bg': '#ffffff', '--color-text': '#000000' };
      
    Object.entries(safeTokens).forEach(([token, value]) => {
      docElement.style.setProperty(token, value);
    });
    
    devLog('Theme Manager: Applied safe contrast fallback');
    return { ratio, passes: false, corrected: true };
  }
  
  return { ratio, passes: true, corrected: false };
}

/**
 * Apply theme to document element
 * Sets dataset.theme, applies CSS vars, optionally verifies contrast in dev
 */
export function applyTheme(theme: ThemeType): void {
  const docElement = document.documentElement;
  
  // Resolve auto theme
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  resolvedTheme = theme === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : theme;
  
  devLog(`Theme Manager: Applying theme "${theme}" (resolved: "${resolvedTheme}")`);
  
  // Set data-theme attribute
  docElement.dataset.theme = resolvedTheme;

  // Mirror data-theme onto the app root so namespaced CSS can react
  const root = document.getElementById('adsm-root') || document.querySelector('.adsm-ui');
  if (root) {
    (root as HTMLElement).dataset.theme = resolvedTheme;
  }
  
  // Apply CSS custom properties directly for deterministic behavior
  const tokens = resolvedTheme === 'dark' ? DARK_TOKENS : LIGHT_TOKENS;
  
  Object.entries(tokens).forEach(([property, value]) => {
    docElement.style.setProperty(property, value);
  });
  
  // Apply any user-customized tokens from localStorage
  const customTokens = loadTokens();
  if (Object.keys(customTokens).length > 0) {
    applyTokens(customTokens, 'root');
  }
  
  // Store preference
  currentTheme = theme;
  localStorage.setItem('adsm:theme', theme);
  
  // Single contrast verification in development only, with minimal delay
  setTimeout(() => {
    const contrastResult = verifyBodyContrast();
    
    // Dispatch custom event for theme diagnostics
    const event = new CustomEvent('adsm:theme:changed', {
      detail: {
        theme,
        resolvedTheme,
        contrastRatio: contrastResult.ratio,
        contrastPasses: contrastResult.passes,
        correctionApplied: contrastResult.corrected
      }
    });
    document.dispatchEvent(event);
    
    if (contrastResult.corrected) {
      const correctionEvent = new CustomEvent('adsm:theme:contrast-corrected', {
        detail: { originalRatio: contrastResult.ratio, theme: resolvedTheme }
      });
      document.dispatchEvent(correctionEvent);
    }
  }, 16); // Single frame delay to ensure CSS has been applied
  
  // Notify callbacks
  changeCallbacks.forEach(callback => {
    try {
      callback(theme, resolvedTheme);
    } catch (error) {
      devError('Theme Manager: Callback error', error);
    }
  });
  
  devLog(`Theme Manager: Theme "${resolvedTheme}" applied successfully`);
}

/**
 * Get current theme preference
 */
export function getTheme(): ThemeType {
  if (currentTheme !== 'auto') return currentTheme;
  
  // Try to get from localStorage first
  const stored = localStorage.getItem('adsm:theme') as ThemeType;
  if (stored && ['light', 'dark', 'auto'].includes(stored)) {
    return stored;
  }
  
  // Default to auto (system preference)
  return 'auto';
}

/**
 * Get resolved theme (light or dark)
 */
export function getResolvedTheme(): 'light' | 'dark' {
  return resolvedTheme;
}

/**
 * Register theme change callback that re-applies theme and calls callback
 * @param callback Function to call when theme changes
 * @returns Unsubscribe function
 */
export function onThemeChange(callback: (theme: ThemeType, resolved: 'light' | 'dark') => void): () => void {
  changeCallbacks.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = changeCallbacks.indexOf(callback);
    if (index > -1) {
      changeCallbacks.splice(index, 1);
    }
  };
}

/**
 * Initialize theme system with minimal logging
 */
export function initializeTheme(): void {
  devLog('Theme Manager: Initializing theme system');
  
  // Get initial theme preference
  const initialTheme = getTheme();
  
  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = () => {
    if (currentTheme === 'auto') {
      applyTheme('auto'); // Re-apply to pick up system change
    }
  };
  
  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleSystemThemeChange);
  } else {
    // Legacy browsers
    mediaQuery.addListener(handleSystemThemeChange);
  }
  
  // Apply initial theme
  applyTheme(initialTheme);
  
  // Single diagnostic log in development only
  setTimeout(() => {
    const docElement = document.documentElement;
    const style = getComputedStyle(docElement);
    
    devGroup('Theme Manager: Initial State');
    devLog('Current Theme:', currentTheme);
    devLog('Resolved Theme:', resolvedTheme);
    devLog('Data Attribute:', docElement.dataset.theme);
    devLog('Background Color:', style.getPropertyValue('--color-bg'));
    devLog('Text Color:', style.getPropertyValue('--color-text'));
    devLog('System Preference:', mediaQuery.matches ? 'dark' : 'light');
    devGroupEnd();
  }, 100);
  
  devLog('Theme Manager: Initialization complete');
}

/**
 * Toggle theme utility
 */
export function toggleTheme(): void {
  const newTheme: ThemeType = resolvedTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

/**
 * Get current contrast ratio for diagnostics
 */
export function getCurrentContrastRatio(): number {
  const docElement = document.documentElement;
  const style = getComputedStyle(docElement);
  
  const bgColor = style.getPropertyValue('--color-bg').trim();
  const textColor = style.getPropertyValue('--color-text').trim();
  
  if (!bgColor || !textColor) return 1;
  
  return contrastRatio(textColor, bgColor);
}

/** Called on boot AND whenever tokens change. */
export function applyLiveTokens(light: Record<string, string>, dark?: Record<string, string>) {
  applyTokens(light, 'root');
  if (dark) applyTokens(dark, 'dark');
}

/** Boot-time restore */
export function restoreTokens() {
  const saved = loadTokens();
  if (Object.keys(saved).length) applyTokens(saved, 'root');
}

// Export token maps for external use
export { LIGHT_TOKENS, DARK_TOKENS };