import type { AuditResult, ComponentInfo } from './utils';

export async function runFormFieldAccessibilityAudit(components: ComponentInfo[]): Promise<AuditResult> {
  const startTime = Date.now();
  
  try {
    // Find form field elements in the DOM
    const fieldSelectors = [
      'input[type="text"]',
      'input[type="email"]', 
      'input[type="password"]',
      'input[type="number"]',
      'textarea',
      'select',
      '.adsm-input',
      '.adsm-textarea',
      '.adsm-select'
    ];

    let totalFields = 0;
    let passedFields = 0;
    const issues: { type: string; message: string; component: string; line?: number }[] = [];

    for (const selector of fieldSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
      
      for (const element of elements) {
        totalFields++;
        let fieldPassed = true;

        // Check for labels
        const hasLabel = element.labels && element.labels.length > 0;
        const hasAriaLabel = element.getAttribute('aria-label');
        const hasAriaLabelledBy = element.getAttribute('aria-labelledby');
        
        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
          fieldPassed = false;
          issues.push({
            type: 'error',
            message: 'Form field missing accessible label',
            component: selector
          });
        }

        // Check for error state accessibility
        const hasAriaInvalid = element.getAttribute('aria-invalid');
        const hasAriaDescribedBy = element.getAttribute('aria-describedby');
        
        if (element.classList.contains('error') || element.classList.contains('invalid')) {
          if (hasAriaInvalid !== 'true') {
            issues.push({
              type: 'warning',
              message: 'Error state field should have aria-invalid="true"',
              component: selector
            });
          }
          
          if (!hasAriaDescribedBy) {
            issues.push({
              type: 'warning', 
              message: 'Error state field should reference error message with aria-describedby',
              component: selector
            });
          }
        }

        // Check required field indication
        if (element.hasAttribute('required') && !element.getAttribute('aria-required')) {
          issues.push({
            type: 'warning',
            message: 'Required field should have aria-required="true"',
            component: selector
          });
        }

        if (fieldPassed) {
          passedFields++;
        }
      }
    }

    const duration = Date.now() - startTime;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    return {
      passed: errorCount === 0,
      category: 'accessibility',
      title: 'Form Field Accessibility Audit',
      description: 'Validates form field accessibility including labels, error states, and required field indicators',
      details: issues,
      metrics: {
        duration,
        checked: totalFields,
        errors: errorCount,
        warnings: warningCount,
        passed: passedFields
      }
    };

  } catch (error) {
    return {
      passed: false,
      category: 'accessibility',
      title: 'Form Field Accessibility Audit',
      description: 'Failed to audit form field accessibility',
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