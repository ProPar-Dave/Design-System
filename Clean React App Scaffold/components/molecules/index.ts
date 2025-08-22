// Export all molecule components and their metadata
export { FieldRow, FieldRowMeta } from './FieldRow';
export { Tabset, TabsetMeta } from './Tabset';
export { Card, CardMeta } from './Card';
export { Toolbar, ToolbarMeta } from './Toolbar';
export { Pagination, PaginationMeta } from './Pagination';
export { Alert, AlertMeta } from './Alert';
export { Toast, ToastMeta } from './Toast';
export { FormGroup, FormGroupMeta } from './FormGroup';

// Export types
export type { FieldRowProps } from './FieldRow';
export type { TabsetProps, Tab } from './Tabset';
export type { CardProps, CardAction, CardSection } from './Card';
export type { ToolbarProps } from './Toolbar';
export type { PaginationProps } from './Pagination';
export type { AlertProps, AlertAction } from './Alert';
export type { ToastProps, ToastAction } from './Toast';
export type { FormGroupProps, FormField } from './FormGroup';

// Molecule registry for catalog integration
export const MOLECULES_REGISTRY = {
  'field-row': {
    component: FieldRow,
    meta: FieldRowMeta,
    presets: {
      minimal: {
        label: 'Email',
        control: 'input',
        controlProps: { type: 'email', placeholder: 'you@example.com' }
      },
      typical: {
        label: 'Full Name',
        required: true,
        control: 'input',
        controlProps: { placeholder: 'Enter your full name' },
        help: 'This will be displayed on your profile'
      },
      edgeCase: {
        label: 'Password',
        required: true,
        control: 'input',
        controlProps: { type: 'password' },
        error: 'Password must be at least 8 characters long and include a number'
      }
    }
  },
  'tabset': {
    component: Tabset,
    meta: TabsetMeta,
    presets: {
      minimal: {
        tabs: [
          { id: 'overview', label: 'Overview', content: 'Overview content.' },
          { id: 'details', label: 'Details', content: 'Details content.' },
          { id: 'settings', label: 'Settings', content: 'Settings content.' }
        ]
      },
      typical: {
        tabs: [
          { id: 'dashboard', label: 'Dashboard', content: 'Dashboard content.' },
          { id: 'analytics', label: 'Analytics', content: 'Analytics content.' },
          { id: 'reports', label: 'Reports', content: 'Reports unavailable.', disabled: true },
          { id: 'exports', label: 'Exports', content: 'Exports content.' }
        ]
      },
      edgeCase: {
        tabs: [
          { id: 'comprehensive-dashboard', label: 'Comprehensive Dashboard Overview', content: 'Complete dashboard.' },
          { id: 'detailed-analytics', label: 'Detailed Analytics & Performance', content: 'Analytics insights.' },
          { id: 'advanced-reporting', label: 'Advanced Reporting Features', content: 'Advanced reports.' },
          { id: 'data-export-management', label: 'Data Export Management', content: 'Export management.' },
          { id: 'user-account-settings', label: 'User Account Settings', content: 'Account settings.' }
        ]
      }
    }
  },
  'card': {
    component: Card,
    meta: CardMeta,
    presets: {
      minimal: {
        title: 'Welcome',
        children: 'Get started with our platform and explore all the features.'
      },
      typical: {
        title: 'Project Settings',
        subtitle: 'Configure your project preferences and team access',
        actions: [
          { label: 'Save Changes', variant: 'primary' },
          { label: 'Reset', variant: 'secondary' }
        ],
        children: 'Project settings allow you to customize collaboration and resource management.'
      },
      edgeCase: {
        title: 'System Status',
        subtitle: 'Current operational status of all services',
        sections: [
          { id: 'api', content: 'API Services: All systems operational' },
          { id: 'database', content: 'Database: Experiencing high latency' },
          { id: 'cdn', content: 'Content Delivery: All regions operational' }
        ]
      }
    }
  },
  'toolbar': {
    component: Toolbar,
    meta: ToolbarMeta,
    presets: {
      minimal: {
        primary: [{ children: 'Save', variant: 'primary' }],
        secondary: [{ children: 'Cancel', variant: 'ghost' }]
      },
      typical: {
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
      edgeCase: {
        align: 'start',
        primary: [
          { children: 'Publish', variant: 'primary' },
          { children: 'Save Draft' },
          { children: 'Preview' },
          { children: 'Schedule' },
          { children: 'Duplicate' }
        ],
        secondary: [
          { children: 'Archive' },
          { children: 'Delete', variant: 'destructive' }
        ]
      }
    }
  },
  'pagination': {
    component: Pagination,
    meta: PaginationMeta,
    presets: {
      minimal: {
        page: 2,
        pageCount: 5,
        onChange: () => {}
      },
      typical: {
        page: 5,
        pageCount: 20,
        maxPageNumbers: 5,
        onChange: () => {}
      },
      edgeCase: {
        page: 47,
        pageCount: 100,
        maxPageNumbers: 7,
        onChange: () => {}
      }
    }
  },
  'alert': {
    component: Alert,
    meta: AlertMeta,
    presets: {
      minimal: {
        tone: 'info',
        message: 'Your profile has been updated successfully.'
      },
      typical: {
        tone: 'warning',
        title: 'Unsaved Changes',
        message: 'You have unsaved changes that will be lost if you navigate away.',
        actions: [
          { label: 'Save Changes', variant: 'primary' },
          { label: 'Discard', variant: 'secondary' }
        ]
      },
      edgeCase: {
        tone: 'danger',
        title: 'Critical Error',
        message: 'Failed to process request. System administrators have been notified.',
        dismissible: true,
        actions: [
          { label: 'Retry', variant: 'primary' },
          { label: 'Contact Support', variant: 'secondary' }
        ]
      }
    }
  },
  'form-group': {
    component: FormGroup,
    meta: FormGroupMeta,
    presets: {
      minimal: {
        legend: 'Contact Information',
        fields: [
          { label: 'Email', control: 'input', controlProps: { type: 'email' } }
        ]
      },
      typical: {
        legend: 'Account Details',
        description: 'Please provide your account information',
        fields: [
          { label: 'Email Address', required: true, control: 'input', controlProps: { type: 'email' }, help: 'We will never share your email.' },
          { label: 'Country', control: 'select', controlProps: { options: [{ value: 'us', label: 'United States' }] } }
        ]
      },
      edgeCase: {
        legend: 'Advanced Configuration',
        description: 'Configure advanced settings and preferences',
        columns: 2,
        fields: [
          { label: 'API Key', required: true, control: 'input', controlProps: { type: 'password' } },
          { label: 'Region', control: 'select', controlProps: { options: [{ value: 'us-east', label: 'US East' }] } },
          { label: 'Enable Logging', control: 'switch' },
          { label: 'Notifications', control: 'checkbox' },
          { label: 'Configuration Notes', control: 'textarea', controlProps: { rows: 3 } }
        ]
      }
    }
  },
  'toast': {
    component: Toast,
    meta: ToastMeta,
    presets: {
      minimal: {
        tone: 'info',
        message: 'Your profile has been updated.'
      },
      typical: {
        tone: 'success',
        title: 'Changes Saved',
        message: 'Your changes have been saved successfully.',
        autoClose: true
      },
      edgeCase: {
        tone: 'danger',
        title: 'Critical Error',
        message: 'Failed to save changes. System administrators have been notified.',
        action: { label: 'Retry', onClick: () => {} },
        autoClose: false,
        dismissible: true
      }
    }
  }
};