import React from 'react';
import { Button } from '../atoms/Button';
import { Chip } from '../atoms/Chip';

export interface AlertAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
}

export interface AlertProps {
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message: React.ReactNode;
  actions?: AlertAction[];
  onDismiss?: () => void;
  dismissible?: boolean;
  className?: string;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ tone, title, message, actions, onDismiss, dismissible = false, className = '', ...props }, ref) => {
    
    // Layout styles using only tokens - no custom colors
    const containerStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'var(--space-sm, 12px)',
      padding: 'var(--space-md, 16px)',
      borderRadius: 'var(--radius-md, 8px)',
      border: '1px solid',
      borderColor: tone === 'neutral' 
        ? 'var(--color-border)'
        : tone === 'info'
        ? 'var(--chip-info-border, var(--color-border))'
        : tone === 'success'
        ? 'var(--chip-success-border, var(--color-border))'
        : tone === 'warning'
        ? 'var(--chip-warning-border, var(--color-border))'
        : 'var(--chip-danger-border, var(--color-border))',
      background: tone === 'neutral'
        ? 'var(--color-muted, var(--color-background))'
        : tone === 'info'
        ? 'var(--chip-info-bg, var(--color-background))'
        : tone === 'success'
        ? 'var(--chip-success-bg, var(--color-background))'
        : tone === 'warning'
        ? 'var(--chip-warning-bg, var(--color-background))'
        : 'var(--chip-danger-bg, var(--color-background))',
    };

    const headerStyles = {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 'var(--space-sm, 12px)',
    };

    const contentStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'var(--space-xs, 8px)',
      flex: 1,
    };

    const titleStyles = {
      margin: 0,
      fontSize: 'var(--font-size-base, 16px)',
      fontWeight: 'var(--font-weight-semibold)',
      color: 'var(--color-foreground)',
      lineHeight: 'var(--line-height-tight)',
    };

    const messageStyles = {
      margin: 0,
      fontSize: 'var(--font-size-sm, 14px)',
      fontWeight: 'var(--font-weight-normal)',
      color: 'var(--color-foreground)',
      lineHeight: 'var(--line-height-normal)',
    };

    const actionsStyles = {
      display: 'flex',
      gap: 'var(--space-sm, 12px)',
      marginTop: 'var(--space-xs, 8px)',
      flexWrap: 'wrap' as const,
    };

    const dismissButtonStyles = {
      padding: 'var(--space-xs, 8px)',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      borderRadius: 'var(--radius-sm, 4px)',
      color: 'var(--color-muted-foreground)',
      fontSize: 'var(--font-size-lg, 18px)',
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 'var(--touch-target-sm, 32px)',
      minHeight: 'var(--touch-target-sm, 32px)',
    };

    return (
      <div
        ref={ref}
        className={`molecule-alert molecule-alert--${tone} ${className}`}
        style={containerStyles}
        data-molecule="alert"
        data-tone={tone}
        role="alert"
        aria-live="polite"
        {...props}
      >
        <div className="molecule-alert__header" style={headerStyles}>
          <div className="molecule-alert__content" style={contentStyles}>
            {title && (
              <h4 className="molecule-alert__title" style={titleStyles}>
                {title}
              </h4>
            )}
            
            <div className="molecule-alert__message" style={messageStyles}>
              {message}
            </div>
          </div>

          {dismissible && onDismiss && (
            <button
              className="molecule-alert__dismiss"
              style={dismissButtonStyles}
              onClick={onDismiss}
              aria-label="Dismiss alert"
              type="button"
            >
              ×
            </button>
          )}
        </div>

        {actions && actions.length > 0 && (
          <div className="molecule-alert__actions" style={actionsStyles}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'secondary'}
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

// Component metadata for catalog
export const AlertMeta = {
  name: 'Alert',
  category: 'molecules',
  description: 'An attention-grabbing message with contextual tone and optional actions',
  composedFrom: ['Button'],
  tokens: {
    layout: ['--space-xs', '--space-sm', '--space-md', '--radius-sm', '--radius-md', '--touch-target-sm'],
    colors: [
      '--color-border', '--color-background', '--color-foreground', '--color-muted', '--color-muted-foreground',
      '--chip-info-bg', '--chip-info-border', '--chip-success-bg', '--chip-success-border',
      '--chip-warning-bg', '--chip-warning-border', '--chip-danger-bg', '--chip-danger-border'
    ],
    typography: ['--font-size-sm', '--font-size-base', '--font-size-lg', '--font-weight-normal', '--font-weight-semibold', '--line-height-tight', '--line-height-normal'],
  },
  variants: {
    tone: {
      type: 'enum',
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
      default: 'neutral',
    },
    dismissible: {
      type: 'boolean',
      default: false,
    },
  },
  examples: {
    info: {
      tone: 'info',
      title: 'Information',
      message: 'This is an informational message.',
    },
    success: {
      tone: 'success',
      title: 'Success',
      message: 'Your action completed successfully.',
    },
    warning: {
      tone: 'warning',
      title: 'Warning',
      message: 'Please review this information carefully.',
    },
    danger: {
      tone: 'danger',
      title: 'Error',
      message: 'Something went wrong. Please try again.',
    },
    withActions: {
      tone: 'warning',
      title: 'Unsaved Changes',
      message: 'You have unsaved changes that will be lost.',
      actions: [
        { label: 'Save Changes', variant: 'primary' },
        { label: 'Discard', variant: 'secondary' },
      ],
    },
    dismissible: {
      tone: 'info',
      message: 'This message can be dismissed.',
      dismissible: true,
    },
  },
};