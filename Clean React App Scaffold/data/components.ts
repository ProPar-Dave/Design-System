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
  },
  { 
    id: 'field-row', 
    name: 'Field Row', 
    level: 'molecule', 
    version: '1.0.0', 
    status: 'ready', 
    description: 'Atomic field row with label, control, and help/error text using only atoms.', 
    tags: ['form','atomic','field','molecule'], 
    dependencies: ['label','input','select','textarea','switch','radio','checkbox','help-text'], 
    notes: 'Composes only from atoms. Supports all control types with consistent layout.',
    previewKind: 'field-row',
    propsSpec: [
      { name: 'label', label: 'Label Text', kind: 'text', default: 'Email Address', description: 'The label for the field' },
      { name: 'required', label: 'Required', kind: 'boolean', default: false, description: 'Whether the field is required' },
      { name: 'control', label: 'Control Type', kind: 'select', options: ['input', 'select', 'textarea', 'switch', 'radio-group', 'checkbox'], default: 'input', description: 'Type of form control' },
      { name: 'help', label: 'Help Text', kind: 'text', default: '', description: 'Help or description text' },
      { name: 'error', label: 'Error Message', kind: 'text', default: '', description: 'Error validation message' },
      { name: 'disabled', label: 'Disabled', kind: 'boolean', default: false, description: 'Whether the field is disabled' }
    ]
  },
  { 
    id: 'card', 
    name: 'Card', 
    level: 'molecule', 
    version: '1.0.0', 
    status: 'ready', 
    description: 'Flexible container with header, body, and action areas using atomic composition.', 
    tags: ['container','layout','atomic','molecule'], 
    dependencies: ['button','divider'], 
    notes: 'Composes only from atoms. Supports sectioned content and action buttons.',
    previewKind: 'card'
  },
  { 
    id: 'alert', 
    name: 'Alert', 
    level: 'molecule', 
    version: '1.0.0', 
    status: 'ready', 
    description: 'Attention-grabbing message with contextual tone and optional actions.', 
    tags: ['message','notification','atomic','molecule'], 
    dependencies: ['button'], 
    notes: 'Composes only from atoms. Supports multiple tones and action buttons.',
    previewKind: 'alert',
    propsSpec: [
      { name: 'tone', label: 'Alert Tone', kind: 'select', options: ['neutral', 'info', 'success', 'warning', 'danger'], default: 'info', description: 'Visual tone of the alert' },
      { name: 'title', label: 'Title', kind: 'text', default: 'Information', description: 'Optional alert title' },
      { name: 'message', label: 'Message', kind: 'text', default: 'This is an informational message.', required: true, description: 'Alert message content' },
      { name: 'dismissible', label: 'Dismissible', kind: 'boolean', default: false, description: 'Whether the alert can be dismissed' }
    ]
  },
  { 
    id: 'tabset', 
    name: 'Tabset', 
    level: 'molecule', 
    version: '1.0.0', 
    status: 'ready', 
    description: 'Tabbed interface for organizing content using atomic composition.', 
    tags: ['navigation','tabs','atomic','molecule'], 
    dependencies: [], 
    notes: 'Uses atomic button patterns for tabs. Supports disabled states and keyboard navigation.',
    previewKind: 'tabset',
    propsSpec: [
      { name: 'tabs', label: 'Tab Configuration', kind: 'text', default: '3 tabs', description: 'Array of tab objects with id, label, content, and disabled properties' },
      { name: 'activeId', label: 'Active Tab ID', kind: 'text', default: '', description: 'ID of the currently active tab' }
    ]
  },
  { 
    id: 'toolbar', 
    name: 'Toolbar', 
    level: 'molecule', 
    version: '1.0.0', 
    status: 'ready', 
    description: 'Horizontal collection of action buttons with flexible alignment.', 
    tags: ['actions','buttons','atomic','molecule'], 
    dependencies: ['button'], 
    notes: 'Composes only from button atoms. Supports primary/secondary grouping.',
    previewKind: 'toolbar',
    propsSpec: [
      { name: 'align', label: 'Alignment', kind: 'select', options: ['space-between', 'start', 'end', 'center'], default: 'space-between', description: 'How to align toolbar buttons' },
      { name: 'primary', label: 'Primary Actions', kind: 'text', default: 'Save, Preview', description: 'Primary action buttons (comma-separated)' },
      { name: 'secondary', label: 'Secondary Actions', kind: 'text', default: 'Cancel', description: 'Secondary action buttons (comma-separated)' }
    ]
  },
  { 
    id: 'pagination', 
    name: 'Pagination', 
    level: 'molecule', 
    version: '1.0.0', 
    status: 'ready', 
    description: 'Navigation component for moving between pages using atomic buttons.', 
    tags: ['navigation','paging','atomic','molecule'], 
    dependencies: ['button'], 
    notes: 'Composes only from button atoms. Supports configurable page number display.',
    previewKind: 'pagination',
    propsSpec: [
      { name: 'page', label: 'Current Page', kind: 'number', default: 1, description: 'Current page number' },
      { name: 'pageCount', label: 'Total Pages', kind: 'number', default: 10, description: 'Total number of pages' },
      { name: 'showFirstLast', label: 'Show First/Last', kind: 'boolean', default: true, description: 'Show first and last page buttons' },
      { name: 'showPageNumbers', label: 'Show Page Numbers', kind: 'boolean', default: true, description: 'Show individual page number buttons' },
      { name: 'maxPageNumbers', label: 'Max Page Numbers', kind: 'number', default: 5, description: 'Maximum page numbers to display' }
    ]
  },
  { 
    id: 'form-group', 
    name: 'Form Group', 
    level: 'molecule', 
    version: '1.0.0', 
    status: 'ready', 
    description: 'Grouped collection of form fields with responsive grid layout.', 
    tags: ['form','group','atomic','molecule'], 
    dependencies: ['field-row'], 
    notes: 'Composes from FieldRow molecules. Supports multi-column responsive layouts.',
    previewKind: 'form-group',
    propsSpec: [
      { name: 'legend', label: 'Group Legend', kind: 'text', default: 'Form Group', description: 'Legend/title for the field group' },
      { name: 'description', label: 'Description', kind: 'text', default: '', description: 'Optional description text' },
      { name: 'columns', label: 'Columns', kind: 'number', default: 1, description: 'Number of columns in the grid layout' },
      { name: 'fields', label: 'Field Count', kind: 'number', default: 3, description: 'Number of fields in the group' }
    ]
  },
  { 
    id: 'toast', 
    name: 'Toast', 
    level: 'molecule', 
    version: '1.0.0', 
    status: 'ready', 
    description: 'Temporary notification message with auto-dismiss and action support.', 
    tags: ['notification','message','atomic','molecule'], 
    dependencies: ['button'], 
    notes: 'Composes only from button atoms. Supports auto-close, actions, and all contextual tones.',
    previewKind: 'toast',
    propsSpec: [
      { name: 'tone', label: 'Notification Tone', kind: 'select', options: ['neutral', 'info', 'success', 'warning', 'danger'], default: 'info', description: 'Visual tone of the notification' },
      { name: 'title', label: 'Title', kind: 'text', default: 'Notification', description: 'Optional notification title' },
      { name: 'message', label: 'Message', kind: 'text', default: 'This is a notification message.', required: true, description: 'Notification message content' },
      { name: 'dismissible', label: 'Dismissible', kind: 'boolean', default: true, description: 'Whether the toast can be dismissed' },
      { name: 'autoClose', label: 'Auto Close', kind: 'boolean', default: true, description: 'Whether the toast auto-closes' },
      { name: 'autoCloseDelay', label: 'Auto Close Delay (ms)', kind: 'number', default: 5000, description: 'Delay before auto-close in milliseconds' }
    ]
  },
  { 
    id: 'molecule-seed-demo', 
    name: 'Molecule Showcase', 
    level: 'molecule', 
    version: '1.0.0', 
    status: 'ready', 
    description: 'Comprehensive showcase of all molecule components with accessibility features and presets.', 
    tags: ['demo','showcase','molecules','accessibility'], 
    dependencies: ['field-row','tabset','card','toolbar','pagination','alert','form-group'], 
    notes: 'Complete demonstration of molecules with minimal, typical, and edge-case presets. Includes full WCAG AA accessibility compliance.',
    previewKind: 'molecule-seed-demo'
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
    case 'field-row':
      demo = { 
        props: { 
          label: 'Email Address', 
          required: true,
          control: 'input', 
          controlProps: { type: 'email', placeholder: 'you@example.com' },
          help: 'We will never share your email with anyone.' 
        },
        presets: {
          minimal: { label: 'Email', control: 'input', controlProps: { type: 'email', placeholder: 'you@example.com' } },
          typical: { label: 'Full Name', required: true, control: 'input', controlProps: { placeholder: 'Enter your full name' }, help: 'This will be displayed on your profile' },
          edgeCase: { label: 'Password', required: true, control: 'input', controlProps: { type: 'password' }, error: 'Password must be at least 8 characters long' }
        }
      };
      break;
    case 'card':
      demo = { 
        props: { 
          title: 'Project Settings', 
          subtitle: 'Configure your project preferences',
          actions: [
            { label: 'Save Changes', variant: 'primary' },
            { label: 'Reset', variant: 'secondary' }
          ],
          children: 'Project settings allow you to customize collaboration and resource management.' 
        },
        presets: {
          minimal: { title: 'Welcome', children: 'Get started with our platform.' },
          typical: { title: 'Project Settings', subtitle: 'Configure preferences', actions: [{ label: 'Save', variant: 'primary' }], children: 'Settings content.' },
          edgeCase: { title: 'System Status', sections: [{ id: 'api', content: 'API: Operational' }, { id: 'db', content: 'DB: High latency' }] }
        }
      };
      break;
    case 'alert':
      demo = { 
        props: { 
          tone: 'warning', 
          title: 'Unsaved Changes', 
          message: 'You have unsaved changes that will be lost if you navigate away.',
          actions: [
            { label: 'Save Changes', variant: 'primary' },
            { label: 'Discard', variant: 'secondary' }
          ]
        },
        presets: {
          minimal: { tone: 'info', message: 'Your profile has been updated successfully.' },
          typical: { tone: 'warning', title: 'Unsaved Changes', message: 'Changes will be lost.', actions: [{ label: 'Save', variant: 'primary' }] },
          edgeCase: { tone: 'danger', title: 'Critical Error', message: 'Failed to process request.', dismissible: true, actions: [{ label: 'Retry', variant: 'primary' }] }
        }
      };
      break;
    case 'tabset':
      demo = { 
        props: { 
          tabs: [
            { id: 'dashboard', label: 'Dashboard', content: 'Dashboard overview with key metrics.' },
            { id: 'analytics', label: 'Analytics', content: 'In-depth analytics and data.' },
            { id: 'reports', label: 'Reports', content: 'Feature unavailable.', disabled: true },
            { id: 'exports', label: 'Exports', content: 'Export your data.' }
          ] 
        },
        presets: {
          minimal: { tabs: [{ id: 'tab1', label: 'Overview', content: 'Overview content.' }, { id: 'tab2', label: 'Details', content: 'Details content.' }] },
          typical: { tabs: [{ id: 'dashboard', label: 'Dashboard', content: 'Dashboard.' }, { id: 'reports', label: 'Reports', disabled: true, content: 'Unavailable.' }] },
          edgeCase: { tabs: [{ id: 'comprehensive', label: 'Comprehensive Dashboard Overview', content: 'Complete dashboard.' }, { id: 'detailed', label: 'Detailed Analytics Performance', content: 'Analytics.' }] }
        }
      };
      break;
    case 'toolbar':
      demo = { 
        props: { 
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
        presets: {
          minimal: { primary: [{ children: 'Save', variant: 'primary' }], secondary: [{ children: 'Cancel', variant: 'ghost' }] },
          typical: { primary: [{ children: 'Create', variant: 'primary' }, { children: 'Import' }], secondary: [{ children: 'Settings' }] },
          edgeCase: { align: 'start', primary: [{ children: 'Publish', variant: 'primary' }, { children: 'Draft' }, { children: 'Preview' }], secondary: [{ children: 'Delete', variant: 'destructive' }] }
        }
      };
      break;
    case 'pagination':
      demo = { 
        props: { 
          page: 5, 
          pageCount: 20, 
          maxPageNumbers: 5,
          onChange: () => {} 
        },
        presets: {
          minimal: { page: 2, pageCount: 5, onChange: () => {} },
          typical: { page: 5, pageCount: 20, maxPageNumbers: 5, onChange: () => {} },
          edgeCase: { page: 47, pageCount: 100, maxPageNumbers: 7, onChange: () => {} }
        }
      };
      break;
    case 'form-group':
      demo = { 
        props: { 
          legend: 'Account Information', 
          description: 'Please provide your account details',
          fields: [
            { label: 'Email Address', required: true, control: 'input', controlProps: { type: 'email' }, help: 'We will never share your email.' },
            { label: 'Country', control: 'select', controlProps: { options: [{ value: 'us', label: 'United States' }] } }
          ] 
        },
        presets: {
          minimal: { legend: 'Contact Information', fields: [{ label: 'Email', control: 'input', controlProps: { type: 'email' } }] },
          typical: { legend: 'Account Details', fields: [{ label: 'Email', required: true, control: 'input' }, { label: 'Country', control: 'select' }] },
          edgeCase: { legend: 'Advanced Configuration', columns: 2, fields: [{ label: 'API Key', control: 'input' }, { label: 'Region', control: 'select' }, { label: 'Enable Logging', control: 'switch' }] }
        }
      };
      break;
    case 'toast':
      demo = { 
        props: { 
          tone: 'success',
          title: 'Changes Saved',
          message: 'Your changes have been saved successfully.',
          autoClose: true,
          dismissible: true
        },
        presets: {
          minimal: { tone: 'info', message: 'Your profile has been updated.' },
          typical: { tone: 'success', title: 'Changes Saved', message: 'Saved successfully.', autoClose: true },
          edgeCase: { tone: 'danger', title: 'Critical Error', message: 'Failed to save changes.', action: { label: 'Retry' }, autoClose: false }
        }
      };
      break;
    case 'molecule-seed-demo':
      demo = { props: {} };
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