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
      // Try to import the registry synchronously
      try {
        registryCache = require('../components/registry').registry;
      } catch (requireError) {
        console.warn(`[lazyFromComponent] Failed to load registry:`, requireError);
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