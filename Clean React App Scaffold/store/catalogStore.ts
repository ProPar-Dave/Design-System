import { useMemo } from 'react';
import { DsComponent, normalizeCatalog, getAllComponents, loadUserComponents } from '../utils/catalog';

export interface CatalogCounts {
  total: number;
  atoms: number;
  molecules: number;
  organisms: number;
  byStatus: {
    draft: number;
    ready: number;
  };
  withNotes: number;
  withTags: number;
  withDependencies: number;
}

export function useCatalogState() {
  // Load all components with safe normalization
  const catalog: DsComponent[] = useMemo(() => {
    try {
      return getAllComponents();
    } catch (error) {
      console.warn('Failed to load catalog:', error);
      return [];
    }
  }, []);

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
        console.warn('Failed to find component by ID:', id, error);
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
        console.warn('Failed to filter components:', error);
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
        console.warn('Failed to search components:', error);
        return [];
      }
    };
  }, [catalog]);

  return { 
    catalog, 
    counts, 
    byId, 
    filter, 
    search 
  };
}

// Hook for managing user components specifically
export function useUserComponents() {
  const userComponents = useMemo(() => {
    try {
      return loadUserComponents();
    } catch (error) {
      console.warn('Failed to load user components:', error);
      return [];
    }
  }, []);

  return userComponents;
}

// Helper hook for component statistics
export function useComponentStats() {
  const { counts } = useCatalogState();
  
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
    isEmpty: counts.total === 0
  };
}