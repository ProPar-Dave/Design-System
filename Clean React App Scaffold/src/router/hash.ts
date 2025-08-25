import * as React from 'react';
import { parseHash } from './hashUtils';

export function useHashRoute() {
  const [hash, setHash] = React.useState(() => location.hash || '#/overview');
  
  React.useEffect(() => {
    const onHash = () => setHash(location.hash || '#/overview');
    window.addEventListener('hashchange', onHash, { passive: true });
    window.addEventListener('popstate', onHash, { passive: true });
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
    };
  }, []);
  
  return hash;
}

/**
 * Hook for parsed hash state with params
 */
export function useParsedHash() {
  const [state, setState] = React.useState(() => parseHash());
  
  React.useEffect(() => {
    const onHash = () => setState(parseHash());
    window.addEventListener('hashchange', onHash, { passive: true });
    window.addEventListener('popstate', onHash, { passive: true });
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onHash);
    };
  }, []);
  
  return state;
}