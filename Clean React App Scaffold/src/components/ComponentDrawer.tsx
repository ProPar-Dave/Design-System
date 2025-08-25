import * as React from 'react';

// Simple Tab components - you can replace these with your actual Tab library
const Tabs = ({ children }: { children: React.ReactNode }) => {
  return <div className="tabs-container">{children}</div>;
};

const TabList = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={`tab-list ${className || ''}`} role="tablist">{children}</div>;
};

const Tab = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <button className={`tab ${className || ''}`} role="tab">{children}</button>;
};

const TabPanels = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={`tab-panels ${className || ''}`}>{children}</div>;
};

const TabPanel = ({ children }: { children: React.ReactNode }) => {
  return <div className="tab-panel" role="tabpanel">{children}</div>;
};

interface Props {
  component: any;
  onClose: () => void;
}

export const ComponentDrawer = ({ component, onClose }: Props) => {
  if (!component) return null;

  return (
    <aside
      className="adsm-drawer"
      data-theme="panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adsm-drawer-title"
    >
      <div
        className="
          flex justify-between items-center
          px-4 py-3 border-b
          border-[var(--color-border)]
        "
      >
        <h2 className="text-lg font-bold">{component?.name}</h2>
        <button
          onClick={onClose}
          className="px-2 py-1 rounded-md hover:bg-[var(--color-hover-bg)]"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <Tabs>
          <TabList className="adsm-drawer-tabs">
            <Tab className="adsm-tab">
              Preview
            </Tab>
            <Tab className="adsm-tab">Notes</Tab>
            <Tab className="adsm-tab">Props</Tab>
            <Tab className="adsm-tab">JSON</Tab>
          </TabList>

          <TabPanels className="mt-3">
            <TabPanel>{/* Live Preview */}</TabPanel>
            <TabPanel>{/* Notes */}</TabPanel>
            <TabPanel>{/* Props */}</TabPanel>
            <TabPanel>{/* JSON */}</TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </aside>
  );
}