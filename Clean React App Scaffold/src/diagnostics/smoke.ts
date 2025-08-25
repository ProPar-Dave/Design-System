import { hasComponentsForCatalog } from '../components/registry';
import { loadTokens } from '../../utils/tokenUtils';
import { supabaseHealth } from '../lib/supabaseClient';

// Call from Diagnostics page (or App in dev only)
export function runSmoke() {
  const results: Array<{ name: string; ok: boolean; note?: string }> = [];

  // Registry
  const okRegistry = hasComponentsForCatalog();
  results.push({ name: 'registry.hasComponentsForCatalog', ok: okRegistry, note: okRegistry ? '' : 'Missing required components' });

  // Tokens
  const tokens = loadTokens();
  results.push({ name: 'tokens.editable', ok: tokens !== null });

  // Supabase (never fail the suite)
  const sb = supabaseHealth();
  results.push({ name: 'supabase.configured', ok: sb.configured, note: sb.message });

  return results;
}