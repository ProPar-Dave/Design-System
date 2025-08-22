import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, disabled = false, children, className = '', ...props }, ref) => {
    const baseStyles = {
      // Base styles using tokens only
      fontFamily: 'inherit',
      fontSize: 'var(--font-size-sm, 14px)',
      fontWeight: 'var(--font-weight-medium)',
      lineHeight: 1.5,
      color: disabled 
        ? 'var(--label-disabled-text, var(--color-muted-foreground))' 
        : 'var(--label-text, var(--color-foreground))',
      display: 'block',
      marginBottom: 'var(--space-xs, 8px)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'color 0.2s ease',
    };

    const requiredStyles = required ? {
      '::after': {
        content: '" *"',
        color: 'var(--label-required-color, var(--color-destructive))',
        marginLeft: 'var(--space-xs, 8px)',
      },
    } : {};

    const combinedStyles = {
      ...baseStyles,
      opacity: disabled ? 0.6 : 1,
    };

    return (
      <label
        ref={ref}
        className={`atom-label ${required ? 'atom-label--required' : ''} ${disabled ? 'atom-label--disabled' : ''} ${className}`}
        style={combinedStyles}
        data-atom="label"
        data-required={required}
        data-disabled={disabled}
        {...props}
      >
        {children}
        {required && (
          <span 
            className="atom-label__required" 
            style={{ color: 'var(--label-required-color, var(--color-destructive))', marginLeft: 'var(--space-xs, 8px)' }}
            aria-label="required"
          >
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

// Component metadata for catalog
export const LabelMeta = {
  name: 'Label',
  category: 'atoms',
  description: 'A fundamental form label element for describing form controls',
  tokens: {
    colors: [
      '--label-text', '--label-disabled-text', '--label-required-color',
    ],
    sizing: ['--space-xs'],
    typography: ['--font-size-sm', '--font-weight-medium'],
  },
  variants: {
    required: {
      type: 'boolean',
      default: false,
    },
    disabled: {
      type: 'boolean',
      default: false,
    },
  },
  examples: {
    default: { children: 'Form Label' },
    required: { required: true, children: 'Required Label' },
    disabled: { disabled: true, children: 'Disabled Label' },
  },
};