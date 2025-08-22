import React, { useEffect, useState } from 'react';
import { Button } from '../atoms/Button';

export interface ToastAction {
  label: string;
  onClick?: () => void;
}

export interface ToastProps {
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message: React.ReactNode;
  action?: ToastAction;
  onDismiss?: () => void;
  dismissible?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
  className?: string;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ 
    tone, 
    title, 
    message, 
    action, 
    onDismiss, 
    dismissible = true,
    autoClose = true,
    autoCloseDelay = 5000,
    className = '', 
    ...props 
  }, ref) => {
    
    const [isVisible, setIsVisible] = useState(true);

    // Auto-close functionality
    useEffect(() => {
      if (autoClose && onDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    }, [autoClose, autoCloseDelay, onDismiss]);

    const handleDismiss = () => {
      setIsVisible(false);
      setTimeout(() => {
        onDismiss?.();
      }, 200); // Animation delay
    };

    // Layout styles using only tokens - no custom colors
    const containerStyles = {
      display: isVisible ? 'flex' : 'none',
      flexDirection: 'column' as const,
      gap: 'var(--space-sm, 12px)',
      padding: 'var(--space-md, 16px)',
      borderRadius: 'var(--radius-lg, 12px)',
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
        ? 'var(--color-card, var(--color-background))'
        : tone === 'info'
        ? 'var(--chip-info-bg, var(--color-background))'
        : tone === 'success'
        ? 'var(--chip-success-bg, var(--color-background))'
        : tone === 'warning'
        ? 'var(--chip-warning-bg, var(--color-background))'
        : 'var(--chip-danger-bg, var(--color-background))',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      minWidth: '320px',
      maxWidth: '480px',
      transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.2s ease-in-out',
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
      alignItems: 'center',
      gap: 'var(--space-sm, 12px)',
      marginTop: 'var(--space-xs, 8px)',
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
      transition: 'background-color 0.2s ease',
    };

    const iconStyles = {
      fontSize: 'var(--font-size-lg, 18px)',
      marginRight: 'var(--space-xs, 8px)',
      display: 'flex',
      alignItems: 'center',
    };

    // Tone-specific icon
    const getIcon = () => {
      switch (tone) {
        case 'info': return 'ℹ️';
        case 'success': return '✅';
        case 'warning': return '⚠️';
        case 'danger': return '❌';
        default: return '📝';
      }
    };

    return (
      <div
        ref={ref}
        className={`molecule-toast molecule-toast--${tone} ${className}`}
        style={containerStyles}
        data-molecule="toast"
        data-tone={tone}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        {...props}
      >
        <div className="molecule-toast__header" style={headerStyles}>
          <div className="molecule-toast__content" style={contentStyles}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-xs, 8px)' }}>
              <span style={iconStyles} aria-hidden="true">
                {getIcon()}
              </span>
              <div style={{ flex: 1 }}>
                {title && (
                  <h4 className="molecule-toast__title" style={titleStyles}>
                    {title}
                  </h4>
                )}
                
                <div className="molecule-toast__message" style={messageStyles}>
                  {message}
                </div>
              </div>
            </div>
          </div>

          {dismissible && (
            <button
              className="molecule-toast__dismiss"
              style={dismissButtonStyles}
              onClick={handleDismiss}
              aria-label="Dismiss notification"
              type="button"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>
          )}
        </div>

        {action && (
          <div className="molecule-toast__actions" style={actionsStyles}>
            <Button
              variant="secondary"
              size="sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Component metadata for catalog
export const ToastMeta = {
  name: 'Toast',
  category: 'molecules',
  description: 'Temporary notification message with auto-dismiss and action support',
  composedFrom: ['Button'],
  tokens: {
    layout: ['--space-xs', '--space-sm', '--space-md', '--radius-sm', '--radius-lg', '--touch-target-sm'],
    colors: [
      '--color-border', '--color-background', '--color-foreground', '--color-muted', '--color-muted-foreground', '--color-card',
      '--chip-info-bg', '--chip-info-border', '--chip-success-bg', '--chip-success-border',
      '--chip-warning-bg', '--chip-warning-border', '--chip-danger-bg', '--chip-danger-border'
    ],
    typography: ['--font-size-sm', '--font-size-base', '--font-size-lg', '--font-weight-normal', '--font-weight-semibold', '--line-height-tight', '--line-height-normal'],
  },
  variants: {
    tone: {
      type: 'enum',
      options: ['neutral', 'info', 'success', 'warning', 'danger'],
      default: 'info',
    },
    dismissible: {
      type: 'boolean',
      default: true,
    },
    autoClose: {
      type: 'boolean',
      default: true,
    },
    autoCloseDelay: {
      type: 'number',
      default: 5000,
    },
  },
  examples: {
    info: {
      tone: 'info',
      title: 'New Message',
      message: 'You have received a new notification.',
    },
    success: {
      tone: 'success',
      title: 'Success',
      message: 'Your changes have been saved successfully.',
      autoClose: true,
    },
    warning: {
      tone: 'warning',
      title: 'Warning',
      message: 'Please review your input before proceeding.',
      action: { label: 'Review', onClick: () => alert('Reviewing...') },
    },
    danger: {
      tone: 'danger',
      title: 'Error',
      message: 'Failed to save changes. Please try again.',
      action: { label: 'Retry', onClick: () => alert('Retrying...') },
      autoClose: false,
    },
    withAction: {
      tone: 'info',
      title: 'Update Available',
      message: 'A new version of the application is available.',
      action: { label: 'Update Now', onClick: () => alert('Updating...') },
      dismissible: true,
      autoClose: false,
    },
  },
};