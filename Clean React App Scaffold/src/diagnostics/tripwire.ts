import { registry } from "../components/registry";

/**
 * Run at boot in dev only. It logs non-fatal warnings if:
 * - Catalog items reference IDs missing from the registry
 * - Registry entries point to files that fail dynamic import
 */
export async function runTripwire(catalogIds: string[]) {
  const isDevMode = /\bdebug(=1|=true)?\b/i.test(window.location.search) || 
                   window.location.hash.includes('debug') || 
                   (!window.location.href.includes('vercel.app') && !window.location.href.includes('netlify.app'));
  
  if (!isDevMode) return;

  // Missing in registry
  const missing = catalogIds.filter((id) => !registry[id]);
  if (missing.length) {
    // One clear warning + structured payload for quick copy/paste
    // to prompt your code assistant if needed.
    console.warn("[Tripwire] Missing registry entries:", missing);
    console.warn("[Tripwire] Add these entries to src/components/registry.tsx:");
    missing.forEach(id => {
      console.warn(`"${id}": {
  id: "${id}",
  name: "${id.replace(/^(atom|molecule|organism)-/, '').replace(/-/g, ' ')}",
  level: "${id.split('-')[0] as 'atom' | 'molecule' | 'organism'}",
  loadPreview: () => Promise.resolve({ default: MissingPreview }),
},`);
    });
  }

  // Smoke-test the loader contracts (don't block boot)
  const probe = Object.values(registry)
    .slice(0, 3) // keep it cheap
    .map((m) =>
      m
        .loadPreview()
        .then(() => ({ id: m.id, ok: true }))
        .catch((error) => ({ id: m.id, ok: false, error: error.message }))
    );

  try {
    const results = await Promise.all(probe);
    const broken = results.filter((r) => !r.ok);
    if (broken.length) {
      console.warn("[Tripwire] Broken preview loaders:", broken);
    }
  } catch {
    /* noop */
  }

  // Check for registry health
  const registryIds = Object.keys(registry);
  console.log(`[Tripwire] Registry health: ${registryIds.length} entries, ${missing.length} missing from catalog`);
  
  // Validate schema contracts
  const schemaChecks = Object.values(registry)
    .filter(meta => meta.loadPropsSchema)
    .slice(0, 2) // sample a few
    .map(async (meta) => {
      try {
        const schema = await meta.loadPropsSchema!();
        return { 
          id: meta.id, 
          ok: schema && (Array.isArray(schema.fields) || typeof schema === 'object'),
          schema 
        };
      } catch (error) {
        return { id: meta.id, ok: false, error: (error as Error).message };
      }
    });

  try {
    const schemaResults = await Promise.all(schemaChecks);
    const brokenSchemas = schemaResults.filter(r => !r.ok);
    if (brokenSchemas.length) {
      console.warn("[Tripwire] Broken schema loaders:", brokenSchemas);
    }
  } catch {
    /* noop */
  }
}