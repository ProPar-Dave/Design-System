import * as React from 'react';
import { createPortal } from 'react-dom';
import { getHashParam, setHashParam } from '../utils/ui';
import type { DsComponent } from '../utils/catalog';
import { PreviewHost } from './registry';
import { ControlsGroup } from './controls';
import { PreviewPane } from '../preview/PreviewPane';
import { PropsEditor, useCurrentProps } from '../preview/PropsEditor';
import { useFocusTrap } from '../utils/useFocusTrap';
import { useThumbCapture } from '../utils/snapshot';
import '../styles/preview.css';
import '../styles/drawer.css';

export type DrawerTab = 'preview' | 'notes' | 'props' | 'json';

// Enhanced Live Preview component with props editor and thumbnail capture
function DrawerPreview({ item }: { item: DsComponent }) {
  const [currentProps, setCurrentProps] = React.useState<Record<string, any>>({});
  
  // Use the new preview system first, fallback to legacy system
  const previewId = item.previewKind || item.id;
  
  // Handle props changes from the new system
  const handlePropsChange = React.useCallback((props: Record<string, any>) => {
    setCurrentProps(props);
  }, []);

  // Auto-capture thumbnail when preview or props change using the dedicated hook
  useThumbCapture(item.id, [currentProps, previewId]);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {/* Preview Area */}
      <section>
        <h4 style={{ 
          margin: '0 0 8px', 
          fontSize: '14px', 
          fontWeight: '600',
          color: 'var(--color-text)'
        }}>
          Preview
        </h4>
        
        {/* Try new preview system first */}
        <PreviewPane 
          id={previewId}
          props={{...item.demo?.props, ...currentProps}}
        />
      </section>

      {/* Props Editor - New System */}
      <section>
        <h4 style={{ 
          margin: '0 0 12px', 
          fontSize: '14px', 
          fontWeight: '600',
          color: 'var(--color-text)'
        }}>
          Properties
        </h4>
        <div style={{
          padding: '16px',
          background: 'var(--color-panel)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}>
          <PropsEditor 
            id={previewId}
            onPropsChange={handlePropsChange}
          />
        </div>
      </section>
    </div>
  );
}

export function ComponentDrawer({ item, onClose, onEdit, returnRef }: { 
  item: DsComponent; 
  onClose: () => void; 
  onEdit: () => void;
  returnRef?: React.RefObject<HTMLElement>;
}) {
  // Create portal container
  const [portalContainer] = React.useState(() => {
    const container = document.createElement('div');
    container.className = 'adsm-drawer-portal';
    return container;
  });

  // Initialize tab from URL or default to preview
  const initial = (getHashParam('tab') as DrawerTab) || 'preview';
  const [tab, setTab] = React.useState<DrawerTab>(initial);

  // Refs for focus management
  const drawerRef = React.useRef<HTMLDivElement>(null);
  
  // Mount portal and manage body scroll lock
  React.useEffect(() => {
    document.body.appendChild(portalContainer);
    
    // Store original overflow and apply body scroll lock
    const originalOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Cleanup on unmount
    return () => {
      document.documentElement.style.overflow = originalOverflow;
      document.body.style.overflow = originalBodyOverflow;
      
      if (portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
      }
      
      // Return focus to the element that opened the drawer
      if (returnRef?.current) {
        returnRef.current.focus();
      }
    };
  }, [portalContainer, returnRef]);

  // Focus trap
  useFocusTrap(drawerRef);

  // Handle escape key globally
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Tab selection with hash update
  const selectTab = React.useCallback((newTab: DrawerTab) => {
    setTab(newTab);
    setHashParam('tab', newTab);
  }, []);

  // Listen for hash changes to sync tab state
  React.useEffect(() => {
    const onHash = () => {
      const hashTab = getHashParam('tab') as DrawerTab;
      if (hashTab && hashTab !== tab && ['preview', 'notes', 'props', 'json'].includes(hashTab)) {
        setTab(hashTab);
      }
    };
    
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [tab]);

  const tabs = [
    { id: 'preview' as const, label: 'Preview' },
    { id: 'notes' as const, label: 'Notes' },
    { id: 'props' as const, label: 'Props' },
    { id: 'json' as const, label: 'JSON' }
  ];

  // Handle backdrop click
  const handleBackdropClick = React.useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const drawerContent = (
    <div 
      className="adsm-drawer-backdrop" 
      role="presentation" 
      onClick={handleBackdropClick}
    >
      <aside
        ref={drawerRef}
        className="adsm-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adsm-drawer-title"
        aria-describedby="adsm-drawer-description"
      >
        {/* Sticky Header */}
        <header className="adsm-drawer-head">
          <div className="adsm-drawer-title-section">
            <h2 
              id="adsm-drawer-title"
              className="adsm-drawer-title"
            >
              {item.name}
            </h2>
            <div id="adsm-drawer-description" className="sr-only">
              Component details drawer for {item.name}. Use Tab and Shift+Tab to navigate, Escape to close.
            </div>
          </div>
          
          <nav className="adsm-drawer-tabs" role="tablist">
            {tabs.map(t => (
              <button 
                key={t.id}
                role="tab"
                aria-selected={t.id === tab}
                aria-controls={`panel-${t.id}`}
                onClick={() => selectTab(t.id)}
                className="adsm-drawer-tab"
                data-active={t.id === tab}
              >
                {t.label}
              </button>
            ))}
          </nav>
          
          <button 
            className="adsm-drawer-close" 
            onClick={onClose}
            aria-label="Close component details drawer"
          >
            ✕
          </button>
        </header>

        {/* Scrollable Content */}
        <section 
          className="adsm-drawer-body"
          role="tabpanel"
          id={`panel-${tab}`}
          aria-labelledby={`tab-${tab}`}
        >
          {tab === 'preview' && (
            <div>
              <DrawerPreview item={item} />
            </div>
          )}

          {tab === 'notes' && (
            <div>
              <h4 style={{ 
                margin: '0 0 12px', 
                fontSize: '14px', 
                fontWeight: '600',
                color: 'var(--color-text)'
              }}>
                Notes
              </h4>
              <div style={{ 
                padding: '16px',
                background: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                lineHeight: 1.5,
                minHeight: '120px'
              }}>
                {item.notes?.trim() ? (
                  <div style={{ 
                    whiteSpace: 'pre-wrap', 
                    color: 'var(--color-text)',
                    fontSize: '14px'
                  }}>
                    {item.notes}
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100px',
                    color: 'var(--color-muted-foreground)',
                    fontSize: '14px',
                    fontStyle: 'italic'
                  }}>
                    No notes added yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'props' && (
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600' }}>Properties</h4>
              {Array.isArray(item.propsSpec) && item.propsSpec.length > 0 ? (
                <div style={{
                  padding: '16px',
                  background: 'var(--color-panel)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {item.propsSpec.map((spec, index) => (
                      <div key={`${spec.name}-${index}`} style={{
                        padding: '8px',
                        background: 'var(--color-background)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                      }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: 'var(--color-text)',
                          marginBottom: '4px'
                        }}>
                          {spec.label || spec.name}
                          {spec.required && <span style={{ color: 'var(--color-destructive)' }}> *</span>}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: 'var(--color-muted-foreground)',
                          marginBottom: '4px'
                        }}>
                          Type: {spec.kind || 'text'}
                          {spec.default !== undefined && ` • Default: ${spec.default}`}
                        </div>
                        {spec.description && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: 'var(--color-text)',
                            lineHeight: 1.4
                          }}>
                            {spec.description}
                          </div>
                        )}
                        {spec.options && spec.options.length > 0 && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: 'var(--color-muted-foreground)',
                            marginTop: '4px'
                          }}>
                            Options: {spec.options.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '24px',
                  background: 'var(--color-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  color: 'var(--color-muted-foreground)',
                  fontSize: '14px'
                }}>
                  No props specification defined.
                </div>
              )}
            </div>
          )}

          {tab === 'json' && (
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600' }}>Component Data</h4>
              <pre style={{
                padding: '12px',
                background: 'var(--color-panel)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '12px',
                lineHeight: '1.4',
                overflowX: 'auto',
                color: 'var(--color-text)',
                fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
              }}>
{JSON.stringify({
  id: item.id, 
  name: item.name, 
  level: item.level, 
  version: item.version,
  status: item.status, 
  description: item.description || '',
  notes: item.notes || '', 
  tags: Array.isArray(item.tags) ? item.tags : [],
  dependencies: Array.isArray(item.dependencies) ? item.dependencies : [],
  previewKind: item.previewKind,
  propsSpec: Array.isArray(item.propsSpec) ? item.propsSpec : [], 
  code: item.code || ''
}, null, 2)}
              </pre>
            </div>
          )}

          {/* Metadata sections - always visible across all tabs */}
          <div style={{ 
            marginTop: '24px', 
            paddingTop: '16px', 
            borderTop: '1px solid var(--color-border)' 
          }}>
            {item?.description && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ 
                  margin: '0 0 8px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: 'var(--color-text)'
                }}>
                  Description
                </h4>
                <p style={{ 
                  margin: 0, 
                  lineHeight: 1.5, 
                  color: 'var(--color-text)',
                  padding: '12px',
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px'
                }}>
                  {item.description}
                </p>
              </div>
            )}

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px',
              fontSize: '12px',
              color: 'var(--color-muted-foreground)'
            }}>
              <div>
                <strong>Level:</strong> {item.level}
              </div>
              <div>
                <strong>Status:</strong> {item.status}
              </div>
              <div>
                <strong>Version:</strong> {item.version}
              </div>
              <div>
                <strong>ID:</strong> {item.id}
              </div>
            </div>

            {Array.isArray(item.tags) && item.tags.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ 
                  margin: '0 0 8px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: 'var(--color-text)'
                }}>
                  Tags
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {item.tags.map((tag, index) => (
                    <span 
                      key={`${tag}-${index}`} 
                      style={{
                        padding: '2px 8px',
                        background: 'var(--color-muted)',
                        color: 'var(--color-muted-foreground)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(item.dependencies) && item.dependencies.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ 
                  margin: '0 0 8px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: 'var(--color-text)'
                }}>
                  Dependencies
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {item.dependencies.map((dep, index) => (
                    <span 
                      key={`${dep}-${index}`} 
                      style={{
                        padding: '2px 8px',
                        background: 'var(--color-accent)',
                        color: 'var(--color-accent-foreground)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Optional Footer */}
        <footer className="adsm-drawer-foot">
          <div style={{ fontSize: '12px', color: 'var(--color-muted-foreground)' }}>
            Use Tab/Shift+Tab to navigate • ESC to close
          </div>
        </footer>
      </aside>
    </div>
  );

  return createPortal(drawerContent, portalContainer);
}