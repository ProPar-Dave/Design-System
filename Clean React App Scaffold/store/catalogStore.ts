import { useMemo, useState, useEffect } from 'react';
import { DsComponent, normalizeCatalog, loadUserComponents } from '../utils/catalog';
import { loadCatalog, CatalogLoadResult } from '../src/catalog/loader';

export interface CatalogCounts {
  total: number;
  atoms: number;
  molecules: number;
  organisms: number;
  atom: number;    // Alias for atoms
  molecule: number; // Alias for molecules  
  organism: number; // Alias for organisms
  byStatus: {
    draft: number;
    ready: number;
  };
  withNotes: number;
  withTags: number;
  withDependencies: number;
}

export function useCatalogState() {
  const [catalogResult, setCatalogResult] = useState<CatalogLoadResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load catalog on mount
  useEffect(() => {
    let mounted = true;
    
    const loadCatalogData = async () => {
      try {
        setIsLoading(true);
        const result = await loadCatalog();
        
        if (mounted) {
          setCatalogResult(result);
          console.log(`CatalogStore: Loaded ${result.count} components from ${result.loadedFrom}`);
        }
      } catch (error) {
        console.error('CatalogStore: Failed to load catalog:', error);
        if (mounted) {
          setCatalogResult({
            components: [],
            loadedFrom: 'starter',
            count: 0,
            error: error instanceof Error ? error.message : 'Failed to load catalog'
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadCatalogData();

    // Listen for catalog reload events
    const handleCatalogReload = () => {
      loadCatalogData();
    };

    document.addEventListener('adsm:catalog:reloaded', handleCatalogReload);
    document.addEventListener('adsm:catalog:saved', handleCatalogReload);

    return () => {
      mounted = false;
      document.removeEventListener('adsm:catalog:reloaded', handleCatalogReload);
      document.removeEventListener('adsm:catalog:saved', handleCatalogReload);
    };
  }, []);

  // Get catalog components with fallback
  const catalog: DsComponent[] = useMemo(() => {
    if (!catalogResult) return [];
    
    try {
      // Merge loaded components with user components
      const loadedComponents = catalogResult.components || [];
      const userComponents = loadUserComponents();
      
      // Combine and normalize
      const allComponents = [...loadedComponents, ...userComponents];
      return normalizeCatalog(allComponents);
    } catch (error) {
      console.warn('CatalogStore: Failed to merge catalog:', error);
      return catalogResult.components || [];
    }
  }, [catalogResult]);

  // Compute counts with defensive patterns
  const counts: CatalogCounts = useMemo(() => {
    const safeCatalog = Array.isArray(catalog) ? catalog.filter(Boolean) : [];
    
    const base = { 
      atoms: 0, 
      molecules: 0, 
      organisms: 0,
      draft: 0,
      ready: 0
    };
    
    let withNotes = 0;
    let withTags = 0;
    let withDependencies = 0;
    
    for (const c of safeCatalog) {
      if (!c || typeof c !== 'object') continue;
      
      // Count by level
      if (c.level === 'atom') base.atoms++;
      else if (c.level === 'molecule') base.molecules++;
      else if (c.level === 'organism') base.organisms++;
      
      // Count by status
      if (c.status === 'draft') base.draft++;
      else if (c.status === 'ready') base.ready++;
      
      // Count components with content
      if (c.notes && c.notes.trim().length > 0) withNotes++;
      if (Array.isArray(c.tags) && c.tags.length > 0) withTags++;
      if (Array.isArray(c.dependencies) && c.dependencies.length > 0) withDependencies++;
    }
    
    return {
      total: safeCatalog.length,
      atoms: base.atoms,
      molecules: base.molecules,
      organisms: base.organisms,
      atom: base.atoms,      // Alias
      molecule: base.molecules, // Alias
      organism: base.organisms, // Alias
      byStatus: {
        draft: base.draft,
        ready: base.ready
      },
      withNotes,
      withTags,
      withDependencies
    };
  }, [catalog]);

  // Safe component lookup by ID
  const byId = useMemo(() => {
    return (id?: string | null): DsComponent | null => {
      if (!id || typeof id !== 'string') return null;
      
      try {
        const found = catalog.find(c => c?.id === id);
        return found || null;
      } catch (error) {
        console.warn('CatalogStore: Failed to find component by ID:', id, error);
        return null;
      }
    };
  }, [catalog]);

  // Filter components safely
  const filter = useMemo(() => {
    return (predicate: (component: DsComponent) => boolean): DsComponent[] => {
      try {
        return catalog.filter(c => c && predicate(c));
      } catch (error) {
        console.warn('CatalogStore: Failed to filter components:', error);
        return [];
      }
    };
  }, [catalog]);

  // Search components safely
  const search = useMemo(() => {
    return (query: string): DsComponent[] => {
      if (!query.trim()) return catalog;
      
      try {
        const lowerQuery = query.toLowerCase();
        return catalog.filter(c => {
          if (!c) return false;
          
          const name = (c.name || '').toLowerCase();
          const description = (c.description || '').toLowerCase();
          const notes = (c.notes || '').toLowerCase();
          const tags = Array.isArray(c.tags) ? c.tags.map(t => String(t).toLowerCase()) : [];
          
          return name.includes(lowerQuery) ||
                 description.includes(lowerQuery) ||
                 notes.includes(lowerQuery) ||
                 tags.some(tag => tag.includes(lowerQuery));
        });
      } catch (error) {
        console.warn('CatalogStore: Failed to search components:', error);
        return [];
      }
    };
  }, [catalog]);

  return { 
    catalog, 
    counts, 
    byId, 
    filter, 
    search,
    isLoading,
    loadResult: catalogResult
  };
}

// Hook for managing user components specifically
export function useUserComponents() {
  const userComponents = useMemo(() => {
    try {
      return loadUserComponents();
    } catch (error) {
      console.warn('CatalogStore: Failed to load user components:', error);
      return [];
    }
  }, []);

  return userComponents;
}

// Helper hook for component statistics
export function useComponentStats() {
  const { counts, isLoading } = useCatalogState();
  
  const percentages = useMemo(() => {
    const { total, atoms, molecules, organisms } = counts;
    
    if (total === 0) {
      return { atoms: 0, molecules: 0, organisms: 0 };
    }
    
    return {
      atoms: Math.round((atoms / total) * 100),
      molecules: Math.round((molecules / total) * 100),
      organisms: Math.round((organisms / total) * 100)
    };
  }, [counts]);

  return {
    counts,
    percentages,
    isEmpty: counts.total === 0,
    isLoading
  };
}

// Hook for catalog diagnostics
export function useCatalogDiagnostics() {
  const { loadResult } = useCatalogState();
  
  return useMemo(() => {
    if (!loadResult) {
      return {
        loadedFrom: 'unknown' as const,
        count: 0,
        hasError: false,
        url: undefined
      };
    }
    
    return {
      loadedFrom: loadResult.loadedFrom,
      count: loadResult.count,
      hasError: !!loadResult.error,
      error: loadResult.error,
      url: loadResult.url
    };
  }, [loadResult]);
}