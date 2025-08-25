import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Overview from '../views/Overview'
import TokensPage from '../views/TokensPage'
import ComponentsCatalog from '../components/ComponentsCatalog'
import Diagnostics from '../diagnostics/Diagnostics'
import MiniLayouts from '../components/MiniLayouts'

// Single, explicit, hash-based routes + safe catch-alls
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/overview" replace />} />
      <Route path="/overview" element={<Overview />} />
      <Route path="/tokens" element={<TokensPage />} />
      <Route path="/components" element={<ComponentsCatalog />} />
      <Route path="/mini-layouts" element={<MiniLayouts />} />
      <Route path="/diagnostics" element={<Diagnostics />} />
      {/* If nothing matched (common in Make), go to Overview */}
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  )
}