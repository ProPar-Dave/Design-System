import React from 'react'
import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="app-main">
        {/* Prefer children when provided; otherwise Outlet for nested routers */}
        {children ?? <Outlet />}
      </main>
    </div>
  )
}