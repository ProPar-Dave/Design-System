// utils/catalog.ts - Enhanced catalog normalization & persistence
export type Level = 'atom' | 'molecule' | 'organism';
export type Status = 'draft' | 'ready';
export type PropKind = 'text' | 'number' | 'boolean' | 'select';

export interface PropSpec {
  name: string;
  label?: string;
  kind: PropKind;
  default?: string | number | boolean;
  options?: string[]; // for select
  required?: boolean;
  description?: string;
}

// Demo specification for component props
export type DemoSpec = {
  props?: Record<string, any>;
};

// Normalized DsComponent interface - compliant with acceptance criteria
export interface DsComponent {
  id: string;
  name: string;
  level: Level;
  version: string;
  status: Status;
  tags: string[];           // Always array
  dependencies: string[];   // Always array - component ids
  notes?: string;           // Optional string
  demo?: DemoSpec;          // Optional demo with props
  
  // Extended fields for enhanced functionality
  description?: string;
  previewKind?: string;     // 'button' | 'badge' | 'chip' | etc.
  propsSpec?: PropSpec[];   // Enhanced prop specifications
  code?: string;            // Component code
}

// Component info interface for diagnostics
export interface ComponentInfo {
  id: string;
  name: string;
  content?: string;
  path?: string;
  level?: Level;
  tags?: string[];
  dependencies?: string[];
}

// Safe array normalization utility - fixed generic syntax
const ensureArray = function<T>(v: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(v)) {
    return v.filter((item): item is T => item != null);
  }
  return fallback;
};

// Safe string normalization
const ensureString = (v: unknown, fallback = ''): string => {
  if (typeof v === 'string') return v;
  if (v != null && typeof v.toString === 'function') return String(v);
  return fallback;
};

// Robust component normalization with crash safety
export function normalizeComponent(raw: any): DsComponent | null {
  if (!raw || typeof raw !== 'object') {
    console.warn('normalizeComponent: Invalid input - not an object:', raw);
    return null;
  }
  
  try {
    // Required fields with safe fallbacks
    const id = ensureString(raw.id, crypto.randomUUID());
    const name = ensureString(raw.name, 'Untitled Component');
    
    // Validate and normalize level
    const validLevels: Level[] = ['atom', 'molecule', 'organism'];
    const level: Level = validLevels.includes(raw.level) ? raw.level : 'atom';
    
    // Version normalization
    const version = ensureString(raw.version, '0.1.0');
    
    // Validate and normalize status  
    const validStatuses: Status[] = ['draft', 'ready'];
    const status: Status = validStatuses.includes(raw.status) ? raw.status : 'draft';
    
    // Arrays with proper validation
    const tags = ensureArray<string>(raw.tags).map(ensureString).filter(Boolean);
    const dependencies = ensureArray<string>(raw.dependencies || raw.deps).map(ensureString).filter(Boolean);
    
    // Optional fields
    const notes = raw.notes != null ? ensureString(raw.notes) : undefined;
    const description = raw.description != null ? ensureString(raw.description) : undefined;
    const previewKind = raw.previewKind != null ? ensureString(raw.previewKind) : undefined;
    const code = raw.code != null ? ensureString(raw.code) : undefined;
    
    // Demo specification normalization
    let demo: DemoSpec | undefined = undefined;
    if (raw.demo && typeof raw.demo === 'object') {
      demo = {
        props: (raw.demo.props && typeof raw.demo.props === 'object') ? raw.demo.props : {}
      };
    }
    
    // Props specification normalization
    const propsSpec = ensureArray<any>(raw.propsSpec)
      .map((p) => {
        if (!p || typeof p !== 'object') return null;
        
        const propName = ensureString(p.name);
        if (!propName) return null;
        
        const validKinds: PropKind[] = ['text', 'number', 'boolean', 'select'];
        const kind: PropKind = validKinds.includes(p.kind) ? p.kind : 'text';
        
        return {
          name: propName,
          label: p.label != null ? ensureString(p.label) : undefined,
          kind,
          default: p.default,
          options: ensureArray<string>(p.options).map(ensureString).filter(Boolean),
          required: Boolean(p.required),
          description: p.description != null ? ensureString(p.description) : undefined
        } as PropSpec;
      })
      .filter(Boolean) as PropSpec[];

    // Build normalized component
    const normalized: DsComponent = {
      id,
      name, 
      level,
      version,
      status,
      tags,
      dependencies,
      notes,
      demo
    };

    // Add optional extended fields only if they exist
    if (description) normalized.description = description;
    if (previewKind) normalized.previewKind = previewKind;
    if (propsSpec.length > 0) normalized.propsSpec = propsSpec;
    if (code) normalized.code = code;

    return normalized;
    
  } catch (error) {
    console.warn('normalizeComponent: Failed to normalize component:', error, raw);
    return null;
  }
}

// Robust catalog normalization
export const normalizeCatalog = (list: any[]): DsComponent[] => {
  if (!Array.isArray(list)) {
    console.warn('normalizeCatalog: Input is not an array:', list);
    return [];
  }
  
  return list
    .map(normalizeComponent)
    .filter((component): component is DsComponent => component !== null);
};

// Enhanced storage migration with comprehensive error handling
export function migrateCatalogStorage(): void {
  try {
    console.log('Starting catalog storage migration...');
    
    const STORAGE_KEYS = [
      'adsm:catalog:current',
      'adsm:userComponents:v1', 
      'adsm:userComponents', 
      'adsm:catalog:builtins'
    ];
    
    let migrationCount = 0;
    let errorCount = 0;
    
    for (const key of STORAGE_KEYS) {
      try {
        const rawData = localStorage.getItem(key);
        if (!rawData) continue;
        
        let parsed: any;
        try {
          parsed = JSON.parse(rawData);
        } catch (parseError) {
          console.warn(`migrateCatalogStorage: Invalid JSON in ${key}, clearing:`, parseError);
          localStorage.removeItem(key);
          errorCount++;
          continue;
        }
        
        // Extract component array from different storage formats
        let componentArray: any[] = [];
        if (Array.isArray(parsed)) {
          componentArray = parsed;
        } else if (parsed && typeof parsed === 'object') {
          componentArray = parsed.items || parsed.components || [];
        }
        
        if (!Array.isArray(componentArray)) {
          console.warn(`migrateCatalogStorage: No valid component array found in ${key}`);
          continue;
        }
        
        // Normalize the components
        const originalCount = componentArray.length;
        const normalized = normalizeCatalog(componentArray);
        
        // Check if migration is needed
        const needsMigration = originalCount !== normalized.length || 
          componentArray.some((item: any, index: number) => {
            const norm = normalized[index];
            return !norm || 
              typeof item?.notes !== 'string' ||
              !Array.isArray(item?.tags) ||
              !Array.isArray(item?.dependencies);
          });
        
        if (needsMigration) {
          // Save the normalized data back
          const updatedData = Array.isArray(parsed) 
            ? normalized 
            : { ...parsed, items: normalized };
          
          localStorage.setItem(key, JSON.stringify(updatedData));
          migrationCount++;
          
          console.log(`Migrated ${key}: ${originalCount} → ${normalized.length} components`);
        }
        
      } catch (keyError) {
        console.warn(`migrateCatalogStorage: Error processing ${key}:`, keyError);
        // Try to clear corrupted storage entry
        try {
          localStorage.removeItem(key);
        } catch (removeError) {
          console.warn(`Failed to remove corrupted storage key ${key}:`, removeError);
        }
        errorCount++;
      }
    }
    
    // Restore theme from storage
    restoreThemeFromStorage();
    
    // Restore last route from storage  
    restoreLastRoute();
    
    // Restore preview props from storage
    restorePreviewProps();
    
    if (migrationCount > 0) {
      console.log(`Catalog migration completed: ${migrationCount} keys migrated, ${errorCount} errors`);
      
      // Dispatch migration complete event
      document.dispatchEvent(new CustomEvent('adsm:catalog:migrated', {
        detail: { migrated: migrationCount, errors: errorCount }
      }));
    }
    
  } catch (globalError) {
    console.warn('migrateCatalogStorage: Global migration error:', globalError);
  }
}

// Restore theme from localStorage
function restoreThemeFromStorage(): void {
  try {
    const savedTheme = localStorage.getItem('adsm:theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
      console.log(`Restored theme: ${savedTheme}`);
    }
  } catch (error) {
    console.warn('Failed to restore theme:', error);
  }
}

// Restore last route from localStorage
function restoreLastRoute(): void {
  try {
    const lastRoute = localStorage.getItem('adsm:lastRoute');
    if (lastRoute && typeof lastRoute === 'string') {
      // Only restore route if current is default
      if (window.location.hash === '' || window.location.hash === '#') {
        window.location.hash = lastRoute.startsWith('#') ? lastRoute : `#${lastRoute}`;
        console.log(`Restored last route: ${lastRoute}`);
      }
    }
  } catch (error) {
    console.warn('Failed to restore last route:', error);
  }
}

// Restore preview props from localStorage
function restorePreviewProps(): void {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('adsm:preview:props:'));
    let restoredCount = 0;
    
    for (const key of keys) {
      try {
        const propsData = localStorage.getItem(key);
        if (propsData) {
          JSON.parse(propsData); // Validate JSON
          restoredCount++;
        }
      } catch (error) {
        console.warn(`Invalid preview props data for ${key}, removing:`, error);
        localStorage.removeItem(key);
      }
    }
    
    if (restoredCount > 0) {
      console.log(`Restored preview props for ${restoredCount} components`);
    }
  } catch (error) {
    console.warn('Failed to restore preview props:', error);
  }
}

// Safe component import with enhanced error handling
// NOTE: This function is maintained for backward compatibility
// New code should use the enhanced importer from utils/importer.ts
export function safeImportComponents(fileText: string): DsComponent[] {
  if (!fileText || typeof fileText !== 'string') {
    throw new Error('Invalid input: expected non-empty string');
  }
  
  try {
    const parsed = JSON.parse(fileText.trim());
    
    if (!parsed) {
      throw new Error('Empty JSON data');
    }
    
    let componentList: any[] = [];
    
    // Handle different JSON structures
    if (Array.isArray(parsed)) {
      componentList = parsed;
    } else if (parsed && typeof parsed === 'object') {
      // Try multiple possible array keys
      const possibleKeys = ['components', 'items', 'catalog', 'data'];
      for (const key of possibleKeys) {
        if (Array.isArray(parsed[key])) {
          componentList = parsed[key];
          break;
        }
      }
      
      // If no array found, treat as single component
      if (componentList.length === 0) {
        componentList = [parsed];
      }
    } else {
      throw new Error('Invalid JSON format: expected array or object');
    }
    
    if (componentList.length === 0) {
      throw new Error('No components found in file');
    }
    
    const normalized = normalizeCatalog(componentList);
    
    if (normalized.length === 0) {
      throw new Error('No valid components could be imported - all entries were malformed');
    }
    
    const skipped = componentList.length - normalized.length;
    if (skipped > 0) {
      console.warn(`Import warning: ${skipped} malformed components were skipped`);
    }
    
    return normalized;
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON syntax in file');
    }
    throw error;
  }
}

// Enhanced component retrieval with error boundaries
export function getAllComponents(): DsComponent[] {
  try {
    // Check global cache first
    const fromGlobal = (window as any).__adsmCatalogAll as DsComponent[] | undefined;
    if (fromGlobal && Array.isArray(fromGlobal)) {
      return normalizeCatalog(fromGlobal);
    }
    
    // Load from multiple storage sources
    const sources = ['adsm:catalog:current', 'adsm:catalog:builtins', 'adsm:userComponents:v1', 'adsm:userComponents'];
    const allComponents: any[] = [];
    
    for (const source of sources) {
      try {
        const data = localStorage.getItem(source);
        if (data) {
          const parsed = JSON.parse(data);
          const components = Array.isArray(parsed) ? parsed : (parsed?.items || parsed?.components || []);
          allComponents.push(...components);
        }
      } catch (error) {
        console.warn(`Failed to load from ${source}:`, error);
      }
    }
    
    return normalizeCatalog(allComponents);
    
  } catch (error) {
    console.warn('getAllComponents: Failed to load components:', error);
    return [];
  }
}

// Load components for diagnostics - converts DsComponent to ComponentInfo
export function loadComponents(): Promise<ComponentInfo[]> {
  return new Promise((resolve) => {
    try {
      const components = getAllComponents();
      
      // Convert DsComponent to ComponentInfo format
      const componentInfo: ComponentInfo[] = components.map(component => ({
        id: component.id,
        name: component.name,
        content: component.code || '', // Use code field as content
        path: `components/${component.level}s/${component.name}.tsx`,
        level: component.level,
        tags: component.tags,
        dependencies: component.dependencies
      }));
      
      resolve(componentInfo);
    } catch (error) {
      console.warn('loadComponents: Failed to load components:', error);
      resolve([]);
    }
  });
}

// Load user components with error handling
export function loadUserComponents(): DsComponent[] {
  try {
    const userSources = ['adsm:userComponents:v1', 'adsm:userComponents'];
    const userComponents: any[] = [];
    
    for (const source of userSources) {
      try {
        const data = localStorage.getItem(source);
        if (data) {
          const parsed = JSON.parse(data);
          const components = Array.isArray(parsed) ? parsed : [];
          userComponents.push(...components);
        }
      } catch (error) {
        console.warn(`Failed to load user components from ${source}:`, error);
      }
    }
    
    return normalizeCatalog(userComponents);
    
  } catch (error) {
    console.warn('loadUserComponents: Failed to load user components:', error);
    return [];
  }
}

// Save user components with validation
export function saveUserComponents(components: DsComponent[]): void {
  try {
    const normalized = normalizeCatalog(components);
    localStorage.setItem('adsm:userComponents:v1', JSON.stringify(normalized));
    
    // Update global cache
    const allComponents = getAllComponents();
    (window as any).__adsmCatalogAll = allComponents;
    
    console.log(`Saved ${normalized.length} user components`);
    
  } catch (error) {
    console.error('saveUserComponents: Failed to save components:', error);
    throw new Error('Failed to save components to storage');
  }
}

// Enhanced component validation
export function validateComponent(component: any): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!component || typeof component !== 'object') {
    return { isValid: false, issues: ['Component must be an object'] };
  }
  
  // Required field validation
  if (!component.id || typeof component.id !== 'string' || component.id.trim() === '') {
    issues.push('Missing or invalid id (must be non-empty string)');
  }
  
  if (!component.name || typeof component.name !== 'string' || component.name.trim() === '') {
    issues.push('Missing or invalid name (must be non-empty string)');
  }
  
  // Level validation
  const validLevels = ['atom', 'molecule', 'organism'];
  if (!validLevels.includes(component.level)) {
    issues.push(`Invalid level: must be one of ${validLevels.join(', ')}`);
  }
  
  // Status validation
  const validStatuses = ['draft', 'ready'];
  if (!validStatuses.includes(component.status)) {
    issues.push(`Invalid status: must be one of ${validStatuses.join(', ')}`);
  }
  
  // Version validation
  if (!component.version || typeof component.version !== 'string') {
    issues.push('Missing or invalid version (must be string)');
  }
  
  // Array field validation
  if (!Array.isArray(component.tags)) {
    issues.push('tags must be an array');
  }
  
  if (!Array.isArray(component.dependencies) && !Array.isArray(component.deps)) {
    issues.push('dependencies must be an array');
  }
  
  // Optional field validation
  if (component.notes !== undefined && typeof component.notes !== 'string') {
    issues.push('notes must be a string if provided');
  }
  
  if (component.propsSpec !== undefined && !Array.isArray(component.propsSpec)) {
    issues.push('propsSpec must be an array if provided');
  }
  
  return { isValid: issues.length === 0, issues };
}

// Enhanced add component with validation
export function addComponent(component: DsComponent): DsComponent {
  try {
    const validation = validateComponent(component);
    if (!validation.isValid) {
      throw new Error(`Component validation failed: ${validation.issues.join(', ')}`);
    }
    
    const normalized = normalizeComponent(component);
    if (!normalized) {
      throw new Error('Failed to normalize component');
    }
    
    const userComponents = loadUserComponents();
    
    // Check for duplicate ID
    const existingIndex = userComponents.findIndex(c => c.id === normalized.id);
    if (existingIndex !== -1) {
      throw new Error(`Component with ID "${normalized.id}" already exists`);
    }
    
    const updatedComponents = [...userComponents, normalized];
    saveUserComponents(updatedComponents);
    
    return normalized;
    
  } catch (error) {
    console.error('addComponent: Failed to add component:', error);
    throw error;
  }
}

// Enhanced upsert component
export function upsertComponent(component: DsComponent): DsComponent {
  try {
    const validation = validateComponent(component);
    if (!validation.isValid) {
      throw new Error(`Component validation failed: ${validation.issues.join(', ')}`);
    }
    
    const normalized = normalizeComponent(component);
    if (!normalized) {
      throw new Error('Failed to normalize component');
    }
    
    const userComponents = loadUserComponents();
    const existingIndex = userComponents.findIndex(c => c.id === normalized.id);
    
    let updatedComponents: DsComponent[];
    if (existingIndex !== -1) {
      updatedComponents = [...userComponents];
      updatedComponents[existingIndex] = normalized;
    } else {
      updatedComponents = [...userComponents, normalized];
    }
    
    saveUserComponents(updatedComponents);
    return normalized;
    
  } catch (error) {
    console.error('upsertComponent: Failed to upsert component:', error);
    throw error;
  }
}

// Safe component retrieval by ID
export function getComponentById(id: string): DsComponent | null {
  try {
    if (!id || typeof id !== 'string') {
      return null;
    }
    
    const allComponents = getAllComponents();
    return allComponents.find(c => c.id === id) || null;
    
  } catch (error) {
    console.warn('getComponentById: Failed to get component:', error);
    return null;
  }
}

// Enhanced merge catalog with deduplication
export function mergeCatalog(catalogs: DsComponent[][]): DsComponent[] {
  try {
    const merged: DsComponent[] = [];
    const seenIds = new Set<string>();
    
    for (const catalog of catalogs) {
      const normalizedCatalog = normalizeCatalog(catalog);
      
      for (const component of normalizedCatalog) {
        if (!seenIds.has(component.id)) {
          merged.push(component);
          seenIds.add(component.id);
        } else {
          // Later catalogs take precedence
          const existingIndex = merged.findIndex(c => c.id === component.id);
          if (existingIndex !== -1) {
            merged[existingIndex] = component;
          }
        }
      }
    }
    
    return merged;
    
  } catch (error) {
    console.warn('mergeCatalog: Failed to merge catalogs:', error);
    return [];
  }
}

// Enhanced diagnostic utilities
export function findMalformedComponents(): Array<{ index: number; id: string; issues: string[] }> {
  try {
    const allRawComponents: any[] = [];
    
    // Collect from all storage sources
    const sources = ['adsm:catalog:builtins', 'adsm:userComponents:v1', 'adsm:userComponents', 'adsm:catalog:current'];
    
    for (const source of sources) {
      try {
        const data = localStorage.getItem(source);
        if (data) {
          const parsed = JSON.parse(data);
          const components = Array.isArray(parsed) ? parsed : (parsed?.items || []);
          allRawComponents.push(...components);
        }
      } catch (error) {
        console.warn(`Failed to load ${source} for diagnostics:`, error);
      }
    }
    
    return allRawComponents.map((component, index) => {
      const validation = validateComponent(component);
      return {
        index,
        id: component?.id || `unknown-${index}`,
        issues: validation.issues
      };
    }).filter(result => result.issues.length > 0);
    
  } catch (error) {
    return [{ index: -1, id: 'storage-error', issues: ['Failed to analyze component storage'] }];
  }
}

// Route persistence utilities
export function saveCurrentRoute(path: string): void {
  try {
    if (path && typeof path === 'string') {
      localStorage.setItem('adsm:lastRoute', path);
    }
  } catch (error) {
    console.warn('Failed to save current route:', error);
  }
}

// Clean up invalid storage entries
export function cleanupStorage(): { removed: number; errors: number } {
  let removed = 0;
  let errors = 0;
  
  try {
    const keys = Object.keys(localStorage);
    const adsmKeys = keys.filter(key => key.startsWith('adsm:'));
    
    for (const key of adsmKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          JSON.parse(data); // Validate JSON
        }
      } catch (error) {
        console.warn(`Removing corrupted storage key: ${key}`, error);
        localStorage.removeItem(key);
        removed++;
      }
    }
  } catch (error) {
    console.warn('Storage cleanup failed:', error);
    errors++;
  }
  
  return { removed, errors };
}