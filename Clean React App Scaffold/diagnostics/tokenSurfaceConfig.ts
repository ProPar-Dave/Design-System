/**
 * Token Surface Allowlist Configuration
 * 
 * Defines which token prefixes each component is allowed to use.
 * This prevents components from using arbitrary tokens and enforces
 * a clean token contract system.
 */

export interface TokenAllowlist {
  [componentName: string]: string[];
}

/**
 * Component token allowlist mapping
 * Each component can only use tokens with the specified prefixes
 */
export const TOKEN_ALLOWLIST: TokenAllowlist = {
  // Atoms - Base components
  'Button': [
    '--button-',
    '--color-text',
    '--color-foreground', 
    '--space-',
    '--radius-',
    '--font-',
    '--line-height-',
    '--touch-target-'
  ],
  
  'Input': [
    '--input-',
    '--color-text',
    '--color-foreground',
    '--color-background',
    '--space-',
    '--radius-',
    '--font-',
    '--line-height-',
    '--touch-target-'
  ],
  
  'Chip': [
    '--chip-',
    '--space-',
    '--radius-',
    '--font-',
    '--line-height-'
  ],
  
  'Badge': [
    '--badge-',
    '--chip-', // Badges can use chip tokens as fallback
    '--space-',
    '--radius-',
    '--font-',
    '--line-height-'
  ],
  
  'Checkbox': [
    '--checkbox-',
    '--color-primary',
    '--color-text',
    '--color-foreground',
    '--space-',
    '--radius-',
    '--touch-target-'
  ],
  
  'Radio': [
    '--radio-',
    '--color-primary',
    '--color-text',
    '--color-foreground',
    '--space-',
    '--radius-',
    '--touch-target-'
  ],
  
  'Switch': [
    '--switch-',
    '--color-primary',
    '--color-text',
    '--color-foreground',
    '--space-',
    '--radius-',
    '--touch-target-'
  ],
  
  'Select': [
    '--select-',
    '--input-', // Selects can use input tokens as base
    '--color-text',
    '--color-foreground',
    '--color-background',
    '--space-',
    '--radius-',
    '--font-',
    '--line-height-',
    '--touch-target-'
  ],
  
  'Textarea': [
    '--textarea-',
    '--input-', // Textareas can use input tokens as base
    '--color-text',
    '--color-foreground',
    '--color-background',
    '--space-',
    '--radius-',
    '--font-',
    '--line-height-'
  ],
  
  'Label': [
    '--label-',
    '--color-text',
    '--color-foreground',
    '--space-',
    '--font-',
    '--line-height-'
  ],
  
  'HelpText': [
    '--help-text-',
    '--color-text',
    '--color-foreground',
    '--color-muted',
    '--space-',
    '--font-',
    '--line-height-'
  ],
  
  'Divider': [
    '--divider-',
    '--color-border',
    '--space-'
  ],

  // Molecules - Composite components
  'Card': [
    '--card-',
    '--color-background',
    '--color-foreground',
    '--color-border',
    '--space-',
    '--radius-',
    '--shadow-'
  ],
  
  'Alert': [
    '--alert-',
    '--chip-', // Alerts can use chip variants
    '--color-text',
    '--color-foreground',
    '--space-',
    '--radius-',
    '--font-',
    '--line-height-'
  ],
  
  'Toast': [
    '--toast-',
    '--alert-', // Toasts can use alert tokens as base
    '--color-text',
    '--color-foreground',
    '--space-',
    '--radius-',
    '--shadow-',
    '--font-',
    '--line-height-'
  ],
  
  'Tabset': [
    '--tab-',
    '--color-text',
    '--color-foreground',
    '--color-primary',
    '--space-',
    '--radius-',
    '--font-',
    '--line-height-'
  ],
  
  'FormGroup': [
    '--form-',
    '--space-',
    '--radius-'
  ],
  
  'FieldRow': [
    '--field-',
    '--form-', // Field rows can use form tokens
    '--space-'
  ],
  
  'Pagination': [
    '--pagination-',
    '--button-', // Pagination can use button tokens for controls
    '--color-text',
    '--color-foreground',
    '--space-',
    '--radius-',
    '--font-',
    '--line-height-'
  ],
  
  'Toolbar': [
    '--toolbar-',
    '--color-background',
    '--color-border',
    '--space-',
    '--radius-'
  ]
};

/**
 * Global tokens that any component can use
 * These are foundational tokens that don't belong to specific components
 */
export const GLOBAL_ALLOWED_TOKENS = [
  '--color-transparent',
  '--color-current',
  '--color-inherit',
  '--size-full',
  '--size-auto',
  '--display-',
  '--position-',
  '--z-index-'
];

/**
 * Patterns that indicate raw color usage (not allowed)
 */
export const RAW_COLOR_PATTERNS = [
  // Hex colors
  /#[0-9a-fA-F]{3,8}\b/g,
  
  // RGB/RGBA
  /rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g,
  /rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)/g,
  
  // HSL/HSLA  
  /hsl\s*\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g,
  /hsla\s*\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)/g,
  
  // Named colors (common ones)
  /\b(red|blue|green|yellow|purple|orange|pink|black|white|gray|grey)\b/g
];

/**
 * Get allowed token prefixes for a component
 */
export function getAllowedTokens(componentName: string): string[] {
  const componentTokens = TOKEN_ALLOWLIST[componentName] || [];
  return [...componentTokens, ...GLOBAL_ALLOWED_TOKENS];
}

/**
 * Check if a token is allowed for a component
 */
export function isTokenAllowed(componentName: string, token: string): boolean {
  const allowedPrefixes = getAllowedTokens(componentName);
  
  return allowedPrefixes.some(prefix => 
    token.startsWith(prefix) || token === prefix.replace(/\-$/, '')
  );
}