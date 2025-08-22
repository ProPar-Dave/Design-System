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

/**
 * Validates that all input elements in the app use consistent semantic token references
 * Returns a list of elements that don't follow the token system
 */
export function validateInputTokenConsistency(): Array<{element: Element, issues: string[]}> {
  const violations: Array<{element: Element, issues: string[]}> = [];
  
  // Get all input elements (excluding special types)
  const inputs = document.querySelectorAll('input:not([type="color"]):not([type="range"]):not([type="checkbox"]):not([type="radio"])');
  
  inputs.forEach(input => {
    const computedStyle = window.getComputedStyle(input);
    const issues: string[] = [];
    
    // Check if using semantic input tokens
    const bgColor = computedStyle.backgroundColor;
    const textColor = computedStyle.color;
    const borderColor = computedStyle.borderColor;
    
    // Get expected token values
    const expectedBg = getComputedStyle(document.documentElement).getPropertyValue('--input-bg').trim();
    const expectedText = getComputedStyle(document.documentElement).getPropertyValue('--input-text').trim();
    const expectedBorder = getComputedStyle(document.documentElement).getPropertyValue('--input-border').trim();
    
    // Convert hex/rgb to comparable format and check if they match semantic tokens
    if (!colorsMatch(bgColor, expectedBg)) {
      issues.push(`Background color doesn't use --input-bg token`);
    }
    
    if (!colorsMatch(textColor, expectedText)) {
      issues.push(`Text color doesn't use --input-text token`);
    }
    
    if (!colorsMatch(borderColor, expectedBorder)) {
      issues.push(`Border color doesn't use --input-border token`);
    }
    
    // Check for hardcoded styles in style attribute
    const styleAttr = input.getAttribute('style') || '';
    if (styleAttr.includes('background:') && !styleAttr.includes('var(--input-bg)')) {
      issues.push(`Hardcoded background in style attribute`);
    }
    if (styleAttr.includes('color:') && !styleAttr.includes('var(--input-text)')) {
      issues.push(`Hardcoded text color in style attribute`);
    }
    
    if (issues.length > 0) {
      violations.push({ element: input, issues });
    }
  });
  
  return violations;
}

/**
 * Simple color comparison utility
 * Converts colors to a normalized format for comparison
 */
function colorsMatch(color1: string, color2: string): boolean {
  // This is a simplified comparison - in a real app you might want more robust color parsing
  const normalize = (color: string) => {
    return color.replace(/\s+/g, '').toLowerCase();
  };
  
  return normalize(color1) === normalize(color2);
}

/**
 * Applies semantic input styling to an element programmatically
 * Useful for ensuring consistency across dynamically created inputs
 */
export function applySemanticInputStyling(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): void {
  // Remove any conflicting inline styles
  element.style.removeProperty('background');
  element.style.removeProperty('background-color');
  element.style.removeProperty('color');
  element.style.removeProperty('border-color');
  
  // Apply semantic token styles
  element.style.background = 'var(--input-bg)';
  element.style.color = 'var(--input-text)';
  element.style.borderColor = 'var(--input-border)';
  element.style.borderWidth = '2px';
  element.style.borderStyle = 'solid';
  element.style.borderRadius = 'var(--radius-md)';
  element.style.padding = '12px 16px';
  element.style.fontSize = 'var(--font-size-base)';
  element.style.fontFamily = 'inherit';
  element.style.transition = 'all 0.2s ease';
  element.style.minHeight = '44px';
  element.style.boxSizing = 'border-box';
  
  // Add the semantic class
  element.classList.add('adsm-input');
  
  // Ensure focus/blur handlers use semantic tokens
  element.addEventListener('focus', () => {
    element.style.outline = '3px solid var(--color-ring)';
    element.style.outlineOffset = '2px';
    element.style.borderColor = 'var(--input-focus-border)';
  });
  
  element.addEventListener('blur', () => {
    element.style.outline = 'none';
    element.style.outlineOffset = '0';
    element.style.borderColor = 'var(--input-border)';
  });
}