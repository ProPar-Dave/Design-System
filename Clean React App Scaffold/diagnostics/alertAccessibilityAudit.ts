import type { AuditResult, ComponentInfo } from './utils';

export async function runAlertAccessibilityAudit(components: ComponentInfo[]): Promise<AuditResult> {
  const startTime = Date.now();
  
  try {
    // Find alert elements in the DOM
    const alertSelectors = [
      '[role="alert"]',
      '[role="alertdialog"]',
      '.alert',
      '.adsm-alert',
      '.toast',
      '.notification',
      '.adsm-error',
      '.adsm-warning',
      '.adsm-success',
      '.adsm-info'
    ];

    let totalAlerts = 0;
    let passedAlerts = 0;
    const issues: { type: string; message: string; component: string; line?: number }[] = [];

    for (const selector of alertSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      
      for (const element of elements) {
        totalAlerts++;
        let alertPassed = true;

        // Check for proper role
        const role = element.getAttribute('role');
        if (!role || (role !== 'alert' && role !== 'alertdialog')) {
          alertPassed = false;
          issues.push({
            type: 'error',
            message: 'Alert element should have role="alert" or role="alertdialog"',
            component: selector
          });
        }

        // Check for accessible content
        const hasText = element.textContent && element.textContent.trim().length > 0;
        const hasAriaLabel = element.getAttribute('aria-label');
        const hasAriaLabelledBy = element.getAttribute('aria-labelledby');
        
        if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
          alertPassed = false;
          issues.push({
            type: 'error',
            message: 'Alert element has no accessible text content',
            component: selector
          });
        }

        // Check for live region behavior
        const ariaLive = element.getAttribute('aria-live');
        if (role === 'alert' && !ariaLive) {
          issues.push({
            type: 'info',
            message: 'Alert should consider aria-live attribute for dynamic content',
            component: selector
          });
        }

        // Check dismissible alerts have proper keyboard support
        const isDismissible = element.querySelector('[aria-label*="close"], [aria-label*="dismiss"], .close-button');
        if (isDismissible) {
          const closeButton = element.querySelector('button, [role="button"]');
          if (!closeButton) {
            issues.push({
              type: 'warning',
              message: 'Dismissible alert should have keyboard-accessible close button',
              component: selector
            });
          }
        }

        if (alertPassed) {
          passedAlerts++;
        }
      }
    }

    const duration = Date.now() - startTime;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    return {
      passed: errorCount === 0,
      category: 'accessibility',
      title: 'Alert Accessibility Audit',
      description: 'Validates alert component accessibility including roles, live regions, and keyboard interaction',
      details: issues,
      metrics: {
        duration,
        checked: totalAlerts,
        errors: errorCount,
        warnings: warningCount,
        passed: passedAlerts
      }
    };

  } catch (error) {
    return {
      passed: false,
      category: 'accessibility',
      title: 'Alert Accessibility Audit',
      description: 'Failed to audit alert accessibility',
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

// Specific function for AlertToastDemo component
export async function runAlertToastAccessibilityAudit(components: ComponentInfo[]): Promise<AuditResult> {
  const startTime = Date.now();
  
  try {
    // Focus specifically on alert and toast components
    const alertToastSelectors = [
      '.adsm-alert',
      '.adsm-toast', 
      '.alert',
      '.toast',
      '[role="alert"]',
      '.adsm-info',
      '.adsm-success', 
      '.adsm-warning',
      '.adsm-error'
    ];

    let totalElements = 0;
    let passedElements = 0;
    const issues: { type: string; message: string; component: string; line?: number }[] = [];

    for (const selector of alertToastSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      
      for (const element of elements) {
        totalElements++;
        let elementPassed = true;

        // Check semantic structure
        const role = element.getAttribute('role');
        const tagName = element.tagName.toLowerCase();
        
        if (!role && !['section', 'article', 'aside'].includes(tagName)) {
          issues.push({
            type: 'warning',
            message: 'Alert/Toast should have semantic role or use semantic HTML element',
            component: selector
          });
        }

        // Check for proper labeling
        const hasAccessibleName = element.getAttribute('aria-label') || 
                                element.getAttribute('aria-labelledby') ||
                                element.textContent?.trim();
        
        if (!hasAccessibleName) {
          elementPassed = false;
          issues.push({
            type: 'error',
            message: 'Alert/Toast must have accessible name via aria-label, aria-labelledby, or text content',
            component: selector
          });
        }

        // Check color contrast for text
        const styles = getComputedStyle(element);
        const textColor = styles.color;
        const backgroundColor = styles.backgroundColor;
        
        if (textColor && backgroundColor && textColor !== backgroundColor) {
          // Basic contrast check (simplified)
          const isLowContrast = (textColor === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') ||
                               (textColor === 'rgb(0, 0, 0)' && backgroundColor === 'rgb(0, 0, 0)');
          
          if (isLowContrast) {
            issues.push({
              type: 'error',
              message: 'Alert/Toast text and background colors have insufficient contrast',
              component: selector
            });
          }
        }

        // Check for action buttons accessibility
        const actionButtons = element.querySelectorAll('button, [role="button"]');
        actionButtons.forEach((button, index) => {
          const buttonElement = button as HTMLElement;
          const hasLabel = buttonElement.getAttribute('aria-label') || 
                          buttonElement.getAttribute('aria-labelledby') ||
                          buttonElement.textContent?.trim();
          
          if (!hasLabel) {
            issues.push({
              type: 'warning',
              message: `Action button ${index + 1} in alert/toast should have accessible label`,
              component: selector
            });
          }
        });

        if (elementPassed) {
          passedElements++;
        }
      }
    }

    const duration = Date.now() - startTime;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    return {
      passed: errorCount === 0,
      category: 'accessibility',
      title: 'Alert & Toast Accessibility Audit',
      description: 'Validates accessibility of alert and toast components including semantics, labeling, and contrast',
      details: issues,
      metrics: {
        duration,
        checked: totalElements,
        errors: errorCount,
        warnings: warningCount,
        passed: passedElements
      }
    };

  } catch (error) {
    return {
      passed: false,
      category: 'accessibility',
      title: 'Alert & Toast Accessibility Audit',
      description: 'Failed to audit alert/toast accessibility',
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

// Token validation function for AlertToastDemo
export function validateAlertToastTokens(): { 
  passed: boolean; 
  issues: Array<{ type: string; message: string; token?: string }>;
  validatedTokens: string[];
} {
  const issues: Array<{ type: string; message: string; token?: string }> = [];
  const validatedTokens: string[] = [];

  // Define expected tokens for alert and toast components
  const requiredTokens = [
    '--chip-info-bg',
    '--chip-info-text', 
    '--chip-info-border',
    '--chip-success-bg',
    '--chip-success-text',
    '--chip-success-border',
    '--chip-warning-bg',
    '--chip-warning-text',
    '--chip-warning-border',
    '--chip-danger-bg',
    '--chip-danger-text',
    '--chip-danger-border'
  ];

  const rootStyles = getComputedStyle(document.documentElement);

  // Validate each token
  requiredTokens.forEach(token => {
    const value = rootStyles.getPropertyValue(token);
    
    if (!value || value.trim() === '') {
      issues.push({
        type: 'error',
        message: `Required token ${token} is not defined or has no value`,
        token
      });
    } else {
      validatedTokens.push(token);
      
      // Check if token uses proper values (not raw colors)
      const trimmedValue = value.trim();
      const hasRawColor = /#[0-9a-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(/i.test(trimmedValue);
      
      if (hasRawColor) {
        issues.push({
          type: 'warning',
          message: `Token ${token} contains raw color value: ${trimmedValue}. Consider using semantic color references.`,
          token
        });
      }
    }
  });

  // Check for semantic consistency
  const semanticGroups = [
    ['--chip-info-bg', '--chip-info-text', '--chip-info-border'],
    ['--chip-success-bg', '--chip-success-text', '--chip-success-border'], 
    ['--chip-warning-bg', '--chip-warning-text', '--chip-warning-border'],
    ['--chip-danger-bg', '--chip-danger-text', '--chip-danger-border']
  ];

  semanticGroups.forEach(group => {
    const missingFromGroup = group.filter(token => !validatedTokens.includes(token));
    if (missingFromGroup.length > 0 && missingFromGroup.length < group.length) {
      issues.push({
        type: 'warning',
        message: `Incomplete token group: ${group[0].split('-')[1]} group is missing ${missingFromGroup.join(', ')}`
      });
    }
  });

  const errorCount = issues.filter(i => i.type === 'error').length;

  return {
    passed: errorCount === 0,
    issues,
    validatedTokens
  };
}