import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ tone = 'neutral', size = 'md', children, className = '', ...props }, ref) => {
    const baseStyles = {
      // Base styles using tokens only
      fontFamily: 'inherit',
      fontWeight: 'var(--font-weight-medium)',
      lineHeight: 1.2,
      borderRadius: 'var(--radius-lg)',
      border: `1px solid var(--badge-${tone}-border, var(--badge-border, var(--color-border)))`,
      background: `var(--badge-${tone}-bg, var(--badge-bg, var(--color-muted)))`,
      color: `var(--badge-${tone}-text, var(--badge-text, var(--color-foreground)))`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center' as const,
      whiteSpace: 'nowrap' as const,
      verticalAlign: 'middle',
    };

    const sizeStyles = {
      sm: {
        padding: 'var(--space-xs, 8px) var(--space-sm, 12px)',
        fontSize: 'var(--font-size-xs, 12px)',
        minHeight: 'var(--space-lg, 20px)',
        minWidth: 'var(--space-lg, 20px)',
      },
      md: {
        padding: 'var(--space-sm, 12px) var(--space-md, 16px)',
        fontSize: 'var(--font-size-sm, 14px)',
        minHeight: 'var(--space-xl, 24px)',
        minWidth: 'var(--space-xl, 24px)',
      },
    };

    const combinedStyles = {
      ...baseStyles,
      ...sizeStyles[size],
    };

    return (
      <span
        ref={ref}
        className={`atom-badge atom-badge--${tone} atom-badge--${size} ${className}`}
        style={combinedStyles}
        data-atom="badge"
        data-tone={tone}
        data-size={size}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Component metadata for catalog
export const BadgeMeta = {
  name: 'Badge',
  category: 'atoms',
  description: 'A small status indicator for displaying counts, labels, or status information',
  tokens: {
    colors: [
      '--badge-bg', '--badge-text', '--badge-border',
      '--badge-neutral-bg', '--badge-neutral-text', '--badge-neutral-border',
      '--badge-info-bg', '--badge-info-text', '--badge-info-border',
      '--badge-success-bg', '--badge-success-text', '--badge-success-border',
      '--badge-warning-bg', '--badge-warning-text', '--badge-warning-border',
      '--badge-danger-bg', '--badge-danger-text', '--badge-danger-border',
    ],
    sizing: ['--space-xs', '--space-sm', '--space-md', '--space-lg', '--space-xl'],
    typography: ['--font-size-xs', '--font-size-sm', '--font-weight-medium'],
    borders: ['--radius-lg'],
  },
  variants: {
    tone: {
      type: 'enum',
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
      default: 'neutral',
    },
    size: {
      type: 'enum',
      options: ['sm', 'md'],
      default: 'md',
    },
  },
  examples: {
    default: { tone: 'neutral', size: 'md', children: 'Default' },
    info: { tone: 'info', size: 'md', children: 'Info' },
    success: { tone: 'success', size: 'md', children: 'Success' },
    warning: { tone: 'warning', size: 'md', children: 'Warning' },
    danger: { tone: 'danger', size: 'md', children: 'Danger' },
    small: { tone: 'neutral', size: 'sm', children: '3' },
    count: { tone: 'info', size: 'sm', children: '99+' },
  },
};