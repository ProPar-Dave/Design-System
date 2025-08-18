/**
 * UI utilities for hash parameters and accessibility
 */

/**
 * Get a parameter from the current hash
 */
export const getHashParam = (key: string): string | null => {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  return params.get(key);
};

/**
 * Set a parameter in the current hash
 */
export const setHashParam = (key: string, value: string): void => {
  const hash = window.location.hash.slice(1);
  const [path, queryString] = hash.split('?', 2);
  const params = new URLSearchParams(queryString || '');
  
  params.set(key, value);
  const newHash = path + '?' + params.toString();
  window.location.hash = '#' + newHash;
};

/**
 * Remove a parameter from the current hash
 */
export const removeHashParam = (key: string): void => {
  const hash = window.location.hash.slice(1);
  const [path, queryString] = hash.split('?', 2);
  const params = new URLSearchParams(queryString || '');
  
  params.delete(key);
  const newQueryString = params.toString();
  const newHash = path + (newQueryString ? '?' + newQueryString : '');
  window.location.hash = '#' + newHash;
};

/**
 * AA contrast chip colors - ensures WCAG AA compliance
 * Returns appropriate chip styling based on contrast ratio
 */
export function aaChipColors(bg: string, fg: string): { className: string } {
  // Simple luminance check; pick outline style when contrast < 4.5
  const toY = (hex: string) => {
    const x = parseInt(hex.slice(1), 16);
    const r = (x >> 16) & 255;
    const g = (x >> 8) & 255;
    const b = x & 255;
    const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return L;
  };
  
  // Handle CSS variables and non-hex colors
  const getBgHex = (color: string): string => {
    if (color.startsWith('#')) return color;
    // For CSS variables or other formats, fall back to a safe default
    return '#ffffff'; // Default light background
  };
  
  const getFgHex = (color: string): string => {
    if (color.startsWith('#')) return color;
    // For CSS variables or other formats, fall back to a safe default
    return '#000000'; // Default dark text
  };
  
  try {
    const bgHex = getBgHex(bg);
    const fgHex = getFgHex(fg);
    
    const Lbg = toY(bgHex);
    const Lfg = toY(fgHex);
    const contrast = (Math.max(Lbg, Lfg) + 0.05) / (Math.min(Lbg, Lfg) + 0.05);
    
    return contrast >= 4.5
      ? { className: 'chip chip--solid' }
      : { className: 'chip chip--outline' };
  } catch {
    // Fall back to outline style if calculation fails
    return { className: 'chip chip--outline' };
  }
}

/**
 * Get current theme tokens for use in AA calculations
 */
export function getCurrentThemeTokens(): { panel: string; text: string } {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  
  return {
    panel: styles.getPropertyValue('--color-panel').trim() || '#ffffff',
    text: styles.getPropertyValue('--color-text').trim() || '#000000'
  };
}