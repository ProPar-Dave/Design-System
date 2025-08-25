import React, { useState, useCallback } from 'react'
import ComponentDrawer from '../drawer/ComponentDrawer'

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

export default function ComponentsCatalog() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<any>(null)

  const openFor = useCallback((item: any) => {
    if (!item) return
    setActive(item)
    setOpen(true)
  }, [])

  return (
    <section className="components-grid">
      {COMPONENTS.map(c => (
        <article
          key={c.id}
          className="component-card"
          role="button"
          tabIndex={0}
          aria-label={`Open ${c.name}`}
          onClick={() => openFor(c)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openFor(c)
            }
          }}
        >
          {/* thumbnail, badges, etc. */}
          <div className="component-card__title">{c.name}</div>
        </article>
      ))}

      <ComponentDrawer open={open} title={active?.name} onClose={() => setOpen(false)}>
        {/* tabs / preview / props / json go here */}
      </ComponentDrawer>
    </section>
  )
}