/**
 * Token Surface Helper Utilities
 * 
 * Provides utilities to help developers understand and fix token surface violations,
 * including automated suggestions and validation helpers.
 */

import { TOKEN_ALLOWLIST, GLOBAL_ALLOWED_TOKENS, isTokenAllowed, getAllowedTokens } from '../diagnostics/tokenSurfaceConfig';

export interface TokenSuggestion {
  original: string;
  suggested: string[];
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ComponentTokenAnalysis {
  component: string;
  allowedPrefixes: string[];
  usedTokens: string[];
  violations: string[];
  suggestions: TokenSuggestion[];
  cleanliness: number; // 0-1 score
}

/**
 * Analyze token usage for a specific component
 */
export function analyzeComponentTokens(componentName: string, componentCode: string): ComponentTokenAnalysis {
  const allowedPrefixes = getAllowedTokens(componentName);
  const usedTokens = extractTokensFromCode(componentCode);
  const violations = usedTokens.filter(token => !isTokenAllowed(componentName, token));
  
  // Generate suggestions for each violation
  const suggestions: TokenSuggestion[] = violations.map(token => 
    generateTokenSuggestion(componentName, token)
  );
  
  // Calculate cleanliness score (percentage of allowed tokens)
  const cleanliness = usedTokens.length > 0 ? 
    (usedTokens.length - violations.length) / usedTokens.length : 1;
  
  return {
    component: componentName,
    allowedPrefixes,
    usedTokens,
    violations,
    suggestions,
    cleanliness
  };
}

/**
 * Generate intelligent suggestions for token violations
 */
function generateTokenSuggestion(componentName: string, violatingToken: string): TokenSuggestion {
  const allowedPrefixes = getAllowedTokens(componentName);
  const suggestions: string[] = [];
  let reason = '';
  let confidence: 'high' | 'medium' | 'low' = 'low';
  
  // Strategy 1: Find similar allowed tokens by prefix matching
  const tokenWithoutPrefix = violatingToken.replace(/^--[^-]+-/, '');
  allowedPrefixes.forEach(prefix => {
    if (prefix.endsWith('-')) {
      const candidate = `${prefix}${tokenWithoutPrefix}`;
      suggestions.push(candidate);
    }
  });
  
  // Strategy 2: Common token mappings
  const commonMappings: Record<string, string[]> = {
    '--card-bg': ['--color-background', '--color-background-subtle'],
    '--card-border': ['--color-border'],
    '--card-text': ['--color-foreground', '--color-text'],
    '--toast-bg': ['--alert-bg', '--color-background'],
    '--toast-border': ['--alert-border', '--color-border'],
    '--navbar-bg': ['--color-background', '--color-background-subtle'],
    '--sidebar-bg': ['--color-background', '--color-background-subtle'],
    '--modal-bg': ['--color-background'],
    '--overlay-bg': ['--color-background']
  };
  
  if (commonMappings[violatingToken]) {
    suggestions.push(...commonMappings[violatingToken]);
    reason = `Common pattern: ${violatingToken} should use general tokens`;
    confidence = 'high';
  }
  
  // Strategy 3: Component-specific prefix suggestions
  const componentPrefixes = allowedPrefixes.filter(p => p.startsWith(`--${componentName.toLowerCase()}-`));
  if (componentPrefixes.length > 0) {
    const baseToken = violatingToken.split('-').pop() || '';
    componentPrefixes.forEach(prefix => {
      suggestions.push(`${prefix}${baseToken}`);
    });
    reason = `Use ${componentName}-specific token prefix`;
    confidence = 'medium';
  }
  
  // Strategy 4: Semantic token suggestions
  const semanticPatterns = [
    { pattern: /color|bg|background/, tokens: ['--color-background', '--color-foreground', '--color-primary'] },
    { pattern: /text|foreground/, tokens: ['--color-text', '--color-foreground'] },
    { pattern: /border/, tokens: ['--color-border'] },
    { pattern: /space|padding|margin|gap/, tokens: ['--space-xs', '--space-sm', '--space-md', '--space-lg'] },
    { pattern: /radius|border-radius/, tokens: ['--radius-sm', '--radius-md', '--radius-lg'] },
    { pattern: /shadow|elevation/, tokens: ['--shadow-sm', '--shadow-md', '--shadow-lg'] }
  ];
  
  semanticPatterns.forEach(({ pattern, tokens }) => {
    if (pattern.test(violatingToken)) {
      suggestions.push(...tokens.filter(t => allowedPrefixes.some(p => t.startsWith(p))));
      if (!reason) {
        reason = `Semantic token needed for ${pattern.source} usage`;
        confidence = 'medium';
      }
    }
  });
  
  // Remove duplicates and invalid suggestions
  const uniqueSuggestions = [...new Set(suggestions)]
    .filter(s => isTokenAllowed(componentName, s))
    .slice(0, 5); // Limit to top 5 suggestions
  
  if (!reason) {
    reason = `Token violates ${componentName} allowlist. Use allowed prefixes: ${allowedPrefixes.join(', ')}`;
  }
  
  return {
    original: violatingToken,
    suggested: uniqueSuggestions,
    reason,
    confidence
  };
}

/**
 * Extract CSS custom properties from component code
 */
function extractTokensFromCode(code: string): string[] {
  const tokenRegex = /var\(\s*(--[^,)]+)/g;
  const tokens: string[] = [];
  let match;
  
  while ((match = tokenRegex.exec(code)) !== null) {
    const token = match[1].trim();
    tokens.push(token);
  }
  
  return [...new Set(tokens)];
}

/**
 * Generate a token allowlist for a new component
 */
export function generateComponentTokenAllowlist(componentName: string, componentType: 'atom' | 'molecule'): string[] {
  const baseAllowlist = [...GLOBAL_ALLOWED_TOKENS];
  
  // Add common prefixes based on component type
  if (componentType === 'atom') {
    baseAllowlist.push(
      `--${componentName.toLowerCase()}-`,
      '--color-text',
      '--color-foreground',
      '--space-',
      '--radius-',
      '--font-',
      '--line-height-'
    );
  } else if (componentType === 'molecule') {
    baseAllowlist.push(
      `--${componentName.toLowerCase()}-`,
      '--color-text',
      '--color-foreground',
      '--color-background',
      '--color-border',
      '--space-',
      '--radius-',
      '--shadow-',
      '--font-',
      '--line-height-'
    );
  }
  
  return baseAllowlist;
}

/**
 * Validate and suggest improvements for component token usage
 */
export function validateComponentTokenUsage(componentName: string, code: string): {
  isValid: boolean;
  violations: string[];
  suggestions: string[];
  score: number;
} {
  const analysis = analyzeComponentTokens(componentName, code);
  
  const isValid = analysis.violations.length === 0;
  const violations = analysis.violations;
  const suggestions = analysis.suggestions.map(s => 
    `Replace "${s.original}" with ${s.suggested.length > 0 ? s.suggested[0] : 'allowed token'}: ${s.reason}`
  );
  const score = Math.round(analysis.cleanliness * 100);
  
  return {
    isValid,
    violations,
    suggestions,
    score
  };
}

/**
 * Auto-fix common token violations (returns modified code)
 */
export function autoFixTokenViolations(componentName: string, code: string): {
  fixedCode: string;
  changes: Array<{ from: string; to: string; reason: string }>;
} {
  const analysis = analyzeComponentTokens(componentName, code);
  let fixedCode = code;
  const changes: Array<{ from: string; to: string; reason: string }> = [];
  
  // Apply high-confidence suggestions
  analysis.suggestions
    .filter(s => s.confidence === 'high' && s.suggested.length > 0)
    .forEach(suggestion => {
      const from = `var(${suggestion.original})`;
      const to = `var(${suggestion.suggested[0]})`;
      
      if (fixedCode.includes(from)) {
        fixedCode = fixedCode.replace(new RegExp(escapeRegExp(from), 'g'), to);
        changes.push({
          from: suggestion.original,
          to: suggestion.suggested[0],
          reason: suggestion.reason
        });
      }
    });
  
  return { fixedCode, changes };
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get token surface health summary for all components
 */
export function getTokenSurfaceHealthSummary(): {
  totalComponents: number;
  cleanComponents: number;
  componentsWithViolations: number;
  healthPercentage: number;
  worstOffenders: Array<{ component: string; violationCount: number }>;
} {
  const components = Object.keys(TOKEN_ALLOWLIST);
  const mockAnalysis = components.map(component => ({
    component,
    violations: Math.floor(Math.random() * 3) // Mock data
  }));
  
  const componentsWithViolations = mockAnalysis.filter(a => a.violations > 0);
  const cleanComponents = mockAnalysis.filter(a => a.violations === 0);
  
  const worstOffenders = componentsWithViolations
    .sort((a, b) => b.violations - a.violations)
    .slice(0, 5)
    .map(a => ({ component: a.component, violationCount: a.violations }));
  
  return {
    totalComponents: components.length,
    cleanComponents: cleanComponents.length,
    componentsWithViolations: componentsWithViolations.length,
    healthPercentage: Math.round((cleanComponents.length / components.length) * 100),
    worstOffenders
  };
}

/**
 * Export token allowlist documentation
 */
export function exportTokenAllowlistDocumentation(): string {
  const lines = [
    '# Component Token Allowlist Documentation',
    '',
    'This document outlines which tokens each component is allowed to use.',
    'This ensures proper token contracts and prevents arbitrary token usage.',
    '',
    '## Component Allowlists',
    ''
  ];
  
  Object.entries(TOKEN_ALLOWLIST).forEach(([component, allowedTokens]) => {
    lines.push(`### ${component}`);
    lines.push('');
    lines.push('**Allowed token prefixes:**');
    allowedTokens.forEach(token => {
      lines.push(`- \`${token}\``);
    });
    lines.push('');
  });
  
  lines.push('## Global Tokens');
  lines.push('');
  lines.push('These tokens can be used by any component:');
  lines.push('');
  GLOBAL_ALLOWED_TOKENS.forEach(token => {
    lines.push(`- \`${token}\``);
  });
  
  return lines.join('\n');
}