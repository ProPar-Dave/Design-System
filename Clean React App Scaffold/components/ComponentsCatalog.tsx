import React from 'react';
import { ComponentsGrid } from './ComponentsGrid';
import { ComponentDrawer } from './ComponentDrawer';
import { NewComponentWizard } from './NewComponentWizard';
import { useCatalogState } from '../store/catalogStore';
import { saveUserComponents, upsertComponent, type DsComponent } from '../utils/catalog';
import { 
  validateJsonStructure, 
  generateExportData, 
  downloadJson, 
  formatImportErrors,
  validateImportPreview,
  type ImportValidationResult 
} from '../utils/importer';
import { parseHash, updateHash, navigateTo } from '../utils/router';
import { pingComponentOperation } from '../utils/ping';
import { safeLogEvent } from '../diagnostics/logger';
import '../styles/components.css';

interface ComponentsCatalogProps {
  selectedId?: string | null;
}

export default function ComponentsCatalog({ selectedId }: ComponentsCatalogProps) {
  const { catalog, counts, byId, search } = useCatalogState();
  
  // State management
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [showWizard, setShowWizard] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [importPreview, setImportPreview] = React.useState<ImportValidationResult | null>(null);
  const [showImportDialog, setShowImportDialog] = React.useState(false);

  // URL state management for drawer - keep deep-linking intact
  const [openDrawerId, setOpenDrawerId] = React.useState<string | null>(null);
  const [drawerReturnRef, setDrawerReturnRef] = React.useState<React.RefObject<HTMLElement> | undefined>();

  // Parse query parameters from hash using router utility
  const parseQuery = React.useCallback(() => {
    const hash = parseHash();
    return hash.id || null;
  }, []);

  // Update query parameters - keep deep-linking intact with tab support
  const updateQuery = React.useCallback((id: string | null, tab?: string) => {
    if (id) {
      updateHash({ id, tab: tab as any });
    } else {
      updateHash({ id: undefined, tab: undefined });
    }
  }, []);

  // Find selected component safely with comprehensive validation
  const selectedComponent = React.useMemo(() => {
    if (!openDrawerId) return null;
    
    let component = null;
    try {
      component = byId(openDrawerId);
    } catch (error) {
      console.error('ComponentsCatalog: Error retrieving component by ID:', {
        openDrawerId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
    
    // Ensure the component exists and has required properties
    if (!component || !component.id || !component.name) {
      console.warn('ComponentsCatalog: Selected component is invalid or missing required properties:', {
        openDrawerId,
        component: component ? { 
          id: component.id,
          name: component.name,
          hasRequiredProps: !!(component.id && component.name)
        } : null
      });
      return null;
    }
    
    return component;
  }, [openDrawerId, byId]);

  // Handle component close - define early to avoid dependency issues
  const handleCloseDrawer = React.useCallback(() => {
    let component = null;
    try {
      component = openDrawerId ? byId(openDrawerId) : null;
    } catch (error) {
      console.warn('Error retrieving component for close:', error);
      component = null;
    }
    
    // Enhanced component close logging
    if (openDrawerId && component) {
      const openTime = parseInt(sessionStorage.getItem(`adsm:open-time:${openDrawerId}`) || '0');
      const viewDuration = openTime ? Date.now() - openTime : 0;
      
      const closeData = {
        event: 'component_closed',
        component: {
          id: openDrawerId,
          name: component.name,
          level: component.level,
          status: component.status,
          tagCount: component.tags?.length || 0
        },
        interaction: {
          viewDuration,
          method: 'drawer-close',
          wasCompleteView: viewDuration > 5000, // 5+ seconds considered a complete view
          closeTime: Date.now()
        },
        context: {
          sessionId: sessionStorage.getItem('adsm:session-id') || 'unknown',
          returnToGrid: true
        }
      };
      
      safeLogEvent('info', 'components/close', closeData);
      
      // Clean up session storage
      sessionStorage.removeItem(`adsm:open-time:${openDrawerId}`);
    }
    
    setOpenDrawerId(null);
    
    // Navigate back to components grid with proper history management
    navigateTo('/components');
    
    // Return focus to the component button if available
    if (drawerReturnRef?.current) {
      drawerReturnRef.current.focus();
    }
    setDrawerReturnRef(undefined);
  }, [drawerReturnRef, openDrawerId, byId]);

  // Handle component selection - wire to the new drawer with proper URL updates
  const handleItemClick = React.useCallback((componentId: string, buttonRef?: HTMLElement) => {
    const component = byId(componentId);
    
    // Enhanced component interaction logging
    const interactionData = {
      event: 'component_opened',
      component: {
        id: componentId,
        name: component?.name || 'unknown',
        level: component?.level || 'unknown',
        status: component?.status || 'unknown',
        tagCount: component?.tags?.length || 0,
        tags: component?.tags || [],
        dependencyCount: component?.dependencies?.length || 0,
        hasPreview: !!component?.previewKind,
        hasDescription: !!component?.description,
        hasNotes: !!component?.notes
      },
      interaction: {
        method: 'card-click',
        previouslyOpen: !!openDrawerId,
        openTime: Date.now(),
        sessionComponentViews: parseInt(sessionStorage.getItem(`adsm:views:${componentId}`) || '0') + 1
      },
      context: {
        sessionId: sessionStorage.getItem('adsm:session-id') || 'unknown',
        currentRoute: window.location.hash,
        timestamp: Date.now()
      }
    };
    
    safeLogEvent('info', 'components/open', interactionData);
    
    // Track component view count
    sessionStorage.setItem(`adsm:views:${componentId}`, String(interactionData.interaction.sessionComponentViews));
    
    setOpenDrawerId(componentId);
    
    // Navigate to component detail view with proper history management
    navigateTo('/components', { id: componentId, tab: 'preview' });
    
    // Store reference to the button for focus return
    if (buttonRef) {
      const ref = { current: buttonRef };
      setDrawerReturnRef(ref);
    }
  }, [byId, openDrawerId]);

  // Initialize drawer state from URL or props - keep deep-linking intact
  React.useEffect(() => {
    const queryId = parseQuery();
    const targetId = selectedId || queryId;
    setOpenDrawerId(targetId);
    
    // Track component open time for view duration analytics
    if (targetId) {
      sessionStorage.setItem(`adsm:open-time:${targetId}`, String(Date.now()));
    }
    
    // Debug logging for development
    if (process.env.NODE_ENV === 'development' && targetId) {
      console.log('ComponentsCatalog - Opening drawer for component:', targetId);
    }
  }, [selectedId, parseQuery]);

  // Close drawer if component becomes invalid (moved after selectedComponent definition)
  React.useEffect(() => {
    if (openDrawerId && selectedComponent === null) {
      console.warn('ComponentsCatalog: Closing drawer due to invalid component');
      setOpenDrawerId(null);
      // Clear the URL hash to avoid infinite loops
      window.location.hash = '#/components';
    }
  }, [openDrawerId, selectedComponent]);

  // Listen for browser navigation and drawer close events
  React.useEffect(() => {
    const handleHashChange = () => {
      const queryId = parseQuery();
      setOpenDrawerId(queryId);
    };
    
    const handleDrawerClose = () => {
      handleCloseDrawer();
    };
    
    // Handle browser back/forward navigation
    const handlePopState = () => {
      const queryId = parseQuery();
      setOpenDrawerId(queryId);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('adsm:drawer:close', handleDrawerClose);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('adsm:drawer:close', handleDrawerClose);
    };
  }, [parseQuery, handleCloseDrawer]);

  const handleEditComponent = React.useCallback(() => {
    // Placeholder for edit functionality
    console.log('Edit component:', openDrawerId);
    
    // Track edit action
    if (openDrawerId) {
      pingComponentOperation('edit-attempt', openDrawerId);
    }
    
    // Could implement edit modal or navigate to edit page later
  }, [openDrawerId]);

  // Safe filtering with search
  const filteredComponents = React.useMemo(() => {
    try {
      let results = catalog;
      
      // Apply search
      if (searchTerm.trim()) {
        results = search(searchTerm);
      }
      
      // Apply level filter
      if (selectedLevel !== 'all') {
        results = results.filter(c => c?.level === selectedLevel);
      }
      
      // Apply status filter
      if (selectedStatus !== 'all') {
        results = results.filter(c => c?.status === selectedStatus);
      }
      
      return results.filter(Boolean);
    } catch (error) {
      console.warn('Filter error:', error);
      return [];
    }
  }, [catalog, search, searchTerm, selectedLevel, selectedStatus]);

  // Enhanced import handler with validation
  const handleImport = React.useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      // Clear previous errors and preview
      setImportError(null);
      setImportPreview(null);
      
      try {
        const text = await file.text();
        
        // Validate the file content before showing preview
        const validation = validateJsonStructure(text);
        
        if (!validation.isValid) {
          const errorMessage = formatImportErrors(validation);
          setImportError(errorMessage);
          pingComponentOperation('import', undefined, new Error('Validation failed'));
          return;
        }
        
        // Show preview dialog for valid imports
        setImportPreview(validation);
        setShowImportDialog(true);
        
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to read file';
        setImportError(message);
        console.error('Import failed:', error);
        pingComponentOperation('import', undefined, error as Error);
      }
    };
    
    input.click();
  }, []);

  // Confirm import after preview
  const handleConfirmImport = React.useCallback(() => {
    if (!importPreview || !importPreview.isValid) return;
    
    try {
      // Get existing user components (excluding builtins)
      const existingUserComponents = catalog.filter(c => 
        c?.id && !c.id.includes('builtin-')
      );
      
      // Enhanced import logging with component tag analysis
      const importData = {
        event: 'components_imported',
        import: {
          componentCount: importPreview.components.length,
          existingCount: existingUserComponents.length,
          totalAfterImport: existingUserComponents.length + importPreview.components.length,
          timestamp: Date.now()
        },
        components: importPreview.components.map(comp => ({
          id: comp.id,
          name: comp.name,
          level: comp.level,
          status: comp.status,
          tagCount: comp.tags?.length || 0,
          tags: comp.tags || [],
          dependencyCount: comp.dependencies?.length || 0,
          hasDescription: !!comp.description,
          hasNotes: !!comp.notes
        })),
        tagAnalysis: {
          totalTags: importPreview.components.reduce((sum, comp) => sum + (comp.tags?.length || 0), 0),
          uniqueTags: [...new Set(importPreview.components.flatMap(comp => comp.tags || []))],
          tagsByCategory: importPreview.components.flatMap(comp => comp.tags || []).reduce((acc, tag) => {
            const category = ['action', 'interactive', 'clickable'].includes(tag) ? 'interaction' :
                           ['form', 'input', 'field'].includes(tag) ? 'form' :
                           ['layout', 'grid', 'flex'].includes(tag) ? 'layout' :
                           ['navigation', 'nav', 'menu'].includes(tag) ? 'navigation' : 'general';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        validation: {
          valid: importPreview.summary.valid,
          total: importPreview.summary.total,
          warnings: importPreview.warnings.length,
          errors: importPreview.errors.length
        },
        context: {
          sessionId: sessionStorage.getItem('adsm:session-id') || 'unknown',
          userAgent: navigator.userAgent,
          method: 'file-upload'
        }
      };
      
      safeLogEvent('info', 'components/import', importData);
      
      // Merge with imported components
      const allUserComponents = [...existingUserComponents, ...importPreview.components];
      saveUserComponents(allUserComponents);
      
      // Track successful import
      pingComponentOperation('import', undefined);
      
      // Clear preview state
      setImportPreview(null);
      setShowImportDialog(false);
      
      // Refresh the page to reload components
      window.location.reload();
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      setImportError(message);
      console.error('Import confirmation failed:', error);
      pingComponentOperation('import', undefined, error as Error);
      
      // Log import failure
      safeLogEvent('error', 'components/import-error', {
        event: 'components_import_failed',
        error: message,
        componentCount: importPreview?.components.length || 0,
        timestamp: Date.now()
      });
    }
  }, [importPreview, catalog]);

  // Enhanced export handler with options
  const handleExport = React.useCallback((includeBuiltins = false) => {
    try {
      const userComponents = catalog.filter(c => 
        c?.id && !c.id.includes('builtin-')
      );
      
      if (userComponents.length === 0) {
        alert('No user components to export');
        pingComponentOperation('export', undefined, new Error('No components to export'));
        
        safeLogEvent('warning', 'components/export-empty', {
          event: 'components_export_empty',
          totalComponents: catalog.length,
          builtinComponents: catalog.length - userComponents.length,
          timestamp: Date.now()
        });
        return;
      }
      
      // Enhanced export logging with tag analysis
      const exportData = generateExportData(userComponents, {
        includeBuiltins,
        formatOutput: true,
        includeMetadata: true,
        filename: `adsm-components-${Date.now()}.json`
      });
      
      const exportLogData = {
        event: 'components_exported',
        export: {
          componentCount: userComponents.length,
          includeBuiltins,
          filename: `adsm-components-${Date.now()}.json`,
          timestamp: Date.now()
        },
        components: userComponents.map(comp => ({
          id: comp.id,
          name: comp.name,
          level: comp.level,
          status: comp.status,
          tagCount: comp.tags?.length || 0,
          tags: comp.tags || [],
          dependencyCount: comp.dependencies?.length || 0
        })),
        analytics: {
          totalTags: userComponents.reduce((sum, comp) => sum + (comp.tags?.length || 0), 0),
          uniqueTags: [...new Set(userComponents.flatMap(comp => comp.tags || []))],
          levelDistribution: userComponents.reduce((acc, comp) => {
            acc[comp.level] = (acc[comp.level] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          statusDistribution: userComponents.reduce((acc, comp) => {
            acc[comp.status] = (acc[comp.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        context: {
          sessionId: sessionStorage.getItem('adsm:session-id') || 'unknown',
          userAgent: navigator.userAgent,
          method: 'json-download'
        }
      };
      
      safeLogEvent('info', 'components/export', exportLogData);
      
      downloadJson(exportData, `adsm-components-${Date.now()}.json`);
      
      // Track successful export
      pingComponentOperation('export', undefined);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
      pingComponentOperation('export', undefined, error as Error);
      
      // Log export failure
      safeLogEvent('error', 'components/export-error', {
        event: 'components_export_failed',
        error: error instanceof Error ? error.message : String(error),
        componentCount: catalog.filter(c => c?.id && !c.id.includes('builtin-')).length,
        timestamp: Date.now()
      });
    }
  }, [catalog]);

  // Create component handler
  const handleCreateComponent = React.useCallback((newComponent: DsComponent) => {
    try {
      const userComponents = catalog.filter(c => 
        c?.id && !c.id.includes('builtin-')
      );
      
      // Enhanced component creation logging with persistence tracking
      const creationPersistData = {
        event: 'component_persisted',
        component: {
          id: newComponent.id,
          name: newComponent.name,
          level: newComponent.level,
          status: newComponent.status,
          version: newComponent.version,
          tagCount: newComponent.tags?.length || 0,
          tags: newComponent.tags || [],
          dependencyCount: newComponent.dependencies?.length || 0,
          dependencies: newComponent.dependencies || [],
          hasDescription: !!newComponent.description,
          hasNotes: !!newComponent.notes
        },
        persistence: {
          existingComponents: userComponents.length,
          totalAfterCreation: userComponents.length + 1,
          storageMethod: 'localStorage',
          storageKey: 'adsm:user-components'
        },
        context: {
          sessionId: sessionStorage.getItem('adsm:session-id') || 'unknown',
          timestamp: Date.now(),
          method: 'component-wizard'
        }
      };
      
      safeLogEvent('info', 'components/persist', creationPersistData);
      
      const updatedUserComponents = [...userComponents, newComponent];
      saveUserComponents(updatedUserComponents);
      
      setShowWizard(false);
      
      // Track successful creation
      pingComponentOperation('create', newComponent.id);
      
      // Log successful save
      safeLogEvent('info', 'components/save-complete', {
        event: 'component_saved_successfully',
        componentId: newComponent.id,
        totalComponents: updatedUserComponents.length,
        timestamp: Date.now()
      });
      
      // Refresh to show new component
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Failed to create component:', error);
      alert('Failed to create component. Please try again.');
      pingComponentOperation('create', newComponent?.id, error as Error);
      
      // Log creation failure
      safeLogEvent('error', 'components/persist-error', {
        event: 'component_persistence_failed',
        componentId: newComponent?.id,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });
    }
  }, [catalog]);

  // Listen for command palette events
  React.useEffect(() => {
    const handleNewComponent = () => setShowWizard(true);

    document.addEventListener('adsm:components:new', handleNewComponent);
    document.addEventListener('adsm:components:import', handleImport);
    document.addEventListener('adsm:components:export', () => handleExport(false));
    
    return () => {
      document.removeEventListener('adsm:components:new', handleNewComponent);
      document.removeEventListener('adsm:components:import', handleImport);
      document.removeEventListener('adsm:components:export', () => handleExport(false));
    };
  }, [handleImport, handleExport]);

  const levelIcons: Record<string, string> = {
    atom: '⚛️',
    molecule: '🧬',
    organism: '🦠'
  };

  return (
    <div style={{
      display: 'grid',
      gap: '16px',
      background: 'var(--color-bg)',
      minHeight: '100%'
    }}>
      {/* Stats Header */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        padding: '16px',
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        flexWrap: 'wrap'
      }}>
        <div 
          className="pill" 
          style={{
            padding: '8px 16px',
            background: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--color-text)',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          All <strong>{counts.total}</strong>
        </div>
        
        {(['atom', 'molecule', 'organism'] as const).map(level => {
          const count = counts[level] || 0;
          const isActive = selectedLevel === level;
          
          return (
            <div 
              key={level}
              className="pill" 
              style={{
                padding: '8px 16px',
                background: isActive ? 'var(--color-accent)' : 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }} 
              onClick={() => setSelectedLevel(isActive ? 'all' : level)}
              onMouseOver={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'color-mix(in oklab, var(--color-accent) 8%, transparent)';
                }
              }}
              onMouseOut={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--color-bg)';
                }
              }}
            >
              {levelIcons[level]} {level.charAt(0).toUpperCase() + level.slice(1)}s <strong>{count}</strong>
            </div>
          );
        })}
      </div>

      {/* Filters and Actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        padding: '16px',
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: '10px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search components..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="adsm-input"
          style={{
            flex: '1 1 200px',
            fontSize: '14px'
          }}
        />
        
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="adsm-select"
          style={{
            fontSize: '14px'
          }}
        >
          <option value="all">All Levels</option>
          <option value="atom">Atoms</option>
          <option value="molecule">Molecules</option>
          <option value="organism">Organisms</option>
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="adsm-select"
          style={{
            fontSize: '14px'
          }}
        >
          <option value="all">All Status</option>
          <option value="ready">Ready</option>
          <option value="draft">Draft</option>
        </select>
        
        <button
          onClick={() => setShowWizard(true)}
          className="adsm-button-primary"
          style={{
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          + New Component
        </button>

        <button
          onClick={handleImport}
          className="adsm-button-secondary"
          style={{
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          📥 Import JSON
        </button>

        <button
          onClick={() => handleExport(false)}
          className="adsm-button-secondary"
          style={{
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          📤 Export JSON
        </button>
      </div>

      {/* Import error display */}
      {importError && (
        <div className="adsm-error" style={{ whiteSpace: 'pre-wrap' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Import Error:</div>
          <div style={{ fontSize: '14px' }}>{importError}</div>
          <button 
            onClick={() => setImportError(null)}
            className="adsm-button-secondary"
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              fontSize: '12px'
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Import preview dialog */}
      {showImportDialog && importPreview && (
        <div 
          className="adsm-modal-overlay" 
          onClick={() => setShowImportDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-preview-title"
        >
          <div 
            className="adsm-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '90vw',
              maxHeight: '80vh'
            }}
          >
            <div className="adsm-modal-header">
              <h3 id="import-preview-title" className="adsm-modal-title">
                Import Preview
              </h3>
              <p className="adsm-modal-description">
                Review components before importing
              </p>
            </div>
            
            <div className="adsm-modal-body">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--modal-body-text)' }}>
                  <strong>{importPreview.summary.valid}</strong> of <strong>{importPreview.summary.total}</strong> components will be imported
                </div>
                
                {importPreview.warnings.length > 0 && (
                  <div className="adsm-modal-warning">
                    <div className="adsm-modal-warning-title">Warnings:</div>
                    <ul style={{ margin: '8px 0 0 20px', lineHeight: 1.5 }}>
                      {importPreview.warnings.map((warning, i) => (
                        <li key={i} style={{marginBottom: '4px'}}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              
                {importPreview.errors.length > 0 && (
                  <div className="adsm-modal-error">
                    <div className="adsm-modal-error-title">Errors:</div>
                    <ul style={{ margin: '8px 0 0 20px', lineHeight: 1.5 }}>
                      {importPreview.errors.map((error, i) => (
                        <li key={i} style={{marginBottom: '4px'}}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {importPreview.components.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '8px',
                      color: 'var(--modal-body-text)'
                    }}>
                      Components to import:
                    </div>
                    <div style={{ 
                      maxHeight: '200px', 
                      overflow: 'auto',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--input-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px'
                    }}>
                      {importPreview.components.map((comp, i) => (
                        <div key={i} style={{ 
                          fontSize: '13px', 
                          marginBottom: '4px',
                          color: 'var(--modal-body-text)'
                        }}>
                          <strong>{comp.name}</strong> ({comp.id}) - {comp.level}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="adsm-modal-footer">
              <button 
                onClick={() => setShowImportDialog(false)} 
                className="adsm-modal-button-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmImport} 
                className="adsm-modal-button-primary"
                disabled={!importPreview.isValid}
              >
                Import {importPreview.summary.valid} Components
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Components Grid */}
      <ComponentsGrid 
        components={filteredComponents}
        onItemClick={handleItemClick}
      />

      {/* Component Drawer - Enhanced validation before rendering */}
      {selectedComponent && selectedComponent.id && selectedComponent.name && (
        <ComponentDrawer 
          item={selectedComponent}
          onClose={handleCloseDrawer}
          onEdit={handleEditComponent}
        />
      )}

      {/* New Component Wizard */}
      {showWizard && (
        <NewComponentWizard 
          onClose={() => setShowWizard(false)}
          onCreate={handleCreateComponent}
        />
      )}
    </div>
  );
}