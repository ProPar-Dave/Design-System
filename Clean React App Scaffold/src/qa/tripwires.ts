import { registry } from "../components/registry";

type Registry = { 
  [key: string]: any;
  has?: (id: string) => boolean 
};

/**
 * Run at boot in dev only. It logs non-fatal warnings if:
 * - Catalog items reference IDs missing from the registry
 * - Registry entries point to files that fail dynamic import
 * - Token write failures occur
 * - Component drawer operations fail
 */
export function armTripwires(componentRegistry?: Registry) {
  if (typeof window === "undefined") return;

  const reg = componentRegistry || registry;
  const hasComponent = reg.has || ((id: string) => id in reg);

  // 1) Missing registry component = no preview
  window.addEventListener("adsm:open-drawer", (e: any) => {
    const id = e?.detail?.id;
    if (id && !hasComponent(id)) {
      console.warn("[Tripwire] Drawer opened for unknown component id:", id);
      console.warn(`[Tripwire] Add this entry to registry.tsx:
"${id}": {
  id: "${id}",
  name: "${id.replace(/^(atom|molecule|organism)-/, '').replace(/-/g, ' ')}",  
  level: "${id.split('-')[0]}",
  loadPreview: () => Promise.resolve({ default: MissingPreview }),
},`);
    }
  });

  // 2) Token write failures (if any)
  window.addEventListener("adsm:tokens:changed", (e: any) => {
    const { name, value, success, error } = e?.detail || {};
    
    if (!success && error) {
      console.warn("[Tripwire] Token write failed:", { name, value, error });
      return;
    }
    
    if (!name?.startsWith?.("--")) {
      console.warn("[Tripwire] Invalid token name (should start with --):", name, value);
    }
    
    // Validate common token patterns
    if (name?.includes('color') && value && !isValidColorValue(value)) {
      console.warn("[Tripwire] Suspicious color token value:", { name, value });
    }
  });

  // 3) Component lazy loading failures
  window.addEventListener("error", (e) => {
    if (e.message?.includes("Loading chunk") || e.message?.includes("lazy")) {
      console.warn("[Tripwire] Lazy loading error detected:", e.message);
    }
  });

  // 4) React lazy errors (the object Object issue)
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('lazy: Expected the result of a dynamic import')) {
      console.warn("[Tripwire] React.lazy received non-promise. Check component registry loadPreview functions.");
    }
    originalError(...args);
  };

  console.log("[Tripwires] Armed and ready - monitoring component registry and token operations");
}

// Helper to validate color values
function isValidColorValue(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  
  const trimmed = value.trim().toLowerCase();
  
  // Common patterns that are likely valid
  return (
    trimmed.startsWith('#') ||
    trimmed.startsWith('rgb') ||
    trimmed.startsWith('hsl') ||
    trimmed.startsWith('var(') ||
    ['transparent', 'currentcolor', 'inherit', 'initial', 'unset', 'none'].includes(trimmed)
  );
}

// Additional runtime checks
export function runRegistryHealthCheck(): {
  totalComponents: number;
  componentsWithPreviews: number;
  componentsWithSchemas: number;
  brokenPreviews: string[];
  recommendations: string[];
} {
  const reg = registry;
  const totalComponents = Object.keys(reg).length;
  let componentsWithPreviews = 0;
  let componentsWithSchemas = 0;
  const brokenPreviews: string[] = [];
  const recommendations: string[] = [];

  Object.entries(reg).forEach(([id, meta]) => {
    if (meta.loadPreview) {
      componentsWithPreviews++;
      
      // Quick validation of the loader function
      if (typeof meta.loadPreview !== 'function') {
        brokenPreviews.push(id);
      }
    }
    
    if (meta.loadPropsSchema) {
      componentsWithSchemas++;
    }
    
    // Check for common issues
    if (!meta.name || !meta.level) {
      recommendations.push(`Component ${id} missing name or level`);
    }
    
    if (!meta.loadPreview) {
      recommendations.push(`Component ${id} has no preview - consider adding loadPreview`);
    }
  });

  return {
    totalComponents,
    componentsWithPreviews,
    componentsWithSchemas,
    brokenPreviews,
    recommendations
  };
}

// Export helpers for diagnostics page
export function getTripwireStatus(): {
  armed: boolean;
  registryHealth: ReturnType<typeof runRegistryHealthCheck>;
  recentWarnings: string[];
} {
  const health = runRegistryHealthCheck();
  
  // In a real implementation, you might track warnings in a store
  const recentWarnings: string[] = [];
  
  return {
    armed: true, // Always true if this code runs
    registryHealth: health,
    recentWarnings
  };
}