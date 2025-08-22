import React from 'react';
import { Button } from '../atoms/Button';
import { Divider } from '../atoms/Divider';

export interface CardAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  onClick?: () => void;
  disabled?: boolean;
}

export interface CardSection {
  id: string;
  content: React.ReactNode;
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: CardAction[];
  sections?: CardSection[];
  children?: React.ReactNode;
  className?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, subtitle, actions, sections, children, className = '', ...props }, ref) => {
    
    // Layout styles using only tokens - no custom colors/fonts
    const containerStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      borderRadius: 'var(--radius-lg, 12px)',
      border: '1px solid var(--color-border)',
      background: 'var(--color-card, var(--color-background))',
      overflow: 'hidden',
    };

    const headerStyles = {
      padding: 'var(--space-lg, 20px)',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'var(--space-xs, 8px)',
    };

    const titleStyles = {
      margin: 0,
      fontSize: 'var(--font-size-lg, 18px)',
      fontWeight: 'var(--font-weight-semibold)',
      color: 'var(--color-foreground)',
      lineHeight: 'var(--line-height-tight)',
    };

    const subtitleStyles = {
      margin: 0,
      fontSize: 'var(--font-size-sm, 14px)',
      fontWeight: 'var(--font-weight-normal)',
      color: 'var(--color-muted-foreground)',
      lineHeight: 'var(--line-height-normal)',
    };

    const actionsStyles = {
      display: 'flex',
      gap: 'var(--space-sm, 12px)',
      marginTop: 'var(--space-md, 16px)',
      flexWrap: 'wrap' as const,
    };

    const bodyStyles = {
      padding: children ? 'var(--space-lg, 20px)' : undefined,
      paddingTop: (title || subtitle || actions) ? 0 : 'var(--space-lg, 20px)',
    };

    const sectionStyles = {
      padding: 'var(--space-lg, 20px)',
    };

    const hasHeader = title || subtitle || actions;
    const hasBody = children || sections;

    return (
      <div
        ref={ref}
        className={`molecule-card ${className}`}
        style={containerStyles}
        data-molecule="card"
        data-has-header={hasHeader}
        data-has-body={hasBody}
        {...props}
      >
        {hasHeader && (
          <div className="molecule-card__header" style={headerStyles}>
            {title && (
              <h3 className="molecule-card__title" style={titleStyles}>
                {title}
              </h3>
            )}
            
            {subtitle && (
              <p className="molecule-card__subtitle" style={subtitleStyles}>
                {subtitle}
              </p>
            )}
            
            {actions && actions.length > 0 && (
              <div className="molecule-card__actions" style={actionsStyles}>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'secondary'}
                    size="sm"
                    disabled={action.disabled}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {hasBody && hasHeader && <Divider />}

        {children && (
          <div className="molecule-card__body" style={bodyStyles}>
            {children}
          </div>
        )}

        {sections && sections.map((section, index) => (
          <React.Fragment key={section.id}>
            {index > 0 && <Divider />}
            <div 
              className="molecule-card__section" 
              style={sectionStyles}
              data-section-id={section.id}
            >
              {section.content}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Component metadata for catalog
export const CardMeta = {
  name: 'Card',
  category: 'molecules',
  description: 'A flexible container with optional header, body, and action areas',
  composedFrom: ['Button', 'Divider'],
  tokens: {
    layout: ['--space-xs', '--space-sm', '--space-md', '--space-lg', '--radius-lg'],
    colors: ['--color-border', '--color-card', '--color-background', '--color-foreground', '--color-muted-foreground'],
    typography: ['--font-size-sm', '--font-size-lg', '--font-weight-normal', '--font-weight-semibold', '--line-height-tight', '--line-height-normal'],
  },
  variants: {},
  examples: {
    simple: {
      title: 'Simple Card',
      children: 'This is a simple card with just a title and content.',
    },
    withSubtitle: {
      title: 'Card with Subtitle',
      subtitle: 'This card has both a title and subtitle',
      children: 'The card content goes here.',
    },
    withActions: {
      title: 'Card with Actions',
      subtitle: 'This card includes action buttons in the header',
      actions: [
        { label: 'Primary Action', variant: 'primary' },
        { label: 'Secondary', variant: 'secondary' },
      ],
      children: 'Card content with actions in the header.',
    },
    sections: {
      title: 'Card with Sections',
      sections: [
        { id: 'section1', content: 'This is the first section content.' },
        { id: 'section2', content: 'This is the second section content.' },
        { id: 'section3', content: 'This is the third section content.' },
      ],
    },
  },
};