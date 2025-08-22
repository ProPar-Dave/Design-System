// Common types and utilities for the diagnostics system

export interface ComponentInfo {
  id: string;
  name: string;
  content?: string;
  path?: string;
  level?: 'atom' | 'molecule' | 'organism';
  tags?: string[];
  dependencies?: string[];
}

export interface AuditResult {
  passed: boolean;
  category: 'accessibility' | 'architecture' | 'tokens' | 'performance' | 'regression';
  title: string;
  description: string;
  details: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    component: string;
    line?: number;
  }>;
  metrics?: {
    duration: number;
    checked: number;
    errors: number;
    warnings: number;
    [key: string]: any; // Allow additional metric properties
  };
  metadata?: {
    key?: string;
    category?: string;
    priority?: string;
    estimatedDuration?: number;
    actualDuration?: number;
    timestamp?: string;
    error?: string;
    [key: string]: any; // Allow additional metadata properties
  };
}

// Application metadata utilities
export function getAppVersion(): string {
  try {
    // Use Vite's import.meta.env for environment variables in browser
    const version = import.meta.env?.VITE_APP_VERSION || 
                   (globalThis as any).__ADSM_VERSION__ ||
                   '2.1.0'; // Default version
    
    return version;
  } catch (error) {
    console.warn('Failed to get app version:', error);
    return '2.1.0';
  }
}

export interface BrowserInfo {
  userAgent: string;
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  cookieEnabled: boolean;
  javaEnabled: boolean;
  language: string;
  languages: readonly string[];
  onLine: boolean;
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;
  timezone: string;
  touchSupport: boolean;
  webGL: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  webWorkers: boolean;
  serviceWorkers: boolean;
}

export function getBrowserInfo(): BrowserInfo {
  const nav = navigator;
  const screen = window.screen;
  
  // Detect browser name and version
  const userAgent = nav.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let engineName = 'Unknown';

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browserName = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    engineName = 'Blink';
  } else if (userAgent.includes('Firefox')) {
    browserName = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    engineName = 'Gecko';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browserName = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    engineName = 'WebKit';
  } else if (userAgent.includes('Edg')) {
    browserName = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    engineName = 'Blink';
  }

  // Detect platform
  let platform = 'Unknown';
  if (userAgent.includes('Win')) platform = 'Windows';
  else if (userAgent.includes('Mac')) platform = 'macOS';
  else if (userAgent.includes('Linux')) platform = 'Linux';
  else if (userAgent.includes('Android')) platform = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) platform = 'iOS';

  // Detect mobile
  const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  // Check touch support
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check WebGL support
  let webGLSupport = false;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    webGLSupport = !!context;
  } catch (error) {
    webGLSupport = false;
  }

  // Check storage support
  let localStorageSupport = false;
  let sessionStorageSupport = false;
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    localStorageSupport = true;
  } catch (error) {
    localStorageSupport = false;
  }

  try {
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
    sessionStorageSupport = true;
  } catch (error) {
    sessionStorageSupport = false;
  }

  // Check Web Workers support
  const webWorkersSupport = typeof Worker !== 'undefined';

  // Check Service Workers support
  const serviceWorkersSupport = 'serviceWorker' in navigator;

  // Get timezone
  let timezone = 'Unknown';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    timezone = 'Unknown';
  }

  return {
    userAgent,
    name: browserName,
    version: browserVersion,
    engine: engineName,
    platform,
    mobile,
    cookieEnabled: nav.cookieEnabled,
    javaEnabled: (nav as any).javaEnabled ? (nav as any).javaEnabled() : false,
    language: nav.language,
    languages: nav.languages,
    onLine: nav.onLine,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    timezone,
    touchSupport,
    webGL: webGLSupport,
    localStorage: localStorageSupport,
    sessionStorage: sessionStorageSupport,
    webWorkers: webWorkersSupport,
    serviceWorkers: serviceWorkersSupport
  };
}

// Utility functions for common audit operations
export function parseColorValue(colorString: string): { r: number; g: number; b: number } | null {
  // Handle hex colors
  const hexMatch = colorString.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16)
      };
    } else {
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      };
    }
  }

  // Handle rgb() colors
  const rgbMatch = colorString.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }

  // Handle rgba() colors
  const rgbaMatch = colorString.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]),
      g: parseInt(rgbaMatch[2]),
      b: parseInt(rgbaMatch[3])
    };
  }

  return null;
}

export function calculateContrastRatio(color1: { r: number; g: number; b: number }, color2: { r: number; g: number; b: number }): number {
  // Calculate relative luminance
  function getLuminance(color: { r: number; g: number; b: number }): number {
    const { r, g, b } = color;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

export function getWCAGLevel(contrastRatio: number): 'AAA' | 'AA' | 'fail' {
  if (contrastRatio >= 7) return 'AAA';
  if (contrastRatio >= 4.5) return 'AA';
  return 'fail';
}

// Token extraction utilities
export function extractTokenFromCSSValue(cssValue: string): string | null {
  const varMatch = cssValue.match(/var\((--[^,)]+)/);
  return varMatch ? varMatch[1] : null;
}

export function isRawColorValue(value: string): boolean {
  return /#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(/i.test(value);
}

export function isRawSpacingValue(value: string): boolean {
  return /\b\d+px\b|\b\d+rem\b|\b\d+em\b/.test(value);
}

// DOM utilities for audits
export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  
  return rect.width > 0 && 
         rect.height > 0 && 
         style.display !== 'none' && 
         style.visibility !== 'hidden' &&
         style.opacity !== '0';
}

export function isElementInteractive(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  const tabindex = element.getAttribute('tabindex');
  
  return ['button', 'a', 'input', 'select', 'textarea'].includes(tagName) ||
         ['button', 'link', 'tab', 'menuitem'].includes(role || '') ||
         (tabindex !== null && tabindex !== '-1');
}

export function hasAccessibleName(element: HTMLElement): boolean {
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const textContent = element.textContent?.trim();
  const title = element.getAttribute('title');
  
  return !!(ariaLabel || ariaLabelledBy || textContent || title);
}

// Result aggregation utilities
export function aggregateAuditResults(results: AuditResult[]): {
  totalAudits: number;
  passedAudits: number;
  failedAudits: number;
  totalErrors: number;
  totalWarnings: number;
  totalChecked: number;
  averageDuration: number;
  overallHealthScore: number;
} {
  const totalAudits = results.length;
  const passedAudits = results.filter(r => r.passed).length;
  const failedAudits = totalAudits - passedAudits;
  
  const totalErrors = results.reduce((sum, r) => sum + (r.metrics?.errors || 0), 0);
  const totalWarnings = results.reduce((sum, r) => sum + (r.metrics?.warnings || 0), 0);
  const totalChecked = results.reduce((sum, r) => sum + (r.metrics?.checked || 0), 0);
  const totalDuration = results.reduce((sum, r) => sum + (r.metrics?.duration || 0), 0);
  
  const averageDuration = totalAudits > 0 ? totalDuration / totalAudits : 0;
  const overallHealthScore = totalAudits > 0 ? Math.round((passedAudits / totalAudits) * 100) : 100;
  
  return {
    totalAudits,
    passedAudits,
    failedAudits,
    totalErrors,
    totalWarnings,
    totalChecked,
    averageDuration,
    overallHealthScore
  };
}

// Error handling utilities
export function createAuditError(
  category: AuditResult['category'],
  title: string,
  description: string,
  error: Error | string,
  startTime: number
): AuditResult {
  return {
    passed: false,
    category,
    title,
    description,
    details: [{
      type: 'error',
      message: `Audit failed: ${error instanceof Error ? error.message : error}`,
      component: 'system'
    }],
    metrics: {
      duration: Date.now() - startTime,
      checked: 0,
      errors: 1,
      warnings: 0
    }
  };
}

// Performance measurement utilities
export function createPerformanceTimer(name: string) {
  const startTime = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - startTime;
      console.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      return duration;
    },
    getDuration: () => performance.now() - startTime
  };
}

// ComponentDrawer specific utilities
export interface DrawerContrastAudit {
  passed: boolean;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    element: string;
    actualRatio?: number;
    requiredRatio?: number;
  }>;
  fallbacksApplied: number;
  elementsChecked: number;
}

export function auditDrawerContrast(drawerElement?: HTMLElement): DrawerContrastAudit {
  const issues: DrawerContrastAudit['issues'] = [];
  let fallbacksApplied = 0;
  let elementsChecked = 0;
  
  try {
    // Find drawer elements to audit
    const drawer = drawerElement || document.querySelector('.drawer, [role="dialog"], .component-drawer');
    if (!drawer) {
      return {
        passed: false,
        issues: [{ type: 'error', message: 'No drawer element found to audit', element: 'drawer' }],
        fallbacksApplied: 0,
        elementsChecked: 0
      };
    }

    // Check drawer background contrast
    const drawerStyles = getComputedStyle(drawer);
    const drawerBg = parseColorValue(drawerStyles.backgroundColor || '#ffffff');
    const drawerText = parseColorValue(drawerStyles.color || '#000000');

    elementsChecked++;
    if (drawerBg && drawerText) {
      const ratio = calculateContrastRatio(drawerText, drawerBg);
      if (ratio < 4.5) {
        issues.push({
          type: 'error',
          message: 'Drawer background and text have insufficient contrast',
          element: 'drawer-background',
          actualRatio: ratio,
          requiredRatio: 4.5
        });
      }
    }

    // Check interactive elements within drawer
    const interactiveElements = drawer.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])');
    
    interactiveElements.forEach((element, index) => {
      elementsChecked++;
      const htmlElement = element as HTMLElement;
      const styles = getComputedStyle(htmlElement);
      
      const bg = parseColorValue(styles.backgroundColor || drawerStyles.backgroundColor || '#ffffff');
      const text = parseColorValue(styles.color || drawerStyles.color || '#000000');
      
      if (bg && text) {
        const ratio = calculateContrastRatio(text, bg);
        if (ratio < 4.5) {
          issues.push({
            type: 'warning',
            message: `Interactive element ${index + 1} has insufficient contrast`,
            element: `interactive-${index}`,
            actualRatio: ratio,
            requiredRatio: 4.5
          });
        }
      }
    });

    // Check focus indicators
    const focusableElements = drawer.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach((element, index) => {
      elementsChecked++;
      const htmlElement = element as HTMLElement;
      
      // Simulate focus to check indicator
      htmlElement.focus();
      const focusStyles = getComputedStyle(htmlElement);
      htmlElement.blur();
      
      const hasFocusIndicator = focusStyles.outlineWidth !== '0px' || 
                               focusStyles.outlineStyle !== 'none' ||
                               focusStyles.boxShadow !== 'none';
      
      if (!hasFocusIndicator) {
        issues.push({
          type: 'warning',
          message: `Focusable element ${index + 1} missing visible focus indicator`,
          element: `focus-${index}`
        });
      }
    });

  } catch (error) {
    issues.push({
      type: 'error',
      message: `Contrast audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      element: 'audit-system'
    });
  }

  const errorCount = issues.filter(i => i.type === 'error').length;
  
  return {
    passed: errorCount === 0,
    issues,
    fallbacksApplied,
    elementsChecked
  };
}

export function applyContrastFallbacks(drawerElement?: HTMLElement): { applied: number; errors: string[] } {
  const errors: string[] = [];
  let applied = 0;

  try {
    const drawer = drawerElement || document.querySelector('.drawer, [role="dialog"], .component-drawer');
    if (!drawer) {
      errors.push('No drawer element found to apply fallbacks');
      return { applied, errors };
    }

    const theme = getCurrentTheme();
    const highContrastTokens = getHighContrastTokens(theme);

    // Apply high contrast tokens to drawer
    const drawerHtml = drawer as HTMLElement;
    
    // Set high contrast background and text
    drawerHtml.style.setProperty('background-color', `var(${highContrastTokens.background})`);
    drawerHtml.style.setProperty('color', `var(${highContrastTokens.text})`);
    applied++;

    // Apply to interactive elements
    const interactiveElements = drawer.querySelectorAll('button, a, input, select, textarea, [role="button"]');
    interactiveElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      const tagName = htmlElement.tagName.toLowerCase();
      
      if (tagName === 'button' || htmlElement.getAttribute('role') === 'button') {
        htmlElement.style.setProperty('background-color', `var(${highContrastTokens.buttonBg})`);
        htmlElement.style.setProperty('color', `var(${highContrastTokens.buttonText})`);
        htmlElement.style.setProperty('border-color', `var(${highContrastTokens.border})`);
        applied++;
      } else if (['input', 'select', 'textarea'].includes(tagName)) {
        htmlElement.style.setProperty('background-color', `var(${highContrastTokens.inputBg})`);
        htmlElement.style.setProperty('color', `var(${highContrastTokens.inputText})`);
        htmlElement.style.setProperty('border-color', `var(${highContrastTokens.border})`);
        applied++;
      } else if (tagName === 'a') {
        htmlElement.style.setProperty('color', `var(${highContrastTokens.link})`);
        applied++;
      }
    });

    // Ensure focus indicators are visible
    const focusableElements = drawer.querySelectorAll('[tabindex]:not([tabindex="-1"]), button, a, input, select, textarea');
    focusableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      htmlElement.style.setProperty('outline', `3px solid var(${highContrastTokens.focus})`);
      htmlElement.style.setProperty('outline-offset', '2px');
    });

  } catch (error) {
    errors.push(`Failed to apply contrast fallbacks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { applied, errors };
}

export async function captureDrawerScreenshot(drawerElement?: HTMLElement): Promise<string> {
  try {
    const drawer = drawerElement || document.querySelector('.drawer, [role="dialog"], .component-drawer');
    if (!drawer) {
      throw new Error('No drawer element found to capture');
    }

    const rect = drawer.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(rect.width, 300);
    canvas.height = Math.max(rect.height, 200);
    const ctx = canvas.getContext('2d')!;

    // Fill background
    const styles = getComputedStyle(drawer);
    ctx.fillStyle = styles.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border if present
    if (styles.borderWidth && parseInt(styles.borderWidth) > 0) {
      ctx.strokeStyle = styles.borderColor || '#cccccc';
      ctx.lineWidth = parseInt(styles.borderWidth) || 1;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }

    // Draw a simple representation of drawer content
    ctx.fillStyle = styles.color || '#000000';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Draw title area
    ctx.fillText('Component Drawer', 16, 16);
    
    // Draw some content representation
    const contentLines = [
      'Properties Panel',
      '• Interactive controls',
      '• Token usage',
      '• Accessibility features'
    ];
    
    contentLines.forEach((line, index) => {
      ctx.fillText(line, 16, 50 + (index * 20));
    });

    // Draw button representations
    ctx.strokeStyle = styles.borderColor || '#cccccc';
    ctx.strokeRect(16, canvas.height - 50, 80, 30);
    ctx.fillText('Primary', 20, canvas.height - 40);
    
    ctx.strokeRect(110, canvas.height - 50, 80, 30);
    ctx.fillText('Secondary', 114, canvas.height - 40);

    return canvas.toDataURL();
  } catch (error) {
    console.warn('Screenshot capture failed:', error);
    return '';
  }
}

export function getHighContrastTokens(theme: 'light' | 'dark' = 'light'): Record<string, string> {
  if (theme === 'dark') {
    return {
      background: '--color-background',
      text: '--color-foreground',
      buttonBg: '--color-primary',
      buttonText: '--color-background',
      inputBg: '--color-background',
      inputText: '--color-foreground',
      link: '--color-primary',
      border: '--color-border',
      focus: '--color-ring'
    };
  }
  
  return {
    background: '--color-background',
    text: '--color-foreground',
    buttonBg: '--color-primary',
    buttonText: '--color-background',
    inputBg: '--color-background',
    inputText: '--color-foreground',
    link: '--color-primary',
    border: '--color-border',
    focus: '--color-ring'
  };
}

export function getCurrentTheme(): 'light' | 'dark' {
  try {
    // Check data-theme attribute on document element
    const dataTheme = document.documentElement.getAttribute('data-theme');
    if (dataTheme === 'light' || dataTheme === 'dark') {
      return dataTheme;
    }

    // Check localStorage
    const savedTheme = localStorage.getItem('adsm:theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to light
    return 'light';
  } catch (error) {
    console.warn('Failed to get current theme:', error);
    return 'light';
  }
}

// Additional drawer-specific utilities
export function validateDrawerAccessibility(drawerElement?: HTMLElement): {
  passed: boolean;
  issues: Array<{ type: 'error' | 'warning' | 'info'; message: string }>;
} {
  const issues: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = [];
  
  try {
    const drawer = drawerElement || document.querySelector('.drawer, [role="dialog"], .component-drawer');
    if (!drawer) {
      return {
        passed: false,
        issues: [{ type: 'error', message: 'No drawer element found' }]
      };
    }

    const htmlDrawer = drawer as HTMLElement;

    // Check for proper role
    const role = htmlDrawer.getAttribute('role');
    if (!role || !['dialog', 'menu', 'navigation'].includes(role)) {
      issues.push({
        type: 'warning',
        message: 'Drawer should have appropriate ARIA role (dialog, menu, or navigation)'
      });
    }

    // Check for accessible name
    const hasAccessibleName = htmlDrawer.getAttribute('aria-label') || 
                             htmlDrawer.getAttribute('aria-labelledby') ||
                             htmlDrawer.querySelector('h1, h2, h3, h4, h5, h6');
                             
    if (!hasAccessibleName) {
      issues.push({
        type: 'error',
        message: 'Drawer must have accessible name via aria-label, aria-labelledby, or heading'
      });
    }

    // Check for focus management
    const focusableElements = htmlDrawer.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) {
      issues.push({
        type: 'warning',
        message: 'Drawer contains no focusable elements'
      });
    }

    // Check for escape key handling
    const hasCloseButton = htmlDrawer.querySelector('[aria-label*="close"], [aria-label*="Close"], .close-button');
    if (!hasCloseButton) {
      issues.push({
        type: 'info',
        message: 'Consider adding a close button for better accessibility'
      });
    }

  } catch (error) {
    issues.push({
      type: 'error',
      message: `Accessibility validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  const errorCount = issues.filter(i => i.type === 'error').length;
  
  return {
    passed: errorCount === 0,
    issues
  };
}