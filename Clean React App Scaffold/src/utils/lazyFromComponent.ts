// Minimal shim: wrap an already-available component constructor
// so React.lazy() gets a dynamic import-like function.
import * as React from "react";

export function lazyFromComponent<T extends React.ComponentType<any>>(Comp: T) {
  return React.lazy(async () => ({ default: Comp }));
}

// Helper to safely get component from registry
let registryCache: any = null;

export function getComponentById(id: string): any {
  try {
    if (!registryCache) {
      // Try to import the registry synchronously (fallback safely if it fails)
      try {
        // Use dynamic import instead of require for better compatibility
        const registryModule = require('../components/registry');
        registryCache = registryModule?.registry || {};
      } catch (requireError) {
        console.warn(`[lazyFromComponent] Failed to load registry (using empty fallback):`, requireError);
        registryCache = {}; // Empty fallback to prevent re-attempts
        return null;
      }
    }
    return registryCache[id] || null;
  } catch (error) {
    console.warn(`[lazyFromComponent] Error getting component ${id}:`, error);
    return null;
  }
}

// Safe wrapper for component loading with fallbacks
export function safeLoadComponent(
  loader: (() => Promise<{ default: React.ComponentType<any> }>) | undefined,
  fallback?: React.ComponentType<any>
) {
  if (!loader) {
    const FallbackComponent = fallback || (() => (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-muted-foreground)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-panel)'
      }}>
        No component available
      </div>
    ));
    return React.lazy(async () => ({ default: FallbackComponent }));
  }

  return React.lazy(loader);
}