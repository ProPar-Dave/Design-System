import React, { useState } from 'react';
import { FieldRow } from './molecules/FieldRow';
import { Card } from './molecules/Card';
import { Alert } from './molecules/Alert';
import { Tabset } from './molecules/Tabset';
import { Toolbar } from './molecules/Toolbar';
import { Pagination } from './molecules/Pagination';
import { FormGroup } from './molecules/FormGroup';

export const MoleculesDemo: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');

  // Layout styles using only tokens
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
    gap: 'var(--space-md, 16px)',
  };

  const titleStyles = {
    fontSize: 'var(--font-size-2xl, 24px)',
    fontWeight: 'var(--font-weight-bold)',
    color: 'var(--color-foreground)',
    margin: 0,
  };

  const subtitleStyles = {
    fontSize: 'var(--font-size-lg, 18px)',
    fontWeight: 'var(--font-weight-semibold)',
    color: 'var(--color-foreground)',
    margin: 0,
  };

  const gridStyles = {
    display: 'grid',
    gap: 'var(--space-lg, 20px)',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  };

  return (
    <div style={containerStyles}>
      <div style={sectionStyles}>
        <h1 style={titleStyles}>Molecules Showcase</h1>
        <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>
          All molecules are composed entirely from atoms with token-driven layouts.
        </p>
      </div>

      {/* Alerts */}
      <div style={sectionStyles}>
        <h2 style={subtitleStyles}>Alert Messages</h2>
        <div style={gridStyles}>
          <Alert
            tone="info"
            title="Information"
            message="This is an informational message to keep you updated."
          />
          <Alert
            tone="success"
            title="Success"
            message="Your changes have been saved successfully."
            dismissible
            onDismiss={() => console.log('Success alert dismissed')}
          />
          <Alert
            tone="warning"
            title="Warning"
            message="Please review your changes before continuing."
            actions={[
              { label: 'Review', variant: 'primary' },
              { label: 'Continue', variant: 'secondary' },
            ]}
          />
          <Alert
            tone="danger"
            title="Error"
            message="Something went wrong. Please check your input and try again."
            actions={[
              { label: 'Retry', variant: 'primary' },
              { label: 'Cancel', variant: 'ghost' },
            ]}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div style={sectionStyles}>
        <h2 style={subtitleStyles}>Form Fields</h2>
        <div style={gridStyles}>
          <FieldRow
            label="Email Address"
            control="input"
            controlProps={{
              type: 'email',
              placeholder: 'Enter your email address',
            }}
            help="We'll never share your email with anyone."
          />
          <FieldRow
            label="Password"
            required
            control="input"
            controlProps={{
              type: 'password',
              placeholder: 'Enter a secure password',
            }}
            error="Password must be at least 8 characters long."
          />
          <FieldRow
            label="Country"
            control="select"
            controlProps={{
              options: [
                { value: '', label: 'Select a country' },
                { value: 'us', label: 'United States' },
                { value: 'ca', label: 'Canada' },
                { value: 'uk', label: 'United Kingdom' },
              ],
            }}
          />
          <FieldRow
            label="Enable notifications"
            control="switch"
          />
        </div>
      </div>

      {/* Cards */}
      <div style={sectionStyles}>
        <h2 style={subtitleStyles}>Cards</h2>
        <div style={gridStyles}>
          <Card
            title="Simple Card"
            subtitle="Basic card with title and content"
          >
            This is a simple card showcasing the basic structure with a title, subtitle, and content area.
          </Card>
          
          <Card
            title="Card with Actions"
            subtitle="Includes action buttons"
            actions={[
              { label: 'Edit', variant: 'primary' },
              { label: 'Delete', variant: 'destructive' },
            ]}
          >
            This card demonstrates how actions can be included in the header area for quick access to common operations.
          </Card>
          
          <Card
            title="Sectioned Card"
            sections={[
              { 
                id: 'overview', 
                content: 'This section provides an overview of the content and main features available.' 
              },
              { 
                id: 'details', 
                content: 'Here you can find more detailed information about the specific features and capabilities.' 
              },
              { 
                id: 'settings', 
                content: 'Configuration options and preferences can be adjusted in this section.' 
              },
            ]}
          />
        </div>
      </div>

      {/* Form Groups */}
      <div style={sectionStyles}>
        <h2 style={subtitleStyles}>Form Groups</h2>
        <FormGroup
          legend="Personal Information"
          columns={2}
          fields={[
            {
              label: 'First Name',
              required: true,
              control: 'input',
              controlProps: { placeholder: 'Enter first name' },
            },
            {
              label: 'Last Name',
              required: true,
              control: 'input',
              controlProps: { placeholder: 'Enter last name' },
            },
            {
              label: 'Email',
              control: 'input',
              controlProps: { type: 'email', placeholder: 'Enter email address' },
              help: 'This will be your primary contact method.',
            },
            {
              label: 'Phone',
              control: 'input',
              controlProps: { type: 'tel', placeholder: 'Enter phone number' },
            },
          ]}
        />
      </div>

      {/* Toolbar */}
      <div style={sectionStyles}>
        <h2 style={subtitleStyles}>Toolbars</h2>
        <Toolbar
          primary={[
            { children: 'Save', variant: 'primary' },
            { children: 'Preview' },
          ]}
          secondary={[
            { children: 'Export' },
            { children: 'Settings', variant: 'ghost' },
          ]}
        />
        <Toolbar
          align="center"
          primary={[
            { children: 'Previous' },
            { children: 'Next', variant: 'primary' },
          ]}
        />
      </div>

      {/* Tabset */}
      <div style={sectionStyles}>
        <h2 style={subtitleStyles}>Tab Navigation</h2>
        <Tabset
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div>
                  <h3 style={{ ...subtitleStyles, fontSize: 'var(--font-size-base)' }}>
                    Overview Content
                  </h3>
                  <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>
                    This tab shows an overview of all the available features and capabilities. 
                    The tabset molecule provides an accessible way to organize related content 
                    into separate, navigable sections.
                  </p>
                </div>
              ),
            },
            {
              id: 'features',
              label: 'Features',
              content: (
                <div>
                  <h3 style={{ ...subtitleStyles, fontSize: 'var(--font-size-base)' }}>
                    Feature Details
                  </h3>
                  <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>
                    Detailed information about specific features, their usage, and implementation details.
                    Each tab can contain any type of content, from simple text to complex interactive components.
                  </p>
                </div>
              ),
            },
            {
              id: 'settings',
              label: 'Settings',
              content: (
                <div>
                  <h3 style={{ ...subtitleStyles, fontSize: 'var(--font-size-base)' }}>
                    Configuration Options
                  </h3>
                  <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>
                    Settings and configuration options that allow users to customize their experience
                    and adjust the behavior of the application to meet their needs.
                  </p>
                </div>
              ),
            },
            {
              id: 'help',
              label: 'Help',
              disabled: true,
              content: (
                <div>
                  <p style={{ color: 'var(--color-muted-foreground)', margin: 0 }}>
                    This tab is currently disabled and not accessible.
                  </p>
                </div>
              ),
            },
          ]}
          activeId={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Pagination */}
      <div style={sectionStyles}>
        <h2 style={subtitleStyles}>Pagination</h2>
        <Pagination
          page={currentPage}
          pageCount={10}
          onChange={setCurrentPage}
        />
        <p style={{ color: 'var(--color-muted-foreground)', margin: 0, textAlign: 'center' }}>
          Current page: {currentPage} of 10
        </p>
      </div>
    </div>
  );
};