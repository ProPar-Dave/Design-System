/**
 * Hash-based router utilities for deep-linking drawer tabs
 * Supports URLs like: #/components?id=btn&tab=json
 */

import * as React from 'react';

export interface HashState {
  path: string;
  id?: string;
  tab?: 'preview' | 'notes' | 'props' | 'json';
  [key: string]: string | undefined;
}

/**
 * Parse current hash into structured state
 */
export function parseHash(): HashState {
  const hash = window.location.hash.slice(1) || '/';
  const [path, queryString] = hash.split('?', 2);
  
  const state: HashState = { path };
  
  if (queryString) {
    const params = new URLSearchParams(queryString);
    params.forEach((value, key) => {
      state[key] = value;
    });
    
    // Type-safe tab parsing
    const tab = params.get('tab');
    if (tab && ['preview', 'notes', 'props', 'json'].includes(tab)) {
      state.tab = tab as 'preview' | 'notes' | 'props' | 'json';
    }
  }
  
  return state;
}

/**
 * Update hash with new state, preserving existing parameters
 */
export function updateHash(updates: Partial<Omit<HashState, 'path'>> & { path?: string }) {
  const current = parseHash();
  const newState = { ...current, ...updates };
  
  // Remove undefined values
  Object.keys(newState).forEach(key => {
    if (newState[key] === undefined || newState[key] === null) {
      delete newState[key];
    }
  });
  
  // Build new hash
  const { path, ...params } = newState;
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.set(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  const newHash = path + (queryString ? `?${queryString}` : '');
  
  // Update URL without triggering hashchange if it's the same
  if (window.location.hash !== `#${newHash}`) {
    window.history.replaceState(null, '', `#${newHash}`);
  }
}

/**
 * Navigate to a new hash state
 */
export function navigateToHash(state: Partial<HashState>) {
  updateHash(state);
  // Trigger hashchange event for listeners
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

/**
 * Navigate with proper history management
 */
export function navigateTo(path: string, params?: Record<string, string>) {
  try {
    const state: HashState = { path, ...params };
    
    // Remove undefined values
    Object.keys(state).forEach(key => {
      if (state[key] === undefined || state[key] === null) {
        delete state[key];
      }
    });
    
    // Build new hash
    const { path: statePath, ...stateParams } = state;
    const queryParams = new URLSearchParams();
    
    Object.entries(stateParams).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.set(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const newHash = statePath + (queryString ? `?${queryString}` : '');
    
    // Use pushState for proper back/forward navigation
    if (window.location.hash !== `#${newHash}`) {
      window.history.pushState(null, '', `#${newHash}`);
      // Trigger hashchange event manually since pushState doesn't trigger it
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }
  } catch (error) {
    console.warn('Navigation failed:', error);
    // Fallback to basic hash navigation
    window.location.hash = path;
  }
}

/**
 * Hook for listening to hash changes
 */
export function useHashState() {
  const [state, setState] = React.useState<HashState>(parseHash);
  
  React.useEffect(() => {
    const handleHashChange = () => {
      setState(parseHash());
    };
    
    const handlePopState = () => {
      setState(parseHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  return [state, updateHash] as const;
}

/**
 * Get current route from hash path
 */
export function getCurrentRoute(): string {
  const hash = parseHash();
  const path = hash.path.replace('/', '');
  return path || 'overview';
}

/**
 * Navigate to a route (simplified for main navigation)
 */
export function navigate(route: string) {
  navigateTo(`/${route}`);
}

/**
 * Backward compatible useRouter hook
 * Returns current route and navigation function
 */
export function useRouter() {
  const [hashState] = useHashState();
  const currentRoute = getCurrentRoute();
  
  return {
    currentRoute,
    hashState,
    navigate,
    navigateTo,
    updateHash
  };
}