import React from 'react';
import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="sidebar" data-theme="panel">
      <div className="sidebar-header">
        <div className="sidebar-title">Atomic DS Manager</div>
        <div className="sidebar-subtitle">Design System Tools</div>
      </div>
      <nav className="sidebar-nav" role="navigation" aria-label="Primary">
        {/* These must be absolute paths (HashRouter expects #/path) */}
        <NavLink to="/overview" className="sidebar-link">Overview</NavLink>
        <NavLink to="/tokens" className="sidebar-link">Tokens</NavLink>
        <NavLink to="/components" className="sidebar-link">Components</NavLink>
        <NavLink to="/mini-layouts" className="sidebar-link">Mini Layouts</NavLink>
        <NavLink to="/diagnostics" className="sidebar-link">Diagnostics</NavLink>
      </nav>
    </aside>
  )
}