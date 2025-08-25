import React from 'react';
import { ComponentsGrid } from './ComponentsGrid';
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
import { openDrawer } from '../src/drawer/controller';
import type { DrawerItem } from '../src/drawer/controller';
import '../styles/components.css';

interface ComponentsCatalogProps {
  selectedId?: string | null;
}

export default function ComponentsCatalog({ selectedId }: ComponentsCatalogProps) {
  const { catalog, counts, byId, search, isLoading, loadResult } = useCatalogState();
  
  // State management
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedLevel, setSelectedLevel] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [showWizard, setShowWizard] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [importPreview, setImportPreview] = React.useState<ImportValidationResult | null>(null);
  const [showImportDialog, setShowImportDialog] = React.useState(false);

  // Validate and normalize catalog components
  const validatedCatalog = React.useMemo(() => {
    return catalog.map((item, index) => {
      if (!item) return null;
      
      // Ensure every catalog item has required shape with fallbacks
      const validatedItem: DsComponent = {
        id: item.id || `auto-${index}`,
        name: item.name || `Untitled Component ${index + 1}`,
        level: item.level || 'atom',
        status: item.status || 'draft',
        version: item.version || '1.0.0',
        description: item.description || '',
        notes: item.notes || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        dependencies: Array.isArray(item.dependencies) ? item.dependencies : [],
        propsSpec: Array.isArray(item.propsSpec) ? item.propsSpec : [],
        code: item.code || '',
        // Preserve other properties from original item
        ...item
      };
      
      return validatedItem;
    }).filter(Boolean) as DsComponent[];
  }, [catalog]);

  // Handle component selection using the new drawer controller
  const handleItemClick = React.useCallback((componentId: string, buttonRef?: HTMLElement) => {
    console.log('ComponentsCatalog: Opening drawer for component:', componentId);
    
    // Find the full component to validate it exists
    const component = validatedCatalog.find(c => c.id === componentId);
    if (!component) {
      console.error('ComponentsCatalog: Component not found in catalog:', componentId);
      return;
    }
    
    console.log('ComponentsCatalog: Opening drawer with component:', {
      id: component.id,
      name: component.name,
      level: component.level,
      status: component.status
    });
    
    // Convert DsComponent to DrawerItem and open drawer
    const drawerItem: DrawerItem = {
      id: component.id,
      name: component.name,
      level: component.level as 'atom'|'molecule'|'organism',
      status: component.status,
      version: component.version,
      description: component.description,
      // Pass through all other properties
      ...component
    };
    
    // Open drawer only - no app reboot
    openDrawer(drawerItem);
    // Optional: update hash for deep linking
    window.location.hash = `#/components?id=${componentId}&tab=preview`;
  }, [validatedCatalog]);

  // Safe filtering with search using validated catalog
  const filteredComponents = React.useMemo(() => {
    try {
      let results = validatedCatalog;
      
      // Apply search
      if (searchTerm.trim()) {
        results = results.filter(c => 
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Apply level filter
      if (selectedLevel !== 'all') {
        results = results.filter(c => c.level === selectedLevel);
      }
      
      // Apply status filter
      if (selectedStatus !== 'all') {
        results = results.filter(c => c.status === selectedStatus);
      }
      
      return results;
    } catch (error) {
      console.warn('Filter error:', error);
      return [];
    }
  }, [validatedCatalog, searchTerm, selectedLevel, selectedStatus]);

  // Enhanced import handler with validation
  const handleImport = React.useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setImportError(null);
      setImportPreview(null);
      
      try {
        const text = await file.text();
        const validation = validateJsonStructure(text);
        
        if (!validation.isValid) {
          const errorMessage = formatImportErrors(validation);
          setImportError(errorMessage);
          return;
        }
        
        setImportPreview(validation);
        setShowImportDialog(true);
        
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to read file';
        setImportError(message);
        console.error('Import failed:', error);
      }
    };
    
    input.click();
  }, []);

  // Handle confirmed import
  const handleConfirmImport = React.useCallback(async () => {
    if (!importPreview || !importPreview.isValid) return;
    
    try {
      const userComponents = validatedCatalog.filter(c => 
        c?.id && !c.id.includes('builtin-')
      );
      
      // Merge imported components with existing ones
      const existingIds = new Set(userComponents.map(c => c.id));
      const newComponents = importPreview.components.filter(c => !existingIds.has(c.id));
      
      const updatedUserComponents = [...userComponents, ...newComponents];
      saveUserComponents(updatedUserComponents);
      
      setShowImportDialog(false);
      setImportPreview(null);
      
      // Refresh to show imported components
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Import confirmation failed:', error);
      setImportError('Failed to import components. Please try again.');
    }
  }, [importPreview, validatedCatalog]);

  // Enhanced export handler with options
  const handleExport = React.useCallback((includeBuiltins = false) => {
    try {
      const userComponents = validatedCatalog.filter(c => 
        c?.id && !c.id.includes('builtin-')
      );
      
      if (userComponents.length === 0) {
        alert('No user components to export');
        return;
      }
      
      const exportData = generateExportData(userComponents, {
        includeBuiltins,
        formatOutput: true,
        includeMetadata: true,
        filename: `adsm-components-${Date.now()}.json`
      });
      
      downloadJson(exportData, `adsm-components-${Date.now()}.json`);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }, [validatedCatalog]);

  // Create component handler
  const handleCreateComponent = React.useCallback((newComponent: DsComponent) => {
    try {
      const userComponents = validatedCatalog.filter(c => 
        c?.id && !c.id.includes('builtin-')
      );
      
      const updatedUserComponents = [...userComponents, newComponent];
      saveUserComponents(updatedUserComponents);
      
      setShowWizard(false);
      
      // Refresh to show new component
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Failed to create component:', error);
      alert('Failed to create component. Please try again.');
    }
  }, [validatedCatalog]);

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

  // Recalculate counts based on validated catalog
  const validatedCounts = React.useMemo(() => {
    return {
      total: validatedCatalog.length,
      atom: validatedCatalog.filter(c => c.level === 'atom').length,
      molecule: validatedCatalog.filter(c => c.level === 'molecule').length,
      organism: validatedCatalog.filter(c => c.level === 'organism').length
    };
  }, [validatedCatalog]);

  const levelIcons: Record<string, string> = {
    atom: 'A',
    molecule: 'M',
    organism: 'O'
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
          aria-label={`All components: ${validatedCounts.total} total`}
        >
          All <strong>{validatedCounts.total}</strong>
        </div>
        
        {(['atom', 'molecule', 'organism'] as const).map(level => {
          const count = validatedCounts[level] || 0;
          const isActive = selectedLevel === level;
          
          return (
            <button 
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
              aria-label={`Filter by ${level}s: ${count} components${isActive ? ' (currently active)' : ''}`}
              aria-pressed={isActive}
            >
              {levelIcons[level]} {level.charAt(0).toUpperCase() + level.slice(1)}s <strong>{count}</strong>
            </button>
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
          aria-label="Search components by name or description"
          style={{
            flex: '1 1 200px',
            fontSize: '14px'
          }}
        />
        
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="adsm-select"
          aria-label="Filter components by architectural level"
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
          aria-label="Filter components by development status"
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
          aria-label="Create a new component"
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
          aria-label="Import components from JSON file"
          style={{
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Import JSON
        </button>

        <button
          onClick={() => handleExport(false)}
          className="adsm-button-secondary"
          aria-label="Export user-created components as JSON file"
          style={{
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          Export JSON
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          background: 'var(--color-panel)',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          gap: '12px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid var(--color-border)',
            borderTop: '2px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: 'var(--color-muted-foreground)' }}>
            Loading components...
          </span>
        </div>
      )}

      {/* Load Error Display */}
      {!isLoading && loadResult?.error && (
        <div className="adsm-error">
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>
            ⚠️ Catalog Loading Error
          </div>
          <div style={{ fontSize: '14px', marginBottom: '12px' }}>
            {loadResult.error}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--color-muted-foreground)' }}>
            Loaded from: <strong>{loadResult.loadedFrom}</strong> • 
            Components available: <strong>{loadResult.count}</strong>
            {loadResult.url && (
              <span> • Attempted URL: <code style={{ fontSize: '12px' }}>{loadResult.url}</code></span>
            )}
          </div>
        </div>
      )}

      {/* No Components Found */}
      {!isLoading && !loadResult?.error && validatedCatalog.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 16px',
          background: 'var(--color-panel)',
          border: '1px solid var(--color-border)',
          borderRadius: '10px',
          textAlign: 'center',
          gap: '16px'
        }}>
          <div style={{ fontSize: '48px' }}>📦</div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
              No Components Found
            </h3>
            <p style={{ 
              margin: '0 0 16px 0', 
              color: 'var(--color-muted-foreground)',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              The component catalog appears to be empty. This could be due to:
            </p>
            <ul style={{ 
              textAlign: 'left', 
              color: 'var(--color-muted-foreground)', 
              fontSize: '13px',
              lineHeight: '1.4',
              margin: '0 0 20px 0',
              paddingLeft: '20px'
            }}>
              <li>Fresh deployment with cleared storage</li>
              <li>Network issues loading the starter catalog</li>
              <li>Missing catalog.json file</li>
            </ul>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                className="adsm-button-primary"
                aria-label="Reload the page to retry loading components"
                style={{ fontSize: '14px' }}
              >
                🔄 Reload Page
              </button>
              <button
                onClick={() => setShowWizard(true)}
                className="adsm-button-secondary"
                aria-label="Create your first component"
                style={{ fontSize: '14px' }}
              >
                + Create Component
              </button>
            </div>
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--color-muted-foreground)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: '16px',
            marginTop: '8px',
            width: '100%'
          }}>
            <strong>Debug Info:</strong> Loaded from {loadResult?.loadedFrom || 'unknown'} • 
            Count: {loadResult?.count || 0}
            {loadResult?.url && (
              <span> • URL: <code style={{ fontSize: '11px' }}>{loadResult.url}</code></span>
            )}
          </div>
        </div>
      )}

      {/* Components Grid - only show when not loading and have components */}
      {!isLoading && validatedCatalog.length > 0 && (
        <ComponentsGrid
          items={filteredComponents}
          onItemClick={handleItemClick}
        />
      )}

      {/* Import error display */}
      {importError && (
        <div className="adsm-error" style={{ whiteSpace: 'pre-wrap' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Import Error:</div>
          <div style={{ fontSize: '14px' }}>{importError}</div>
          <button 
            onClick={() => setImportError(null)}
            className="adsm-button-secondary"
            aria-label="Dismiss import error message"
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
                <div style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--color-text)' }}>
                  <strong>{importPreview.summary.valid}</strong> of <strong>{importPreview.summary.total}</strong> components will be imported
                </div>
                
                {importPreview.warnings.length > 0 && (
                  <div className="adsm-warning">
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>Warnings:</div>
                    <ul style={{ margin: '8px 0 0 20px', lineHeight: 1.5 }}>
                      {importPreview.warnings.map((warning, i) => (
                        <li key={i} style={{marginBottom: '4px'}}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              
                {importPreview.errors.length > 0 && (
                  <div className="adsm-error">
                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>Errors:</div>
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
                      color: 'var(--color-text)'
                    }}>
                      Components to import:
                    </div>
                    <div style={{ 
                      maxHeight: '200px', 
                      overflow: 'auto',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px'
                    }}>
                      {importPreview.components.map((comp, i) => (
                        <div key={i} style={{ 
                          fontSize: '13px', 
                          marginBottom: '4px',
                          color: 'var(--color-text)'
                        }}>
                          <strong>{comp.name}</strong> ({comp.id}) - {comp.level}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              padding: '16px',
              borderTop: '1px solid var(--color-border)'
            }}>
              <button 
                onClick={() => setShowImportDialog(false)} 
                className="adsm-button-secondary"
                aria-label="Cancel component import"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmImport} 
                className="adsm-button-primary"
                disabled={!importPreview.isValid}
                aria-label={`Import ${importPreview.summary.valid} valid components`}
              >
                Import {importPreview.summary.valid} Components
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Component Wizard */}
      {showWizard && (
        <NewComponentWizard 
          onSave={handleCreateComponent}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}