import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ orientation = 'horizontal', size = 'md', className = '', ...props }, ref) => {
    const baseStyles = {
      // Base styles using tokens only
      border: 'none',
      background: 'var(--divider-color, var(--color-border))',
      margin: 0,
    };

    const orientationStyles = {
      horizontal: {
        width: '100%',
        height: size === 'sm' 
          ? 'var(--divider-thickness-sm, 1px)'
          : size === 'lg'
          ? 'var(--divider-thickness-lg, 3px)'
          : 'var(--divider-thickness-md, 2px)',
        marginTop: 'var(--space-md, 16px)',
        marginBottom: 'var(--space-md, 16px)',
      },
      vertical: {
        height: '100%',
        width: size === 'sm' 
          ? 'var(--divider-thickness-sm, 1px)'
          : size === 'lg'
          ? 'var(--divider-thickness-lg, 3px)'
          : 'var(--divider-thickness-md, 2px)',
        marginLeft: 'var(--space-md, 16px)',
        marginRight: 'var(--space-md, 16px)',
        minHeight: 'var(--space-xl, 24px)',
      },
    };

    const combinedStyles = {
      ...baseStyles,
      ...orientationStyles[orientation],
    };

    return (
      <hr
        ref={ref}
        className={`atom-divider atom-divider--${orientation} atom-divider--${size} ${className}`}
        style={combinedStyles}
        data-atom="divider"
        data-orientation={orientation}
        data-size={size}
        role="separator"
        aria-orientation={orientation}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

// Component metadata for catalog
export const DividerMeta = {
  name: 'Divider',
  category: 'atoms',
  description: 'A visual separator element for dividing content sections',
  tokens: {
    colors: ['--divider-color'],
    sizing: ['--space-md', '--space-xl', '--divider-thickness-sm', '--divider-thickness-md', '--divider-thickness-lg'],
  },
  variants: {
    orientation: {
      type: 'enum',
      options: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
    size: {
      type: 'enum',
      options: ['sm', 'md', 'lg'],
      default: 'md',
    },
  },
  examples: {
    default: { orientation: 'horizontal', size: 'md' },
    vertical: { orientation: 'vertical', size: 'md' },
    thick: { orientation: 'horizontal', size: 'lg' },
    thin: { orientation: 'horizontal', size: 'sm' },
  },
};