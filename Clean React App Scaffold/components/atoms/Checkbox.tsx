import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked = false, disabled = false, indeterminate = false, className = '', ...props }, ref) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);
    
    React.useImperativeHandle(ref, () => checkboxRef.current!);
    
    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const baseStyles = {
      // Base styles using tokens only
      width: 'var(--space-lg, 20px)',
      height: 'var(--space-lg, 20px)',
      borderRadius: 'var(--radius-sm, 4px)',
      border: `2px solid var(--input-border, var(--color-border))`,
      background: disabled 
        ? 'var(--input-disabled-bg, var(--color-muted))' 
        : checked || indeterminate 
        ? 'var(--checkbox-checked-bg, var(--color-primary))' 
        : 'var(--input-bg, var(--color-input-background))',
      transition: 'all 0.2s ease',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      position: 'relative' as const,
      appearance: 'none' as const,
      flexShrink: 0,
      // Checkmark styles using CSS
      backgroundImage: (checked || indeterminate) && !disabled 
        ? indeterminate
          ? `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3e%3crect x='3' y='7' width='10' height='2'/%3e%3c/svg%3e")`
          : `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3e%3cpath d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e")`
        : 'none',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: '75%',
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
        borderColor: 'var(--checkbox-hover-border, var(--color-primary))',
        background: checked || indeterminate 
          ? 'var(--checkbox-checked-hover, var(--color-primary))' 
          : 'var(--checkbox-hover-bg, var(--color-muted))',
      },
    };

    const combinedStyles = {
      ...baseStyles,
      opacity: disabled ? 0.6 : 1,
    };

    return (
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className={`atom-checkbox ${indeterminate ? 'atom-checkbox--indeterminate' : ''} ${className}`}
        style={combinedStyles}
        data-atom="checkbox"
        data-checked={checked}
        data-indeterminate={indeterminate}
        data-disabled={disabled}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';

// Component metadata for catalog
export const CheckboxMeta = {
  name: 'Checkbox',
  category: 'atoms',
  description: 'A fundamental form checkbox element for binary or multi-select choices',
  tokens: {
    colors: [
      '--input-bg', '--input-border', '--input-focus-border',
      '--checkbox-checked-bg', '--checkbox-checked-hover', '--checkbox-hover-bg', '--checkbox-hover-border',
      '--input-disabled-bg',
    ],
    sizing: ['--space-lg', '--touch-target-md'],
    borders: ['--radius-sm'],
    focus: ['--color-ring'],
  },
  variants: {
    checked: {
      type: 'boolean',
      default: false,
    },
    indeterminate: {
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
    indeterminate: { indeterminate: true },
    disabled: { disabled: true },
    'disabled-checked': { checked: true, disabled: true },
  },
};