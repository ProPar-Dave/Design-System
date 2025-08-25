import React from 'react';
import { useDrawerController } from './DrawerController';

function PreviewPanel({ item }: { item: any }) {
  return (
    <div className="preview-panel">
      <p>Preview for {item.name}</p>
      <div style={{ 
        padding: '16px', 
        background: 'var(--color-accent)', 
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)'
      }}>
        <strong>Component Details:</strong>
        <br />ID: {item.id}
        <br />Level: {item.level}
        <br />Status: {item.status}
        <br />Version: {item.version}
      </div>
    </div>
  );
}

export default function ComponentDrawer() {
  const { isOpen, item, close } = useDrawerController();
  if (!isOpen || !item) return null;
  
  return (
    <>
      <div className="adsm-backdrop" onClick={close} />
      <aside className="adsm-drawer" data-theme="panel">
        <header className="adsm-drawer__header">
          <h3 style={{margin:0}}>{item.name}</h3>
          <div className="adsm-drawer__tabs" role="tablist" aria-label="Component tabs">
            <button className="adsm-tab" role="tab" aria-selected="true">Preview</button>
            <button className="adsm-tab" role="tab" aria-selected="false">Notes</button>
            <button className="adsm-tab" role="tab" aria-selected="false">Props</button>
            <button className="adsm-tab" role="tab" aria-selected="false">JSON</button>
          </div>
        </header>
        <section className="adsm-drawer__body">
          <PreviewPanel item={item} />
        </section>
      </aside>
    </>
  );
}