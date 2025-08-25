import React, { useEffect } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  title?: string
  onClose: () => void
  children?: React.ReactNode
}

export default function ComponentDrawer({ open, title, onClose, children }: Props) {
  // Trap ESC and ensure body doesn't scroll while open
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <div aria-hidden={!open} className={`adsm-drawer ${open ? 'adsm-drawer--open' : ''}`}>
      <aside aria-label="Component drawer panel" className="adsm-drawer__panel" data-theme="panel">
        <header className="adsm-drawer__header">
          <div className="adsm-drawer__title">{title}</div>
          <button
            className="adsm-drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </header>
        <div className="adsm-drawer__content">{children}</div>
      </aside>
      <button aria-label="Overlay" className="adsm-drawer__scrim" onClick={onClose} />
    </div>
  )
}