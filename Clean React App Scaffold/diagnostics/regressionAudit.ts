import type { AuditResult, ComponentInfo } from './utils';
import { runAudits, QUICK_AUDIT_KEYS, FULL_AUDIT_KEYS } from './audits';

export async function runRegressionAudit(components: ComponentInfo[]): Promise<AuditResult> {
  const startTime = Date.now();
  
  try {
    // Check for regression indicators in the component system
    const issues: { type: string; message: string; component: string; line?: number }[] = [];
    
    let totalChecks = 0;
    let regressionCount = 0;

    // Check for missing components that were previously available
    const expectedComponents = [
      '.adsm-button-primary',
      '.adsm-button-secondary',
      '.adsm-input',
      '.adsm-alert',
      '.adsm-card'
    ];

    expectedComponents.forEach(selector => {
      totalChecks++;
      const exists = document.querySelector(selector);
      if (!exists) {
        regressionCount++;
        issues.push({
          type: 'error',
          message: `Expected component ${selector} not found in DOM. This may indicate a regression.`,
          component: selector
        });
      }
    });

    // Check for broken CSS custom properties (tokens)
    const tokenChecks = [
      '--color-primary',
      '--color-secondary', 
      '--space-sm',
      '--space-md',
      '--radius-md'
    ];

    const rootStyles = getComputedStyle(document.documentElement);
    
    tokenChecks.forEach(token => {
      totalChecks++;
      const value = rootStyles.getPropertyValue(token);
      if (!value || value.trim() === '') {
        regressionCount++;
        issues.push({
          type: 'error',
          message: `Design token ${token} is not defined or has no value`,
          component: 'tokens'
        });
      }
    });

    // Check for console errors that might indicate regressions
    const originalConsoleError = console.error;
    const consoleErrors: string[] = [];
    
    console.error = (...args: any[]) => {
      consoleErrors.push(args.join(' '));
      originalConsoleError.apply(console, args);
    };

    // Restore console.error after a short delay
    setTimeout(() => {
      console.error = originalConsoleError;
    }, 100);

    // Check localStorage for corruption
    try {
      const adsmKeys = Object.keys(localStorage).filter(key => key.startsWith('adsm:'));
      adsmKeys.forEach(key => {
        totalChecks++;
        try {
          const data = localStorage.getItem(key);
          if (data) {
            JSON.parse(data); // Validate JSON
          }
        } catch (error) {
          regressionCount++;
          issues.push({
            type: 'warning',
            message: `Corrupted localStorage data detected for key: ${key}`,
            component: 'storage'
          });
        }
      });
    } catch (error) {
      totalChecks++;
      regressionCount++;
      issues.push({
        type: 'error',
        message: 'Unable to access localStorage for regression check',
        component: 'storage'
      });
    }

    // Check for theme consistency
    totalChecks++;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const savedTheme = localStorage.getItem('adsm:theme');
    
    if (currentTheme !== savedTheme) {
      issues.push({
        type: 'warning',
        message: `Theme mismatch: DOM shows "${currentTheme}" but localStorage has "${savedTheme}"`,
        component: 'theme'
      });
    }

    const duration = Date.now() - startTime;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;

    return {
      passed: errorCount === 0,
      category: 'regression',
      title: 'Regression Detection Audit',
      description: 'Detects potential regressions in components, tokens, and system state',
      details: issues,
      metrics: {
        duration,
        checked: totalChecks,
        errors: errorCount,
        warnings: warningCount,
        regressions: regressionCount,
        stability: totalChecks > 0 ? Math.round(((totalChecks - regressionCount) / totalChecks) * 100) : 100
      }
    };

  } catch (error) {
    return {
      passed: false,
      category: 'regression',
      title: 'Regression Detection Audit',
      description: 'Failed to run regression detection',
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

// Quick audit function for testRunner
export async function runQuickAudit(components: ComponentInfo[]): Promise<AuditResult[]> {
  try {
    const results = await runAudits(QUICK_AUDIT_KEYS, components);
    return results;
  } catch (error) {
    return [{
      passed: false,
      category: 'regression',
      title: 'Quick Audit Failed',
      description: 'Failed to run quick audit suite',
      details: [{
        type: 'error',
        message: `Quick audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        component: 'system'
      }],
      metrics: {
        duration: 0,
        checked: 0,
        errors: 1,
        warnings: 0
      }
    }];
  }
}

// Full audit function for testRunner  
export async function runFullAudit(components: ComponentInfo[]): Promise<AuditResult[]> {
  try {
    const results = await runAudits(FULL_AUDIT_KEYS, components);
    return results;
  } catch (error) {
    return [{
      passed: false,
      category: 'regression',
      title: 'Full Audit Failed',
      description: 'Failed to run full audit suite',
      details: [{
        type: 'error',
        message: `Full audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        component: 'system'
      }],
      metrics: {
        duration: 0,
        checked: 0,
        errors: 1,
        warnings: 0
      }
    }];
  }
}

// Helper function for running specific audit types
export async function runAuditType(
  auditType: 'accessibility' | 'architecture' | 'tokens' | 'performance',
  components: ComponentInfo[]
): Promise<AuditResult[]> {
  try {
    // Filter audit keys by category
    const auditsByCategory: Record<string, string[]> = {
      accessibility: ['button-accessibility', 'form-accessibility', 'alert-accessibility', 'navigation-accessibility'],
      architecture: ['component-dependencies', 'molecule-composition'],
      tokens: ['atoms-tokens', 'token-surface'],
      performance: ['regression-detection']
    };

    const auditKeys = auditsByCategory[auditType] || [];
    if (auditKeys.length === 0) {
      return [{
        passed: false,
        category: auditType as any,
        title: `${auditType} Audit`,
        description: `No audits defined for category: ${auditType}`,
        details: [{
          type: 'warning',
          message: `No audit configuration found for category: ${auditType}`,
          component: 'system'
        }],
        metrics: {
          duration: 0,
          checked: 0,
          errors: 0,
          warnings: 1
        }
      }];
    }

    const results = await runAudits(auditKeys, components);
    return results;
  } catch (error) {
    return [{
      passed: false,
      category: auditType as any,
      title: `${auditType} Audit Failed`,
      description: `Failed to run ${auditType} audit suite`,
      details: [{
        type: 'error',
        message: `${auditType} audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        component: 'system'
      }],
      metrics: {
        duration: 0,
        checked: 0,
        errors: 1,
        warnings: 0
      }
    }];
  }
}