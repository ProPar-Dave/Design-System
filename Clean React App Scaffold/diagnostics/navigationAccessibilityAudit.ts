import type { AuditResult, ComponentInfo } from './utils';

export async function runNavigationAccessibilityAudit(components: ComponentInfo[]): Promise<AuditResult> {
  const startTime = Date.now();
  
  try {
    // Find navigation elements in the DOM
    const navSelectors = [
      'nav',
      '[role="navigation"]',
      '.navigation',
      '.nav',
      '.menu',
      '.sidebar',
      '.breadcrumb',
      '[role="menubar"]',
      '[role="tablist"]'
    ];

    let totalNavs = 0;
    let passedNavs = 0;
    const issues: { type: string; message: string; component: string; line?: number }[] = [];

    for (const selector of navSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      
      for (const element of elements) {
        totalNavs++;
        let navPassed = true;

        // Check for proper navigation role
        const role = element.getAttribute('role');
        const tagName = element.tagName.toLowerCase();
        
        if (tagName !== 'nav' && role !== 'navigation') {
          issues.push({
            type: 'warning',
            message: 'Navigation element should use <nav> tag or role="navigation"',
            component: selector
          });
        }

        // Check for accessible name
        const hasAriaLabel = element.getAttribute('aria-label');
        const hasAriaLabelledBy = element.getAttribute('aria-labelledby');
        
        if (!hasAriaLabel && !hasAriaLabelledBy) {
          issues.push({
            type: 'warning',
            message: 'Navigation should have aria-label or aria-labelledby for identification',
            component: selector
          });
        }

        // Check for keyboard navigation
        const focusableElements = element.querySelectorAll('a, button, [tabindex], [role="button"], [role="tab"]');
        let hasKeyboardSupport = false;
        
        focusableElements.forEach(focusable => {
          const tabindex = focusable.getAttribute('tabindex');
          if (tabindex !== '-1') {
            hasKeyboardSupport = true;
          }
        });

        if (focusableElements.length > 0 && !hasKeyboardSupport) {
          navPassed = false;
          issues.push({
            type: 'error',
            message: 'Navigation contains no keyboard-accessible elements',
            component: selector
          });
        }

        // Check for current/active state indication
        const hasCurrentState = element.querySelector('[aria-current], .active, .current');
        if (!hasCurrentState && focusableElements.length > 1) {
          issues.push({
            type: 'info',
            message: 'Navigation should indicate current page/section with aria-current',
            component: selector
          });
        }

        // Check skip links for main navigation
        if (element.matches('nav:first-of-type, [role="navigation"]:first-of-type')) {
          const skipLink = document.querySelector('a[href="#main"], a[href="#content"], .skip-link');
          if (!skipLink) {
            issues.push({
              type: 'warning',
              message: 'Main navigation should be accompanied by skip links',
              component: selector
            });
          }
        }

        if (navPassed) {
          passedNavs++;
        }
      }
    }

    const duration = Date.now() - startTime;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    return {
      passed: errorCount === 0,
      category: 'accessibility',
      title: 'Navigation Accessibility Audit',
      description: 'Validates navigation accessibility including roles, keyboard support, and current state indicators',
      details: issues,
      metrics: {
        duration,
        checked: totalNavs,
        errors: errorCount,
        warnings: warningCount,
        passed: passedNavs
      }
    };

  } catch (error) {
    return {
      passed: false,
      category: 'accessibility',
      title: 'Navigation Accessibility Audit',
      description: 'Failed to audit navigation accessibility',
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