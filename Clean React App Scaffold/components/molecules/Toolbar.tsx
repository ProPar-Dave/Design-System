import React from 'react';
import { Button, ButtonProps } from '../atoms/Button';

export interface ToolbarProps {
  primary?: ButtonProps[];
  secondary?: ButtonProps[];
  align?: 'space-between' | 'start' | 'end' | 'center';
  className?: string;
}

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ primary = [], secondary = [], align = 'space-between', className = '', ...props }, ref) => {
    
    // Layout styles using only tokens
    const containerStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm, 12px)',
      padding: 'var(--space-sm, 12px) var(--space-md, 16px)',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-background)',
      minHeight: 'var(--touch-target-lg, 48px)',
      justifyContent: align === 'space-between' ? 'space-between' 
        : align === 'start' ? 'flex-start'
        : align === 'end' ? 'flex-end'
        : 'center',
      flexWrap: 'wrap' as const,
    };

    const buttonGroupStyles = {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm, 12px)',
      flexWrap: 'wrap' as const,
    };

    const hasButtons = primary.length > 0 || secondary.length > 0;

    if (!hasButtons) {
      return (
        <div
          ref={ref}
          className={`molecule-toolbar molecule-toolbar--empty ${className}`}
          style={containerStyles}
          data-molecule="toolbar"
          data-align={align}
          {...props}
        >
          <div style={{ color: 'var(--color-muted-foreground)', fontSize: 'var(--font-size-sm)' }}>
            No actions available
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`molecule-toolbar molecule-toolbar--${align} ${className}`}
        style={containerStyles}
        data-molecule="toolbar"
        data-align={align}
        data-primary-count={primary.length}
        data-secondary-count={secondary.length}
        role="toolbar"
        aria-label="Action toolbar"
        {...props}
      >
        {primary.length > 0 && (
          <div 
            className="molecule-toolbar__primary" 
            style={buttonGroupStyles}
            role="group"
            aria-label="Primary actions"
          >
            {primary.map((buttonProps, index) => (
              <Button
                key={index}
                size="sm"
                {...buttonProps}
              />
            ))}
          </div>
        )}

        {secondary.length > 0 && (
          <div 
            className="molecule-toolbar__secondary" 
            style={buttonGroupStyles}
            role="group"
            aria-label="Secondary actions"
          >
            {secondary.map((buttonProps, index) => (
              <Button
                key={index}
                variant="secondary"
                size="sm"
                {...buttonProps}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

Toolbar.displayName = 'Toolbar';

// Component metadata for catalog
export const ToolbarMeta = {
  name: 'Toolbar',
  category: 'molecules',
  description: 'A horizontal collection of action buttons with flexible alignment',
  composedFrom: ['Button'],
  tokens: {
    layout: ['--space-sm', '--space-md', '--touch-target-lg'],
    colors: ['--color-border', '--color-background', '--color-muted-foreground'],
    typography: ['--font-size-sm'],
  },
  variants: {
    align: {
      type: 'enum',
      options: ['space-between', 'start', 'end', 'center'],
      default: 'space-between',
    },
  },
  examples: {
    basic: {
      primary: [
        { children: 'Save', variant: 'primary' },
        { children: 'Preview' },
      ],
      secondary: [
        { children: 'Cancel', variant: 'ghost' },
      ],
    },
    centered: {
      align: 'center',
      primary: [
        { children: 'Previous' },
        { children: 'Next', variant: 'primary' },
      ],
    },
    rightAligned: {
      align: 'end',
      primary: [
        { children: 'Apply' },
        { children: 'Reset', variant: 'secondary' },
      ],
    },
    primaryOnly: {
      primary: [
        { children: 'Create', variant: 'primary' },
        { children: 'Import' },
        { children: 'Export' },
      ],
    },
    secondaryOnly: {
      secondary: [
        { children: 'Edit' },
        { children: 'Delete', variant: 'destructive' },
        { children: 'More Options' },
      ],
    },
  },
};