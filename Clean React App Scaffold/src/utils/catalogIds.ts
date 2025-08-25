export function getCatalogIdsSafely(): string[] {
  try {
    // Try multiple sources for catalog IDs
    
    // 1. Check localStorage first
    const raw = localStorage.getItem("adsm:catalog:current");
    if (raw) {
      const json = JSON.parse(raw);
      const items = Array.isArray(json?.items) ? json.items : [];
      const ids = items.map((it: any) => String(it?.id ?? "")).filter(Boolean);
      if (ids.length > 0) return ids;
    }

    // 2. Check if there's a global catalog store
    if (typeof window !== 'undefined' && (window as any).__ADSM_CATALOG__) {
      const catalog = (window as any).__ADSM_CATALOG__;
      if (Array.isArray(catalog.items)) {
        return catalog.items.map((it: any) => String(it?.id ?? "")).filter(Boolean);
      }
    }

    // 3. Fallback to common IDs based on the registry
    const commonIds = [
      "atom-button-primary",
      "atom-button-secondary", 
      "atom-input-text",
      "atom-checkbox",
      "atom-chip",
      "molecule-alert",
      "molecule-card"
    ];

    return commonIds;
  } catch (error) {
    console.warn("[getCatalogIdsSafely] Error reading catalog IDs:", error);
    return [];
  }
}

// Helper to sync catalog with registry
export function syncCatalogWithRegistry() {
  try {
    const catalogIds = getCatalogIdsSafely();
    const registryIds = Object.keys(require('../components/registry').registry || {});
    
    const missingInRegistry = catalogIds.filter(id => !registryIds.includes(id));
    const missingInCatalog = registryIds.filter(id => !catalogIds.includes(id));
    
    if (missingInRegistry.length > 0) {
      console.warn("[Sync] IDs in catalog but missing from registry:", missingInRegistry);
    }
    
    if (missingInCatalog.length > 0) {
      console.log("[Sync] IDs in registry but not in catalog:", missingInCatalog);
    }
    
    return {
      catalogIds,
      registryIds,
      missingInRegistry,
      missingInCatalog,
      inSync: missingInRegistry.length === 0 && missingInCatalog.length === 0
    };
  } catch (error) {
    console.warn("[syncCatalogWithRegistry] Error:", error);
    return {
      catalogIds: [],
      registryIds: [],
      missingInRegistry: [],
      missingInCatalog: [],
      inSync: false
    };
  }
}