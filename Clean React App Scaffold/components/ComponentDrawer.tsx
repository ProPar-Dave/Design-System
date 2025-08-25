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
import { auditDrawerContrast, applyContrastFallbacks, captureDrawerScreenshot, getHighContrastTokens, getCurrentTheme } from '../diagnostics/utils';
import { safeLogEvent } from '../diagnostics/logger';
import '../styles/preview.css';
// Normalize to a single drawer stylesheet to avoid dupe or missing imports.
import '../src/styles/drawer.css';

export type DrawerTab = 'preview' | 'notes' | 'props' | 'json';

// Screen reader announcement utility
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.style.cssText = `
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  `;
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Enhanced Live Preview component with accessible props editor
function DrawerPreview({ item }: { item: DsComponent }) {
  const [currentProps, setCurrentProps] = React.useState<Record<string, any>>({});
  
  // Use the new preview system first, fallback to legacy system
  const previewId = item.previewKind || item.id;
  
  // Handle props changes from the new system
  const handlePropsChange = React.useCallback((props: Record<string, any>) => {
    setCurrentProps(props);
    // Announce changes to screen readers
    announceToScreenReader(`Preview properties updated for ${item.name}`);
  }, [item.name]);

  // Auto-capture thumbnail when preview or props change using the dedicated hook
  useThumbCapture(item.id, [currentProps, previewId]);

  return (
    <div className="preview-section">
      {/* Preview Area */}
      <section className="adsm-section" role="region" aria-labelledby="preview-heading">
        <h4 id="preview-heading">
          Live Preview
        </h4>
        
        <div 
          style={{
            border: '2px solid var(--adsm-drawer-border)',
            borderRadius: 'var(--adsm-drawer-radius)',
            background: 'var(--color-background)',
            overflow: 'hidden',
            minHeight: '120px'
          }}
          role="img"
          aria-label={`Preview of ${item.name} component`}
        >
          <PreviewPane 
            id={previewId}
            props={{...item.demo?.props, ...currentProps}}
          />
        </div>
      </section>

      {/* Props Editor - New System */}
      <section className="adsm-section" role="region" aria-labelledby="props-editor-heading">
        <h4 id="props-editor-heading">
          Properties Editor
        </h4>
        <div className="props-editor">
          <PropsEditor 
            id={previewId}
            onPropsChange={handlePropsChange}
          />
        </div>
      </section>
    </div>
  );
}

// Invalid component data placeholder
function InvalidComponentPlaceholder({ onClose }: { onClose: () => void }) {
  return (
    <div 
      className="adsm-drawer-backdrop" 
      role="presentation" 
      onClick={onClose}
    >
      <aside
        className="adsm-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invalid-component-title"
      >
        <div className="adsm-drawer-header">
          <h2 id="invalid-component-title">
            Invalid Component Data
          </h2>
          <button 
            className="adsm-drawer-close"
            onClick={onClose}
            aria-label="Close invalid component drawer"
          >
            ✕
          </button>
        </div>
        
        <div className="adsm-drawer-body">
          <div className="adsm-section">
            <div style={{
              textAlign: 'center',
              padding: '48px 16px',
              color: 'var(--color-muted-foreground)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3>Invalid Component Data</h3>
              <p style={{ marginBottom: '16px' }}>
                The component data is missing or invalid. Please try selecting a different component.
              </p>
              <button 
                onClick={onClose}
                className="adsm-button-primary"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function ComponentDrawer({ item, onClose, onEdit, returnRef }: { 
  item: DsComponent | null | undefined; 
  onClose: () => void; 
  onEdit: () => void;
  returnRef?: React.RefObject<HTMLElement>;
}) {
  // Enhanced logging for debugging
  React.useEffect(() => {
    console.log('ComponentDrawer: Received item:', item);
    if (!item) {
      console.error('ComponentDrawer: Invalid component data received', { item });
    } else if (!item.id || !item.name) {
      console.error('ComponentDrawer: Component missing required properties', { 
        item,
        hasId: !!item.id,
        hasName: !!item.name
      });
    } else {
      console.log('ComponentDrawer: Valid component received:', {
        id: item.id,
        name: item.name,
        level: item.level,
        status: item.status
      });
    }
  }, [item]);

  // Create portal container
  const [portalContainer] = React.useState(() => {
    const container = document.createElement('div');
    container.className = 'adsm-drawer-portal';
    return container;
  });

  // If component is invalid, show error placeholder
  if (!item || !item.id || !item.name) {
    console.warn('ComponentDrawer: Rendering invalid component placeholder');
    return createPortal(
      <InvalidComponentPlaceholder onClose={onClose} />,
      portalContainer
    );
  }

  // Initialize tab from URL or default to preview
  const initial = (getHashParam('tab') as DrawerTab) || 'preview';
  const [tab, setTab] = React.useState<DrawerTab>(initial);

  // Refs for focus management
  const drawerRef = React.useRef<HTMLDivElement>(null);
  const firstTabRef = React.useRef<HTMLButtonElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  
  // Mount portal and manage body scroll lock with accessibility audit
  React.useEffect(() => {
    document.body.appendChild(portalContainer);
    
    // Store original overflow and apply body scroll lock
    const originalOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Focus the first tab after mounting
    setTimeout(() => {
      firstTabRef.current?.focus();
      announceToScreenReader(`Component drawer opened for ${item.name}. Use Tab to navigate, Escape to close.`);
    }, 100);

    // Run accessibility audit after drawer is mounted and rendered
    setTimeout(async () => {
      try {
        // Capture screenshot before any fixes
        const screenshotBefore = await captureDrawerScreenshot();
        
        // Run comprehensive contrast audit
        const auditResult = auditDrawerContrast();
        
        // Log initial audit results
        safeLogEvent('info', 'drawer/accessibility-audit', {
          event: 'drawer_accessibility_audit',
          component: {
            id: item.id,
            name: item.name,
            level: item.level
          },
          audit: {
            totalElements: auditResult.totalElements,
            accessibleElements: auditResult.accessibleElements,
            failedElements: auditResult.failedElements,
            averageContrast: auditResult.averageContrast,
            issueCount: auditResult.issues.length,
            criticalIssues: auditResult.issues.filter(i => i.severity === 'critical').length,
            theme: auditResult.theme
          },
          tokenMappings: auditResult.tokenMappings,
          timestamp: Date.now()
        });

        // Apply automatic fallbacks for critical issues
        if (auditResult.issues.some(i => i.severity === 'critical')) {
          const fixesApplied = applyContrastFallbacks(auditResult);
          
          if (fixesApplied > 0) {
            // Capture screenshot after fixes
            const screenshotAfter = await captureDrawerScreenshot();
            
            // Run audit again to verify fixes
            const auditAfterFixes = auditDrawerContrast();
            
            // Log fallback application results
            safeLogEvent('info', 'drawer/contrast-fallbacks', {
              event: 'drawer_contrast_fallbacks_applied',
              component: {
                id: item.id,
                name: item.name
              },
              fallbacks: {
                fixesApplied,
                beforeFailures: auditResult.failedElements,
                afterFailures: auditAfterFixes.failedElements,
                improvementCount: auditResult.failedElements - auditAfterFixes.failedElements,
                averageContrastBefore: auditResult.averageContrast,
                averageContrastAfter: auditAfterFixes.averageContrast
              },
              appliedFixes: auditAfterFixes.issues
                .filter(i => i.fallbackApplied)
                .map(i => ({
                  element: i.element,
                  fromToken: i.fallbackApplied?.fromToken,
                  toToken: i.fallbackApplied?.toToken,
                  contrastImprovement: (i.fallbackApplied?.newContrast || 0) - i.currentContrast
                })),
              screenshots: {
                before: screenshotBefore,
                after: screenshotAfter
              },
              timestamp: Date.now()
            });

            // Announce improvements to screen reader users
            announceToScreenReader(`Accessibility improvements applied: ${fixesApplied} contrast issues automatically fixed`);
          }
        }

        // Apply high-contrast tokens if needed and user has high-contrast preference
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
          const highContrastTokens = getHighContrastTokens(getCurrentTheme());
          const root = document.documentElement;
          
          let highContrastApplied = 0;
          for (const [token, value] of Object.entries(highContrastTokens)) {
            root.style.setProperty(token, value);
            highContrastApplied++;
          }
          
          if (highContrastApplied > 0) {
            safeLogEvent('info', 'drawer/high-contrast', {
              event: 'drawer_high_contrast_applied',
              component: { id: item.id, name: item.name },
              tokensApplied: highContrastApplied,
              tokens: highContrastTokens,
              timestamp: Date.now()
            });

            announceToScreenReader('High contrast mode detected, enhanced accessibility tokens applied');
          }
        }

        // Log detailed accessibility metrics for manual review
        safeLogEvent('info', 'drawer/accessibility-metrics', {
          event: 'drawer_accessibility_metrics_detailed',
          component: { id: item.id, name: item.name },
          metrics: {
            totalTextElements: auditResult.totalElements,
            wcagAACompliant: auditResult.accessibleElements,
            complianceRate: auditResult.totalElements > 0 ? 
              Number((auditResult.accessibleElements / auditResult.totalElements * 100).toFixed(1)) : 0,
            averageContrastRatio: auditResult.averageContrast,
            issuesByType: {
              critical: auditResult.issues.filter(i => i.severity === 'critical').length,
              warning: auditResult.issues.filter(i => i.severity === 'warning').length,
              info: auditResult.issues.filter(i => i.severity === 'info').length
            },
            elementBreakdown: auditResult.issues.reduce((acc, issue) => {
              const elementType = issue.element.split('-')[0];
              acc[elementType] = (acc[elementType] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          },
          detailedIssues: auditResult.issues.map(issue => ({
            element: issue.element,
            selector: issue.selector,
            currentContrast: issue.currentContrast,
            requiredContrast: issue.requiredContrast,
            isAccessible: issue.isAccessible,
            severity: issue.severity,
            textToken: issue.textToken,
            backgroundToken: issue.backgroundToken,
            recommendations: issue.recommendations,
            fallbackApplied: issue.fallbackApplied
          })),
          timestamp: Date.now()
        });

      } catch (error) {
        // Log audit errors for debugging
        safeLogEvent('error', 'drawer/accessibility-audit-error', {
          event: 'drawer_accessibility_audit_failed',
          component: { id: item.id, name: item.name },
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        });
        
        console.warn('Drawer accessibility audit failed:', error);
      }
    }, 250); // Wait for drawer animation and render

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
        announceToScreenReader('Component drawer closed, focus returned to component card');
      }
    };
  }, [portalContainer, returnRef, item.name, item.id, item.level]);

  // Enhanced focus trap with better keyboard navigation
  useFocusTrap(drawerRef);

  // Handle escape key and other keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      
      // Alt + 1-4 for quick tab switching
      if (e.altKey && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        const tabIds: DrawerTab[] = ['preview', 'notes', 'props', 'json'];
        if (tabIds[tabIndex]) {
          selectTab(tabIds[tabIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Tab selection with hash update and announcements
  const selectTab = React.useCallback((newTab: DrawerTab) => {
    setTab(newTab);
    setHashParam('tab', newTab);
    
    // Announce tab change
    const tabLabels = {
      preview: 'Preview',
      notes: 'Notes',
      props: 'Properties',
      json: 'JSON Data'
    };
    announceToScreenReader(`Switched to ${tabLabels[newTab]} tab`);
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
    { id: 'preview' as const, label: 'Preview', shortcut: 'Alt+1' },
    { id: 'notes' as const, label: 'Notes', shortcut: 'Alt+2' },
    { id: 'props' as const, label: 'Props', shortcut: 'Alt+3' },
    { id: 'json' as const, label: 'JSON', shortcut: 'Alt+4' }
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
        <div className="adsm-drawer-header">
          <div>
            <h2 id="adsm-drawer-title">
              {item.name}
            </h2>
            <div 
              id="adsm-drawer-description" 
              className="meta"
            >
              {item.level} • {item.status} • v{item.version}
            </div>
          </div>
          
          <button 
            ref={closeButtonRef}
            className="adsm-drawer-close"
            onClick={onClose}
            aria-label={`Close ${item.name} component drawer`}
          >
            ✕
          </button>
        </div>
        
        {/* Tabs Bar (separate sticky row) */}
        <div className="adsm-drawer-tabs" role="tablist" aria-label="Component details sections">
          {tabs.map((t, index) => (
            <button 
              key={t.id}
              ref={index === 0 ? firstTabRef : undefined}
              role="tab"
              aria-selected={t.id === tab}
              aria-controls={`panel-${t.id}`}
              id={`tab-${t.id}`}
              onClick={() => selectTab(t.id)}
              title={`${t.label} (${t.shortcut})`}
              className="adsm-tab"
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content Body */}
        <div className="adsm-drawer-body">
          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            tabIndex={-1}
          >
            {tab === 'preview' && (
              <DrawerPreview item={item} />
            )}

            {tab === 'notes' && (
              <div role="region" aria-labelledby="notes-heading">
                <h3 id="notes-heading" className="adsm-section h2">
                  Component Notes
                </h3>
                <div className="adsm-drawer-notes" role="article" aria-label={`Notes for ${item.name} component`}>
                  {item.notes?.trim() ? (
                    <div className="adsm-drawer-notes-content">
                      {item.notes}
                    </div>
                  ) : (
                    <div className="adsm-drawer-notes-empty">
                      No notes have been added for this component yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'props' && (
              <div role="region" aria-labelledby="props-spec-heading">
                <h3 id="props-spec-heading" className="adsm-section h2">
                  Properties Specification
                </h3>
                {Array.isArray(item.propsSpec) && item.propsSpec.length > 0 ? (
                  <div className="adsm-drawer-props-spec">
                    <div className="adsm-drawer-props-spec-grid">
                      {item.propsSpec.map((spec, index) => (
                        <div 
                          key={`${spec.name}-${index}`} 
                          className="adsm-drawer-props-spec-item"
                          role="article"
                          aria-labelledby={`prop-${index}-name`}
                        >
                          <div 
                            id={`prop-${index}-name`}
                            className="adsm-drawer-props-spec-name"
                          >
                            {spec.label || spec.name}
                            {spec.required && (
                              <span 
                                className="adsm-drawer-props-spec-required"
                                aria-label="required"
                              >
                                *
                              </span>
                            )}
                          </div>
                          <div className="adsm-drawer-props-spec-meta">
                            <div><strong>Type:</strong> {spec.kind || 'text'}</div>
                            {spec.default !== undefined && (
                              <div><strong>Default:</strong> {String(spec.default)}</div>
                            )}
                            {spec.required && (
                              <div><strong>Required:</strong> Yes</div>
                            )}
                          </div>
                          {spec.description && (
                            <div className="adsm-drawer-props-spec-description">
                              {spec.description}
                            </div>
                          )}
                          {spec.options && spec.options.length > 0 && (
                            <div className="adsm-drawer-props-spec-options">
                              <strong>Options:</strong> {spec.options.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="adsm-drawer-empty">
                    No properties specification has been defined for this component.
                  </div>
                )}
              </div>
            )}

            {tab === 'json' && (
              <div role="region" aria-labelledby="json-heading">
                <h3 id="json-heading" className="adsm-section h2">
                  Component Data (JSON)
                </h3>
                <div className="adsm-drawer-json">
                  <pre 
                    role="code"
                    aria-label={`JSON data for ${item.name} component`}
                    tabIndex={0}
                  >
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
              </div>
            )}

            {/* Enhanced Metadata sections */}
            <div className="adsm-drawer-metadata">
              {item?.description && (
                <div style={{ marginBottom: '24px' }} role="region" aria-labelledby="description-heading">
                  <h4 id="description-heading" className="adsm-section h2">
                    Description
                  </h4>
                  <div className="adsm-section">
                    {item.description}
                  </div>
                </div>
              )}

              <div className="adsm-drawer-metadata-grid" role="list" aria-label="Component metadata">
                <div className="adsm-drawer-metadata-item" role="listitem">
                  <strong>Level:</strong> <span style={{ textTransform: 'capitalize' }}>{item.level}</span>
                </div>
                <div className="adsm-drawer-metadata-item" role="listitem">
                  <strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{item.status}</span>
                </div>
                <div className="adsm-drawer-metadata-item" role="listitem">
                  <strong>Version:</strong> {item.version}
                </div>
                <div className="adsm-drawer-metadata-item" role="listitem">
                  <strong>ID:</strong> <code style={{ fontSize: '12px', background: 'var(--color-muted)', padding: '2px 4px', borderRadius: '3px' }}>{item.id}</code>
                </div>
              </div>

              {Array.isArray(item.tags) && item.tags.length > 0 && (
                <div className="adsm-drawer-tags" role="region" aria-labelledby="tags-heading">
                  <h4 id="tags-heading">Tags</h4>
                  <div 
                    className="adsm-drawer-tags-list"
                    role="list"
                    aria-label={`${item.tags.length} tags for ${item.name}`}
                  >
                    {item.tags.map((tag, index) => (
                      <span 
                        key={`${tag}-${index}`} 
                        className="adsm-drawer-tag adsm-chip--tag"
                        role="listitem"
                        aria-label={`Tag: ${tag}`}
                        tabIndex={0}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Array.isArray(item.dependencies) && item.dependencies.length > 0 && (
                <div className="adsm-drawer-tags" role="region" aria-labelledby="deps-heading">
                  <h4 id="deps-heading">Dependencies</h4>
                  <div 
                    className="adsm-drawer-tags-list"
                    role="list"
                    aria-label={`${item.dependencies.length} dependencies for ${item.name}`}
                  >
                    {item.dependencies.map((dep, index) => (
                      <span 
                        key={`${dep}-${index}`} 
                        className="adsm-drawer-dependency adsm-chip--dependency"
                        role="listitem"
                        aria-label={`Dependency: ${dep}`}
                        tabIndex={0}
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );

  return createPortal(drawerContent, portalContainer);
}