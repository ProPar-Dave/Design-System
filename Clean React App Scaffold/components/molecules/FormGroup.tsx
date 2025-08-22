import React from 'react';
import { FieldRow, FieldRowProps } from './FieldRow';

export interface FormGroupProps {
  legend?: string;
  fields: FieldRowProps[];
  columns?: 1 | 2 | 3;
  disabled?: boolean;
  className?: string;
}

export const FormGroup = React.forwardRef<HTMLFieldSetElement, FormGroupProps>(
  ({ legend, fields, columns = 1, disabled = false, className = '', ...props }, ref) => {
    
    // Layout styles using only tokens
    const fieldsetStyles = {
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md, 8px)',
      padding: 'var(--space-lg, 20px)',
      margin: 0,
      background: 'var(--color-background)',
    };

    const legendStyles = {
      fontSize: 'var(--font-size-base, 16px)',
      fontWeight: 'var(--font-weight-semibold)',
      color: disabled ? 'var(--color-muted-foreground)' : 'var(--color-foreground)',
      padding: '0 var(--space-sm, 12px)',
      margin: '0 0 var(--space-md, 16px) 0',
      background: 'var(--color-background)',
    };

    const gridStyles = {
      display: 'grid',
      gap: 'var(--space-md, 16px)',
      gridTemplateColumns: columns === 1 
        ? '1fr'
        : columns === 2 
        ? 'repeat(auto-fit, minmax(250px, 1fr))'
        : 'repeat(auto-fit, minmax(200px, 1fr))',
    };

    const responsiveGridStyles = {
      // Ensure single column on small screens
      '@media (max-width: 640px)': {
        gridTemplateColumns: '1fr',
      },
    };

    return (
      <fieldset
        ref={ref}
        className={`molecule-form-group molecule-form-group--${columns}col ${disabled ? 'molecule-form-group--disabled' : ''} ${className}`}
        style={{
          ...fieldsetStyles,
          opacity: disabled ? 0.6 : 1,
        }}
        data-molecule="form-group"
        data-columns={columns}
        data-disabled={disabled}
        disabled={disabled}
        {...props}
      >
        {legend && (
          <legend 
            className="molecule-form-group__legend" 
            style={legendStyles}
          >
            {legend}
          </legend>
        )}

        <div 
          className="molecule-form-group__fields" 
          style={{
            ...gridStyles,
            // Inline responsive behavior
            ...(columns > 1 && {
              '@media (max-width: 640px)': {
                gridTemplateColumns: '1fr !important',
              },
            } as any),
          }}
        >
          {fields.map((fieldProps, index) => (
            <FieldRow
              key={fieldProps.id || `field-${index}`}
              disabled={disabled || fieldProps.disabled}
              {...fieldProps}
            />
          ))}
        </div>
      </fieldset>
    );
  }
);

FormGroup.displayName = 'FormGroup';

// Component metadata for catalog
export const FormGroupMeta = {
  name: 'FormGroup',
  category: 'molecules',
  description: 'A grouped collection of form fields with optional legend and responsive grid layout',
  composedFrom: ['FieldRow'],
  tokens: {
    layout: ['--space-sm', '--space-md', '--space-lg', '--radius-md'],
    colors: ['--color-border', '--color-background', '--color-foreground', '--color-muted-foreground'],
    typography: ['--font-size-base', '--font-weight-semibold'],
  },
  variants: {
    columns: {
      type: 'enum',
      options: [1, 2, 3],
      default: 1,
    },
    disabled: {
      type: 'boolean',
      default: false,
    },
  },
  examples: {
    singleColumn: {
      legend: 'Personal Information',
      columns: 1,
      fields: [
        { label: 'First Name', control: 'input', controlProps: { placeholder: 'Enter first name' } },
        { label: 'Last Name', control: 'input', controlProps: { placeholder: 'Enter last name' } },
        { label: 'Email', control: 'input', controlProps: { type: 'email', placeholder: 'Enter email' } },
      ],
    },
    twoColumn: {
      legend: 'Contact Details',
      columns: 2,
      fields: [
        { label: 'Phone', control: 'input', controlProps: { type: 'tel', placeholder: 'Enter phone' } },
        { label: 'Country', control: 'select', controlProps: { options: [{ value: 'us', label: 'United States' }] } },
        { label: 'Address', control: 'textarea', controlProps: { placeholder: 'Enter address' } },
        { label: 'Newsletter', control: 'switch' },
      ],
    },
    threeColumn: {
      legend: 'Preferences',
      columns: 3,
      fields: [
        { label: 'Language', control: 'select', controlProps: { options: [{ value: 'en', label: 'English' }] } },
        { label: 'Theme', control: 'select', controlProps: { options: [{ value: 'light', label: 'Light' }] } },
        { label: 'Timezone', control: 'select', controlProps: { options: [{ value: 'utc', label: 'UTC' }] } },
        { label: 'Notifications', control: 'switch' },
        { label: 'Analytics', control: 'switch' },
        { label: 'Marketing', control: 'switch' },
      ],
    },
    disabled: {
      legend: 'Disabled Form Group',
      disabled: true,
      fields: [
        { label: 'Username', control: 'input', controlProps: { value: 'locked-user' } },
        { label: 'Status', control: 'select', controlProps: { options: [{ value: 'inactive', label: 'Inactive' }] } },
      ],
    },
  },
};