import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  disabled?: boolean;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked = false, disabled = false, className = '', ...props }, ref) => {
    const trackStyles = {
      // Track styles using tokens only
      width: 'calc(var(--space-lg, 20px) * 2.2)', // ~44px
      height: 'var(--space-lg, 20px)',
      borderRadius: 'calc(var(--space-lg, 20px) / 2)',
      background: disabled 
        ? 'var(--switch-disabled-bg, var(--color-muted))' 
        : checked 
        ? 'var(--switch-checked-bg, var(--color-primary))' 
        : 'var(--switch-unchecked-bg, var(--color-switch-background))',
      border: `2px solid ${disabled 
        ? 'var(--switch-disabled-border, var(--color-muted))' 
        : checked 
        ? 'var(--switch-checked-border, var(--color-primary))' 
        : 'var(--switch-unchecked-border, var(--color-border))'}`,
      position: 'relative' as const,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      flexShrink: 0,
    };

    const thumbStyles = {
      // Thumb styles using tokens only
      width: 'calc(var(--space-lg, 20px) - 6px)', // Slightly smaller than track height
      height: 'calc(var(--space-lg, 20px) - 6px)',
      borderRadius: '50%',
      background: disabled 
        ? 'var(--switch-thumb-disabled, var(--color-muted-foreground))' 
        : 'var(--switch-thumb-color, white)',
      position: 'absolute' as const,
      top: '50%',
      left: checked ? 'calc(100% - var(--space-lg, 20px) + 3px)' : '3px',
      transform: 'translateY(-50%)',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    };

    const inputStyles = {
      // Hidden input
      position: 'absolute' as const,
      opacity: 0,
      width: '100%',
      height: '100%',
      margin: 0,
      cursor: disabled ? 'not-allowed' : 'pointer',
    };

    const focusStyles = {
      ':focus-visible': {
        outline: '3px solid var(--color-ring)',
        outlineOffset: '2px',
      },
    };

    const hoverStyles = disabled ? {} : {
      ':hover': {
        background: checked 
          ? 'var(--switch-checked-hover, var(--color-primary))' 
          : 'var(--switch-unchecked-hover, var(--color-muted))',
      },
    };

    return (
      <div 
        className={`atom-switch ${className}`} 
        style={trackStyles}
        data-atom="switch"
        data-checked={checked}
        data-disabled={disabled}
      >
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          style={inputStyles}
          {...props}
        />
        <div 
          className="atom-switch__thumb" 
          style={thumbStyles}
        />
      </div>
    );
  }
);

Switch.displayName = 'Switch';

// Component metadata for catalog
export const SwitchMeta = {
  name: 'Switch',
  category: 'atoms',
  description: 'A fundamental toggle switch element for binary on/off states',
  tokens: {
    colors: [
      '--switch-checked-bg', '--switch-unchecked-bg', '--switch-disabled-bg',
      '--switch-checked-border', '--switch-unchecked-border', '--switch-disabled-border',
      '--switch-thumb-color', '--switch-thumb-disabled',
      '--switch-checked-hover', '--switch-unchecked-hover',
    ],
    sizing: ['--space-lg'],
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
    default: { checked: false },
    checked: { checked: true },
    disabled: { disabled: true },
    'disabled-checked': { checked: true, disabled: true },
  },
};