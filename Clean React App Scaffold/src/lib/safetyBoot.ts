import { applyTokens } from './TokenRuntime';

export async function guardedBoot() {
  console.log('[SafetyBoot] Running startup QA checks...');
  
  try {
    const { runSmokeQA } = await import('../qa/smoke');
    const res = await runSmokeQA();
    if (res.pass) {
      console.log('[SafetyBoot] All checks passed ✓');
      return;
    }

    console.warn('[SafetyBoot] QA checks failed, attempting auto-recovery...');
    
    // Try rollback of tokens & catalog
    const kinds = ['tokens', 'catalog'] as const;
    let recoveredAny = false;
    
    for (const kind of kinds) {
      try {
        const { getPublished, latestSnapshot } = await import('./stateSnapshots');
        const id = await getPublished(kind);
        if (!id) {
          console.warn(`[SafetyBoot] No published ${kind} snapshot found`);
          continue;
        }
        
        const snap = await latestSnapshot(kind);
        if (snap?.data) {
          if (kind === 'tokens') {
            applyTokens(snap.data as Record<string, string>);
            console.log(`[SafetyBoot] Restored ${kind} from snapshot ${id}`);
            recoveredAny = true;
          }
          if (kind === 'catalog') {
            // Store in localStorage for catalog system
            localStorage.setItem('adsm:catalog:builtins', JSON.stringify(snap.data));
            console.log(`[SafetyBoot] Restored ${kind} from snapshot ${id}`);
            recoveredAny = true;
          }
        }
      } catch (error) {
        console.error(`[SafetyBoot] Failed to restore ${kind} (likely Supabase not configured):`, error);
      }
    }
    
    if (recoveredAny) {
      console.warn('[SafetyBoot] Auto-restored published snapshots due to smoke test failure.');
      
      // Re-run QA after recovery
      setTimeout(async () => {
        try {
          const recheck = await runSmokeQA();
          if (recheck.pass) {
            console.log('[SafetyBoot] Recovery successful ✓');
          } else {
            console.error('[SafetyBoot] Recovery failed, manual intervention needed');
          }
        } catch (error) {
          console.error('[SafetyBoot] Recovery verification failed:', error);
        }
      }, 1000);
    } else {
      console.error('[SafetyBoot] No recovery options available');
    }
    
  } catch (error) {
    console.error('[SafetyBoot] Safety boot system error:', error);
  }
}

export async function saveGoldenSnapshots(label = 'auto') {
  try {
    const { saveSnapshot, publishSnapshot } = await import('./stateSnapshots');
    const { exportCurrentTokens, exportCurrentRegistry, exportCurrentCatalog } = await import('../qa/smoke');
    
    const [tokensSnap, registrySnap, catalogSnap] = await Promise.all([
      saveSnapshot('tokens', exportCurrentTokens(), label),
      saveSnapshot('registry', exportCurrentRegistry(), label),
      saveSnapshot('catalog', exportCurrentCatalog(), label)
    ]);
    
    await Promise.all([
      publishSnapshot('tokens', tokensSnap.id),
      publishSnapshot('registry', registrySnap.id),
      publishSnapshot('catalog', catalogSnap.id)
    ]);
    
    console.log(`[SafetyBoot] Golden snapshots saved with label: ${label}`);
    return { tokensSnap, registrySnap, catalogSnap };
  } catch (error) {
    console.warn('[SafetyBoot] Failed to save golden snapshots (likely Supabase not configured):', error);
    // Return mock data instead of throwing
    return {
      tokensSnap: { id: 'local-tokens', kind: 'tokens' as const, data: {}, label },
      registrySnap: { id: 'local-registry', kind: 'registry' as const, data: [], label },
      catalogSnap: { id: 'local-catalog', kind: 'catalog' as const, data: [], label }
    };
  }
}