import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', disabled = false, className = '', children, ...props }, ref) => {
    const baseStyles = {
      // Base styles using tokens only
      fontFamily: 'inherit',
      fontWeight: 'var(--font-weight-medium)',
      lineHeight: 1.5,
      borderRadius: 'var(--radius-md)',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-xs, 8px)',
      textDecoration: 'none',
      outline: 'none',
      position: 'relative' as const,
    };

    const sizeStyles = {
      sm: {
        padding: 'var(--space-xs, 8px) var(--space-sm, 12px)',
        fontSize: 'var(--font-size-sm, 14px)',
        minHeight: 'var(--touch-target-sm, 32px)',
        minWidth: 'var(--touch-target-sm, 32px)',
      },
      md: {
        padding: 'var(--space-sm, 12px) var(--space-md, 16px)',
        fontSize: 'var(--font-size-base, 16px)',
        minHeight: 'var(--touch-target-md, 44px)',
        minWidth: 'var(--touch-target-md, 44px)',
      },
      lg: {
        padding: 'var(--space-md, 16px) var(--space-lg, 20px)',
        fontSize: 'var(--font-size-lg, 18px)',
        minHeight: 'var(--touch-target-lg, 48px)',
        minWidth: 'var(--touch-target-lg, 48px)',
      },
    };

    const variantStyles = {
      primary: {
        background: disabled 
          ? 'var(--button-primary-disabled, var(--color-muted))' 
          : 'var(--button-primary-bg, var(--color-primary))',
        color: disabled 
          ? 'var(--button-primary-disabled-text, var(--color-muted-foreground))' 
          : 'var(--button-primary-text, var(--color-primary-foreground))',
      },
      secondary: {
        background: disabled 
          ? 'var(--button-secondary-disabled, var(--color-muted))' 
          : 'var(--button-secondary-bg, transparent)',
        color: disabled 
          ? 'var(--button-secondary-disabled-text, var(--color-muted-foreground))' 
          : 'var(--button-secondary-text, var(--color-foreground))',
        border: `2px solid ${disabled 
          ? 'var(--button-secondary-disabled, var(--color-muted))' 
          : 'var(--button-secondary-border, var(--color-border))'}`,
      },
      ghost: {
        background: disabled 
          ? 'var(--button-ghost-disabled, transparent)' 
          : 'var(--button-ghost-bg, transparent)',
        color: disabled 
          ? 'var(--button-ghost-disabled-text, var(--color-muted-foreground))' 
          : 'var(--button-ghost-text, var(--color-foreground))',
      },
      destructive: {
        background: disabled 
          ? 'var(--button-destructive-disabled, var(--color-muted))' 
          : 'var(--button-destructive-bg, var(--color-destructive))',
        color: disabled 
          ? 'var(--button-destructive-disabled-text, var(--color-muted-foreground))' 
          : 'var(--button-destructive-text, var(--color-destructive-foreground))',
      },
    };

    const hoverStyles = disabled ? {} : {
      ':hover': {
        background: variant === 'primary' 
          ? 'var(--button-primary-hover, var(--button-primary-bg))' 
          : variant === 'secondary' 
          ? 'var(--button-secondary-hover, var(--color-muted))' 
          : variant === 'ghost' 
          ? 'var(--button-ghost-hover, var(--color-muted))' 
          : 'var(--button-destructive-hover, var(--button-destructive-bg))',
      },
    };

    const focusStyles = {
      ':focus-visible': {
        outline: '3px solid var(--color-ring)',
        outlineOffset: '2px',
        boxShadow: '0 0 0 2px var(--color-background), 0 0 0 5px var(--color-ring)',
      },
    };

    const activeStyles = disabled ? {} : {
      ':active': {
        background: variant === 'primary' 
          ? 'var(--button-primary-active, var(--button-primary-bg))' 
          : variant === 'secondary' 
          ? 'var(--button-secondary-active, var(--color-border))' 
          : variant === 'ghost' 
          ? 'var(--button-ghost-active, var(--color-border))' 
          : 'var(--button-destructive-active, var(--button-destructive-bg))',
        transform: 'translateY(1px)',
      },
    };

    const combinedStyles = {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`atom-button atom-button--${variant} atom-button--${size} ${className}`}
        style={combinedStyles}
        data-atom="button"
        data-variant={variant}
        data-size={size}
        data-disabled={disabled}
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Component metadata for catalog
export const ButtonMeta = {
  name: 'Button',
  category: 'atoms',
  description: 'A fundamental interactive element for triggering actions',
  tokens: {
    colors: [
      '--button-primary-bg', '--button-primary-text', '--button-primary-hover', '--button-primary-active', '--button-primary-disabled',
      '--button-secondary-bg', '--button-secondary-text', '--button-secondary-border', '--button-secondary-hover', '--button-secondary-active', '--button-secondary-disabled',
      '--button-ghost-bg', '--button-ghost-text', '--button-ghost-hover', '--button-ghost-active', '--button-ghost-disabled',
      '--button-destructive-bg', '--button-destructive-text', '--button-destructive-hover', '--button-destructive-active', '--button-destructive-disabled',
    ],
    sizing: ['--space-xs', '--space-sm', '--space-md', '--space-lg', '--touch-target-sm', '--touch-target-md', '--touch-target-lg'],
    typography: ['--font-size-sm', '--font-size-base', '--font-size-lg', '--font-weight-medium'],
    borders: ['--radius-md'],
    focus: ['--color-ring'],
  },
  variants: {
    variant: {
      type: 'enum',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      default: 'primary',
    },
    size: {
      type: 'enum',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
    disabled: {
      type: 'boolean',
      default: false,
    },
  },
  examples: {
    default: { variant: 'primary', size: 'md', children: 'Button' },
    secondary: { variant: 'secondary', size: 'md', children: 'Button' },
    small: { variant: 'primary', size: 'sm', children: 'Button' },
    disabled: { variant: 'primary', size: 'md', disabled: true, children: 'Button' },
    destructive: { variant: 'destructive', size: 'md', children: 'Delete' },
  },
};