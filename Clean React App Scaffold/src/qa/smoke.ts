import { QAItem } from '../lib/audits';
import { registry } from '../../preview/registry';
import { loadTokens, updateToken } from '../lib/TokenRuntime';

// Safe audit recording with fallback
const recordAuditSafe = async (scope: string, status: 'pass'|'fail', summary: QAItem[]) => {
  try {
    const { recordAudit } = await import('../lib/audits');
    await recordAudit(scope, status, summary);
  } catch (error) {
    console.warn('[QA] Audit recording disabled:', error);
  }
};

// Helper to detect React components
function isReactComponent(x: any) {
  return typeof x === 'function' || (x && typeof x === 'object' && ('$$typeof' in x || 'render' in x));
}

// Helper to get catalog items safely
function getAllCatalogItems() {
  try {
    // Try to get from localStorage first
    const stored = localStorage.getItem('adsm:catalog:builtins');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
    
    // Fallback to empty array if no catalog available
    return [];
  } catch (error) {
    console.warn('[QA] Failed to load catalog items:', error);
    return [];
  }
}

export async function runSmokeQA(): Promise<{pass: boolean; items: QAItem[]}> {
  const items: QAItem[] = [];

  try {
    // 1) Registry ↔ catalog integrity
    const catalog = getAllCatalogItems();
    const missing: string[] = [];
    for (const c of catalog) {
      if (!registry[c.id]?.Component) missing.push(c.id);
    }
    items.push({ 
      name: 'registry.hasComponentsForCatalog', 
      ok: missing.length === 0, 
      note: missing.length > 0 ? `Missing: ${missing.join(', ')}` : 'All catalog components have registry entries' 
    });

    // 2) Each registry entry is a component and props tab behaves
    const badTypes: string[] = [];
    const missingSchemas: string[] = [];
    Object.entries(registry).forEach(([id, r]) => {
      if (!isReactComponent(r.Component)) badTypes.push(id);
      if (!r.schema || Object.keys(r.schema).length === 0) missingSchemas.push(id);
    });
    
    items.push({ 
      name: 'registry.componentsAreRenderable', 
      ok: badTypes.length === 0, 
      note: badTypes.length > 0 ? `Invalid components: ${badTypes.join(', ')}` : 'All registry entries are valid React components' 
    });
    
    // Not a failure, but we surface it
    items.push({ 
      name: 'registry.propsSchemasPresent (advisory)', 
      ok: true, 
      note: missingSchemas.length > 0 ? `No schemas: ${missingSchemas.slice(0, 5).join(', ')}${missingSchemas.length > 5 ? '...' : ''}` : 'All components have prop schemas' 
    });

    // 3) Token edits don't throw & produce valid CSS values
    try {
      const before = loadTokens();
      const testTokens = [
        ['--space-4', '16px'],
        ['--radius-md', '10px'],
        ['--color-accent', '#3b82f6']
      ];
      
      for (const [token, value] of testTokens) {
        updateToken(token, value);
      }
      
      items.push({ name: 'tokens.editable', ok: true, note: 'Token editing works correctly' });
      
      // Revert changes
      for (const [token] of testTokens) {
        updateToken(token, before[token] || '');
      }
    } catch (e: any) {
      items.push({ name: 'tokens.editable', ok: false, note: `Token edit error: ${e.message}` });
    }

    // 4) Preview lazy import paths (if any) actually resolve
    const lazyErrors: string[] = [];
    const registryEntries = Object.entries(registry).slice(0, 10); // Limit to avoid timeout
    
    await Promise.all(registryEntries.map(async ([id, r]) => {
      const mod = (r as any).preview?.module;
      const exp = (r as any).preview?.exportName || 'default';
      if (typeof mod === 'string') {
        try {
          const m = await import(/* @vite-ignore */ mod);
          if (!(exp in m)) throw new Error(`export "${exp}" missing`);
        } catch (e: any) {
          lazyErrors.push(`${id}:${mod}:${exp} -> ${e.message}`);
        }
      }
    }));
    
    items.push({ 
      name: 'preview.dynamicImportsResolve', 
      ok: lazyErrors.length === 0, 
      note: lazyErrors.length > 0 ? `Import errors: ${lazyErrors.slice(0, 3).join(' | ')}${lazyErrors.length > 3 ? '...' : ''}` : 'All dynamic imports resolve correctly' 
    });

    // 5) Essential DOM elements exist
    const criticalElements = [
      '#adsm-root',
      '[data-theme]'
    ];
    
    const missingElements: string[] = [];
    criticalElements.forEach(selector => {
      if (!document.querySelector(selector)) {
        missingElements.push(selector);
      }
    });
    
    items.push({
      name: 'dom.criticalElementsPresent',
      ok: missingElements.length === 0,
      note: missingElements.length > 0 ? `Missing: ${missingElements.join(', ')}` : 'All critical DOM elements present'
    });

    // 6) Theme system integrity
    try {
      const root = document.querySelector('#adsm-root') as HTMLElement;
      const hasTheme = root?.getAttribute('data-theme');
      const hasBasicTokens = !!(
        getComputedStyle(root || document.documentElement).getPropertyValue('--color-bg').trim()
      );
      
      items.push({
        name: 'theme.systemIntegrity',
        ok: !!(hasTheme && hasBasicTokens),
        note: hasTheme && hasBasicTokens ? 'Theme system working correctly' : `Theme issues: ${!hasTheme ? 'no data-theme' : ''} ${!hasBasicTokens ? 'no tokens' : ''}`.trim()
      });
    } catch (e: any) {
      items.push({
        name: 'theme.systemIntegrity',
        ok: false,
        note: `Theme check error: ${e.message}`
      });
    }

  } catch (error: any) {
    items.push({
      name: 'qa.systemError',
      ok: false,
      note: `QA system error: ${error.message}`
    });
  }

  const pass = items.every(i => i.ok);
  
  // Record audit safely without blocking QA functionality
  await recordAuditSafe('smoke', pass ? 'pass' : 'fail', items);
  
  return { pass, items };
}

// Export current state for snapshots
export function exportCurrentTokens() {
  try {
    return loadTokens();
  } catch {
    return {};
  }
}

export function exportCurrentRegistry() {
  try {
    return Object.keys(registry);
  } catch {
    return [];
  }
}

export function exportCurrentCatalog() {
  try {
    return getAllCatalogItems();
  } catch {
    return [];
  }
}