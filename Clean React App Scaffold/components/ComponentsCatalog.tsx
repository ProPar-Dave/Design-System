import React from 'react';
import { ComponentsGrid } from './ComponentsGrid';
import { ComponentDrawer } from './ComponentDrawer';
import { NewComponentWizard } from './NewComponentWizard';
import { useCatalogState } from '../store/catalogStore';
import { saveUserComponents, safeImportComponents, upsertComponent, type DsComponent } from '../utils/catalog';
import { parseHash, updateHash } from '../utils/router';
import { pingComponentOperation } from '../utils/ping';
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

  // Initialize drawer state from URL or props - keep deep-linking intact
  React.useEffect(() => {
    const queryId = parseQuery();
    const targetId = selectedId || queryId;
    setOpenDrawerId(targetId);
  }, [selectedId, parseQuery]);

  // Listen for browser navigation - keep deep-linking intact
  React.useEffect(() => {
    const handleHashChange = () => {
      const queryId = parseQuery();
      setOpenDrawerId(queryId);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [parseQuery]);

  // Find selected component safely
  const selectedComponent = React.useMemo(() => {
    return openDrawerId ? byId(openDrawerId) : null;
  }, [openDrawerId, byId]);

  // Handle component selection - wire to the new drawer
  const handleItemClick = React.useCallback((componentId: string, buttonRef?: HTMLElement) => {
    setOpenDrawerId(componentId);
    updateQuery(componentId, 'preview'); // Default to preview tab
    
    // Store reference to the button for focus return
    if (buttonRef) {
      const ref = { current: buttonRef };
      setDrawerReturnRef(ref);
    }
  }, [updateQuery]);

  const handleCloseDrawer = React.useCallback(() => {
    setOpenDrawerId(null);
    updateQuery(null);
    setDrawerReturnRef(undefined);
  }, [updateQuery]);

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

  // Import handler
  const handleImport = React.useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      setImportError(null);
      
      try {
        const text = await file.text();
        const importedComponents = safeImportComponents(text);
        
        if (importedComponents.length === 0) {
          throw new Error('No valid components found in file');
        }
        
        // Save imported components
        const existingUserComponents = catalog.filter(c => 
          c?.id && !c.id.includes('builtin-')
        );
        
        const allUserComponents = [...existingUserComponents, ...importedComponents];
        saveUserComponents(allUserComponents);
        
        // Track successful import
        pingComponentOperation('import', undefined);
        
        // Refresh the page to reload components
        window.location.reload();
        
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Import failed';
        setImportError(message);
        console.error('Import failed:', error);
        
        // Track import error
        pingComponentOperation('import', undefined, error as Error);
      }
    };
    
    input.click();
  }, [catalog]);

  // Export handler
  const handleExport = React.useCallback(() => {
    try {
      const userComponents = catalog.filter(c => 
        c?.id && !c.id.includes('builtin-')
      );
      
      if (userComponents.length === 0) {
        alert('No user components to export');
        pingComponentOperation('export', undefined, new Error('No components to export'));
        return;
      }
      
      const blob = new Blob([JSON.stringify(userComponents, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `adsm-components-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      
      // Track successful export
      pingComponentOperation('export', undefined);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
      
      // Track export error
      pingComponentOperation('export', undefined, error as Error);
    }
  }, [catalog]);

  // Create component handler
  const handleCreateComponent = React.useCallback((newComponent: DsComponent) => {
    try {
      const userComponents = catalog.filter(c => 
        c?.id && !c.id.includes('builtin-')
      );
      
      const updatedUserComponents = [...userComponents, newComponent];
      saveUserComponents(updatedUserComponents);
      
      setShowWizard(false);
      
      // Track successful creation
      pingComponentOperation('create', newComponent.id);
      
      // Refresh to show new component
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Failed to create component:', error);
      alert('Failed to create component. Please try again.');
      
      // Track creation error
      pingComponentOperation('create', newComponent?.id, error as Error);
    }
  }, [catalog]);

  // Listen for command palette events
  React.useEffect(() => {
    const handleNewComponent = () => setShowWizard(true);

    document.addEventListener('adsm:components:new', handleNewComponent);
    document.addEventListener('adsm:components:import', handleImport);
    document.addEventListener('adsm:components:export', handleExport);
    
    return () => {
      document.removeEventListener('adsm:components:new', handleNewComponent);
      document.removeEventListener('adsm:components:import', handleImport);
      document.removeEventListener('adsm:components:export', handleExport);
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
          style={{
            flex: '1 1 200px',
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontSize: '14px'
          }}
        />
        
        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
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
          style={{
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontSize: '14px'
          }}
        >
          <option value="all">All Status</option>
          <option value="ready">Ready</option>
          <option value="draft">Draft</option>
        </select>
        
        <button
          onClick={() => setShowWizard(true)}
          style={{
            background: 'var(--button-bg, var(--color-accent))',
            color: 'var(--button-fg, var(--color-text))',
            border: '1px solid var(--button-border, var(--color-border))',
            borderRadius: '8px',
            padding: '8px 16px',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          + New Component
        </button>
      </div>

      {/* Import error display */}
      {importError && (
        <div style={{
          padding: '12px',
          background: '#3f1b1b',
          color: '#F6A1A1',
          border: '1px solid #8B0000',
          borderRadius: '8px'
        }}>
          Import Error: {importError}
          <button 
            onClick={() => setImportError(null)}
            style={{
              marginLeft: '8px',
              background: 'transparent',
              border: 'none',
              color: '#F6A1A1',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Components grid - no layout shift when drawer opens */}
      <div style={{ position: 'relative' }}>
        <ComponentsGrid 
          items={filteredComponents} 
          onItemClick={handleItemClick}
        />

        {filteredComponents.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '32px',
            color: 'var(--color-muted)'
          }}>
            {searchTerm ? (
              <div>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                <div>No components found matching "{searchTerm}"</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
                <div>No components found</div>
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>
                  Click "New Component" to get started
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mount the drawer as a portal with enhanced UX */}
      {selectedComponent && (
        <ComponentDrawer
          item={selectedComponent}
          onClose={handleCloseDrawer}
          onEdit={handleEditComponent}
          returnRef={drawerReturnRef}
        />
      )}

      {/* New component wizard */}
      {showWizard && (
        <NewComponentWizard
          onClose={() => setShowWizard(false)}
          onCreate={handleCreateComponent}
        />
      )}
    </div>
  );
}