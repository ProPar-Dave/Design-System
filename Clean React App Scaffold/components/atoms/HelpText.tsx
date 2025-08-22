import React from 'react';

export interface HelpTextProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'neutral' | 'error' | 'warning' | 'success';
  children: React.ReactNode;
}

export const HelpText = React.forwardRef<HTMLDivElement, HelpTextProps>(
  ({ tone = 'neutral', children, className = '', ...props }, ref) => {
    const baseStyles = {
      // Base styles using tokens only
      fontFamily: 'inherit',
      fontSize: 'var(--font-size-xs, 12px)',
      fontWeight: 'var(--font-weight-normal)',
      lineHeight: 1.4,
      color: tone === 'neutral' 
        ? 'var(--help-text-color, var(--color-muted-foreground))'
        : tone === 'error' 
        ? 'var(--help-text-error-color, var(--color-destructive))'
        : tone === 'warning' 
        ? 'var(--help-text-warning-color, var(--warning-text))'
        : 'var(--help-text-success-color, var(--success-text))',
      marginTop: 'var(--space-xs, 8px)',
      display: 'block',
    };

    const combinedStyles = {
      ...baseStyles,
    };

    return (
      <div
        ref={ref}
        className={`atom-help-text atom-help-text--${tone} ${className}`}
        style={combinedStyles}
        data-atom="help-text"
        data-tone={tone}
        role={tone === 'error' ? 'alert' : undefined}
        aria-live={tone === 'error' ? 'polite' : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

HelpText.displayName = 'HelpText';

// Component metadata for catalog
export const HelpTextMeta = {
  name: 'HelpText',
  category: 'atoms',
  description: 'A fundamental text element for providing additional context or error messages',
  tokens: {
    colors: [
      '--help-text-color', '--help-text-error-color', '--help-text-warning-color', '--help-text-success-color',
    ],
    sizing: ['--space-xs'],
    typography: ['--font-size-xs', '--font-weight-normal'],
  },
  variants: {
    tone: {
      type: 'enum',
      options: ['neutral', 'error', 'warning', 'success'],
      default: 'neutral',
    },
  },
  examples: {
    default: { tone: 'neutral', children: 'This is helpful information about the field above.' },
    error: { tone: 'error', children: 'This field is required and cannot be empty.' },
    warning: { tone: 'warning', children: 'This action cannot be undone.' },
    success: { tone: 'success', children: 'Your changes have been saved successfully.' },
  },
};