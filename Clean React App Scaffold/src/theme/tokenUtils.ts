const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const CSS_KEYWORD = /^(transparent|currentColor|inherit|initial|unset|none)$/i;
const RGB = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i;
const RGBA = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i;
const HSL = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/i;
const HSLA = /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/i;

export function normalizeColor(v: string): string {
  const value = (v || "").trim();
  
  // Empty values are valid (resets to default)
  if (!value) return value;
  
  // Hex colors
  if (HEX.test(value)) return value.toLowerCase();
  
  // CSS keywords
  if (CSS_KEYWORD.test(value)) return value.toLowerCase();
  
  // RGB/RGBA colors
  if (RGB.test(value) || RGBA.test(value)) return value;
  
  // HSL/HSLA colors  
  if (HSL.test(value) || HSLA.test(value)) return value;
  
  // CSS variables
  if (value.startsWith('var(') && value.endsWith(')')) return value;
  
  // If it starts with # but isn't valid hex, throw
  if (value.startsWith("#")) {
    throw new Error(`Invalid hex color: "${v}"`);
  }
  
  // For other values, be permissive (could be CSS functions, etc.)
  return value;
}

export function setCssVar(name: string, value: string): void {
  if (!name || typeof name !== 'string') {
    throw new Error(`Invalid token name: "${name}"`);
  }
  
  // Ensure name starts with --
  const cssVarName = name.startsWith("--") ? name : `--${name}`;
  
  try {
    document.documentElement.style.setProperty(cssVarName, value);
  } catch (error) {
    throw new Error(`Failed to set CSS variable ${cssVarName}: ${error}`);
  }
}

export function writeToken(name: string, rawValue: string): void {
  try {
    const value = normalizeColor(rawValue);
    setCssVar(name, value);
    
    // Persist to localStorage with error handling
    try {
      const key = "adsm:tokens:v1";
      const existing = localStorage.getItem(key);
      const stash = existing ? JSON.parse(existing) : {};
      
      if (value === "" || value == null) {
        // Remove token if empty
        delete stash[name];
      } else {
        stash[name] = value;
      }
      
      localStorage.setItem(key, JSON.stringify(stash));
    } catch (storageError) {
      // Non-fatal in Make/preview contexts
      console.warn(`[tokenUtils] Failed to persist token ${name}:`, storageError);
    }
    
    // Broadcast change event
    window.dispatchEvent(new CustomEvent("adsm:tokens:changed", { 
      detail: { name, value, success: true } 
    }));
    
  } catch (error) {
    // Broadcast error event
    window.dispatchEvent(new CustomEvent("adsm:tokens:changed", { 
      detail: { name, value: rawValue, success: false, error: (error as Error).message } 
    }));
    throw error;
  }
}

// Bulk token operations
export function writeTokens(tokens: Record<string, string>): void {
  const errors: { name: string; error: string }[] = [];
  
  Object.entries(tokens).forEach(([name, value]) => {
    try {
      writeToken(name, value);
    } catch (error) {
      errors.push({ name, error: (error as Error).message });
    }
  });
  
  if (errors.length > 0) {
    console.warn('[tokenUtils] Some tokens failed to write:', errors);
    throw new Error(`Failed to write ${errors.length} tokens`);
  }
}

// Get current token value from CSS
export function getTokenValue(name: string): string {
  const cssVarName = name.startsWith("--") ? name : `--${name}`;
  const computed = getComputedStyle(document.documentElement);
  return computed.getPropertyValue(cssVarName).trim();
}

// Get all tokens from localStorage
export function getAllTokens(): Record<string, string> {
  try {
    const key = "adsm:tokens:v1"; 
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Reset token to default (remove override)
export function resetToken(name: string): void {
  try {
    // Remove from localStorage
    const key = "adsm:tokens:v1";
    const existing = localStorage.getItem(key);
    const stash = existing ? JSON.parse(existing) : {};
    delete stash[name];
    localStorage.setItem(key, JSON.stringify(stash));
    
    // Remove CSS variable
    const cssVarName = name.startsWith("--") ? name : `--${name}`;
    document.documentElement.style.removeProperty(cssVarName);
    
    // Broadcast change
    window.dispatchEvent(new CustomEvent("adsm:tokens:changed", { 
      detail: { name, value: "", reset: true, success: true } 
    }));
  } catch (error) {
    console.warn(`[tokenUtils] Failed to reset token ${name}:`, error);
  }
}

// Validate token name
export function isValidTokenName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  // CSS custom property names must start with -- and contain valid characters
  const cssVarName = name.startsWith("--") ? name : `--${name}`;
  return /^--[a-zA-Z0-9-_]+$/.test(cssVarName);
}

// Export/import functionality
export function exportTokens(): string {
  const tokens = getAllTokens();
  return JSON.stringify(tokens, null, 2);
}

export function importTokens(jsonString: string): void {
  try {
    const tokens = JSON.parse(jsonString);
    if (typeof tokens !== 'object' || tokens === null) {
      throw new Error('Invalid token format');
    }
    
    writeTokens(tokens);
  } catch (error) {
    throw new Error(`Failed to import tokens: ${(error as Error).message}`);
  }
}