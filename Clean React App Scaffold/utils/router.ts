/**
 * Hash-based router utilities for deep-linking drawer tabs
 * Supports URLs like: #/components?id=btn&tab=json
 */

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
 * Hook for listening to hash changes
 */
export function useHashState() {
  const [state, setState] = React.useState<HashState>(parseHash);
  
  React.useEffect(() => {
    const handleHashChange = () => {
      setState(parseHash());
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  return [state, updateHash] as const;
}