import React from 'react'
import Layout from '../components/Layout'
import AppRoutes from './router/AppRoutes'

export default function App() {
  // Ensure design-system namespace + theme are always present
  React.useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.add('adsm-ui')               // namespace
    // keep existing value if tool already set it
    if (!root.getAttribute('data-theme')) root.setAttribute('data-theme', 'dark')
  }, [])

  return (
    <Layout>
      <AppRoutes />
      {/* Dev heartbeat to prove routing in Figma Make */}
      <RouteHeartbeat />
    </Layout>
  )
}

function RouteHeartbeat() {
  const [loc, setLoc] = React.useState<string>(location.hash || '#/')
  React.useEffect(() => {
    const h = () => setLoc(location.hash || '#/')
    window.addEventListener('hashchange', h)
    return () => window.removeEventListener('hashchange', h)
  }, [])
  return (
    <div style={{
      position:'fixed', top:6, right:8, zIndex:9999,
      fontSize:11, padding:'2px 6px', borderRadius:6,
      border:'1px solid var(--color-border)', background:'var(--color-panel)', color:'var(--color-text)',
      opacity:.75, pointerEvents:'none'
    }}>
      {loc}
    </div>
  )
}