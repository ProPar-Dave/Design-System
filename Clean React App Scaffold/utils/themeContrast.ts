// Theme contrast verification and auto-correction utilities

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse CSS color value to RGB
 */
function parseColor(color: string): ColorRGB | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16)
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }
  }
  
  // Handle rgb() colors
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }
  
  // Handle rgba() colors
  const rgbaMatch = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3])
    };
  }
  
  // Handle named colors (basic ones)
  const namedColors: Record<string, ColorRGB> = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 128, b: 0 },
    blue: { r: 0, g: 0, b: 255 }
  };
  
  return namedColors[color.toLowerCase()] || null;
}

/**
 * Calculate relative luminance of a color
 */
function getRelativeLuminance(color: ColorRGB): number {
  const { r, g, b } = color;
  
  const toLinear = (channel: number): number => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  
  const R = toLinear(r);
  const G = toLinear(g);
  const B = toLinear(b);
  
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  
  if (!rgb1 || !rgb2) {
    console.warn('Failed to parse colors for contrast calculation:', color1, color2);
    return 1; // Worst case
  }
  
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standard
 */
export function meetsWCAGAA(contrastRatio: number): boolean {
  return contrastRatio >= 4.5;
}

/**
 * Get computed CSS custom property value
 */
function getComputedCustomProperty(property: string): string {
  const root = document.documentElement;
  return getComputedStyle(root).getPropertyValue(property).trim();
}

/**
 * Get theme contrast diagnostics
 */
export function getThemeContrastDiagnostics() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  
  const background = getComputedCustomProperty('--color-background') || 
                    getComputedCustomProperty('--background');
  const foreground = getComputedCustomProperty('--color-foreground') || 
                    getComputedCustomProperty('--foreground');
  const text = getComputedCustomProperty('--color-text');
  
  const diagnostics = {
    theme: currentTheme,
    colors: {
      background,
      foreground,
      text
    },
    contrast: {
      'text-on-background': 0,
      'foreground-on-background': 0
    },
    passes: {
      'text-on-background': false,
      'foreground-on-background': false
    }
  };
  
  // Calculate contrast ratios
  if (background && text) {
    diagnostics.contrast['text-on-background'] = calculateContrastRatio(text, background);
    diagnostics.passes['text-on-background'] = meetsWCAGAA(diagnostics.contrast['text-on-background']);
  }
  
  if (background && foreground) {
    diagnostics.contrast['foreground-on-background'] = calculateContrastRatio(foreground, background);
    diagnostics.passes['foreground-on-background'] = meetsWCAGAA(diagnostics.contrast['foreground-on-background']);
  }
  
  return diagnostics;
}

/**
 * Ensure theme has proper contrast - auto-correct if needed
 */
export function ensureThemeContrast(): boolean {
  const diagnostics = getThemeContrastDiagnostics();
  const isLightTheme = diagnostics.theme === 'light';
  let correctionMade = false;
  
  console.log('Theme contrast diagnostics:', diagnostics);
  
  // Check text contrast
  if (!diagnostics.passes['text-on-background']) {
    const safeDarkText = '#0B1020';
    const safeLightText = '#E2E8F0';
    const safeText = isLightTheme ? safeDarkText : safeLightText;
    
    document.documentElement.style.setProperty('--color-text', safeText);
    document.documentElement.style.setProperty('--color-foreground', safeText);
    
    console.log(`Auto-corrected text color to ${safeText} for ${diagnostics.theme} theme`);
    correctionMade = true;
  }
  
  // Check background contrast
  if (!diagnostics.passes['foreground-on-background']) {
    const safeLight = '#FFFFFF';
    const safeDark = '#0B1020';
    const safeBackground = isLightTheme ? safeLight : safeDark;
    
    document.documentElement.style.setProperty('--color-background', safeBackground);
    document.documentElement.style.setProperty('--background', safeBackground);
    
    console.log(`Auto-corrected background color to ${safeBackground} for ${diagnostics.theme} theme`);
    correctionMade = true;
  }
  
  if (correctionMade) {
    // Re-run diagnostics to verify fix
    const updatedDiagnostics = getThemeContrastDiagnostics();
    console.log('Updated contrast diagnostics:', updatedDiagnostics);
    
    // Dispatch event for diagnostics to pick up
    document.dispatchEvent(new CustomEvent('adsm:theme:contrast-corrected', {
      detail: { original: diagnostics, updated: updatedDiagnostics }
    }));
  }
  
  return correctionMade;
}

/**
 * Make this available globally for debugging
 */
declare global {
  interface Window {
    __adsmContrast: (fg: string, bg: string) => number;
    __adsmThemeCheck: () => any;
  }
}

if (typeof window !== 'undefined') {
  window.__adsmContrast = calculateContrastRatio;
  window.__adsmThemeCheck = getThemeContrastDiagnostics;
}