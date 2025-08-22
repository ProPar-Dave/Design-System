import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  size?: 'sm' | 'md' | 'lg';
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ size = 'md', invalid = false, disabled = false, className = '', ...props }, ref) => {
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
      resize: 'vertical' as const,
      minHeight: 'calc(var(--touch-target-md, 44px) * 2)',
    };

    const sizeStyles = {
      sm: {
        padding: 'var(--space-xs, 8px) var(--space-sm, 12px)',
        fontSize: 'var(--font-size-sm, 14px)',
        minHeight: 'calc(var(--touch-target-sm, 32px) * 2)',
      },
      md: {
        padding: 'var(--space-sm, 12px) var(--space-md, 16px)',
        fontSize: 'var(--font-size-base, 16px)',
        minHeight: 'calc(var(--touch-target-md, 44px) * 2)',
      },
      lg: {
        padding: 'var(--space-md, 16px) var(--space-lg, 20px)',
        fontSize: 'var(--font-size-lg, 18px)',
        minHeight: 'calc(var(--touch-target-lg, 48px) * 2)',
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

    const placeholderStyles = {
      '::placeholder': {
        color: 'var(--input-placeholder, var(--color-muted-foreground))',
        opacity: 1,
      },
    };

    const combinedStyles = {
      ...baseStyles,
      ...sizeStyles[size],
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? 'not-allowed' : 'text',
    };

    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={`atom-textarea atom-textarea--${size} ${invalid ? 'atom-textarea--invalid' : ''} ${className}`}
        style={combinedStyles}
        data-atom="textarea"
        data-size={size}
        data-invalid={invalid}
        data-disabled={disabled}
        aria-invalid={invalid}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

// Component metadata for catalog
export const TextareaMeta = {
  name: 'Textarea',
  category: 'atoms',
  description: 'A fundamental form textarea element for multi-line text entry',
  tokens: {
    colors: [
      '--input-bg', '--input-text', '--input-border', '--input-placeholder',
      '--input-focus-border', '--input-error-border',
      '--input-disabled-bg', '--input-disabled-text',
    ],
    sizing: ['--space-xs', '--space-sm', '--space-md', '--space-lg', '--touch-target-sm', '--touch-target-md', '--touch-target-lg'],
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
    placeholder: {
      type: 'string',
      default: '',
    },
  },
  examples: {
    default: { size: 'md', placeholder: 'Enter multi-line text...' },
    small: { size: 'sm', placeholder: 'Small textarea' },
    invalid: { size: 'md', invalid: true, placeholder: 'Invalid textarea', value: 'Invalid content' },
    disabled: { size: 'md', disabled: true, placeholder: 'Disabled textarea' },
  },
};