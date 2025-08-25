/**
 * Hash-based router utilities for deep-linking drawer tabs
 * Supports URLs like: #/components?id=btn&tab=json
 */

import * as React from 'react';
import { parseHash as parseHashCore, navigate as navigateCore, updateParams, getCurrentRoute as getCurrentRouteCore, getParam } from '../src/router/hashUtils';

export interface HashState {
  path: string;
  id?: string;
  tab?: 'preview' | 'notes' | 'props' | 'json';
  [key: string]: string | undefined;
}

/**
 * Parse current hash into structured state (legacy interface)
 */
export function parseHash(): HashState {
  const { path, params } = parseHashCore();
  const state: HashState = { path };
  
  // Copy all params to state
  Object.entries(params).forEach(([key, value]) => {
    state[key] = value;
  });
  
  // Type-safe tab parsing
  const tab = params.tab;
  if (tab && ['preview', 'notes', 'props', 'json'].includes(tab)) {
    state.tab = tab as 'preview' | 'notes' | 'props' | 'json';
  }
  
  return state;
}

/**
 * Update hash with new state, preserving existing parameters
 */
export function updateHash(updates: Partial<Omit<HashState, 'path'>> & { path?: string }) {
  if (updates.path) {
    // Navigate to new path with params
    const { path, ...params } = updates;
    navigateCore(path as any, params);
  } else {
    // Update only parameters
    updateParams(updates);
  }
}

/**
 * Navigate to a new hash state
 */
export function navigateToHash(state: Partial<HashState>) {
  updateHash(state);
}

/**
 * Navigate with proper history management
 */
export function navigateTo(path: string, params?: Record<string, string>) {
  navigateCore(path as any, params);
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
  return getCurrentRouteCore();
}

/**
 * Navigate to a route (simplified for main navigation)
 */
export function navigate(route: string) {
  const path = route.startsWith('#/') ? route : `#/${route}`;
  navigateCore(path as any);
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

/**
 * Hook for hash-based routing with current route and params
 * Compatible with Layout and Router components
 */
export function useHashRouter() {
  const [hashState] = useHashState();
  const currentRoute = getCurrentRoute();
  
  return {
    currentRoute,
    params: hashState
  };
}