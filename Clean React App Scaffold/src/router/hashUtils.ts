/**
 * Centralized hash routing utilities
 * Single source of truth for all hash-based navigation
 */

export type RoutePath = 
  | '#/' 
  | '#/overview' 
  | '#/guidelines' 
  | '#/tokens' 
  | '#/components' 
  | '#/releases' 
  | '#/diagnostics' 
  | '#/mini-layouts'
  | '#/alert-demo';

export interface ParsedHash {
  path: string;
  params: Record<string, string>;
}

/**
 * Parse hash into path and params
 */
export function parseHash(h = location.hash): ParsedHash {
  const cleanHash = h.replace(/^#/, '');
  const [path, query = ''] = cleanHash.split('?');
  const params = Object.fromEntries(new URLSearchParams(query));
  return { path: `#${path}`, params };
}

/**
 * Build hash from path - ensures type safety
 */
export function buildHash(path: RoutePath): string {
  return path;
}

/**
 * Navigate to path with optional params
 */
export function navigate(path: RoutePath, params?: Record<string, string | number | boolean>): void {
  const query = params ? 
    `?${new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString()}` : '';
  
  const hash = `${path}${query}`;
  
  if (location.hash !== hash) {
    location.hash = hash;
  }
}

/**
 * Update current hash with new params, preserving path
 */
export function updateParams(params: Record<string, string | number | boolean | null | undefined>): void {
  const current = parseHash();
  const newParams = { ...current.params };
  
  // Update params, removing null/undefined values
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      delete newParams[key];
    } else {
      newParams[key] = String(value);
    }
  });
  
  const query = Object.keys(newParams).length > 0 ? 
    `?${new URLSearchParams(newParams).toString()}` : '';
  
  const hash = `${current.path}${query}`;
  
  if (location.hash !== hash) {
    // Use replaceState to avoid creating history entries for param updates
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
}

/**
 * Get current route name without hash prefix
 */
export function getCurrentRoute(): string {
  const { path } = parseHash();
  const route = path.replace('#/', '');
  return route || 'overview';
}

/**
 * Check if current route matches given path
 */
export function isCurrentRoute(path: RoutePath): boolean {
  const current = parseHash();
  return current.path === path;
}

/**
 * Navigate to component with specific params (helper for components page)
 */
export function navigateToComponent(id: string, tab?: 'preview' | 'notes' | 'props' | 'json'): void {
  const params: Record<string, string> = { id };
  if (tab) params.tab = tab;
  navigate('#/components', params);
}

/**
 * Get param value from current hash
 */
export function getParam(key: string): string | undefined {
  const { params } = parseHash();
  return params[key];
}