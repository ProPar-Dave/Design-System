import { supabase, isSupabaseConfigured } from './supabaseClient';

export type SnapshotKind = 'tokens'|'catalog'|'registry'|'app_state';

export async function saveSnapshot(kind: SnapshotKind, data: unknown, label?: string) {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[Snapshots] Supabase not configured - snapshots disabled');
    return { id: 'local-' + Date.now(), kind, data, label, created_at: new Date().toISOString() };
  }
  
  try {
    const { data: row, error } = await supabase
      .from('snapshots')
      .insert({ kind, data, label })
      .select()
      .single();
    if (error) throw error;
    return row;
  } catch (error) {
    console.warn('[Snapshots] Failed to save snapshot:', error);
    return { id: 'local-' + Date.now(), kind, data, label, created_at: new Date().toISOString() };
  }
}

export async function latestSnapshot(kind: SnapshotKind) {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('snapshots')
    .select('*')
    .eq('kind', kind)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

export async function publishSnapshot(kind: SnapshotKind, snapshot_id: string) {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[Snapshots] Supabase not configured - publish disabled');
    return;
  }
  
  try {
    const { error } = await supabase
      .from('published_state')
      .upsert({ kind, snapshot_id, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (error) {
    console.warn('[Snapshots] Failed to publish snapshot:', error);
  }
}

export async function getPublished(kind: SnapshotKind) {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('published_state')
    .select('snapshot_id')
    .eq('kind', kind)
    .single();
  if (error) return null;
  return data?.snapshot_id as string | null;
}