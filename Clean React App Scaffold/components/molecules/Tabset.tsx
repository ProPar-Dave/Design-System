import React, { useState } from 'react';
import { Button } from '../atoms/Button';

export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface TabsetProps {
  tabs: Tab[];
  activeId?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export const Tabset = React.forwardRef<HTMLDivElement, TabsetProps>(
  ({ tabs, activeId, onTabChange, className = '', ...props }, ref) => {
    const [internalActiveId, setInternalActiveId] = useState(tabs[0]?.id || '');
    const currentActiveId = activeId || internalActiveId;
    
    const handleTabChange = (tabId: string) => {
      if (!activeId) {
        setInternalActiveId(tabId);
      }
      onTabChange?.(tabId);
    };

    // Layout styles using only tokens
    const containerStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      width: '100%',
    };

    const tabListStyles = {
      display: 'flex',
      borderBottom: '1px solid var(--color-border)',
      gap: 0, // No gap between tabs for seamless border
      overflow: 'auto',
      scrollbarWidth: 'thin' as const,
    };

    const tabButtonStyles = {
      padding: 'var(--space-sm, 12px) var(--space-md, 16px)',
      background: 'transparent',
      border: 'none',
      borderBottom: '2px solid transparent',
      cursor: 'pointer',
      fontSize: 'var(--font-size-sm, 14px)',
      fontWeight: 'var(--font-weight-medium)',
      lineHeight: 'var(--line-height-normal)',
      color: 'var(--color-muted-foreground)',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap' as const,
      position: 'relative' as const,
      minHeight: 'var(--touch-target-md, 44px)',
      display: 'flex',
      alignItems: 'center',
    };

    const activeTabStyles = {
      color: 'var(--color-foreground)',
      borderBottomColor: 'var(--color-primary)',
      background: 'var(--color-background)',
    };

    const disabledTabStyles = {
      color: 'var(--color-muted-foreground)',
      cursor: 'not-allowed',
      opacity: 0.5,
    };

    const panelStyles = {
      padding: 'var(--space-lg, 20px)',
      background: 'var(--color-background)',
      minHeight: '200px', // Prevent layout shift
    };

    const activeTab = tabs.find(tab => tab.id === currentActiveId);

    return (
      <div
        ref={ref}
        className={`molecule-tabset ${className}`}
        style={containerStyles}
        data-molecule="tabset"
        data-active-tab={currentActiveId}
        {...props}
      >
        <div 
          className="molecule-tabset__tabs"
          style={tabListStyles}
          role="tablist"
          aria-label="Content tabs"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === currentActiveId;
            const isDisabled = tab.disabled;
            
            const buttonStyle = {
              ...tabButtonStyles,
              ...(isActive ? activeTabStyles : {}),
              ...(isDisabled ? disabledTabStyles : {}),
            };

            return (
              <button
                key={tab.id}
                className={`molecule-tabset__tab ${isActive ? 'molecule-tabset__tab--active' : ''} ${isDisabled ? 'molecule-tabset__tab--disabled' : ''}`}
                style={buttonStyle}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                onClick={() => !isDisabled && handleTabChange(tab.id)}
                onKeyDown={(e) => {
                  if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleTabChange(tab.id);
                  }
                }}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          className="molecule-tabset__panel"
          style={panelStyles}
          role="tabpanel"
          id={`panel-${currentActiveId}`}
          aria-labelledby={`tab-${currentActiveId}`}
        >
          {activeTab?.content || (
            <div style={{ color: 'var(--color-muted-foreground)' }}>
              No content available for this tab.
            </div>
          )}
        </div>
      </div>
    );
  }
);

Tabset.displayName = 'Tabset';

// Component metadata for catalog
export const TabsetMeta = {
  name: 'Tabset',
  category: 'molecules',
  description: 'A tabbed interface for organizing content into separate views',
  composedFrom: [],
  tokens: {
    layout: ['--space-sm', '--space-md', '--space-lg', '--touch-target-md'],
    colors: ['--color-border', '--color-background', '--color-foreground', '--color-muted-foreground', '--color-primary'],
    typography: ['--font-size-sm', '--font-weight-medium', '--line-height-normal'],
  },
  variants: {},
  examples: {
    basic: {
      tabs: [
        { id: 'tab1', label: 'Overview', content: 'This is the overview content.' },
        { id: 'tab2', label: 'Details', content: 'This is the detailed information.' },
        { id: 'tab3', label: 'Settings', content: 'This is the settings panel.' },
      ],
    },
    withDisabled: {
      tabs: [
        { id: 'tab1', label: 'Available', content: 'This tab is available.' },
        { id: 'tab2', label: 'Disabled', content: 'This content is not accessible.', disabled: true },
        { id: 'tab3', label: 'Also Available', content: 'This tab is also available.' },
      ],
    },
    manyTabs: {
      tabs: [
        { id: 'tab1', label: 'Dashboard', content: 'Dashboard content' },
        { id: 'tab2', label: 'Analytics', content: 'Analytics content' },
        { id: 'tab3', label: 'Reports', content: 'Reports content' },
        { id: 'tab4', label: 'Settings', content: 'Settings content' },
        { id: 'tab5', label: 'Users', content: 'Users content' },
        { id: 'tab6', label: 'Billing', content: 'Billing content' },
      ],
    },
  },
};