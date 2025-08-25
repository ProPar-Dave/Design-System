import React from 'react';
import { getCurrentRoute } from './hashUtils';

/**
 * Core router component that handles hash-based navigation
 * Separated from app initialization to prevent re-triggering boot sequence
 */
export function Router() {
  const [currentRoute, setCurrentRoute] = React.useState(() => getCurrentRoute());

  React.useEffect(() => {
    const setRouteFromHash = () => {
      const route = getCurrentRoute();
      setCurrentRoute(route);
    };

    // navigation should not touch app boot/init
    // simply handle hash routing
    window.addEventListener("hashchange", () => {
      setRouteFromHash();
    });

    // Set initial route
    setRouteFromHash();

    return () => {
      window.removeEventListener("hashchange", setRouteFromHash);
    };
  }, []);

  return { currentRoute };
}

/**
 * Hook for accessing current route without triggering app initialization
 */
export function useRouter() {
  const [currentRoute, setCurrentRoute] = React.useState(() => getCurrentRoute());

  React.useEffect(() => {
    const setRouteFromHash = () => {
      const route = getCurrentRoute();
      setCurrentRoute(route);
    };

    // navigation should not touch app boot/init
    // simply handle hash routing
    window.addEventListener("hashchange", () => {
      setRouteFromHash();
    });

    return () => {
      window.removeEventListener("hashchange", setRouteFromHash);
    };
  }, []);

  return { currentRoute };
}