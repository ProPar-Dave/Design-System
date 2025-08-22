import React from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  disabled?: boolean;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ checked = false, disabled = false, className = '', ...props }, ref) => {
    const baseStyles = {
      // Base styles using tokens only
      width: 'var(--space-lg, 20px)',
      height: 'var(--space-lg, 20px)',
      borderRadius: '50%',
      border: `2px solid var(--input-border, var(--color-border))`,
      background: disabled 
        ? 'var(--input-disabled-bg, var(--color-muted))' 
        : 'var(--input-bg, var(--color-input-background))',
      transition: 'all 0.2s ease',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      position: 'relative' as const,
      appearance: 'none' as const,
      flexShrink: 0,
      // Dot styles using CSS
      '::after': checked && !disabled ? {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'var(--space-sm, 12px)',
        height: 'var(--space-sm, 12px)',
        borderRadius: '50%',
        background: 'var(--radio-dot-color, var(--color-primary))',
      } : undefined,
    };

    const focusStyles = {
      ':focus': {
        outline: '3px solid var(--color-ring)',
        outlineOffset: '2px',
        borderColor: 'var(--input-focus-border, var(--color-ring))',
      },
    };

    const hoverStyles = disabled ? {} : {
      ':hover': {
        borderColor: 'var(--radio-hover-border, var(--color-primary))',
        background: 'var(--radio-hover-bg, var(--color-muted))',
      },
    };

    const combinedStyles = {
      ...baseStyles,
      opacity: disabled ? 0.6 : 1,
    };

    return (
      <input
        ref={ref}
        type="radio"
        checked={checked}
        disabled={disabled}
        className={`atom-radio ${className}`}
        style={combinedStyles}
        data-atom="radio"
        data-checked={checked}
        data-disabled={disabled}
        {...props}
      />
    );
  }
);

Radio.displayName = 'Radio';

// Component metadata for catalog
export const RadioMeta = {
  name: 'Radio',
  category: 'atoms',
  description: 'A fundamental form radio element for single-select choices',
  tokens: {
    colors: [
      '--input-bg', '--input-border', '--input-focus-border',
      '--radio-dot-color', '--radio-hover-bg', '--radio-hover-border',
      '--input-disabled-bg',
    ],
    sizing: ['--space-lg', '--space-sm'],
    focus: ['--color-ring'],
  },
  variants: {
    checked: {
      type: 'boolean',
      default: false,
    },
    disabled: {
      type: 'boolean',
      default: false,
    },
  },
  examples: {
    default: { checked: false, name: 'example' },
    checked: { checked: true, name: 'example' },
    disabled: { disabled: true, name: 'example' },
    'disabled-checked': { checked: true, disabled: true, name: 'example' },
  },
};