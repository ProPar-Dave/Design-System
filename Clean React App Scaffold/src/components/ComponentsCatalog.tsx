import React from 'react'
import { useDrawerController } from '../drawer/DrawerController';

// Sample components data for the catalog
const COMPONENTS = [
  {
    id: 'button-primary',
    name: 'Primary Button',
    level: 'atom',
    status: 'ready',
    version: '1.0.0'
  },
  {
    id: 'card-basic',
    name: 'Basic Card',
    level: 'molecule',
    status: 'ready',
    version: '1.0.0'
  },
  {
    id: 'form-group',
    name: 'Form Group',
    level: 'organism',
    status: 'draft',
    version: '0.9.0'
  }
];

function ComponentCard({ item, onClick, ...props }: { item: any; onClick: () => void; [key: string]: any }) {
  return (
    <article
      className="component-card"
      role="button"
      tabIndex={0}
      aria-label={`Open ${item.name}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      {...props}
    >
      {/* thumbnail, badges, etc. */}
      <div className="component-card__title">{item.name}</div>
    </article>
  )
}

export default function ComponentsCatalog() {
  const ctrl = useDrawerController();

  return (
    <div className="catalog-grid">
      {COMPONENTS.map((c) => (
        <ComponentCard
          key={c.id}
          item={c}
          onClick={() => ctrl.open(c)}   // <- ensure drawer opens on card click
          data-drawer-target={c.id}
        />
      ))}
    </div>
  );
}