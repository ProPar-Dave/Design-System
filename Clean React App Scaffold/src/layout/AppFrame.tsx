import React from 'react';
import '../styles/nav.css';
import '../styles/drawer.css';
import ComponentDrawer from '../drawer/ComponentDrawer';

type Props = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export default function AppFrame({ sidebar, children }: Props) {
  return (
    <div className="adsm-shell">
      <aside className="adsm-sidebar" data-theme="panel">
        {sidebar}
      </aside>
      <main className="adsm-main">{children}</main>
      <ComponentDrawer />
    </div>
  );
}