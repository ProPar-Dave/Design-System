import * as React from 'react';

// DrawerTabs component placeholder
function DrawerTabs({ component }: { component: any }) {
  return (
    <div className="drawer-tabs">
      <div>Component tabs would go here</div>
    </div>
  );
}

// Props interface
interface Props {
  component: any;
  onClose: () => void;
}

export function ComponentDrawer({ component, onClose }: Props) {
  return (
    <aside
      className="adsm-drawer"
      data-theme="panel"
      data-ns="adsm-ui"
    >
      <header className="adsm-drawer-header">
        <h2>{component?.name}</h2>
        <button onClick={onClose}>×</button>
      </header>
      <DrawerTabs component={component} />
    </aside>
  );
}