import { runAccessibilityAudit } from './buttonAccessibilityAudit';
import { runFormFieldAccessibilityAudit } from './formFieldAccessibilityAudit';
import { runAlertAccessibilityAudit } from './alertAccessibilityAudit';  
import { runNavigationAccessibilityAudit } from './navigationAccessibilityAudit';
import { runAtomsTokenAudit } from './atomsTokenAudit';
import { runMoleculeCompositionAudit } from './moleculeCompositionAudit';
import { runTokenSurfaceAudit } from './tokenSurfaceAudit';
import { runComponentDependencyAudit } from './componentDependencyAudit';
import { runRegressionAudit } from './regressionAudit';
import type { AuditResult, ComponentInfo } from './utils';

export interface AuditFunction {
  (components: ComponentInfo[]): Promise<AuditResult>;
}

export interface AuditRegistry {
  [key: string]: {
    fn: AuditFunction;
    category: 'accessibility' | 'architecture' | 'tokens' | 'performance' | 'regression';
    priority: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    estimatedDuration: number; // in milliseconds
    dependencies?: string[]; // other audit keys this depends on
  };
}

export const AUDIT_REGISTRY: AuditRegistry = {
  // Accessibility Audits
  'button-accessibility': {
    fn: runAccessibilityAudit,
    category: 'accessibility',
    priority: 'critical',
    description: 'Validates button component accessibility features including ARIA labels, keyboard navigation, and focus management',
    estimatedDuration: 1000
  },

  'form-accessibility': {
    fn: runFormFieldAccessibilityAudit,
    category: 'accessibility', 
    priority: 'critical',
    description: 'Ensures form fields have proper labels, validation states, and accessibility attributes',
    estimatedDuration: 1500
  },

  'alert-accessibility': {
    fn: runAlertAccessibilityAudit,
    category: 'accessibility',
    priority: 'high', 
    description: 'Validates alert components for proper ARIA roles, live regions, and screen reader compatibility',
    estimatedDuration: 800
  },

  'navigation-accessibility': {
    fn: runNavigationAccessibilityAudit,
    category: 'accessibility',
    priority: 'high',
    description: 'Checks navigation components for keyboard accessibility, focus management, and ARIA navigation patterns',
    estimatedDuration: 1200
  },

  // Architecture Audits  
  'component-dependencies': {
    fn: runComponentDependencyAudit,
    category: 'architecture',
    priority: 'critical',
    description: 'Analyzes component import relationships and enforces atomic design layering principles',
    estimatedDuration: 3000
  },

  'molecule-composition': {
    fn: runMoleculeCompositionAudit,
    category: 'architecture',
    priority: 'high', 
    description: 'Validates that molecules properly compose atoms without violating architectural boundaries',
    estimatedDuration: 2000,
    dependencies: ['component-dependencies']
  },

  // Token Audits
  'atoms-tokens': {
    fn: runAtomsTokenAudit,
    category: 'tokens',
    priority: 'high',
    description: 'Ensures atoms use only approved design tokens and avoid raw CSS values',
    estimatedDuration: 1500
  },

  'token-surface': {
    fn: runTokenSurfaceAudit,
    category: 'tokens', 
    priority: 'medium',
    description: 'Validates token usage against component-specific allowlists and detects token violations',
    estimatedDuration: 2500
  },

  // Regression Audits
  'regression-detection': {
    fn: runRegressionAudit,
    category: 'regression',
    priority: 'medium',
    description: 'Compares current component state against previous versions to detect breaking changes',
    estimatedDuration: 4000
  }
};

// Quick audit runs critical and high priority audits
export const QUICK_AUDIT_KEYS = Object.entries(AUDIT_REGISTRY)
  .filter(([, config]) => config.priority === 'critical' || config.priority === 'high')
  .map(([key]) => key);

// Full audit runs all registered audits
export const FULL_AUDIT_KEYS = Object.keys(AUDIT_REGISTRY);

export async function runAudits(
  auditKeys: string[], 
  components: ComponentInfo[],
  onProgress?: (progress: { completed: number; total: number; current: string }) => void
): Promise<AuditResult[]> {
  const results: AuditResult[] = [];
  const total = auditKeys.length;

  // Sort audits by dependencies and priority
  const sortedKeys = sortAuditsByDependencies(auditKeys);

  for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    const auditConfig = AUDIT_REGISTRY[key];
    
    if (!auditConfig) {
      console.warn(`Unknown audit key: ${key}`);
      continue;
    }

    onProgress?.({ completed: i, total, current: auditConfig.description });

    try {
      const startTime = Date.now();
      const result = await auditConfig.fn(components);
      const actualDuration = Date.now() - startTime;
      
      // Add metadata to result
      result.metadata = {
        key,
        category: auditConfig.category,
        priority: auditConfig.priority,
        estimatedDuration: auditConfig.estimatedDuration,
        actualDuration,
        timestamp: new Date().toISOString()
      };

      results.push(result);
    } catch (error) {
      console.error(`Audit ${key} failed:`, error);
      
      // Create error result
      results.push({
        passed: false,
        category: auditConfig.category,
        title: `${auditConfig.description} (Failed)`,
        description: `Audit execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: [{
          type: 'error',
          message: `System error during ${key} audit`,
          component: 'audit-system'
        }],
        metrics: {
          duration: 0,
          checked: 0,
          errors: 1,
          warnings: 0
        },
        metadata: {
          key,
          category: auditConfig.category,
          priority: auditConfig.priority,
          estimatedDuration: auditConfig.estimatedDuration,
          actualDuration: 0,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }

  onProgress?.({ completed: total, total, current: 'Complete' });
  
  return results;
}

function sortAuditsByDependencies(auditKeys: string[]): string[] {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(key: string) {
    if (visiting.has(key)) {
      throw new Error(`Circular dependency detected in audits involving ${key}`);
    }
    
    if (visited.has(key)) {
      return;
    }

    visiting.add(key);
    
    const auditConfig = AUDIT_REGISTRY[key];
    if (auditConfig?.dependencies) {
      for (const dep of auditConfig.dependencies) {
        if (auditKeys.includes(dep)) {
          visit(dep);
        }
      }
    }

    visiting.delete(key);
    visited.add(key);
    sorted.push(key);
  }

  for (const key of auditKeys) {
    visit(key);
  }

  return sorted;
}

export function getAuditEstimatedDuration(auditKeys: string[]): number {
  return auditKeys.reduce((total, key) => {
    const config = AUDIT_REGISTRY[key];
    return total + (config?.estimatedDuration || 0);
  }, 0);
}

export function getAuditsByCategory(category: string): string[] {
  return Object.entries(AUDIT_REGISTRY)
    .filter(([, config]) => config.category === category)
    .map(([key]) => key);
}

export function getAuditsByPriority(priority: string): string[] {
  return Object.entries(AUDIT_REGISTRY)
    .filter(([, config]) => config.priority === priority)
    .map(([key]) => key);
}

// Generate audit configuration summary for documentation
export function generateAuditConfigSummary(): string {
  const categories = ['accessibility', 'architecture', 'tokens', 'performance', 'regression'];
  
  let summary = '# Audit Configuration\n\n';
  
  categories.forEach(category => {
    const audits = getAuditsByCategory(category);
    if (audits.length === 0) return;
    
    summary += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Audits\n\n`;
    
    audits.forEach(key => {
      const config = AUDIT_REGISTRY[key];
      summary += `### ${key}\n`;
      summary += `- **Priority:** ${config.priority}\n`;
      summary += `- **Estimated Duration:** ${config.estimatedDuration}ms\n`;
      summary += `- **Description:** ${config.description}\n`;
      if (config.dependencies?.length) {
        summary += `- **Dependencies:** ${config.dependencies.join(', ')}\n`;
      }
      summary += '\n';
    });
  });
  
  return summary;
}