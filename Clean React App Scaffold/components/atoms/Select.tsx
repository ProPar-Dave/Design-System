import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ size = 'md', invalid = false, disabled = false, className = '', children, ...props }, ref) => {
    const baseStyles = {
      // Base styles using tokens only
      fontFamily: 'inherit',
      fontWeight: 'var(--font-weight-normal)',
      lineHeight: 1.5,
      borderRadius: 'var(--radius-md)',
      border: `2px solid ${invalid 
        ? 'var(--input-error-border, var(--color-destructive))' 
        : 'var(--input-border, var(--color-border))'}`,
      background: disabled 
        ? 'var(--input-disabled-bg, var(--color-muted))' 
        : 'var(--input-bg, var(--color-input-background))',
      color: disabled 
        ? 'var(--input-disabled-text, var(--color-muted-foreground))' 
        : 'var(--input-text, var(--color-foreground))',
      transition: 'all 0.2s ease',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box' as const,
      cursor: disabled ? 'not-allowed' : 'pointer',
      // Custom arrow using CSS
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right var(--space-sm, 12px) center',
      backgroundSize: 'var(--space-md, 16px)',
      paddingRight: 'calc(var(--space-lg, 20px) + var(--space-md, 16px))', // Space for arrow
    };

    const sizeStyles = {
      sm: {
        padding: 'var(--space-xs, 8px) var(--space-sm, 12px)',
        fontSize: 'var(--font-size-sm, 14px)',
        minHeight: 'var(--touch-target-sm, 32px)',
        paddingRight: 'calc(var(--space-md, 16px) + var(--space-sm, 12px))',
      },
      md: {
        padding: 'var(--space-sm, 12px) var(--space-md, 16px)',
        fontSize: 'var(--font-size-base, 16px)',
        minHeight: 'var(--touch-target-md, 44px)',
        paddingRight: 'calc(var(--space-lg, 20px) + var(--space-md, 16px))',
      },
      lg: {
        padding: 'var(--space-md, 16px) var(--space-lg, 20px)',
        fontSize: 'var(--font-size-lg, 18px)',
        minHeight: 'var(--touch-target-lg, 48px)',
        paddingRight: 'calc(var(--space-xl, 24px) + var(--space-lg, 20px))',
      },
    };

    const focusStyles = {
      ':focus': {
        borderColor: invalid 
          ? 'var(--input-error-border, var(--color-destructive))' 
          : 'var(--input-focus-border, var(--color-ring))',
        outline: '3px solid var(--color-ring)',
        outlineOffset: '2px',
        boxShadow: `0 0 0 1px ${invalid 
          ? 'var(--input-error-border, var(--color-destructive))' 
          : 'var(--input-focus-border, var(--color-ring))'}`,
      },
    };

    const combinedStyles = {
      ...baseStyles,
      ...sizeStyles[size],
      opacity: disabled ? 0.6 : 1,
    };

    return (
      <select
        ref={ref}
        disabled={disabled}
        className={`atom-select atom-select--${size} ${invalid ? 'atom-select--invalid' : ''} ${className}`}
        style={combinedStyles}
        data-atom="select"
        data-size={size}
        data-invalid={invalid}
        data-disabled={disabled}
        aria-invalid={invalid}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

// Component metadata for catalog
export const SelectMeta = {
  name: 'Select',
  category: 'atoms',
  description: 'A fundamental form select element for choosing options',
  tokens: {
    colors: [
      '--input-bg', '--input-text', '--input-border',
      '--input-focus-border', '--input-error-border',
      '--input-disabled-bg', '--input-disabled-text',
    ],
    sizing: ['--space-xs', '--space-sm', '--space-md', '--space-lg', '--space-xl', '--touch-target-sm', '--touch-target-md', '--touch-target-lg'],
    typography: ['--font-size-sm', '--font-size-base', '--font-size-lg', '--font-weight-normal'],
    borders: ['--radius-md'],
    focus: ['--color-ring'],
  },
  variants: {
    size: {
      type: 'enum',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
    invalid: {
      type: 'boolean',
      default: false,
    },
    disabled: {
      type: 'boolean',
      default: false,
    },
  },
  examples: {
    default: { size: 'md', children: [<option key="1" value="">Choose an option</option>, <option key="2" value="1">Option 1</option>, <option key="3" value="2">Option 2</option>] },
    small: { size: 'sm', children: [<option key="1" value="">Small select</option>, <option key="2" value="1">Option 1</option>] },
    invalid: { size: 'md', invalid: true, children: [<option key="1" value="">Invalid select</option>, <option key="2" value="1">Option 1</option>] },
    disabled: { size: 'md', disabled: true, children: [<option key="1" value="">Disabled select</option>, <option key="2" value="1">Option 1</option>] },
  },
};