// utils/catalog.ts
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

// Add minimal demo shape we can expand later
export type DemoSpec = {
  props?: Record<string, any>;
};

export interface DsComponent {
  id: string;
  name: string;
  description?: string;
  level: Level;
  version: string;
  status: Status;
  tags: string[];
  dependencies: string[];   // component ids
  notes: string;             // <- ALWAYS a string
  previewKind?: string;      // NEW: 'button' | 'badge' | 'chip' | etc.
  propsSpec?: PropSpec[];    // NEW: Enhanced prop specifications
  code?: string;
  demo?: DemoSpec;           // NEW: Optional demo specification
}

const ensureArray = <T,>(v: unknown): T[] => Array.isArray(v) ? (v as T[]).filter(Boolean) : [];

export function normalizeComponent(raw: any): DsComponent | null {
  if (!raw || typeof raw !== 'object') return null;
  
  try {
    const id = String(raw.id ?? crypto.randomUUID());
    const name = String(raw.name ?? 'Untitled');
    const level = (raw.level === 'molecule' || raw.level === 'organism') ? raw.level : 'atom';
    const version = typeof raw.version === 'string' ? raw.version : (raw.version?.toString?.() || '0.1.0');
    const status: Status = raw.status === 'ready' ? 'ready' : 'draft';
    const description = typeof raw.description === 'string' ? raw.description : undefined;
    const tags = ensureArray<string>(raw.tags).map(String);
    const dependencies = ensureArray<string>(raw.dependencies || raw.deps).map(String);
    const notes = typeof raw.notes === 'string' ? raw.notes : '';
    const previewKind = typeof raw.previewKind === 'string' ? raw.previewKind : undefined;
    const code = typeof raw.code === 'string' ? raw.code : undefined;
    const demo: DemoSpec | undefined = typeof raw.demo === 'object' && raw.demo ? { props: raw.demo.props ?? {} } : undefined;
    
    // Enhanced props specification normalization
    const propsSpec = ensureArray<any>(raw.propsSpec).map((p) => ({
      name: String(p?.name ?? ''),
      label: typeof p?.label === 'string' ? p.label : undefined,
      kind: (['text','number','boolean','select'] as const).includes(p?.kind) ? p.kind : 'text',
      default: (p?.default !== undefined ? p.default : undefined),
      options: ensureArray<string>(p?.options).map(String),
      required: Boolean(p?.required),
      description: typeof p?.description === 'string' ? p.description : undefined
    })).filter(p => !!p.name);

    return { 
      id, name, description, level, version, status, tags, dependencies, 
      notes, previewKind, propsSpec, code, demo
    };
  } catch (error) {
    console.warn('Failed to normalize component:', error);
    return null;
  }
}

export const normalizeCatalog = (list: any[]): DsComponent[] =>
  ensureArray<any>(list).map(normalizeComponent).filter(Boolean) as DsComponent[];

// One‑time storage migration to clean existing data
export function migrateCatalogStorage() {
  try {
    const KEYS = ['adsm:catalog:current','adsm:userComponents:v1', 'adsm:userComponents', 'adsm:catalog:builtins'];
    let migrated = false;
    
    for (const key of KEYS) {
      const raw = localStorage.getItem(key); 
      if (!raw) continue;
      
      try {
        const parsed = JSON.parse(raw);
        const items = Array.isArray(parsed) ? parsed : parsed?.items || [];
        const normalized = normalizeCatalog(items);
        
        // Only update if we actually changed something
        if (items.length !== normalized.length || 
            items.some((item: any, i: number) => !item || typeof item.notes !== 'string' || !Array.isArray(item.tags))) {
          
          localStorage.setItem(
            key,
            Array.isArray(parsed) ? JSON.stringify(normalized) : JSON.stringify({ ...parsed, items: normalized })
          );
          migrated = true;
          console.log(`Migrated ${normalized.length} components in ${key}`);
        }
      } catch (e) {
        console.warn(`Failed to migrate ${key}, clearing corrupted data:`, e);
        localStorage.removeItem(key);
      }
    }
    
    if (migrated) {
      console.log('Component catalog migration completed');
    }
  } catch (e) {
    console.warn('Catalog migration skipped:', e);
  }
}

// Safe importer for JSON files
export function safeImportComponents(fileText: string): DsComponent[] {
  try {
    const parsed = JSON.parse(fileText);
    
    if (!parsed) {
      throw new Error('Empty JSON file');
    }
    
    let componentList: any[] = [];
    
    if (Array.isArray(parsed)) {
      componentList = parsed;
    } else if (parsed.components && Array.isArray(parsed.components)) {
      componentList = parsed.components;
    } else if (parsed.items && Array.isArray(parsed.items)) {
      componentList = parsed.items;
    } else if (typeof parsed === 'object') {
      // Single component object
      componentList = [parsed];
    } else {
      throw new Error('Invalid JSON format: expected array or object with components');
    }
    
    if (componentList.length === 0) {
      throw new Error('No components found in JSON file');
    }
    
    const normalized = normalizeCatalog(componentList);
    
    if (normalized.length === 0) {
      throw new Error('No valid components could be imported from JSON file');
    }
    
    return normalized;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON syntax');
    }
    throw error;
  }
}

// Get all components from storage with normalization
export function getAllComponents(): DsComponent[] {
  try {
    const builtins = JSON.parse(localStorage.getItem('adsm:catalog:builtins') || '[]');
    const userV1 = JSON.parse(localStorage.getItem('adsm:userComponents:v1') || '[]');
    const user = JSON.parse(localStorage.getItem('adsm:userComponents') || '[]');
    const current = JSON.parse(localStorage.getItem('adsm:catalog:current') || '[]');
    
    // Use global reference if available, otherwise merge from storage
    const fromGlobal = (window as any).__adsmCatalogAll as DsComponent[] | undefined;
    if (fromGlobal && Array.isArray(fromGlobal)) {
      return normalizeCatalog(fromGlobal);
    }
    
    const allRaw = current.length ? current : [...builtins, ...userV1, ...user];
    return normalizeCatalog(allRaw);
  } catch (error) {
    console.warn('Failed to load components:', error);
    return [];
  }
}

// Load user components specifically
export function loadUserComponents(): DsComponent[] {
  try {
    const userV1 = JSON.parse(localStorage.getItem('adsm:userComponents:v1') || '[]');
    const user = JSON.parse(localStorage.getItem('adsm:userComponents') || '[]');
    const allUserComponents = [...userV1, ...user];
    return normalizeCatalog(allUserComponents);
  } catch (error) {
    console.warn('Failed to load user components:', error);
    return [];
  }
}

// Save components to storage
export function saveUserComponents(components: DsComponent[]): void {
  try {
    const normalized = normalizeCatalog(components);
    localStorage.setItem('adsm:userComponents:v1', JSON.stringify(normalized));
    
    // Update global reference
    const all = getAllComponents();
    (window as any).__adsmCatalogAll = all;
  } catch (error) {
    console.warn('Failed to save components:', error);
  }
}

// Add a new component (for NewComponentWizard)
export function addComponent(component: DsComponent): DsComponent {
  try {
    const normalized = normalizeComponent(component);
    if (!normalized) {
      throw new Error('Failed to normalize component');
    }
    
    // Get current user components
    const userComponents = loadUserComponents();
    
    // Check for existing component with same ID
    const existingIndex = userComponents.findIndex(c => c.id === normalized.id);
    if (existingIndex !== -1) {
      throw new Error(`Component with ID "${normalized.id}" already exists`);
    }
    
    // Add to user components
    const updatedUserComponents = [...userComponents, normalized];
    saveUserComponents(updatedUserComponents);
    
    return normalized;
  } catch (error) {
    console.error('Failed to add component:', error);
    throw error;
  }
}

// Update or insert component (for ComponentDrawer)
export function upsertComponent(component: DsComponent): DsComponent {
  try {
    const normalized = normalizeComponent(component);
    if (!normalized) {
      throw new Error('Failed to normalize component');
    }
    
    // Get current user components
    const userComponents = loadUserComponents();
    
    // Check if component exists
    const existingIndex = userComponents.findIndex(c => c.id === normalized.id);
    
    let updatedUserComponents: DsComponent[];
    if (existingIndex !== -1) {
      // Update existing component
      updatedUserComponents = [...userComponents];
      updatedUserComponents[existingIndex] = normalized;
    } else {
      // Insert new component
      updatedUserComponents = [...userComponents, normalized];
    }
    
    saveUserComponents(updatedUserComponents);
    
    return normalized;
  } catch (error) {
    console.error('Failed to upsert component:', error);
    throw error;
  }
}

// Merge catalog data (for releases)
export function mergeCatalog(catalogs: DsComponent[][]): DsComponent[] {
  try {
    const merged: DsComponent[] = [];
    const seenIds = new Set<string>();
    
    // Merge all catalogs, with later ones taking precedence
    for (const catalog of catalogs) {
      const normalizedCatalog = normalizeCatalog(catalog);
      
      for (const component of normalizedCatalog) {
        if (!seenIds.has(component.id)) {
          merged.push(component);
          seenIds.add(component.id);
        } else {
          // Replace existing component with same ID (later catalog takes precedence)
          const existingIndex = merged.findIndex(c => c.id === component.id);
          if (existingIndex !== -1) {
            merged[existingIndex] = component;
          }
        }
      }
    }
    
    return merged;
  } catch (error) {
    console.warn('Failed to merge catalogs:', error);
    return [];
  }
}

// Get component by ID with normalization
export function getComponentById(id: string): DsComponent | null {
  try {
    const allComponents = getAllComponents();
    return allComponents.find(c => c.id === id) || null;
  } catch (error) {
    console.warn('Failed to get component by ID:', error);
    return null;
  }
}

// Validation utilities
export function validateComponent(component: any): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!component || typeof component !== 'object') {
    return { isValid: false, issues: ['Component must be an object'] };
  }
  
  if (!component.id || typeof component.id !== 'string') {
    issues.push('Missing or invalid id');
  }
  
  if (!component.name || typeof component.name !== 'string') {
    issues.push('Missing or invalid name');
  }
  
  if (!Array.isArray(component.tags)) {
    issues.push('tags must be an array');
  }
  
  if (!Array.isArray(component.dependencies) && !Array.isArray(component.deps)) {
    issues.push('dependencies must be an array');
  }
  
  if (typeof component.notes !== 'string') {
    issues.push('notes must be a string');
  }
  
  if (component.propsSpec && !Array.isArray(component.propsSpec)) {
    issues.push('propsSpec must be an array');
  }
  
  const validLevels = ['atom', 'molecule', 'organism'];
  if (!validLevels.includes(component.level)) {
    issues.push(`level must be one of: ${validLevels.join(', ')}`);
  }
  
  const validStatuses = ['draft', 'ready'];
  if (!validStatuses.includes(component.status)) {
    issues.push(`status must be one of: ${validStatuses.join(', ')}`);
  }
  
  return { isValid: issues.length === 0, issues };
}

// Diagnostic utilities
export function findMalformedComponents(): Array<{ index: number; id: string; issues: string[] }> {
  try {
    const allRaw = [
      ...JSON.parse(localStorage.getItem('adsm:catalog:builtins') || '[]'),
      ...JSON.parse(localStorage.getItem('adsm:userComponents:v1') || '[]'),
      ...JSON.parse(localStorage.getItem('adsm:userComponents') || '[]')
    ];
    
    return allRaw.map((component, index) => {
      const validation = validateComponent(component);
      return {
        index,
        id: component?.id || `unknown-${index}`,
        issues: validation.issues
      };
    }).filter(result => result.issues.length > 0);
  } catch (error) {
    return [{ index: -1, id: 'storage-error', issues: ['Failed to read component storage'] }];
  }
}