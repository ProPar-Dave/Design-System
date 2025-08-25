import * as React from 'react';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/atoms/Input';
import { Label } from '../components/atoms/Label';
import { Checkbox } from '../components/atoms/Checkbox';
import { Switch } from '../components/atoms/Switch';
import { Chip } from '../components/atoms/Chip';
import { Divider } from '../components/atoms/Divider';
import { Badge } from '../components/atoms/Badge';
import { Radio } from '../components/atoms/Radio';
import { Select } from '../components/atoms/Select';
import { Textarea } from '../components/atoms/Textarea';
import { HelpText } from '../components/atoms/HelpText';

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

// New registry structure that matches catalog IDs
export const registry: Record<string, {
  Component: React.ComponentType<any>;
  defaults?: Record<string, any>;
  schema?: Record<string, any>;
}> = {
  'atom-button-primary': {
    Component: Button,
    defaults: { variant: 'primary', children: 'Primary Button' },
    schema: { 
      variant: ['primary','secondary','destructive','outline','ghost'], 
      size: ['sm','md','lg'], 
      disabled: 'boolean', 
      children: 'text' 
    }
  },
  'atom-button-secondary': {
    Component: Button,
    defaults: { variant: 'secondary', children: 'Secondary Button' },
    schema: { 
      variant: ['primary','secondary','destructive','outline','ghost'], 
      size: ['sm','md','lg'], 
      disabled: 'boolean', 
      children: 'text' 
    }
  },
  'atom-input-text': {
    Component: Input,
    defaults: { placeholder: 'Enter text…', value: '' },
    schema: { 
      placeholder: 'text', 
      disabled: 'boolean', 
      type: ['text','email','password'] 
    }
  },
  'atom-label': {
    Component: Label,
    defaults: { children: 'Label' },
    schema: { children: 'text' }
  },
  'atom-checkbox': {
    Component: Checkbox,
    defaults: { checked: false, children: 'Accept terms' },
    schema: { 
      checked: 'boolean', 
      disabled: 'boolean', 
      children: 'text' 
    }
  },
  'atom-switch': {
    Component: Switch,
    defaults: { checked: false, children: 'Enable notifications' },
    schema: { 
      checked: 'boolean', 
      disabled: 'boolean', 
      children: 'text' 
    }
  },
  'atom-chip': {
    Component: Chip,
    defaults: { children: 'Interactive' },
    schema: { 
      variant: ['default','primary','secondary','success','warning','error'],
      children: 'text' 
    }
  },
  'atom-divider': {
    Component: Divider,
    defaults: {},
    schema: { 
      orientation: ['horizontal','vertical'] 
    }
  },
  'atom-radio': {
    Component: Radio,
    defaults: { name: 'radio-group', value: 'option1', children: 'Option 1' },
    schema: {
      name: 'text',
      value: 'text',
      checked: 'boolean',
      disabled: 'boolean',
      children: 'text'
    }
  },
  'atom-select': {
    Component: Select,
    defaults: { placeholder: 'Select an option' },
    schema: {
      placeholder: 'text',
      disabled: 'boolean',
      value: 'text'
    }
  },
  'atom-textarea': {
    Component: Textarea,
    defaults: { placeholder: 'Enter your message...', rows: 4 },
    schema: {
      placeholder: 'text',
      rows: 'number',
      disabled: 'boolean',
      value: 'text'
    }
  },
  'atom-help-text': {
    Component: HelpText,
    defaults: { children: 'This is help text to guide users.' },
    schema: {
      children: 'text',
      tone: ['neutral','info','success','warning','danger']
    }
  },
  'atom-badge': {
    Component: Badge,
    defaults: { tone: 'neutral', size: 'md', children: 'Badge' },
    schema: {
      tone: ['neutral','info','success','warning','danger'],
      size: ['sm','md'],
      children: 'text'
    }
  },
  // Legacy aliases
  'checkbox': {
    Component: Checkbox,
    defaults: { checked: false, children: 'Accept' },
    schema: { checked: 'boolean', children: 'text' }
  },
  'btn': {
    Component: Button,
    defaults: { variant: 'primary', children: 'Button' },
    schema: { 
      variant: ['primary','secondary','destructive','outline','ghost'], 
      size: ['sm','md','lg'], 
      disabled: 'boolean', 
      children: 'text' 
    }
  },
  'button': {
    Component: Button,
    defaults: { variant: 'primary', children: 'Button' },
    schema: { 
      variant: ['primary','secondary','destructive','outline','ghost'], 
      size: ['sm','md','lg'], 
      disabled: 'boolean', 
      children: 'text' 
    }
  },
  'input': {
    Component: Input,
    defaults: { placeholder: 'Enter text…' },
    schema: { 
      placeholder: 'text', 
      disabled: 'boolean', 
      type: ['text','email','password'] 
    }
  },
  'badge': {
    Component: Badge,
    defaults: { tone: 'neutral', children: 'Badge' },
    schema: {
      tone: ['neutral','info','success','warning','danger'],
      size: ['sm','md'],
      children: 'text'
    }
  },
  'chip': {
    Component: Chip,
    defaults: { children: 'Chip' },
    schema: { 
      variant: ['default','primary','secondary','success','warning','error'],
      children: 'text' 
    }
  },
  // Molecule components
  'molecule-field-row': {
    Component: FieldRow,
    defaults: { 
      label: 'Email Address', 
      control: 'input',
      controlProps: { type: 'email', placeholder: 'you@example.com' },
      help: 'We will never share your email with anyone.'
    },
    schema: {
      label: 'text',
      required: 'boolean',
      control: ['input','select','textarea','switch','radio-group','checkbox'],
      help: 'text',
      error: 'text',
      disabled: 'boolean'
    }
  },
  'molecule-card': {
    Component: Card,
    defaults: { 
      title: 'Project Settings', 
      subtitle: 'Configure your project preferences',
      children: 'Project settings allow you to customize collaboration and resource management.'
    },
    schema: {
      title: 'text',
      subtitle: 'text',
      children: 'text'
    }
  },
  'molecule-alert': {
    Component: Alert,
    defaults: { 
      tone: 'info', 
      title: 'Information', 
      message: 'This is an informational message.',
      dismissible: false
    },
    schema: {
      tone: ['neutral','info','success','warning','danger'],
      title: 'text',
      message: 'text',
      dismissible: 'boolean'
    }
  },
  'molecule-toolbar': {
    Component: Toolbar,
    defaults: {
      primary: [
        { children: 'Create New', variant: 'primary' },
        { children: 'Import' },
        { children: 'Export' }
      ],
      secondary: [
        { children: 'Settings' },
        { children: 'Help', variant: 'ghost' }
      ]
    },
    schema: {
      align: ['space-between','start','end','center'],
      primary: 'text',
      secondary: 'text'
    }
  },
  'molecule-seed-demo': {
    Component: MoleculeSeedDemo,
    defaults: {},
    schema: {}
  },
  // Additional legacy aliases
  'field-row': {
    Component: FieldRow,
    defaults: { 
      label: 'Email Address', 
      control: 'input',
      help: 'We will never share your email.'
    },
    schema: {
      label: 'text',
      required: 'boolean',
      control: ['input','select','textarea','switch','radio-group','checkbox'],
      help: 'text',
      error: 'text',
      disabled: 'boolean'
    }
  },
  'card': {
    Component: Card,
    defaults: { 
      title: 'Card Title',
      children: 'Card content goes here.'
    },
    schema: {
      title: 'text',
      subtitle: 'text',
      children: 'text'
    }
  },
  'alert': {
    Component: Alert,
    defaults: { 
      tone: 'info', 
      message: 'This is an alert message.'
    },
    schema: {
      tone: ['neutral','info','success','warning','danger'],
      title: 'text',
      message: 'text',
      dismissible: 'boolean'
    }
  },
  'toolbar': {
    Component: Toolbar,
    defaults: {
      primary: [{ children: 'Save', variant: 'primary' }],
      secondary: [{ children: 'Cancel', variant: 'ghost' }]
    },
    schema: {
      align: ['space-between','start','end','center'],
      primary: 'text',
      secondary: 'text'
    }
  }
};

// Import molecule components
import { MoleculeSeedDemo } from '../components/MoleculeSeedDemo';
import { FieldRow } from '../components/molecules/FieldRow';
import { Card } from '../components/molecules/Card';
import { Alert } from '../components/molecules/Alert';
import { Toolbar } from '../components/molecules/Toolbar';

// Enhanced UI components for legacy preview support
const UI = {
  Button: ({ children, disabled = false, variant = 'primary', size = 'md', onClick }: any) => (
    <Button variant={variant} size={size} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  ),
  
  TextField: ({ placeholder = 'Type…', value = '', disabled = false, error = false }: any) => (
    <Input 
      type="text"
      placeholder={placeholder}
      defaultValue={value}
      disabled={disabled}
      className={error ? 'border-red-500' : ''}
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
        <Input 
          type="text"
          placeholder={placeholder}
          style={{ paddingLeft: '32px' }}
        />
      </div>
      {showClear && (
        <Button variant="secondary" size="sm">
          Clear
        </Button>
      )}
    </div>
  ),
  
  FormRow: ({ label = 'Label', help = 'Help text', invalid = false }: any) => (
    <div style={{ display: 'grid', gap: '6px', width: '100%' }}>
      <Label>{label}</Label>
      <Input className={invalid ? 'border-red-500' : ''} />
      <small style={{ 
        color: invalid ? 'var(--color-destructive)' : 'var(--color-muted-foreground)',
        fontSize: '12px'
      }}>
        {help}
      </small>
    </div>
  ),
};

// Legacy registry for backward compatibility with existing preview system
const legacyRegistry: Record<string, RegistryEntry> = {
  // Legacy aliases
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

  'molecule-seed-demo': {
    schema: {},
    defaults: {},
    render: () => <MoleculeSeedDemo />,
  },
};

// Helper function to convert new registry format to legacy format
function convertToLegacyEntry(entry: { Component: React.ComponentType<any>; defaults?: any; schema?: any }): RegistryEntry {
  const legacySchema: Schema = {};
  
  if (entry.schema) {
    Object.entries(entry.schema).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        legacySchema[key] = {
          kind: 'select',
          label: key.charAt(0).toUpperCase() + key.slice(1),
          options: value.map(v => ({ label: v.charAt(0).toUpperCase() + v.slice(1), value: v }))
        };
      } else if (value === 'boolean') {
        legacySchema[key] = {
          kind: 'boolean',
          label: key.charAt(0).toUpperCase() + key.slice(1)
        };
      } else if (value === 'text') {
        legacySchema[key] = {
          kind: 'text',
          label: key.charAt(0).toUpperCase() + key.slice(1)
        };
      }
    });
  }

  return {
    schema: legacySchema,
    defaults: entry.defaults || {},
    render: (props) => React.createElement(entry.Component, props)
  };
}

export function getEntry(id?: string): RegistryEntry | null {
  if (!id) return null;
  
  // Check new registry first (for catalog IDs)
  if (registry[id]) {
    return convertToLegacyEntry(registry[id]);
  }
  
  // Fall back to legacy registry
  return legacyRegistry[id] ?? null;
}

export function getAvailableComponents(): string[] {
  return [...Object.keys(registry), ...Object.keys(legacyRegistry)];
}

export function hasPreview(id?: string): boolean {
  return !!(id && (registry[id] || legacyRegistry[id]));
}