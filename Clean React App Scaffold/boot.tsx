// boot.tsx — enhanced token injector & theme guard with semantic tokens
const DARK = {
  bg: '#0B1020', 
  panel: '#0F162E', 
  text: '#E6ECFF', 
  accent: '#3B82F6',
  muted: '#A0ABCF', 
  border: '#202A44', 
  space4: '16px', 
  radiusMd: '10px', 
  font: '16px',
  
  // Interactive state colors
  hoverBg: '#1E293B',
  activeBg: '#334155',
  disabledBg: '#0F172A',
  disabledText: '#64748B',
  focusRing: '#60A5FA',
  
  // Component semantic tokens
  chipBg: '#1E293B',
  chipText: '#E2E8F0',
  chipHover: '#334155',
  chipActive: '#475569',
  chipBorder: '#475569',
  
  tabActiveText: '#60A5FA',
  tabActiveBg: '#1E293B',
  tabInactiveText: '#94A3B8',
  tabInactiveBg: 'transparent',
  tabHoverBg: '#1E293B',
  
  inputBg: '#1a223c',          /* slightly lighter background for better contrast */
  inputText: '#f1f5f9',        /* brighter text for improved readability */
  inputPlaceholder: '#94a3b8',
  inputBorder: '#334155',
  inputFocusBorder: '#60A5FA',
  inputDisabledBg: '#0b1020',
  inputDisabledText: '#64748b',
  
  buttonPrimaryBg: '#3B82F6',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryHover: '#2563EB',
  buttonPrimaryActive: '#1D4ED8',
  buttonPrimaryDisabled: '#1E293B',
  
  buttonSecondaryBg: 'transparent',
  buttonSecondaryText: '#E2E8F0',
  buttonSecondaryBorder: '#334155',
  buttonSecondaryHover: '#1E293B',
  buttonSecondaryActive: '#334155',
  buttonSecondaryDisabled: '#0F172A',
  
  cardBg: '#0F162E',
  cardBorder: '#334155',
  cardHover: '#1E293B',
  
  linkText: '#60A5FA',
  linkHover: '#93C5FD',
  linkActive: '#3B82F6',
  
  successBg: '#065F46',
  successText: '#D1FAE5',
  successBorder: '#10B981',
  
  warningBg: '#92400E',
  warningText: '#FEF3C7',
  warningBorder: '#F59E0B',
  
  errorBg: '#7F1D1D',
  errorText: '#FECACA',
  errorBorder: '#EF4444',
  
  infoBg: '#1E3A8A',
  infoText: '#DBEAFE',
  infoBorder: '#3B82F6',
  
  // Navigation tokens with WCAG AA contrast for dark mode
  navLinkText: '#E2E8F0',        // inactive nav links - bright enough for AA
  navLinkHoverBg: '#334155',     // subtle hover background
  navLinkHoverText: '#F1F5F9',   // brighter text on hover
  navActiveBg: '#3B82F6',        // same blue as light mode
  navActiveText: '#FFFFFF',      // white text - 8.59:1 contrast with blue
  navFocusRing: '#60A5FA'        // brighter focus ring for dark mode
};

const LIGHT = {
  bg: '#FFFFFF', 
  panel: '#F7FAFF', 
  text: '#0B1020', 
  accent: '#2563EB',
  muted: '#6B7280', 
  border: '#E5E7EB', 
  space4: '16px', 
  radiusMd: '10px', 
  font: '16px',
  
  // Interactive state colors
  hoverBg: '#F1F5F9',
  activeBg: '#E2E8F0',
  disabledBg: '#F8FAFC',
  disabledText: '#94A3B8',
  focusRing: '#3B82F6',
  
  // Component semantic tokens
  chipBg: '#F1F5F9',
  chipText: '#475569',
  chipHover: '#E2E8F0',
  chipActive: '#CBD5E1',
  chipBorder: '#CBD5E1',
  
  tabActiveText: '#2563EB',
  tabActiveBg: '#EFF6FF',
  tabInactiveText: '#6B7280',
  tabInactiveBg: 'transparent',
  tabHoverBg: '#F1F5F9',
  
  inputBg: '#ffffff',
  inputText: '#0f172a',        /* dark text for high contrast on white */
  inputPlaceholder: '#475569', /* darker placeholder for better visibility */
  inputBorder: '#cbd5e1',      /* consistent with CSS tokens */
  inputFocusBorder: '#3b82f6',
  inputDisabledBg: '#f1f5f9',
  inputDisabledText: '#94a3b8',
  
  buttonPrimaryBg: '#2563EB',
  buttonPrimaryText: '#FFFFFF',
  buttonPrimaryHover: '#1D4ED8',
  buttonPrimaryActive: '#1E40AF',
  buttonPrimaryDisabled: '#E5E7EB',
  
  buttonSecondaryBg: 'transparent',
  buttonSecondaryText: '#374151',
  buttonSecondaryBorder: '#D1D5DB',
  buttonSecondaryHover: '#F9FAFB',
  buttonSecondaryActive: '#F3F4F6',
  buttonSecondaryDisabled: '#F9FAFB',
  
  cardBg: '#FFFFFF',
  cardBorder: '#E5E7EB',
  cardHover: '#F9FAFB',
  
  linkText: '#2563EB',
  linkHover: '#1D4ED8',
  linkActive: '#1E40AF',
  
  successBg: '#F0FDF4',
  successText: '#166534',
  successBorder: '#22C55E',
  
  warningBg: '#FFFBEB',
  warningText: '#92400E',
  warningBorder: '#F59E0B',
  
  errorBg: '#FEF2F2',
  errorText: '#DC2626',
  errorBorder: '#EF4444',
  
  infoBg: '#EFF6FF',
  infoText: '#1E40AF',
  infoBorder: '#3B82F6',
  
  // Navigation tokens with WCAG AA contrast
  navLinkText: '#475569',        // inactive nav links - 4.54:1 on white
  navLinkHoverBg: '#F1F5F9',     // subtle hover background
  navLinkHoverText: '#1E293B',   // darker text on hover
  navActiveBg: '#3B82F6',        // high-contrast blue background
  navActiveText: '#FFFFFF',      // white text - 8.59:1 contrast with blue
  navFocusRing: '#3B82F6'        // consistent focus ring
};

const THEME_STYLE_ID = 'adsm-theme';

function css(vars: typeof DARK) {
  const themeName = vars === LIGHT ? 'light' : 'dark';
  
  return `:root{
/* Base tokens */
--color-bg:${vars.bg};
--color-panel:${vars.panel};
--color-text:${vars.text};
--color-accent:${vars.accent};
--color-muted:${vars.muted};
--color-border:${vars.border};
--space-4:${vars.space4};
--radius-md:${vars.radiusMd};
--font-size-base:${vars.font};

/* Legacy compatibility tokens */
--button-bg:${vars.accent};
--button-fg:${vars.text};
--color-background:${vars.bg};
--color-foreground:${vars.text};
--color-primary:${vars.accent};
--color-secondary:${vars.muted};
--button-border:${vars.border};
--button-bg-hover:${vars.accent}dd;

/* Interactive state tokens */
--color-hover-bg:${vars.hoverBg};
--color-active-bg:${vars.activeBg};
--color-disabled-bg:${vars.disabledBg};
--color-disabled-text:${vars.disabledText};
--color-focus-ring:${vars.focusRing};

/* Component semantic tokens - Chips */
--chip-bg:${vars.chipBg};
--chip-text:${vars.chipText};
--chip-hover:${vars.chipHover};
--chip-active:${vars.chipActive};
--chip-border:${vars.chipBorder};

/* Component semantic tokens - Tabs */
--tab-active-fg:${vars.tabActiveText};
--tab-active-bg:${vars.tabActiveBg};
--tab-inactive-fg:${vars.tabInactiveText};
--tab-inactive-bg:${vars.tabInactiveBg};
--tab-hover-bg:${vars.tabHoverBg};

/* Component semantic tokens - Inputs */
--input-bg:${vars.inputBg};
--input-text:${vars.inputText};
--input-placeholder:${vars.inputPlaceholder};
--input-border:${vars.inputBorder};
--input-focus-border:${vars.inputFocusBorder};
--input-disabled-bg:${vars.inputDisabledBg};
--input-disabled-text:${vars.inputDisabledText};

/* Component semantic tokens - Buttons */
--button-primary-bg:${vars.buttonPrimaryBg};
--button-primary-text:${vars.buttonPrimaryText};
--button-primary-hover:${vars.buttonPrimaryHover};
--button-primary-active:${vars.buttonPrimaryActive};
--button-primary-disabled:${vars.buttonPrimaryDisabled};

--button-secondary-bg:${vars.buttonSecondaryBg};
--button-secondary-text:${vars.buttonSecondaryText};
--button-secondary-border:${vars.buttonSecondaryBorder};
--button-secondary-hover:${vars.buttonSecondaryHover};
--button-secondary-active:${vars.buttonSecondaryActive};
--button-secondary-disabled:${vars.buttonSecondaryDisabled};

/* Component semantic tokens - Cards */
--card-bg:${vars.cardBg};
--card-border:${vars.cardBorder};
--card-hover:${vars.cardHover};

/* Component semantic tokens - Links */
--link-text:${vars.linkText};
--link-hover:${vars.linkHover};
--link-active:${vars.linkActive};

/* Component semantic tokens - Status Colors */
--success-bg:${vars.successBg};
--success-text:${vars.successText};
--success-border:${vars.successBorder};

--warning-bg:${vars.warningBg};
--warning-text:${vars.warningText};
--warning-border:${vars.warningBorder};

--error-bg:${vars.errorBg};
--error-text:${vars.errorText};
--error-border:${vars.errorBorder};

--info-bg:${vars.infoBg};
--info-text:${vars.infoText};
--info-border:${vars.infoBorder};

/* Component semantic tokens - Navigation */
--nav-link-text:${vars.navLinkText};
--nav-link-hover-bg:${vars.navLinkHoverBg};
--nav-link-hover-text:${vars.navLinkHoverText};
--nav-active-bg:${vars.navActiveBg};
--nav-active-text:${vars.navActiveText};
--nav-focus-ring:${vars.navFocusRing};
}

body{
background:var(--color-bg);
color:var(--color-text);
}

html[data-theme="${themeName}"] {
/* Base tokens */
--color-bg:${vars.bg};
--color-panel:${vars.panel};
--color-text:${vars.text};
--color-accent:${vars.accent};
--color-muted:${vars.muted};
--color-border:${vars.border};
--space-4:${vars.space4};
--radius-md:${vars.radiusMd};
--font-size-base:${vars.font};

/* Legacy compatibility tokens */
--button-bg:${vars.accent};
--button-fg:${vars.text};
--color-background:${vars.bg};
--color-foreground:${vars.text};
--color-primary:${vars.accent};
--color-secondary:${vars.muted};
--button-border:${vars.border};
--button-bg-hover:${vars.accent}dd;

/* Interactive state tokens */
--color-hover-bg:${vars.hoverBg};
--color-active-bg:${vars.activeBg};
--color-disabled-bg:${vars.disabledBg};
--color-disabled-text:${vars.disabledText};
--color-focus-ring:${vars.focusRing};

/* Component semantic tokens */
--chip-bg:${vars.chipBg};
--chip-text:${vars.chipText};
--chip-hover:${vars.chipHover};
--chip-active:${vars.chipActive};
--chip-border:${vars.chipBorder};

--tab-active-fg:${vars.tabActiveText};
--tab-active-bg:${vars.tabActiveBg};
--tab-inactive-fg:${vars.tabInactiveText};
--tab-inactive-bg:${vars.tabInactiveBg};
--tab-hover-bg:${vars.tabHoverBg};

--input-bg:${vars.inputBg};
--input-text:${vars.inputText};
--input-placeholder:${vars.inputPlaceholder};
--input-border:${vars.inputBorder};
--input-focus-border:${vars.inputFocusBorder};
--input-disabled-bg:${vars.inputDisabledBg};
--input-disabled-text:${vars.inputDisabledText};

--button-primary-bg:${vars.buttonPrimaryBg};
--button-primary-text:${vars.buttonPrimaryText};
--button-primary-hover:${vars.buttonPrimaryHover};
--button-primary-active:${vars.buttonPrimaryActive};
--button-primary-disabled:${vars.buttonPrimaryDisabled};

--button-secondary-bg:${vars.buttonSecondaryBg};
--button-secondary-text:${vars.buttonSecondaryText};
--button-secondary-border:${vars.buttonSecondaryBorder};
--button-secondary-hover:${vars.buttonSecondaryHover};
--button-secondary-active:${vars.buttonSecondaryActive};
--button-secondary-disabled:${vars.buttonSecondaryDisabled};

--card-bg:${vars.cardBg};
--card-border:${vars.cardBorder};
--card-hover:${vars.cardHover};

--link-text:${vars.linkText};
--link-hover:${vars.linkHover};
--link-active:${vars.linkActive};

--success-bg:${vars.successBg};
--success-text:${vars.successText};
--success-border:${vars.successBorder};

--warning-bg:${vars.warningBg};
--warning-text:${vars.warningText};
--warning-border:${vars.warningBorder};

--error-bg:${vars.errorBg};
--error-text:${vars.errorText};
--error-border:${vars.errorBorder};

--info-bg:${vars.infoBg};
--info-text:${vars.infoText};
--info-border:${vars.infoBorder};

/* Navigation semantic tokens */
--nav-link-text:${vars.navLinkText};
--nav-link-hover-bg:${vars.navLinkHoverBg};
--nav-link-hover-text:${vars.navLinkHoverText};
--nav-active-bg:${vars.navActiveBg};
--nav-active-text:${vars.navActiveText};
--nav-focus-ring:${vars.navFocusRing};
}`;
}

export function ensureThemeTokens(theme?: 'light' | 'dark') {
  // Fallback if storage says "auto" or nothing - never allow auto
  const stored = (localStorage.getItem('adsm:theme') || 'dark').toLowerCase();
  const mode: 'light' | 'dark' = (theme || (stored === 'light' || stored === 'dark' ? stored : 'dark')) as any;
  const vars = mode === 'light' ? LIGHT : DARK;

  // Set data-theme attribute
  document.documentElement.setAttribute('data-theme', mode);

  let style = document.getElementById(THEME_STYLE_ID) as HTMLStyleElement | null;
  if (!style) { 
    style = document.createElement('style'); 
    style.id = THEME_STYLE_ID; 
    document.head.appendChild(style); 
  }
  
  // Always keep it last for highest precedence in static hosting
  document.head.appendChild(style);
  
  const newCss = css(vars);
  if (style.textContent !== newCss) { 
    style.textContent = newCss; 
  }

  // Store the clean theme value (never auto)
  if (localStorage.getItem('adsm:theme') !== mode) {
    localStorage.setItem('adsm:theme', mode);
  }

  // Apply theme overrides if they exist
  try {
    const overrides = localStorage.getItem(`adsm:overrides:${mode}`);
    if (overrides) {
      const parsed = JSON.parse(overrides);
      const root = document.getElementById('adsm-root') || document.documentElement;
      
      Object.entries(parsed).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(key, value);
        }
      });
    }
  } catch (error) {
    console.warn('Failed to apply theme overrides:', error);
  }

  // Dispatch tokens ready event
  document.dispatchEvent(new CustomEvent('adsm:tokens:ready', { detail: { theme: mode, vars } }));
}

// Run as early as possible
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ensureThemeTokens());
} else { 
  ensureThemeTokens(); 
}

// Optional: expose a small API for your theme toggle
export function setTheme(mode: 'light' | 'dark') {
  localStorage.setItem('adsm:theme', mode); 
  ensureThemeTokens(mode);
  // Dispatch event for components that need to react
  document.dispatchEvent(new CustomEvent('adsm:theme:changed', { detail: mode }));
}

// Export theme getter
export function getTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('adsm:theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark'; // Never return auto
}

// Get all available semantic tokens
export function getSemanticTokens(): Record<string, string> {
  const mode = getTheme();
  const vars = mode === 'light' ? LIGHT : DARK;
  
  return {
    // Interactive states
    '--color-hover-bg': vars.hoverBg,
    '--color-active-bg': vars.activeBg,
    '--color-disabled-bg': vars.disabledBg,
    '--color-disabled-text': vars.disabledText,
    '--color-focus-ring': vars.focusRing,
    
    // Component tokens
    '--chip-bg': vars.chipBg,
    '--chip-text': vars.chipText,
    '--chip-hover': vars.chipHover,
    '--chip-active': vars.chipActive,
    '--chip-border': vars.chipBorder,
    
    '--tab-active-fg': vars.tabActiveText,
    '--tab-active-bg': vars.tabActiveBg,
    '--tab-inactive-fg': vars.tabInactiveText,
    '--tab-inactive-bg': vars.tabInactiveBg,
    '--tab-hover-bg': vars.tabHoverBg,
    
    '--input-bg': vars.inputBg,
    '--input-text': vars.inputText,
    '--input-placeholder': vars.inputPlaceholder,
    '--input-border': vars.inputBorder,
    '--input-focus-border': vars.inputFocusBorder,
    '--input-disabled-bg': vars.inputDisabledBg,
    '--input-disabled-text': vars.inputDisabledText,
    
    '--button-primary-bg': vars.buttonPrimaryBg,
    '--button-primary-text': vars.buttonPrimaryText,
    '--button-primary-hover': vars.buttonPrimaryHover,
    '--button-primary-active': vars.buttonPrimaryActive,
    '--button-primary-disabled': vars.buttonPrimaryDisabled,
    
    '--button-secondary-bg': vars.buttonSecondaryBg,
    '--button-secondary-text': vars.buttonSecondaryText,
    '--button-secondary-border': vars.buttonSecondaryBorder,
    '--button-secondary-hover': vars.buttonSecondaryHover,
    '--button-secondary-active': vars.buttonSecondaryActive,
    '--button-secondary-disabled': vars.buttonSecondaryDisabled,
    
    '--card-bg': vars.cardBg,
    '--card-border': vars.cardBorder,
    '--card-hover': vars.cardHover,
    
    '--link-text': vars.linkText,
    '--link-hover': vars.linkHover,
    '--link-active': vars.linkActive,
    
    '--success-bg': vars.successBg,
    '--success-text': vars.successText,
    '--success-border': vars.successBorder,
    
    '--warning-bg': vars.warningBg,
    '--warning-text': vars.warningText,
    '--warning-border': vars.warningBorder,
    
    '--error-bg': vars.errorBg,
    '--error-text': vars.errorText,
    '--error-border': vars.errorBorder,
    
    '--info-bg': vars.infoBg,
    '--info-text': vars.infoText,
    '--info-border': vars.infoBorder,
    
    // Navigation tokens
    '--nav-link-text': vars.navLinkText,
    '--nav-link-hover-bg': vars.navLinkHoverBg,
    '--nav-link-hover-text': vars.navLinkHoverText,
    '--nav-active-bg': vars.navActiveBg,
    '--nav-active-text': vars.navActiveText,
    '--nav-focus-ring': vars.navFocusRing
  };
}

// Initialize immediately
ensureThemeTokens();