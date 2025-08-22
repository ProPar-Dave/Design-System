import React from 'react';
import { Label } from '../atoms/Label';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Textarea } from '../atoms/Textarea';
import { Switch } from '../atoms/Switch';
import { Radio } from '../atoms/Radio';
import { Checkbox } from '../atoms/Checkbox';
import { HelpText } from '../atoms/HelpText';

export interface FieldRowProps {
  label?: string;
  required?: boolean;
  help?: string;
  error?: string;
  control: 'input' | 'select' | 'textarea' | 'switch' | 'radio-group' | 'checkbox';
  controlProps?: any;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const FieldRow = React.forwardRef<HTMLDivElement, FieldRowProps>(
  ({ 
    label, 
    required = false, 
    help, 
    error, 
    control, 
    controlProps = {}, 
    disabled = false, 
    id,
    className = '',
    ...props 
  }, ref) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;
    const helpId = help || error ? `${fieldId}-help` : undefined;
    
    // Layout styles using only tokens
    const containerStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'var(--space-xs, 8px)',
      width: '100%',
    };

    const renderControl = () => {
      const baseControlProps = {
        id: fieldId,
        disabled,
        'aria-describedby': helpId,
        'aria-invalid': error ? 'true' : undefined,
        ...controlProps,
      };

      switch (control) {
        case 'input':
          return <Input {...baseControlProps} />;
        case 'select':
          return <Select {...baseControlProps} />;
        case 'textarea':
          return <Textarea {...baseControlProps} />;
        case 'switch':
          return <Switch {...baseControlProps} />;
        case 'checkbox':
          return <Checkbox {...baseControlProps} />;
        case 'radio-group':
          return <Radio {...baseControlProps} />;
        default:
          return <Input {...baseControlProps} />;
      }
    };

    return (
      <div
        ref={ref}
        className={`molecule-field-row ${error ? 'molecule-field-row--error' : ''} ${className}`}
        style={containerStyles}
        data-molecule="field-row"
        data-control={control}
        data-has-error={Boolean(error)}
        {...props}
      >
        {label && (
          <Label 
            htmlFor={fieldId} 
            required={required} 
            disabled={disabled}
          >
            {label}
          </Label>
        )}
        
        {renderControl()}
        
        {(help || error) && (
          <HelpText 
            id={helpId}
            tone={error ? 'error' : 'neutral'}
          >
            {error || help}
          </HelpText>
        )}
      </div>
    );
  }
);

FieldRow.displayName = 'FieldRow';

// Component metadata for catalog
export const FieldRowMeta = {
  name: 'FieldRow',
  category: 'molecules',
  description: 'A complete form field combining label, control, and help/error text',
  composedFrom: ['Label', 'Input', 'Select', 'Textarea', 'Switch', 'Radio', 'Checkbox', 'HelpText'],
  tokens: {
    layout: ['--space-xs'],
  },
  variants: {
    control: {
      type: 'enum',
      options: ['input', 'select', 'textarea', 'switch', 'radio-group', 'checkbox'],
      default: 'input',
    },
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
    input: { 
      label: 'Email Address', 
      control: 'input', 
      controlProps: { type: 'email', placeholder: 'Enter your email' },
      help: 'We will never share your email with anyone.',
    },
    required: { 
      label: 'Full Name', 
      required: true, 
      control: 'input', 
      controlProps: { placeholder: 'Enter your full name' },
    },
    error: { 
      label: 'Password', 
      control: 'input', 
      controlProps: { type: 'password' },
      error: 'Password must be at least 8 characters long.',
    },
    select: { 
      label: 'Country', 
      control: 'select', 
      controlProps: { 
        options: [
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'uk', label: 'United Kingdom' },
        ] 
      },
    },
    textarea: { 
      label: 'Message', 
      control: 'textarea', 
      controlProps: { placeholder: 'Enter your message here...', rows: 4 },
    },
    switch: { 
      label: 'Enable notifications', 
      control: 'switch',
    },
  },
};