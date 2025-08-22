import React, { useState } from 'react';
import { FieldRow } from './molecules/FieldRow';
import { Tabset, Tab } from './molecules/Tabset';
import { Card } from './molecules/Card';
import { Toolbar } from './molecules/Toolbar';
import { Pagination } from './molecules/Pagination';
import { Alert } from './molecules/Alert';
import { FormGroup } from './molecules/FormGroup';
import { Toast } from './molecules/Toast';

export const MoleculeSeedDemo = () => {
  // State for interactive demos
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('minimal');
  const [formData, setFormData] = useState({
    email: '',
    country: '',
    message: '',
    notifications: false,
    plan: '',
    terms: false
  });

  // Demo styles using tokens
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-xl, 24px)',
    padding: 'var(--space-lg, 20px)',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const sectionStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-lg, 20px)',
    padding: 'var(--space-lg, 20px)',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background)',
  };

  const headerStyles = {
    fontSize: 'var(--font-size-xl, 20px)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-foreground)',
    margin: 0,
    marginBottom: 'var(--space-md, 16px)',
  };

  const groupStyles = {
    display: 'grid',
    gap: 'var(--space-lg, 20px)',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  };

  const presetStyles = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-sm, 12px)',
    padding: 'var(--space-md, 16px)',
    borderRadius: 'var(--radius-md, 8px)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-card, var(--color-background))',
  };

  const presetTitleStyles = {
    fontSize: 'var(--font-size-sm, 14px)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-muted-foreground)',
    margin: 0,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  };

  return (
    <div style={containerStyles} role="main" aria-label="Molecule Components Demo">
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl, 24px)' }}>
        <h1 style={{
          fontSize: 'var(--font-size-3xl, 30px)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-foreground)',
          margin: 0,
        }}>
          Molecule Components Showcase
        </h1>
        <p style={{
          fontSize: 'var(--font-size-lg, 18px)',
          color: 'var(--color-muted-foreground)',
          margin: 'var(--space-sm, 12px) 0 0',
        }}>
          Complete molecule components with accessibility and keyboard navigation
        </p>
      </div>

      {/* FieldRow Section */}
      <section style={sectionStyles} aria-labelledby="field-row-heading">
        <h2 id="field-row-heading" style={headerStyles}>FieldRow - Form Field Composition</h2>
        <div style={groupStyles}>
          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Minimal</h3>
            <FieldRow
              label="Email"
              control="input"
              controlProps={{ 
                type: 'email', 
                placeholder: 'you@example.com',
                'aria-describedby': 'email-help'
              }}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Typical</h3>
            <FieldRow
              label="Full Name"
              required
              control="input"
              controlProps={{ 
                placeholder: 'Enter your full name',
                'aria-describedby': 'name-help'
              }}
              help="This will be displayed on your profile"
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Edge Case - Error State</h3>
            <FieldRow
              label="Password"
              required
              control="input"
              controlProps={{ 
                type: 'password',
                'aria-describedby': 'password-error'
              }}
              error="Password must be at least 8 characters long and include a number"
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Select Field</h3>
            <FieldRow
              label="Country"
              control="select"
              controlProps={{
                options: [
                  { value: '', label: 'Select a country...' },
                  { value: 'us', label: 'United States' },
                  { value: 'ca', label: 'Canada' },
                  { value: 'uk', label: 'United Kingdom' },
                  { value: 'fr', label: 'France' },
                  { value: 'de', label: 'Germany' },
                ],
                'aria-describedby': 'country-help'
              }}
              help="Select your primary country of residence"
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Textarea Field</h3>
            <FieldRow
              label="Message"
              control="textarea"
              controlProps={{
                rows: 4,
                placeholder: 'Enter your message here...',
                'aria-describedby': 'message-help'
              }}
              help="Maximum 500 characters"
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Switch Field</h3>
            <FieldRow
              label="Enable notifications"
              control="switch"
              controlProps={{
                'aria-describedby': 'notifications-help'
              }}
              help="Receive email updates about your account"
            />
          </div>
        </div>
      </section>

      {/* Tabset Section */}
      <section style={sectionStyles} aria-labelledby="tabset-heading">
        <h2 id="tabset-heading" style={headerStyles}>Tabset - Tabbed Interface</h2>
        <div style={groupStyles}>
          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Minimal - 3 Tabs</h3>
            <Tabset
              tabs={[
                { id: 'overview', label: 'Overview', content: 'Overview content with essential information.' },
                { id: 'details', label: 'Details', content: 'Detailed information and specifications.' },
                { id: 'settings', label: 'Settings', content: 'Configuration and preference options.' },
              ]}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Typical - With Disabled Tab</h3>
            <Tabset
              tabs={[
                { id: 'dashboard', label: 'Dashboard', content: 'Dashboard overview with key metrics and charts.' },
                { id: 'analytics', label: 'Analytics', content: 'In-depth analytics and performance data.' },
                { id: 'reports', label: 'Reports', content: 'This feature is not available in your current plan.', disabled: true },
                { id: 'exports', label: 'Exports', content: 'Export your data in various formats.' },
              ]}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Edge Case - Long Labels with Overflow</h3>
            <Tabset
              tabs={[
                { id: 'comprehensive-dashboard', label: 'Comprehensive Dashboard Overview', content: 'Complete dashboard with all available metrics.' },
                { id: 'detailed-analytics', label: 'Detailed Analytics & Performance', content: 'Comprehensive analytics with performance insights.' },
                { id: 'advanced-reporting', label: 'Advanced Reporting Features', content: 'Advanced reporting capabilities and custom reports.' },
                { id: 'data-export-management', label: 'Data Export Management', content: 'Manage your data exports and scheduled reports.' },
                { id: 'user-account-settings', label: 'User Account Settings', content: 'Manage your account preferences and security settings.' },
                { id: 'billing-subscription', label: 'Billing & Subscription', content: 'View billing information and manage your subscription.' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Card Section */}
      <section style={sectionStyles} aria-labelledby="card-heading">
        <h2 id="card-heading" style={headerStyles}>Card - Flexible Container</h2>
        <div style={groupStyles}>
          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Minimal - Simple Card</h3>
            <Card
              title="Welcome"
            >
              Get started with our platform and explore all the features available to you.
            </Card>
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Typical - Header with Actions</h3>
            <Card
              title="Project Settings"
              subtitle="Configure your project preferences and team access"
              actions={[
                { label: 'Save Changes', variant: 'primary', onClick: () => alert('Changes saved!') },
                { label: 'Reset', variant: 'secondary', onClick: () => alert('Reset to defaults') },
              ]}
            >
              <div style={{ color: 'var(--color-muted-foreground)' }}>
                Project settings allow you to customize how your team collaborates and manages resources.
                Configure integrations, permissions, and notification preferences.
              </div>
            </Card>
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Edge Case - Multi-Section Card</h3>
            <Card
              title="System Status"
              subtitle="Current operational status of all services"
              sections={[
                {
                  id: 'api',
                  content: (
                    <div>
                      <h4 style={{ margin: '0 0 var(--space-xs, 8px)', color: 'var(--color-foreground)' }}>
                        API Services
                      </h4>
                      <div style={{ color: 'var(--color-success, #22c55e)' }}>✓ All systems operational</div>
                    </div>
                  )
                },
                {
                  id: 'database',
                  content: (
                    <div>
                      <h4 style={{ margin: '0 0 var(--space-xs, 8px)', color: 'var(--color-foreground)' }}>
                        Database
                      </h4>
                      <div style={{ color: 'var(--color-warning, #f59e0b)' }}>⚠ Experiencing high latency</div>
                    </div>
                  )
                },
                {
                  id: 'cdn',
                  content: (
                    <div>
                      <h4 style={{ margin: '0 0 var(--space-xs, 8px)', color: 'var(--color-foreground)' }}>
                        Content Delivery
                      </h4>
                      <div style={{ color: 'var(--color-success, #22c55e)' }}>✓ All regions operational</div>
                    </div>
                  )
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Toolbar Section */}
      <section style={sectionStyles} aria-labelledby="toolbar-heading">
        <h2 id="toolbar-heading" style={headerStyles}>Toolbar - Action Collections</h2>
        <div style={groupStyles}>
          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Minimal - Basic Actions</h3>
            <Toolbar
              primary={[
                { children: 'Save', variant: 'primary', onClick: () => alert('Saved!') },
              ]}
              secondary={[
                { children: 'Cancel', variant: 'ghost', onClick: () => alert('Cancelled') },
              ]}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Typical - Multiple Actions</h3>
            <Toolbar
              primary={[
                { children: 'Create New', variant: 'primary', onClick: () => alert('Creating...') },
                { children: 'Import', onClick: () => alert('Importing...') },
                { children: 'Export', onClick: () => alert('Exporting...') },
              ]}
              secondary={[
                { children: 'Settings', onClick: () => alert('Settings opened') },
                { children: 'Help', variant: 'ghost', onClick: () => alert('Help opened') },
              ]}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Edge Case - Responsive Wrap</h3>
            <Toolbar
              align="start"
              primary={[
                { children: 'Publish Changes', variant: 'primary', onClick: () => alert('Publishing...') },
                { children: 'Save Draft', onClick: () => alert('Draft saved') },
                { children: 'Preview', onClick: () => alert('Preview opened') },
                { children: 'Schedule', onClick: () => alert('Scheduling...') },
                { children: 'Duplicate', onClick: () => alert('Duplicating...') },
              ]}
              secondary={[
                { children: 'Archive', onClick: () => alert('Archived') },
                { children: 'Delete', variant: 'destructive', onClick: () => alert('Deleted') },
                { children: 'More Options', variant: 'ghost', onClick: () => alert('More options') },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Pagination Section */}
      <section style={sectionStyles} aria-labelledby="pagination-heading">
        <h2 id="pagination-heading" style={headerStyles}>Pagination - Page Navigation</h2>
        <div style={groupStyles}>
          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Minimal - Small Set</h3>
            <Pagination
              page={2}
              pageCount={5}
              onChange={(page) => alert(`Navigate to page ${page}`)}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Typical - Medium Set</h3>
            <Pagination
              page={currentPage}
              pageCount={20}
              onChange={setCurrentPage}
              maxPageNumbers={5}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Edge Case - Large Set with Ellipsis</h3>
            <Pagination
              page={47}
              pageCount={100}
              onChange={(page) => alert(`Navigate to page ${page}`)}
              maxPageNumbers={7}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Edge Case - First/Last Navigation</h3>
            <Pagination
              page={1}
              pageCount={50}
              onChange={(page) => alert(`Navigate to page ${page}`)}
              showFirstLast={true}
              showPageNumbers={false}
            />
          </div>
        </div>
      </section>

      {/* Toast Section */}
      <section style={sectionStyles} aria-labelledby="toast-heading">
        <h2 id="toast-heading" style={headerStyles}>Toast - Temporary Notifications</h2>
        <div style={groupStyles}>
          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Minimal - Info Toast</h3>
            <Toast
              tone="info"
              message="Your profile has been updated successfully."
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Typical - Success with Auto-Close</h3>
            <Toast
              tone="success"
              title="Changes Saved"
              message="Your changes have been saved successfully."
              autoClose={true}
              autoCloseDelay={3000}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Edge Case - Error with Action</h3>
            <Toast
              tone="danger"
              title="Critical Error"
              message="Failed to save changes. System administrators have been notified."
              action={{ 
                label: 'Retry', 
                onClick: () => alert('Retrying operation...') 
              }}
              autoClose={false}
              dismissible={true}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>All Tones Demo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md, 16px)' }}>
              <Toast
                tone="neutral"
                message="This is a neutral notification message."
                autoClose={false}
              />
              <Toast
                tone="warning"
                title="Warning"
                message="Please review this information carefully."
                action={{ label: 'Review', onClick: () => alert('Reviewing...') }}
                autoClose={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* InlineAlert Section */}
      <section style={sectionStyles} aria-labelledby="alert-heading">
        <h2 id="alert-heading" style={headerStyles}>InlineAlert - Contextual Messages</h2>
        <div style={groupStyles}>
          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Minimal - Info Tone</h3>
            <Alert
              tone="info"
              message="Your profile has been updated successfully."
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Typical - With Title and Actions</h3>
            <Alert
              tone="warning"
              title="Unsaved Changes"
              message="You have unsaved changes that will be lost if you navigate away."
              actions={[
                { label: 'Save Changes', variant: 'primary', onClick: () => alert('Changes saved!') },
                { label: 'Discard', variant: 'secondary', onClick: () => alert('Changes discarded') },
              ]}
            />
          </div>

          <div style={presetStyles}>
            <h3 style={presetTitleStyles}>Edge Case - All Tones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md, 16px)' }}>
              <Alert
                tone="success"
                title="Success"
                message="Operation completed successfully."
                dismissible
                onDismiss={() => alert('Dismissed')}
              />
              <Alert
                tone="info"
                title="Information"
                message="New features are now available in your account."
              />
              <Alert
                tone="warning"
                title="Warning"
                message="This action cannot be undone."
              />
              <Alert
                tone="danger"
                title="Error"
                message="Failed to process request. Please try again."
                actions={[
                  { label: 'Retry', variant: 'primary', onClick: () => alert('Retrying...') },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FormGroup Demo */}
      <section style={sectionStyles} aria-labelledby="form-group-heading">
        <h2 id="form-group-heading" style={headerStyles}>FormGroup - Field Collections</h2>
        <div style={presetStyles}>
          <h3 style={presetTitleStyles}>Complete Form Example</h3>
          <FormGroup
            legend="Account Information"
            fields={[
              {
                id: 'email',
                label: 'Email Address',
                required: true,
                control: 'input',
                controlProps: { 
                  type: 'email',
                  placeholder: 'you@example.com',
                  value: formData.email,
                  onChange: (e: any) => setFormData(prev => ({ ...prev, email: e.target.value }))
                },
                help: 'We will never share your email with anyone.',
              },
              {
                id: 'country',
                label: 'Country',
                required: true,
                control: 'select',
                controlProps: {
                  options: [
                    { value: '', label: 'Select a country...' },
                    { value: 'us', label: 'United States' },
                    { value: 'ca', label: 'Canada' },
                    { value: 'uk', label: 'United Kingdom' },
                  ],
                  value: formData.country,
                  onChange: (e: any) => setFormData(prev => ({ ...prev, country: e.target.value }))
                },
              },
              {
                id: 'message',
                label: 'Additional Comments',
                control: 'textarea',
                controlProps: {
                  rows: 3,
                  placeholder: 'Optional comments...',
                  value: formData.message,
                  onChange: (e: any) => setFormData(prev => ({ ...prev, message: e.target.value }))
                },
              },
              {
                id: 'notifications',
                label: 'Email Notifications',
                control: 'switch',
                controlProps: {
                  checked: formData.notifications,
                  onChange: (e: any) => setFormData(prev => ({ ...prev, notifications: e.target.checked }))
                },
                help: 'Receive updates about your account',
              },
            ]}
          />
        </div>
      </section>

      {/* Accessibility Notes */}
      <section style={sectionStyles} aria-labelledby="accessibility-heading">
        <h2 id="accessibility-heading" style={headerStyles}>Accessibility Features</h2>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-md, 16px)',
          fontSize: 'var(--font-size-sm, 14px)',
          color: 'var(--color-muted-foreground)'
        }}>
          <div>
            <strong style={{ color: 'var(--color-foreground)' }}>Keyboard Navigation:</strong>
            <ul style={{ margin: 'var(--space-xs, 8px) 0', paddingLeft: 'var(--space-md, 16px)' }}>
              <li>Tabset: Use Tab to focus tabs, Enter/Space to activate</li>
              <li>Pagination: Tab through buttons, Enter/Space to navigate</li>
              <li>Toolbar: Tab through actions, Enter/Space to activate</li>
              <li>Form fields: Tab navigation with proper focus management</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: 'var(--color-foreground)' }}>ARIA Labels:</strong>
            <ul style={{ margin: 'var(--space-xs, 8px) 0', paddingLeft: 'var(--space-md, 16px)' }}>
              <li>All interactive elements have proper labels</li>
              <li>Form fields use aria-describedby for help text</li>
              <li>Alerts use role="alert" and aria-live="polite"</li>
              <li>Toolbars use role="toolbar" with grouped actions</li>
            </ul>
          </div>
          <div>
            <strong style={{ color: 'var(--color-foreground)' }}>Focus Management:</strong>
            <ul style={{ margin: 'var(--space-xs, 8px) 0', paddingLeft: 'var(--space-md, 16px)' }}>
              <li>Visible focus indicators on all interactive elements</li>
              <li>Logical tab order throughout all components</li>
              <li>Skip-to-content navigation where applicable</li>
              <li>High contrast mode support</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

// Component metadata for catalog integration
export const MoleculeSeedDemoMeta = {
  name: 'MoleculeSeedDemo',
  category: 'demo',
  description: 'Comprehensive showcase of all molecule components with accessibility features',
  composedFrom: ['FieldRow', 'Tabset', 'Card', 'Toolbar', 'Pagination', 'Alert', 'Toast', 'FormGroup'],
  tokens: {
    layout: ['--space-xs', '--space-sm', '--space-md', '--space-lg', '--space-xl', '--radius-sm', '--radius-md', '--radius-lg'],
    colors: ['--color-background', '--color-foreground', '--color-border', '--color-muted-foreground', '--color-card'],
    typography: ['--font-size-sm', '--font-size-base', '--font-size-lg', '--font-size-xl', '--font-size-3xl', '--font-weight-medium', '--font-weight-semibold', '--font-weight-bold'],
  },
  examples: {
    demo: {},
  },
};