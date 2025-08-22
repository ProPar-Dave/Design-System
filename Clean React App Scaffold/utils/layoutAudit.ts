export interface ContrastResult {
  aa: boolean;
  aaa: boolean;
  ratio: number;
  foreground: string;
  background: string;
}

export interface LayoutSchema {
  name: string;
  timestamp: string;
  elements: number;
  interactions: number;
  hasProperFocus: boolean;
  usesTokens: boolean;
  composition: {
    atoms: string[];
    molecules: string[];
    pattern: string;
  };
  accessibility: {
    hasHeadings: boolean;
    hasLabels: boolean;
    hasAria: boolean;
    keyboardNavigable: boolean;
  };
}

export interface LayoutAuditResult {
  name: string;
  schema: LayoutSchema;
  contrastResults: ContrastResult[];
  violations: string[];
  score: number;
}

/**
 * Calculate color contrast ratio between two colors
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  // This is a simplified version - in a real implementation you'd use a proper color library
  // For demo purposes, we'll simulate realistic contrast ratios
  const contrastRatios: Record<string, number> = {
    'dark-on-light': 15.2,
    'light-on-dark': 14.8,
    'primary-on-background': 8.5,
    'muted-on-background': 4.8,
    'accent-on-background': 6.2
  };
  
  // Determine color combination type based on CSS variables or class names
  if (foreground.includes('foreground') && background.includes('background')) {
    return contrastRatios['dark-on-light'] || contrastRatios['light-on-dark'];
  }
  if (foreground.includes('primary')) {
    return contrastRatios['primary-on-background'];
  }
  if (foreground.includes('muted')) {
    return contrastRatios['muted-on-background'];
  }
  
  // Default to a good contrast ratio
  return 7.5;
}

/**
 * Check if contrast meets WCAG guidelines
 */
export function checkContrastCompliance(ratio: number): { aa: boolean; aaa: boolean } {
  return {
    aa: ratio >= 4.5,
    aaa: ratio >= 7.0
  };
}

/**
 * Analyze element composition to identify atoms and molecules
 */
export function analyzeComposition(element: HTMLElement): {
  atoms: string[];
  molecules: string[];
  pattern: string;
} {
  const atoms: string[] = [];
  const molecules: string[] = [];
  
  // Identify atoms by component classes or data attributes
  const atomSelectors = [
    'button', 'input', 'select', 'textarea', 'label', 
    '[class*="adsm-button"]', '[class*="adsm-input"]', '[class*="adsm-select"]'
  ];
  
  const moleculeSelectors = [
    '[class*="card"]', '[class*="toolbar"]', '[class*="field-row"]',
    '[class*="form-group"]', '[class*="alert"]', '[class*="pagination"]',
    '[class*="tabset"]'
  ];
  
  atomSelectors.forEach(selector => {
    const elements = element.querySelectorAll(selector);
    if (elements.length > 0) {
      const componentName = selector.replace(/[[\].*]/g, '').replace('adsm-', '');
      atoms.push(`${componentName} (${elements.length})`);
    }
  });
  
  moleculeSelectors.forEach(selector => {
    const elements = element.querySelectorAll(selector);
    if (elements.length > 0) {
      const componentName = selector.replace(/[[\].*]/g, '').replace('adsm-', '');
      molecules.push(`${componentName} (${elements.length})`);
    }
  });
  
  // Determine composition pattern
  let pattern = 'Unknown';
  if (molecules.includes('card') && atoms.includes('button')) {
    pattern = 'Card-based Form';
  } else if (molecules.includes('toolbar') && molecules.includes('pagination')) {
    pattern = 'Data Management Interface';
  } else if (molecules.includes('tabset')) {
    pattern = 'Tabbed Content Layout';
  }
  
  return { atoms, molecules, pattern };
}

/**
 * Check accessibility features of an element
 */
export function auditAccessibility(element: HTMLElement): {
  hasHeadings: boolean;
  hasLabels: boolean;
  hasAria: boolean;
  keyboardNavigable: boolean;
} {
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const labels = element.querySelectorAll('label');
  const ariaElements = element.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
  const focusableElements = element.querySelectorAll(
    'button, input, select, textarea, a, [tabindex]:not([tabindex="-1"])'
  );
  
  return {
    hasHeadings: headings.length > 0,
    hasLabels: labels.length > 0,
    hasAria: ariaElements.length > 0,
    keyboardNavigable: focusableElements.length > 0
  };
}

/**
 * Generate comprehensive layout audit
 */
export function auditLayout(name: string, element: HTMLElement): LayoutAuditResult {
  const timestamp = new Date().toISOString();
  const allElements = element.querySelectorAll('*');
  const interactiveElements = element.querySelectorAll(
    'button, input, select, textarea, a, [role="button"], [tabindex]:not([tabindex="-1"])'
  );
  
  const composition = analyzeComposition(element);
  const accessibility = auditAccessibility(element);
  
  const schema: LayoutSchema = {
    name,
    timestamp,
    elements: allElements.length,
    interactions: interactiveElements.length,
    hasProperFocus: true, // Assume true for demo
    usesTokens: true, // Assume true for our components
    composition,
    accessibility
  };
  
  // Simulate contrast testing on key elements
  const contrastResults: ContrastResult[] = [
    {
      aa: true,
      aaa: true,
      ratio: 15.2,
      foreground: 'var(--color-foreground)',
      background: 'var(--color-background)'
    },
    {
      aa: true,
      aaa: false,
      ratio: 5.8,
      foreground: 'var(--color-muted-foreground)',
      background: 'var(--color-background)'
    }
  ];
  
  // Check for violations
  const violations: string[] = [];
  if (!accessibility.hasLabels && interactiveElements.length > 0) {
    violations.push('Interactive elements missing proper labels');
  }
  if (!accessibility.hasHeadings) {
    violations.push('Layout missing heading structure');
  }
  
  // Calculate overall score
  const baseScore = 85;
  const accessibilityBonus = Object.values(accessibility).filter(Boolean).length * 5;
  const contrastBonus = contrastResults.every(r => r.aa) ? 10 : 0;
  const violationsPenalty = violations.length * 5;
  
  const score = Math.min(100, Math.max(0, baseScore + accessibilityBonus + contrastBonus - violationsPenalty));
  
  // Log detailed results
  console.group(`Layout Audit: ${name}`);
  console.log('Schema:', schema);
  console.log('Contrast Results:', contrastResults);
  console.log('Violations:', violations);
  console.log('Score:', score);
  console.groupEnd();
  
  return {
    name,
    schema,
    contrastResults,
    violations,
    score
  };
}

/**
 * Export audit results as structured data
 */
export function exportAuditResults(results: LayoutAuditResult[]): string {
  const exportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalLayouts: results.length,
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      aaCompliant: results.filter(r => r.contrastResults.every(c => c.aa)).length,
      aaaCompliant: results.filter(r => r.contrastResults.every(c => c.aaa)).length
    },
    results
  };
  
  return JSON.stringify(exportData, null, 2);
}