import * as React from 'react';

export type PropKind = 'text' | 'number' | 'boolean' | 'select';
export type PropOption = { label: string; value: any };
export type PropSpec = { 
  kind: PropKind; 
  label?: string; 
  options?: PropOption[]; 
  min?: number; 
  max?: number; 
  step?: number;
  description?: string;
};

export type Schema = Record<string, PropSpec>;

export type Renderer = (props: Record<string, any>) => React.ReactNode;

export type RegistryEntry = {
  schema: Schema;
  defaults: Record<string, any>;
  render: Renderer;
};

// Enhanced UI components for preview with proper styling
const UI = {
  Button: ({ children, disabled = false, variant = 'primary', size = 'md', onClick }: any) => (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: size === 'sm' ? '4px 8px' : size === 'lg' ? '12px 24px' : '8px 16px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        fontSize: 'var(--font-size-base)',
        fontWeight: 'var(--font-weight-medium)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        background: variant === 'primary' ? 'var(--color-primary)' : 
                   variant === 'secondary' ? 'var(--color-secondary)' : 
                   variant === 'destructive' ? 'var(--color-destructive)' : 'var(--color-muted)',
        color: variant === 'primary' ? 'var(--color-primary-foreground)' : 
               variant === 'secondary' ? 'var(--color-secondary-foreground)' : 
               variant === 'destructive' ? 'var(--color-destructive-foreground)' : 'var(--color-text)',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  ),
  
  TextField: ({ placeholder = 'Type…', value = '', disabled = false, error = false }: any) => (
    <input
      type="text"
      placeholder={placeholder}
      defaultValue={value}
      disabled={disabled}
      readOnly
      style={{
        width: '100%',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${error ? 'var(--color-destructive)' : 'var(--color-border)'}`,
        background: disabled ? 'var(--color-muted)' : 'var(--color-input-background)',
        color: disabled ? 'var(--color-muted-foreground)' : 'var(--color-text)',
        fontSize: 'var(--font-size-base)',
        cursor: disabled ? 'not-allowed' : 'text',
        outline: 'none',
      }}
    />
  ),
  
  SearchBar: ({ placeholder = 'Search', showClear = true }: any) => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <span style={{ 
          position: 'absolute', 
          left: '8px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          fontSize: '14px',
          color: 'var(--color-muted-foreground)'
        }}>
          🔎
        </span>
        <input 
          type="text"
          placeholder={placeholder} 
          readOnly
          style={{ 
            flex: 1, 
            padding: '8px 8px 8px 32px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--color-border)', 
            background: 'var(--color-input-background)', 
            color: 'var(--color-text)',
            fontSize: 'var(--font-size-base)',
            outline: 'none',
            width: '100%'
          }} 
        />
      </div>
      {showClear && (
        <button style={{ 
          padding: '6px 8px', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-panel)',
          color: 'var(--color-text)',
          fontSize: '12px',
          cursor: 'pointer'
        }}>
          Clear
        </button>
      )}
    </div>
  ),
  
  FormRow: ({ label = 'Label', help = 'Help text', invalid = false }: any) => (
    <div style={{ display: 'grid', gap: '6px', width: '100%' }}>
      <label style={{ 
        fontWeight: 'var(--font-weight-medium)', 
        color: 'var(--color-text)',
        fontSize: 'var(--font-size-base)'
      }}>
        {label}
      </label>
      <input 
        type="text"
        readOnly
        style={{ 
          padding: '8px 12px', 
          borderRadius: 'var(--radius-md)', 
          border: `1px solid ${invalid ? 'var(--color-destructive)' : 'var(--color-border)'}`, 
          background: 'var(--color-input-background)', 
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-base)',
          outline: 'none'
        }} 
      />
      <small style={{ 
        color: invalid ? 'var(--color-destructive)' : 'var(--color-muted-foreground)',
        fontSize: '12px'
      }}>
        {help}
      </small>
    </div>
  ),
};

// Component registry with schemas and renderers
export const registry: Record<string, RegistryEntry> = {
  btn: {
    schema: {
      label: { kind: 'text', label: 'Label', description: 'Button text content' },
      disabled: { kind: 'boolean', label: 'Disabled', description: 'Whether the button is disabled' },
      variant: { 
        kind: 'select', 
        label: 'Variant', 
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Destructive', value: 'destructive' },
        ],
        description: 'Button style variant'
      },
      size: {
        kind: 'select',
        label: 'Size',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
        description: 'Button size'
      }
    },
    defaults: { label: 'Primary Button', disabled: false, variant: 'primary', size: 'md' },
    render: (props) => <UI.Button {...props}>{props.label}</UI.Button>,
  },
  
  button: {
    schema: {
      label: { kind: 'text', label: 'Label', description: 'Button text content' },
      disabled: { kind: 'boolean', label: 'Disabled', description: 'Whether the button is disabled' },
      variant: { 
        kind: 'select', 
        label: 'Variant', 
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Destructive', value: 'destructive' },
        ],
        description: 'Button style variant'
      },
      size: {
        kind: 'select',
        label: 'Size',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
        ],
        description: 'Button size'
      }
    },
    defaults: { label: 'Primary Button', disabled: false, variant: 'primary', size: 'md' },
    render: (props) => <UI.Button {...props}>{props.label}</UI.Button>,
  },

  'text-field': {
    schema: {
      placeholder: { kind: 'text', label: 'Placeholder', description: 'Placeholder text' },
      disabled: { kind: 'boolean', label: 'Disabled', description: 'Whether the field is disabled' },
      value: { kind: 'text', label: 'Value', description: 'Current field value' },
      error: { kind: 'boolean', label: 'Error State', description: 'Show error styling' },
    },
    defaults: { placeholder: 'Enter text...', disabled: false, value: '', error: false },
    render: (props) => <UI.TextField {...props} />,
  },

  input: {
    schema: {
      placeholder: { kind: 'text', label: 'Placeholder', description: 'Placeholder text' },
      disabled: { kind: 'boolean', label: 'Disabled', description: 'Whether the field is disabled' },
      value: { kind: 'text', label: 'Value', description: 'Current field value' },
      error: { kind: 'boolean', label: 'Error State', description: 'Show error styling' },
    },
    defaults: { placeholder: 'Enter text...', disabled: false, value: '', error: false },
    render: (props) => <UI.TextField {...props} />,
  },

  'search-bar': {
    schema: {
      placeholder: { kind: 'text', label: 'Placeholder', description: 'Search placeholder text' },
      showClear: { kind: 'boolean', label: 'Show Clear', description: 'Show clear button' },
    },
    defaults: { placeholder: 'Search components...', showClear: true },
    render: (props) => <UI.SearchBar {...props} />,
  },

  searchbar: {
    schema: {
      placeholder: { kind: 'text', label: 'Placeholder', description: 'Search placeholder text' },
      showClear: { kind: 'boolean', label: 'Show Clear', description: 'Show clear button' },
    },
    defaults: { placeholder: 'Search components...', showClear: true },
    render: (props) => <UI.SearchBar {...props} />,
  },

  'form-row': {
    schema: {
      label: { kind: 'text', label: 'Label', description: 'Form field label' },
      help: { kind: 'text', label: 'Help Text', description: 'Help or description text' },
      invalid: { kind: 'boolean', label: 'Invalid', description: 'Show validation error state' },
    },
    defaults: { label: 'Email Address', help: 'We will never share your email.', invalid: false },
    render: (props) => <UI.FormRow {...props} />,
  },
};

export function getEntry(id?: string): RegistryEntry | null {
  if (!id) return null;
  return registry[id] ?? null;
}

export function getAvailableComponents(): string[] {
  return Object.keys(registry);
}

export function hasPreview(id?: string): boolean {
  return !!(id && registry[id]);
}