import { safeLogEvent } from './logger';
import type { AuditResult, ComponentInfo } from './utils';

export interface ButtonElement {
  element: HTMLElement;
  variant: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost' | 'link' | 'icon' | 'custom';
  size: 'small' | 'medium' | 'large' | 'icon' | 'custom';
  selector: string;
  state: 'default' | 'hover' | 'focus' | 'active' | 'disabled' | 'loading';
  textContent: string | null;
  hasIcon: boolean;
  iconOnly: boolean;
  computedStyles: CSSStyleDeclaration;
  tokens: {
    background: string;
    color: string;
    border: string;
    focusRing: string;
    hoverBg?: string;
    activeBg?: string;
    disabledBg?: string;
    disabledText?: string;
  };
  resolvedColors: {
    background: string;
    foreground: string;
    border?: string;
    icon?: string;
  };
  contrastRatios: {
    textToBg: number;
    iconToBg?: number;
    borderToBg?: number;
    focusRingToBg?: number;
  };
  wcagLevel: 'AAA' | 'AA' | 'fail' | 'unknown';
  position: DOMRect;
  touchTargetSize: {
    width: number;
    height: number;
    meetsMinimum: boolean;
  };
  keyboardAccessible: boolean;
  ariaAttributes: {
    label?: string;
    describedBy?: string;
    expanded?: boolean;
    pressed?: boolean;
    disabled?: boolean;
  };
}

export interface ButtonAuditResult {
  timestamp: number;
  theme: string;
  totalButtons: number;
  passedButtons: number;
  failedButtons: number;
  buttonsByVariant: Record<string, number>;
  buttonsBySize: Record<string, number>;
  elements: ButtonElement[];
  issues: {
    type: 'contrast' | 'focus' | 'hover' | 'touch-target' | 'keyboard' | 'icon' | 'state' | 'consistency' | 'color-blindness';
    severity: 'critical' | 'error' | 'warning' | 'info';
    element: string;
    variant: string;
    description: string;
    actualValue: string;
    expectedValue: string;
    suggestion: string;
    token?: string;
    fallbackApplied?: boolean;
  }[];
  screenshots: {
    beforeFixes: Record<string, string>; // variant -> base64 data URL
    afterFixes: Record<string, string>;
    colorBlindnessSimulations: {
      protanopia: Record<string, string>;
      deuteranopia: Record<string, string>;
      tritanopia: Record<string, string>;
    };
  };
  fallbacks: {
    variant: string;
    element: string;
    token: string;
    originalValue: string;
    fallbackValue: string;
    reason: string;
    contrastImprovement: number;
  }[];
  consistencyChecks: {
    paddingConsistency: boolean;
    borderRadiusConsistency: boolean;
    fontSizeConsistency: boolean;
    fontWeightConsistency: boolean;
    focusIndicatorConsistency: boolean;
    touchTargetConsistency: boolean;
    iconSizeConsistency: boolean;
    destructiveDistinction: boolean;
  };
  globalUpdates: {
    token: string;
    oldValue: string;
    newValue: string;
    buttonsAffected: number;
  }[];
}

// WCAG contrast calculation utilities (shared with other audits)
function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseColor(color: string): [number, number, number] | null {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const imageData = ctx.getImageData(0, 0, 1, 1);
  return [imageData.data[0], imageData.data[1], imageData.data[2]];
}

function getWcagLevel(contrastRatio: number): 'AAA' | 'AA' | 'fail' {
  if (contrastRatio >= 7) return 'AAA';
  if (contrastRatio >= 4.5) return 'AA';
  return 'fail';
}

// Button variant detection and categorization
function getButtonVariant(element: HTMLElement): ButtonElement['variant'] {
  const classList = element.className.toLowerCase();
  const tagName = element.tagName.toLowerCase();
  
  // Check for explicit variant classes
  if (classList.includes('adsm-button-primary') || classList.includes('btn-primary') || classList.includes('primary')) {
    return 'primary';
  }
  if (classList.includes('adsm-button-secondary') || classList.includes('btn-secondary') || classList.includes('secondary')) {
    return 'secondary';
  }
  if (classList.includes('destructive') || classList.includes('danger') || classList.includes('error')) {
    return 'destructive';
  }
  if (classList.includes('ghost') || classList.includes('outline')) {
    return 'ghost';
  }
  if (classList.includes('link') || tagName === 'a') {
    return 'link';
  }
  if (classList.includes('icon-button') || element.querySelector('svg:only-child')) {
    return 'icon';
  }
  if (classList.includes('tertiary')) {
    return 'tertiary';
  }
  
  // Default based on element type
  if (tagName === 'button') return 'primary';
  if (tagName === 'a') return 'link';
  
  return 'custom';
}

function getButtonSize(element: HTMLElement): ButtonElement['size'] {
  const classList = element.className.toLowerCase();
  const rect = element.getBoundingClientRect();
  
  if (classList.includes('small') || classList.includes('sm')) return 'small';
  if (classList.includes('large') || classList.includes('lg')) return 'large';
  if (classList.includes('icon') || (rect.width <= 44 && rect.height <= 44)) return 'icon';
  
  // Determine by computed styles
  const styles = getComputedStyle(element);
  const fontSize = parseInt(styles.fontSize);
  
  if (fontSize <= 12) return 'small';
  if (fontSize >= 18) return 'large';
  
  return 'medium';
}

function getButtonState(element: HTMLElement): ButtonElement['state'] {
  if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') return 'disabled';
  if (element.classList.contains('loading') || element.getAttribute('aria-busy') === 'true') return 'loading';
  if (element.matches(':focus')) return 'focus';
  if (element.matches(':hover')) return 'hover';
  if (element.matches(':active')) return 'active';
  return 'default';
}

function hasIcon(element: HTMLElement): { hasIcon: boolean; iconOnly: boolean } {
  const svgElements = element.querySelectorAll('svg');
  const iconElements = element.querySelectorAll('.icon, [class*="icon"]');
  const textContent = element.textContent?.trim();
  
  const hasIcon = svgElements.length > 0 || iconElements.length > 0;
  const iconOnly = hasIcon && (!textContent || textContent.length === 0);
  
  return { hasIcon, iconOnly };
}

// Simplified audit function for integration with the audit system
export async function runAccessibilityAudit(components: ComponentInfo[]): Promise<AuditResult> {
  const startTime = Date.now();
  
  try {
    // Find button elements in the DOM
    const buttonSelectors = [
      'button',
      'a[role="button"]',
      '.adsm-button-primary',
      '.adsm-button-secondary',
      '[role="button"]'
    ];

    let totalButtons = 0;
    let passedButtons = 0;
    let failedButtons = 0;
    const issues: { type: string; message: string; component: string; line?: number }[] = [];

    for (const selector of buttonSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      
      for (const element of elements) {
        totalButtons++;
        
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;

        const styles = getComputedStyle(element);
        const backgroundColor = parseColor(styles.backgroundColor || '#ffffff');
        const textColor = parseColor(styles.color || '#000000');

        if (!backgroundColor || !textColor) {
          failedButtons++;
          issues.push({
            type: 'error',
            message: 'Button has unparseable colors',
            component: selector
          });
          continue;
        }

        const contrast = getContrastRatio(textColor, backgroundColor);
        const wcagLevel = getWcagLevel(contrast);

        if (wcagLevel === 'fail') {
          failedButtons++;
          issues.push({
            type: 'error', 
            message: `Button contrast ratio ${contrast.toFixed(2)}:1 fails WCAG AA (requires 4.5:1)`,
            component: selector
          });
        } else {
          passedButtons++;
        }

        // Check touch target size
        if (rect.width < 44 || rect.height < 44) {
          issues.push({
            type: 'warning',
            message: `Button ${rect.width}x${rect.height}px smaller than recommended 44x44px`,
            component: selector
          });
        }

        // Check keyboard accessibility
        const isKeyboardAccessible = element.hasAttribute('tabindex') || 
                                   ['button', 'a'].includes(element.tagName.toLowerCase()) ||
                                   element.getAttribute('role') === 'button';
        
        if (!isKeyboardAccessible) {
          issues.push({
            type: 'error',
            message: 'Button is not keyboard accessible',
            component: selector
          });
        }

        // Check for accessible labels on icon-only buttons
        const iconInfo = hasIcon(element);
        if (iconInfo.iconOnly && !element.getAttribute('aria-label') && !element.textContent?.trim()) {
          issues.push({
            type: 'error',
            message: 'Icon-only button missing accessible label',
            component: selector
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    return {
      passed: errorCount === 0,
      category: 'accessibility',
      title: 'Button Accessibility Audit',
      description: 'Validates button accessibility including contrast, touch targets, and keyboard navigation',
      details: issues,
      metrics: {
        duration,
        checked: totalButtons,
        errors: errorCount,
        warnings: warningCount,
        passed: passedButtons,
        failed: failedButtons
      }
    };

  } catch (error) {
    return {
      passed: false,
      category: 'accessibility',
      title: 'Button Accessibility Audit',
      description: 'Failed to audit button accessibility',
      details: [{
        type: 'error',
        message: `Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
}