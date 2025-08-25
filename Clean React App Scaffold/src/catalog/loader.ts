/**
 * Catalog Loader - Robust component catalog loading with fallback chain
 * Ensures components are always available even in fresh environments
 */

import type { DsComponent } from '../../utils/catalog';
import { normalizeCatalog } from '../../utils/catalog';
import { devLog, devWarn, devError } from '../utils/log';

export const CATALOG_LS_KEY = 'adsm:catalog:current';

export interface CatalogLoadResult {
  components: DsComponent[];
  loadedFrom: 'localStorage' | 'fetch' | 'starter' | 'global';
  count: number;
  url?: string;
  error?: string;
}

/**
 * Load catalog with comprehensive fallback chain
 * 1. Try localStorage
 * 2. Try fetch from catalog.json 
 * 3. Fallback to embedded starter catalog
 */
export async function loadCatalog(): Promise<CatalogLoadResult> {
  devLog('CatalogLoader: Starting catalog load sequence...');

  // 1. Try localStorage first
  try {
    const raw = localStorage.getItem(CATALOG_LS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) {
        const normalized = normalizeCatalog(data);
        if (normalized.length > 0) {
          devLog(`CatalogLoader: Loaded ${normalized.length} components from localStorage`);
          return {
            components: normalized,
            loadedFrom: 'localStorage',
            count: normalized.length
          };
        }
      }
    }
  } catch (error) {
    devWarn('CatalogLoader: localStorage load failed:', error);
  }

  // 2. Try fetching from catalog.json with robust path resolution
  try {
    // Use multiple path strategies for different deployment scenarios
    // Priority order: document.baseURI (best for Sites) → origin → public paths
    const possibleUrls = [
      // Relative to document base (works reliably on Figma Sites and production environments)
      new URL('catalog.json', document.baseURI).toString(),
      // Relative to current origin (fallback for standard hosting)
      `${window.location.origin}/catalog.json`,
      // Explicit public path (common for static hosting)
      '/catalog.json',
      // Alternative relative path (for development servers)
      './catalog.json',
      // Public folder path (for some bundler setups)
      '/public/catalog.json'
    ];

    for (const url of possibleUrls) {
      try {
        devLog(`CatalogLoader: Attempting fetch from ${url}`);
        
        const res = await fetch(url, { 
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          
          // Handle different JSON structures
          let componentArray: any[] = [];
          if (Array.isArray(data)) {
            componentArray = data;
          } else if (data && typeof data === 'object') {
            // Try multiple possible keys
            componentArray = data.components || data.items || data.catalog || data.data || [];
          }
          
          if (Array.isArray(componentArray) && componentArray.length > 0) {
            const normalized = normalizeCatalog(componentArray);
            if (normalized.length > 0) {
              // Cache in localStorage for future loads
              localStorage.setItem(CATALOG_LS_KEY, JSON.stringify(normalized));
              
              devLog(`CatalogLoader: Successfully loaded ${normalized.length} components from ${url}`);
              return {
                components: normalized,
                loadedFrom: 'fetch',
                count: normalized.length,
                url
              };
            }
          }
        }
      } catch (fetchError) {
        devWarn(`CatalogLoader: Fetch failed for ${url}:`, fetchError);
        continue; // Try next URL
      }
    }
  } catch (error) {
    devWarn('CatalogLoader: All fetch attempts failed:', error);
  }

  // 3. Fallback to embedded starter catalog
  try {
    devLog('CatalogLoader: Loading embedded starter catalog...');
    const { starterCatalog } = await import('./starterCatalog');
    
    const normalized = normalizeCatalog(starterCatalog);
    if (normalized.length > 0) {
      // Cache the starter catalog for future loads
      localStorage.setItem(CATALOG_LS_KEY, JSON.stringify(normalized));
      
      devLog(`CatalogLoader: Loaded ${normalized.length} components from embedded starter catalog`);
      return {
        components: normalized,
        loadedFrom: 'starter',
        count: normalized.length
      };
    }
  } catch (error) {
    devError('CatalogLoader: Starter catalog load failed:', error);
  }

  // 4. Last resort: empty catalog with error
  devError('CatalogLoader: All loading methods failed, returning empty catalog');
  return {
    components: [],
    loadedFrom: 'starter',
    count: 0,
    error: 'All catalog loading methods failed'
  };
}

/**
 * Save catalog to localStorage
 */
export function saveCatalog(items: DsComponent[]): void {
  try {
    const normalized = normalizeCatalog(items);
    localStorage.setItem(CATALOG_LS_KEY, JSON.stringify(normalized));
    
    devLog(`CatalogLoader: Saved ${normalized.length} components to localStorage`);
    
    // Dispatch event for other components to react
    const event = new CustomEvent('adsm:catalog:saved', {
      detail: { count: normalized.length, timestamp: Date.now() }
    });
    document.dispatchEvent(event);
    
  } catch (error) {
    devError('CatalogLoader: Failed to save catalog:', error);
    throw new Error('Failed to save catalog to storage');
  }
}

/**
 * Clear catalog and reload starter
 */
export async function reloadStarterCatalog(): Promise<CatalogLoadResult> {
  try {
    devLog('CatalogLoader: Clearing current catalog and reloading starter...');
    
    // Clear localStorage
    localStorage.removeItem(CATALOG_LS_KEY);
    
    // Clear any other related storage
    const keysToRemove = [
      'adsm:userComponents:v1',
      'adsm:userComponents',
      'adsm:catalog:builtins'
    ];
    
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
    
    // Force reload from starter
    const result = await loadCatalog();
    
    // Dispatch reload event
    const event = new CustomEvent('adsm:catalog:reloaded', {
      detail: { 
        loadedFrom: result.loadedFrom,
        count: result.count,
        timestamp: Date.now()
      }
    });
    document.dispatchEvent(event);
    
    return result;
    
  } catch (error) {
    devError('CatalogLoader: Failed to reload starter catalog:', error);
    throw error;
  }
}

/**
 * Get catalog loading diagnostics
 */
export function getCatalogDiagnostics(): {
  hasLocalStorage: boolean;
  localStorageSize: number;
  catalogKeys: string[];
  lastLoadSource?: string;
  canFetch: boolean;
} {
  try {
    const catalogKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('adsm:catalog') || key.startsWith('adsm:userComponents')
    );
    
    let localStorageSize = 0;
    for (const key of catalogKeys) {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          localStorageSize += item.length;
        }
      } catch {
        // Skip corrupted entries
      }
    }
    
    const hasLocalStorage = catalogKeys.length > 0;
    const canFetch = typeof fetch !== 'undefined';
    
    return {
      hasLocalStorage,
      localStorageSize,
      catalogKeys,
      canFetch
    };
    
  } catch (error) {
    devWarn('CatalogLoader: Failed to get diagnostics:', error);
    return {
      hasLocalStorage: false,
      localStorageSize: 0,
      catalogKeys: [],
      canFetch: false
    };
  }
}

/**
 * Initialize catalog on app startup
 */
export async function initializeCatalog(): Promise<CatalogLoadResult> {
  devLog('CatalogLoader: Initializing catalog system...');
  
  try {
    const result = await loadCatalog();
    
    // Store result for diagnostics (development only)
    if (process.env.NODE_ENV === 'development') {
      (window as any).__adsmCatalogLoadResult = result;
    }
    
    // Dispatch initialization complete event
    const event = new CustomEvent('adsm:catalog:initialized', {
      detail: result
    });
    document.dispatchEvent(event);
    
    return result;
    
  } catch (error) {
    devError('CatalogLoader: Initialization failed:', error);
    
    // Return empty result with error
    const errorResult: CatalogLoadResult = {
      components: [],
      loadedFrom: 'starter',
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown initialization error'
    };
    
    if (process.env.NODE_ENV === 'development') {
      (window as any).__adsmCatalogLoadResult = errorResult;
    }
    return errorResult;
  }
}

// Make loader functions globally available for debugging (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__adsmCatalogLoader = {
    loadCatalog,
    saveCatalog,
    reloadStarterCatalog,
    getCatalogDiagnostics,
    initializeCatalog
  };
}