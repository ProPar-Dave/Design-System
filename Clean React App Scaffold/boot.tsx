// boot.tsx — token injector & theme guard
const DARK = {
  bg: '#0B1020', 
  panel: '#0F162E', 
  text: '#E6ECFF', 
  accent: '#3B82F6',
  muted: '#A0ABCF', 
  border: '#202A44', 
  space4: '16px', 
  radiusMd: '10px', 
  font: '16px'
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
  font: '16px'
};

const THEME_STYLE_ID = 'adsm-theme';

function css(vars: typeof DARK) {
  return `:root{
--color-bg:${vars.bg};
--color-panel:${vars.panel};
--color-text:${vars.text};
--color-accent:${vars.accent};
--color-muted:${vars.muted};
--color-border:${vars.border};
--space-4:${vars.space4};
--radius-md:${vars.radiusMd};
--font-size-base:${vars.font};
--button-bg:${vars.accent};
--button-fg:${vars.text};
--color-background:${vars.bg};
--color-foreground:${vars.text};
--color-primary:${vars.accent};
--color-secondary:${vars.muted};
--button-border:${vars.border};
--button-bg-hover:${vars.accent}dd;
}
body{
background:var(--color-bg);
color:var(--color-text);
}
html[data-theme="${vars === LIGHT ? 'light' : 'dark'}"] {
--color-bg:${vars.bg};
--color-panel:${vars.panel};
--color-text:${vars.text};
--color-accent:${vars.accent};
--color-muted:${vars.muted};
--color-border:${vars.border};
--space-4:${vars.space4};
--radius-md:${vars.radiusMd};
--font-size-base:${vars.font};
--button-bg:${vars.accent};
--button-fg:${vars.text};
--color-background:${vars.bg};
--color-foreground:${vars.text};
--color-primary:${vars.accent};
--color-secondary:${vars.muted};
--button-border:${vars.border};
--button-bg-hover:${vars.accent}dd;
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

// Initialize immediately
ensureThemeTokens();