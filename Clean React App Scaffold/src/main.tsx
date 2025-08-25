import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'

// Very small error boundary to avoid blank screens during init.
class RootBoundary extends React.Component<{ children: React.ReactNode }, { err?: Error }> {
  state = { err: undefined }
  static getDerivedStateFromError(err: Error) { return { err } }
  render() {
    if (this.state.err) {
      console.warn('[A/DS] RootBoundary caught:', this.state.err)
      return (
        <div className="p-6 text-sm" style={{ color: 'var(--color-text)' }}>
          <strong>Something went wrong.</strong>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.err)}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl =
  document.getElementById('root') ||
  document.getElementById('app')  ||
  (() => { const d = document.createElement('div'); d.id = 'root'; document.body.appendChild(d); return d })()

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HashRouter>
      <RootBoundary>
        <App />
      </RootBoundary>
    </HashRouter>
  </React.StrictMode>
)