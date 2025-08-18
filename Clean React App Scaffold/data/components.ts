export type DSComponent = {
  id: string;
  name: string;
  level: 'atom' | 'molecule' | 'organism';
  version: string; // semver
  status: 'draft' | 'ready';
  description: string;
  tags: string[];
  deps?: string[];            // component ids this item composes
  dependencies?: string[];    // normalized field name
  notes?: string;             // component notes
  previewKind?: string;       // preview widget type
  propsSpec?: Array<{         // props specification
    name: string;
    label?: string;
    kind: 'text' | 'number' | 'boolean' | 'select';
    default?: any;
    options?: string[];
    required?: boolean;
    description?: string;
  }>;
  exampleProps?: Record<string, any>; // minimal demo props (legacy)
};

export const componentsData: DSComponent[] = [
  { 
    id: 'btn', 
    name: 'Button', 
    level: 'atom', 
    version: '0.1.0', 
    status: 'ready', 
    description: 'Clickable action control with variants for different use cases.', 
    tags: ['action','pressable','interactive'], 
    dependencies: [],
    notes: 'Use primary for main actions, secondary for supporting actions, destructive for dangerous operations.',
    previewKind: 'button',
    propsSpec: [
      { name: 'label', label: 'Button Text', kind: 'text', default: 'Button', required: true, description: 'The text displayed on the button' },
      { name: 'variant', label: 'Variant', kind: 'select', options: ['primary', 'secondary', 'destructive'], default: 'primary', description: 'Visual style variant' },
      { name: 'size', label: 'Size', kind: 'select', options: ['sm', 'md', 'lg'], default: 'md', description: 'Button size' },
      { name: 'disabled', label: 'Disabled', kind: 'boolean', default: false, description: 'Whether the button is disabled' }
    ]
  },
  { 
    id: 'input', 
    name: 'Text Field', 
    level: 'atom', 
    version: '0.1.0', 
    status: 'ready', 
    description: 'Single-line text input for forms and data entry.', 
    tags: ['form','input','text'], 
    dependencies: [],
    notes: 'Ensure proper labels and validation states for accessibility.',
    previewKind: 'input',
    propsSpec: [
      { name: 'placeholder', label: 'Placeholder', kind: 'text', default: 'Enter text...', description: 'Placeholder text shown when input is empty' },
      { name: 'disabled', label: 'Disabled', kind: 'boolean', default: false, description: 'Whether the input is disabled' },
      { name: 'error', label: 'Error State', kind: 'boolean', default: false, description: 'Whether to show error styling' }
    ]
  },
  { 
    id: 'badge', 
    name: 'Badge', 
    level: 'atom', 
    version: '0.1.0', 
    status: 'ready', 
    description: 'Small status indicator or label for categorization.', 
    tags: ['label','status','indicator'], 
    dependencies: [],
    notes: 'Use for status indicators, counts, or small labels. Keep text concise.',
    previewKind: 'badge',
    propsSpec: [
      { name: 'text', label: 'Text', kind: 'text', default: 'New', required: true, description: 'The text displayed in the badge' },
      { name: 'variant', label: 'Variant', kind: 'select', options: ['default', 'secondary', 'destructive'], default: 'default', description: 'Visual style variant' }
    ]
  },
  { 
    id: 'chip', 
    name: 'Chip', 
    level: 'atom', 
    version: '0.1.0', 
    status: 'draft', 
    description: 'Interactive tag-like element for selections or filters.', 
    tags: ['tag','filter','selection'], 
    dependencies: [],
    notes: 'Use for tags, filters, or multi-select scenarios. Can be removable or selectable.',
    previewKind: 'chip',
    propsSpec: [
      { name: 'label', label: 'Label', kind: 'text', default: 'Chip', required: true, description: 'The text displayed in the chip' },
      { name: 'selected', label: 'Selected', kind: 'boolean', default: false, description: 'Whether the chip is selected' },
      { name: 'removable', label: 'Removable', kind: 'boolean', default: false, description: 'Whether the chip can be removed' }
    ]
  },
  { 
    id: 'checkbox', 
    name: 'Checkbox', 
    level: 'atom', 
    version: '0.1.0', 
    status: 'draft', 
    description: 'Binary selection control for forms.', 
    tags: ['form','boolean','selection'], 
    dependencies: [],
    notes: 'Always provide clear labels and consider indeterminate states for parent-child relationships.',
    previewKind: 'checkbox',
    propsSpec: [
      { name: 'label', label: 'Label', kind: 'text', default: 'Checkbox Label', required: true, description: 'The label text for the checkbox' },
      { name: 'checked', label: 'Checked', kind: 'boolean', default: false, description: 'Whether the checkbox is checked' },
      { name: 'disabled', label: 'Disabled', kind: 'boolean', default: false, description: 'Whether the checkbox is disabled' }
    ]
  },
  { 
    id: 'searchbar', 
    name: 'Search Bar', 
    level: 'molecule', 
    version: '0.1.0', 
    status: 'draft', 
    description: 'Composite search input with clear functionality.', 
    tags: ['search','compose','form'], 
    dependencies: ['input','btn'], 
    notes: 'Combines input field with search affordances. Consider debouncing for live search.',
    previewKind: 'searchbar',
    propsSpec: [
      { name: 'placeholder', label: 'Placeholder', kind: 'text', default: 'Search...', description: 'Placeholder text for the search input' },
      { name: 'showClear', label: 'Show Clear Button', kind: 'boolean', default: true, description: 'Whether to show a clear button' }
    ]
  },
  { 
    id: 'form-row', 
    name: 'Form Row', 
    level: 'molecule', 
    version: '0.1.0', 
    status: 'ready', 
    description: 'Complete form field with label, input, and help text.', 
    tags: ['form','compose','field'], 
    dependencies: ['input'], 
    notes: 'Provides consistent form field layout with proper spacing and error states.',
    previewKind: 'form-row',
    propsSpec: [
      { name: 'label', label: 'Label', kind: 'text', default: 'Email Address', description: 'The label text for the form field' },
      { name: 'help', label: 'Help Text', kind: 'text', default: 'We will never share your email.', description: 'Help or description text' },
      { name: 'invalid', label: 'Invalid State', kind: 'boolean', default: false, description: 'Whether to show validation error styling' }
    ]
  }
];

// Normalize the data to ensure it matches the DsComponent interface  
const normalizedData = componentsData.map(component => {
  // Add default demo props based on component ID
  let demo = undefined;
  switch (component.id) {
    case 'btn':
      demo = { props: { label: 'Primary Button', variant: 'primary', disabled: false } };
      break;
    case 'input':
      demo = { props: { placeholder: 'Enter your text...', disabled: false, error: false } };
      break;
    case 'searchbar':
      demo = { props: { placeholder: 'Search components...', showClear: true } };
      break;
    case 'badge':
      demo = { props: { text: 'New', variant: 'default' } };
      break;
    case 'chip':
      demo = { props: { label: 'Design System', selected: false, removable: true } };
      break;
    case 'checkbox':
      demo = { props: { label: 'Enable notifications', checked: false, disabled: false } };
      break;
    case 'form-row':
      demo = { props: { label: 'Email Address', help: 'We will never share your email.', invalid: false } };
      break;
  }

  return {
    id: component.id,
    name: component.name,
    description: component.description,
    level: component.level,
    version: component.version,
    status: component.status,
    tags: component.tags,
    dependencies: component.dependencies || component.deps || [],
    notes: component.notes || '',
    previewKind: component.previewKind,
    propsSpec: component.propsSpec || [],
    code: component.code,
    demo
  };
});

// Seed built-ins to localStorage so diagnostics can see them
try { 
  localStorage.setItem('adsm:catalog:builtins', JSON.stringify(normalizedData)); 
} catch {}