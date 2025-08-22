import type { AuditResult, ComponentInfo } from './utils';

export async function runMoleculeCompositionAudit(components: ComponentInfo[]): Promise<AuditResult> {
  const startTime = Date.now();
  
  try {
    // Define molecule selectors to audit
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

    let totalMolecules = 0;
    let properlyComposed = 0;
    const issues: { type: string; message: string; component: string; line?: number }[] = [];

    for (const selector of moleculeSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      
      for (const element of elements) {
        totalMolecules++;
        let isProperlyComposed = true;

        // Check if molecule contains atomic components
        const atomicComponents = [
          '.adsm-button-primary',
          '.adsm-button-secondary',
          '.adsm-input',
          '.adsm-textarea', 
          '.adsm-select',
          '.adsm-checkbox',
          '.adsm-radio',
          '.adsm-badge',
          '.adsm-chip',
          '.adsm-divider',
          'button',
          'input',
          'textarea',
          'select'
        ];

        let containsAtoms = false;
        for (const atomSelector of atomicComponents) {
          if (element.querySelector(atomSelector)) {
            containsAtoms = true;
            break;
          }
        }

        if (!containsAtoms) {
          isProperlyComposed = false;
          issues.push({
            type: 'warning',
            message: `Molecule ${selector} does not appear to compose any atomic components`,
            component: selector
          });
        }

        // Check for direct styling (should use tokens or atoms for styling)
        const hasInlineStyles = element.hasAttribute('style');
        if (hasInlineStyles) {
          const inlineStyle = element.getAttribute('style') || '';
          const hasRawValues = /#[0-9a-f]{3,8}|\d+px|\d+rem/.test(inlineStyle);
          
          if (hasRawValues) {
            isProperlyComposed = false;
            issues.push({
              type: 'error',
              message: `Molecule ${selector} has inline styles with raw values. Should use design tokens or atomic components.`,
              component: selector
            });
          }
        }

        // Check for appropriate molecule complexity
        const childElements = element.children.length;
        if (childElements < 2) {
          issues.push({
            type: 'info',
            message: `Molecule ${selector} has only ${childElements} child elements. Consider if this should be an atom instead.`,
            component: selector
          });
        }

        // Check for excessive complexity (might need to be split into smaller molecules)
        if (childElements > 10) {
          issues.push({
            type: 'warning',
            message: `Molecule ${selector} has ${childElements} child elements. Consider breaking into smaller molecules.`,
            component: selector
          });
        }

        // Check for proper semantic structure
        const hasSemanticElements = element.querySelector('header, main, section, article, aside, nav, footer, h1, h2, h3, h4, h5, h6');
        const isComplexMolecule = selector.includes('card') || selector.includes('form') || selector.includes('alert');
        
        if (isComplexMolecule && !hasSemanticElements) {
          issues.push({
            type: 'info',
            message: `Complex molecule ${selector} should consider using semantic HTML elements for better accessibility`,
            component: selector
          });
        }

        if (isProperlyComposed) {
          properlyComposed++;
        }
      }
    }

    const duration = Date.now() - startTime;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    return {
      passed: errorCount === 0,
      category: 'architecture',
      title: 'Molecule Composition Audit',
      description: 'Validates that molecules properly compose atomic components and follow composition principles',
      details: issues,
      metrics: {
        duration,
        checked: totalMolecules,
        errors: errorCount,
        warnings: warningCount,
        properlyComposed,
        compositionScore: totalMolecules > 0 ? Math.round((properlyComposed / totalMolecules) * 100) : 100
      }
    };

  } catch (error) {
    return {
      passed: false,
      category: 'architecture',
      title: 'Molecule Composition Audit',
      description: 'Failed to audit molecule composition',
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