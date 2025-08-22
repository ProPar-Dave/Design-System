import type { AuditResult, ComponentInfo } from './utils';

export async function runTokenSurfaceAudit(components: ComponentInfo[]): Promise<AuditResult> {
  const startTime = Date.now();
  
  try {
    // Define token surface allowlists
    const TOKEN_SURFACE_ALLOWLIST = {
      atoms: [
        'color', 'space', 'font', 'radius', 'border', 'shadow'
      ],
      molecules: [
        'color', 'space', 'font', 'radius', 'border', 'shadow',
        'button', 'input', 'card', 'chip', 'alert'
      ]
    };

    let totalElements = 0;
    let violatingElements = 0;
    const issues: { type: string; message: string; component: string; line?: number }[] = [];

    // Define selectors for atoms and molecules
    const atomSelectors = [
      '.adsm-button-primary',
      '.adsm-button-secondary',
      '.adsm-input',
      '.adsm-textarea',
      '.adsm-select',
      '.adsm-checkbox',
      '.adsm-radio',
      '.adsm-switch',
      '.adsm-badge',
      '.adsm-chip',
      '.adsm-divider',
      'button',
      'input',
      'textarea',
      'select'
    ];

    const moleculeSelectors = [
      '.adsm-alert',
      '.adsm-card',
      '.adsm-field-row',
      '.adsm-form-group',
      '.adsm-toast',
      '.adsm-toolbar',
      '.adsm-tabset',
      '.adsm-pagination'
    ];

    // Audit atoms
    for (const selector of atomSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      
      for (const element of elements) {
        totalElements++;
        const violations = auditElementTokenSurface(element, 'atom', TOKEN_SURFACE_ALLOWLIST);
        
        if (violations.length > 0) {
          violatingElements++;
          violations.forEach(violation => {
            issues.push({
              type: 'error',
              message: violation,
              component: selector
            });
          });
        }
      }
    }

    // Audit molecules
    for (const selector of moleculeSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      
      for (const element of elements) {
        totalElements++;
        const violations = auditElementTokenSurface(element, 'molecule', TOKEN_SURFACE_ALLOWLIST);
        
        if (violations.length > 0) {
          violatingElements++;
          violations.forEach(violation => {
            issues.push({
              type: 'error',
              message: violation,
              component: selector
            });
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const complianceScore = totalElements > 0 ? Math.round(((totalElements - violatingElements) / totalElements) * 100) : 100;

    return {
      passed: errorCount === 0,
      category: 'tokens',
      title: 'Token Surface Audit',
      description: 'Validates that components use only approved design tokens according to their type',
      details: issues,
      metrics: {
        duration,
        checked: totalElements,
        errors: errorCount,
        warnings: warningCount,
        violations: violatingElements,
        complianceScore
      }
    };

  } catch (error) {
    return {
      passed: false,
      category: 'tokens',
      title: 'Token Surface Audit',
      description: 'Failed to audit token surface usage',
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

function auditElementTokenSurface(
  element: HTMLElement, 
  componentType: 'atom' | 'molecule',
  allowlist: { atoms: string[]; molecules: string[] }
): string[] {
  const violations: string[] = [];
  const styles = getComputedStyle(element);
  const allowedCategories = componentType === 'atom' ? allowlist.atoms : allowlist.molecules;

  // Check for raw color values
  const colorProperties = ['backgroundColor', 'color', 'borderColor'];
  colorProperties.forEach(prop => {
    const value = styles[prop as keyof CSSStyleDeclaration] as string;
    if (value && isRawColorValue(value)) {
      violations.push(`Raw color value detected in ${prop}: ${value}. Use design tokens instead.`);
    }
  });

  // Check for raw spacing values
  const spacingProperties = ['padding', 'margin', 'gap'];
  spacingProperties.forEach(prop => {
    const value = styles[prop as keyof CSSStyleDeclaration] as string;
    if (value && isRawSpacingValue(value)) {
      violations.push(`Raw spacing value detected in ${prop}: ${value}. Use spacing tokens instead.`);
    }
  });

  // Check for disallowed token usage
  const inlineStyle = element.getAttribute('style') || '';
  const varMatches = inlineStyle.matchAll(/var\((--[^,)]+)/g);
  
  for (const match of varMatches) {
    const token = match[1];
    const tokenCategory = getTokenCategory(token);
    
    if (tokenCategory && !allowedCategories.includes(tokenCategory)) {
      violations.push(`${componentType} component uses disallowed token category "${tokenCategory}": ${token}`);
    }
  }

  return violations;
}

function getTokenCategory(token: string): string | null {
  if (token.startsWith('--color-')) return 'color';
  if (token.startsWith('--space-')) return 'space';
  if (token.startsWith('--font-')) return 'font';
  if (token.startsWith('--radius-')) return 'radius';
  if (token.startsWith('--border-')) return 'border';
  if (token.startsWith('--shadow-')) return 'shadow';
  if (token.startsWith('--button-')) return 'button';
  if (token.startsWith('--input-')) return 'input';
  if (token.startsWith('--card-')) return 'card';
  if (token.startsWith('--chip-')) return 'chip';
  if (token.startsWith('--alert-')) return 'alert';
  
  return null;
}

function isRawColorValue(value: string): boolean {
  return /#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(/i.test(value);
}

function isRawSpacingValue(value: string): boolean {
  return /\b\d+px\b|\b\d+rem\b|\b\d+em\b/.test(value);
}