import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ tone = 'neutral', size = 'md', children, removable = false, onRemove, className = '', ...props }, ref) => {
    const baseStyles = {
      // Base styles using tokens only
      fontFamily: 'inherit',
      fontWeight: 'var(--font-weight-medium)',
      lineHeight: 1.4,
      borderRadius: 'var(--radius-md)',
      border: `1px solid var(--chip-${tone}-border, var(--chip-border, var(--color-border)))`,
      background: `var(--chip-${tone}-bg, var(--chip-bg, var(--color-muted)))`,
      color: `var(--chip-${tone}-text, var(--chip-text, var(--color-foreground)))`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-xs, 8px)',
      transition: 'all 0.2s ease',
      cursor: removable ? 'pointer' : 'default',
      position: 'relative' as const,
    };

    const sizeStyles = {
      sm: {
        padding: 'var(--space-xs, 8px) var(--space-sm, 12px)',
        fontSize: 'var(--font-size-xs, 12px)',
        minHeight: 'var(--touch-target-sm, 32px)',
      },
      md: {
        padding: 'var(--space-sm, 12px) var(--space-md, 16px)',
        fontSize: 'var(--font-size-sm, 14px)',
        minHeight: 'var(--touch-target-sm, 32px)',
      },
    };

    const hoverStyles = removable ? {
      ':hover': {
        background: `var(--chip-${tone}-hover, var(--chip-hover, var(--color-accent)))`,
        borderColor: `var(--chip-${tone}-hover-border, var(--chip-hover-border, var(--color-accent-foreground)))`,
      },
    } : {};

    const focusStyles = removable ? {
      ':focus-visible': {
        outline: '3px solid var(--color-ring)',
        outlineOffset: '2px',
      },
    } : {};

    const combinedStyles = {
      ...baseStyles,
      ...sizeStyles[size],
    };

    const removeButtonStyles = {
      background: 'transparent',
      border: 'none',
      color: 'inherit',
      cursor: 'pointer',
      padding: 'var(--space-xs, 8px)',
      borderRadius: '50%',
      width: 'var(--space-md, 16px)',
      height: 'var(--space-md, 16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 'var(--space-xs, 8px)',
      fontSize: 'var(--font-size-xs, 12px)',
      transition: 'all 0.2s ease',
    };

    return (
      <div
        ref={ref}
        className={`atom-chip atom-chip--${tone} atom-chip--${size} ${className}`}
        style={combinedStyles}
        data-atom="chip"
        data-tone={tone}
        data-size={size}
        data-removable={removable}
        tabIndex={removable ? 0 : undefined}
        role={removable ? 'button' : undefined}
        {...props}
      >
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className="atom-chip__remove"
            style={removeButtonStyles}
            aria-label="Remove"
            tabIndex={-1}
          >
            ×
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';

// Component metadata for catalog
export const ChipMeta = {
  name: 'Chip',
  category: 'atoms',
  description: 'A compact element for displaying tags, categories, or removable items',
  tokens: {
    colors: [
      '--chip-bg', '--chip-text', '--chip-border', '--chip-hover', '--chip-hover-border',
      '--chip-neutral-bg', '--chip-neutral-text', '--chip-neutral-border', '--chip-neutral-hover', '--chip-neutral-hover-border',
      '--chip-info-bg', '--chip-info-text', '--chip-info-border', '--chip-info-hover', '--chip-info-hover-border',
      '--chip-success-bg', '--chip-success-text', '--chip-success-border', '--chip-success-hover', '--chip-success-hover-border',
      '--chip-warning-bg', '--chip-warning-text', '--chip-warning-border', '--chip-warning-hover', '--chip-warning-hover-border',
      '--chip-danger-bg', '--chip-danger-text', '--chip-danger-border', '--chip-danger-hover', '--chip-danger-hover-border',
    ],
    sizing: ['--space-xs', '--space-sm', '--space-md', '--touch-target-sm'],
    typography: ['--font-size-xs', '--font-size-sm', '--font-weight-medium'],
    borders: ['--radius-md'],
    focus: ['--color-ring'],
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
    removable: {
      type: 'boolean',
      default: false,
    },
  },
  examples: {
    default: { tone: 'neutral', size: 'md', children: 'Default chip' },
    info: { tone: 'info', size: 'md', children: 'Info chip' },
    success: { tone: 'success', size: 'md', children: 'Success chip' },
    warning: { tone: 'warning', size: 'md', children: 'Warning chip' },
    danger: { tone: 'danger', size: 'md', children: 'Danger chip' },
    removable: { tone: 'neutral', size: 'md', removable: true, children: 'Removable chip' },
    small: { tone: 'neutral', size: 'sm', children: 'Small chip' },
  },
};