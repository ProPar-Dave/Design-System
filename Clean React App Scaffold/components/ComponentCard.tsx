// src/components/ComponentCard.tsx
import * as React from 'react';
import { open } from '../src/drawer/DrawerController';

type Item = { 
  id: string; 
  name: string; 
  level: string; 
  status: string;
  description?: string;
};

export default function ComponentCard({ 
  item 
}: { 
  item: Item;
}) {
  const onActivate = () => {
    // Dispatch custom event for tripwire monitoring
    window.dispatchEvent(new CustomEvent('adsm:open-drawer', {
      detail: { id: item.id }
    }));
    
    // Open drawer via controller
    open({
      id: item.id,
      name: item.name,
      level: item.level,
      status: item.status,
      description: item.description
    });
  };
  
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <article
      className="comp-card"
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.name}`}
      onClick={onActivate}
      onKeyDown={onKeyDown}
    >
      <div className="thumb" aria-hidden style={{
        width: '100%',
        height: '80px',
        background: 'var(--color-accent)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: 'var(--space-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-muted-foreground)',
        fontSize: 'var(--font-size-xs)'
      }}>
        Preview
      </div>
      <div className="meta">
        <div className="title" style={{
          fontWeight: 'var(--font-weight-medium)',
          marginBottom: 'var(--space-xs)',
          color: 'var(--color-text)'
        }}>
          {item.name}
        </div>
        <div className="tags" style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-muted-foreground)'
        }}>
          {item.level} • {item.status}
        </div>
        {item.description && (
          <div className="description" style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-muted-foreground)',
            marginTop: 'var(--space-xs)',
            lineHeight: 'var(--line-height-normal)'
          }}>
            {item.description}
          </div>
        )}
      </div>
    </article>
  );
}