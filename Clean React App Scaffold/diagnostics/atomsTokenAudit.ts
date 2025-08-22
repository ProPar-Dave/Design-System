import type { AuditResult, ComponentInfo } from './utils';

export async function runAtomsTokenAudit(components: ComponentInfo[]): Promise<AuditResult> {
  const startTime = Date.now();
  
  try {
    // Define atoms selectors to audit
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
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'button',
      'textarea',
      'select'
    ];

    let totalAtoms = 0;
    let atomsWithViolations = 0;
    const issues: { type: string; message: string; component: string; line?: number }[] = [];

    // Regular expressions to detect raw CSS values
    const rawColorPattern = /#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(/i;
    const rawSpacingPattern = /\b\d+px\b|\b\d+rem\b|\b\d+em\b/i;
    const rawBorderPattern = /border:\s*\d+px|border-width:\s*\d+px/i;

    for (const selector of atomSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      
      for (const element of elements) {
        totalAtoms++;
        const styles = getComputedStyle(element);
        let hasViolation = false;

        // Check for raw color values
        const backgroundColorStyle = element.style.backgroundColor;
        const colorStyle = element.style.color;
        const borderColorStyle = element.style.borderColor;

        if (backgroundColorStyle && rawColorPattern.test(backgroundColorStyle)) {
          hasViolation = true;
          issues.push({
            type: 'error',
            message: `Raw background color detected: ${backgroundColorStyle}. Use design tokens instead.`,
            component: selector
          });
        }

        if (colorStyle && rawColorPattern.test(colorStyle)) {
          hasViolation = true;
          issues.push({
            type: 'error', 
            message: `Raw text color detected: ${colorStyle}. Use design tokens instead.`,
            component: selector
          });
        }

        if (borderColorStyle && rawColorPattern.test(borderColorStyle)) {
          hasViolation = true;
          issues.push({
            type: 'error',
            message: `Raw border color detected: ${borderColorStyle}. Use design tokens instead.`,
            component: selector
          });
        }

        // Check for raw spacing values
        const paddingStyle = element.style.padding;
        const marginStyle = element.style.margin;
        
        if (paddingStyle && rawSpacingPattern.test(paddingStyle)) {
          hasViolation = true;
          issues.push({
            type: 'error',
            message: `Raw padding value detected: ${paddingStyle}. Use spacing tokens instead.`,
            component: selector
          });
        }

        if (marginStyle && rawSpacingPattern.test(marginStyle)) {
          hasViolation = true;
          issues.push({
            type: 'error',
            message: `Raw margin value detected: ${marginStyle}. Use spacing tokens instead.`,
            component: selector
          });
        }

        // Check for raw border values
        const borderStyle = element.style.border;
        if (borderStyle && rawBorderPattern.test(borderStyle)) {
          hasViolation = true;
          issues.push({
            type: 'error',
            message: `Raw border value detected: ${borderStyle}. Use border tokens instead.`,
            component: selector
          });
        }

        // Check if element uses CSS custom properties (tokens)
        const usesTokens = styles.backgroundColor?.includes('var(') || 
                          styles.color?.includes('var(') ||
                          styles.padding?.includes('var(') ||
                          styles.margin?.includes('var(') ||
                          styles.borderColor?.includes('var(');

        if (!usesTokens && (styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || styles.color !== 'rgb(0, 0, 0)')) {
          issues.push({
            type: 'warning',
            message: 'Atom should use CSS custom properties (design tokens) for styling',
            component: selector
          });
        }

        if (hasViolation) {
          atomsWithViolations++;
        }
      }
    }

    const duration = Date.now() - startTime;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    return {
      passed: errorCount === 0,
      category: 'tokens',
      title: 'Atoms Token Usage Audit',
      description: 'Validates that atomic components use design tokens instead of raw CSS values',
      details: issues,
      metrics: {
        duration,
        checked: totalAtoms,
        errors: errorCount,
        warnings: warningCount,
        violations: atomsWithViolations,
        compliance: totalAtoms > 0 ? Math.round(((totalAtoms - atomsWithViolations) / totalAtoms) * 100) : 100
      }
    };

  } catch (error) {
    return {
      passed: false,
      category: 'tokens',
      title: 'Atoms Token Usage Audit', 
      description: 'Failed to audit atoms token usage',
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