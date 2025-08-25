import * as React from 'react';
import type { DsComponent } from '../utils/catalog';
import '../styles/drawer.css';

const TABS = ['Preview','Notes','Props','JSON'] as const;

type Tab = typeof TABS[number];

export function Drawer({
  open,
  item,
  onClose,
  onEdit,
}: {
  open: boolean;
  item: DsComponent | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}){
  const [tab, setTab] = React.useState<Tab>('Preview');
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Lock scroll when open
  React.useEffect(() => {
    if (open) {
      document.documentElement.classList.add('adsm-no-scroll');
      document.body.classList.add('adsm-no-scroll');
    } else {
      document.documentElement.classList.remove('adsm-no-scroll');
      document.body.classList.remove('adsm-no-scroll');
    }
    
    return () => { 
      document.documentElement.classList.remove('adsm-no-scroll'); 
      document.body.classList.remove('adsm-no-scroll'); 
    };
  }, [open]);

  // Scroll to top when switching items or tabs
  React.useEffect(() => { 
    if (open && bodyRef.current) {
      bodyRef.current.scrollTo({ top: 0, behavior: 'instant' as any });
    }
  }, [open, item?.id, tab]);

  // Focus management and keyboard handling
  React.useEffect(() => {
    if (open) {
      // Focus the panel when opened
      setTimeout(() => {
        panelRef.current?.focus();
      }, 100);

      // Handle escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, onClose]);

  if (!open || !item) return null;

  // Safe field access with fallbacks
  const safeItem = {
    id: item.id || 'unknown',
    name: item.name || 'Untitled Component',
    version: item.version || '1.0.0',
    level: item.level || 'atom',
    status: item.status || 'draft',
    description: item.description || '',
    notes: item.notes || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    dependencies: Array.isArray(item.dependencies) ? item.dependencies : [],
    propsSpec: Array.isArray(item.propsSpec) ? item.propsSpec : [],
    code: item.code || ''
  };

  const levelIcons: Record<string, string> = {
    atom: '⚛️',
    molecule: '🧬',
    organism: '🦠'
  };

  const statusColors: Record<string, string> = {
    ready: '#10B981',
    draft: '#F59E0B'
  };

  return (
    <>
      {/* Backdrop */}
      <div className="adsm-drawer__backdrop" onClick={onClose} />
      
      {/* Drawer Panel */}
      <div 
        className="adsm-drawer" 
        open={open || undefined}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="drawer-title"
        tabIndex={-1} 
        ref={panelRef} 
        data-drawer="panel"
        onKeyDown={(e) => {
          // Prevent tab from escaping the drawer
          if (e.key === 'Tab') {
            const focusableElements = panelRef.current?.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements && focusableElements.length > 0) {
              const firstElement = focusableElements[0] as HTMLElement;
              const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
              
              if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        }}
      >
        {/* Header */}
        <div className="adsm-drawer__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '18px' }}>{levelIcons[safeItem.level] || '⚛️'}</span>
            <div>
              <div id="drawer-title" className="adsm-drawer__title">
                {safeItem.name}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                fontSize: '11px',
                color: 'var(--color-muted-foreground)',
                marginTop: '2px'
              }}>
                <span>v{safeItem.version}</span>
                <span>•</span>
                <span style={{ 
                  color: statusColors[safeItem.status] || statusColors.draft,
                  textTransform: 'capitalize'
                }}>
                  {safeItem.status}
                </span>
                <span>•</span>
                <span style={{ textTransform: 'capitalize' }}>{safeItem.level}</span>
              </div>
            </div>
          </div>
          <button 
            className="adsm-close" 
            onClick={onClose} 
            aria-label="Close component details drawer"
            title="Close (Escape)"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="adsm-drawer__tabs" role="tablist" aria-label="Component detail views">
          {TABS.map((t) => (
            <button 
              key={t} 
              id={`drawer-tab-${t.toLowerCase()}`}
              role="tab" 
              className="adsm-tab" 
              aria-selected={tab === t} 
              aria-controls={`drawer-panel-${t.toLowerCase()}`}
              onClick={() => setTab(t)}
              tabIndex={tab === t ? 0 : -1}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="adsm-drawer__body" ref={bodyRef}>
          {/* Preview Panel */}
          <div 
            id="drawer-panel-preview"
            role="tabpanel" 
            aria-labelledby="drawer-tab-preview"
            hidden={tab !== 'Preview'}
          >
            {tab === 'Preview' && (
              <div className="adsm-section">
                <div className="adsm-preview-placeholder">
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>👁️</div>
                  <div>Live Preview</div>
                  <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                    Preview functionality coming soon
                  </div>
                </div>
                
                {safeItem.description && (
                  <div className="adsm-content">
                    <label style={{ 
                      display: 'block', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: 'var(--color-muted-foreground)', 
                      marginBottom: '8px' 
                    }}>
                      Description
                    </label>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                      {safeItem.description}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes Panel */}
          <div 
            id="drawer-panel-notes"
            role="tabpanel" 
            aria-labelledby="drawer-tab-notes"
            hidden={tab !== 'Notes'}
          >
            {tab === 'Notes' && (
              <div className="adsm-section">
                <div className="adsm-content">
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: 'var(--color-muted-foreground)', 
                    marginBottom: '8px' 
                  }}>
                    Notes
                  </label>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4, minHeight: '100px' }}>
                    {safeItem.notes.trim() || (
                      <div style={{ 
                        color: 'var(--color-muted-foreground)', 
                        fontStyle: 'italic',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '80px',
                        textAlign: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
                          <div>No notes added yet.</div>
                          <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                            Click "Edit" to add notes
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Props Panel */}
          <div 
            id="drawer-panel-props"
            role="tabpanel" 
            aria-labelledby="drawer-tab-props"
            hidden={tab !== 'Props'}
          >
            {tab === 'Props' && (
              <div className="adsm-section">
                <div className="adsm-content">
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: 'var(--color-muted-foreground)', 
                    marginBottom: '8px' 
                  }}>
                    Properties
                  </label>
                  {safeItem.propsSpec.length > 0 ? (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {safeItem.propsSpec.map((prop, index) => (
                        <div key={index} style={{
                          padding: '8px',
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: '6px'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '4px'
                          }}>
                            <code style={{ 
                              fontSize: '12px', 
                              fontWeight: '600',
                              color: 'var(--color-text)'
                            }}>
                              {prop.name}
                            </code>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'var(--color-accent)',
                              color: 'var(--color-text)'
                            }}>
                              {prop.type}
                            </span>
                            {prop.required && (
                              <span style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: '#F59E0B',
                                color: 'white'
                              }}>
                                required
                              </span>
                            )}
                          </div>
                          {prop.description && (
                            <div style={{
                              fontSize: '12px',
                              color: 'var(--color-muted-foreground)',
                              lineHeight: 1.4
                            }}>
                              {prop.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      color: 'var(--color-muted-foreground)', 
                      fontStyle: 'italic',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '80px',
                      textAlign: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚙️</div>
                        <div>No properties defined yet.</div>
                        <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                          Click "Edit" to add component properties
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* JSON Panel */}
          <div 
            id="drawer-panel-json"
            role="tabpanel" 
            aria-labelledby="drawer-tab-json"
            hidden={tab !== 'JSON'}
          >
            {tab === 'JSON' && (
              <div className="adsm-section">
                <div className="adsm-content">
                  <label style={{ 
                    display: 'block', 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: 'var(--color-muted-foreground)', 
                    marginBottom: '8px' 
                  }}>
                    Component Data
                  </label>
                  <pre className="adsm-json-viewer">
                    {JSON.stringify(safeItem, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Metadata section - always visible */}
          <div className="adsm-section">
            {(safeItem.tags.length > 0 || safeItem.dependencies.length > 0) && (
              <>
                {safeItem.tags.length > 0 && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: 'var(--color-muted-foreground)', 
                      marginBottom: '6px' 
                    }}>
                      Tags
                    </label>
                    <div className="adsm-chips">
                      {safeItem.tags.map((t, index) => 
                        <span className="adsm-chip" key={`${t}-${index}`}>{t}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {safeItem.dependencies.length > 0 && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: 'var(--color-muted-foreground)', 
                      marginBottom: '6px' 
                    }}>
                      Dependencies
                    </label>
                    <div className="adsm-chips">
                      {safeItem.dependencies.map((d, index) => 
                        <span className="adsm-chip" key={`${d}-${index}`} title={`Dependency: ${d}`}>
                          🔗 {d}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {safeItem.code && (
              <div className="adsm-content">
                <label style={{ 
                  display: 'block', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: 'var(--color-muted-foreground)', 
                  marginBottom: '8px' 
                }}>
                  Code Snippet
                </label>
                <pre style={{
                  fontSize: '11px',
                  lineHeight: 1.4,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  padding: '8px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {safeItem.code}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="adsm-footer">
          <button 
            className="adsm-button" 
            onClick={() => safeItem.id && onEdit(safeItem.id)}
            aria-label={`Edit ${safeItem.name} component`}
          >
            ✏️ Edit
          </button>
          <button 
            className="adsm-button" 
            onClick={onClose}
            aria-label="Close component details drawer"
            style={{
              background: 'transparent',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}