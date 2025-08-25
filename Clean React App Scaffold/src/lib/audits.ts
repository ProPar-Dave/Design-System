import { supabase, isSupabaseConfigured } from './supabaseClient';

export type QAItem = { name: string; ok: boolean; note?: string };

export async function recordAudit(scope: string, status: 'pass'|'fail', summary: QAItem[], appVersion?: string) {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[Audits] Supabase not configured - audit recording disabled');
    return;
  }
  
  try {
    await supabase.from('audits').insert({ scope, status, summary, app_version: appVersion ?? '' });
  } catch (error) {
    console.error('[Audits] Failed to record audit:', error);
  }
}

export async function getLatestAudits(scope?: string, limit = 10) {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[Audits] Supabase not configured - returning empty audit history');
    return [];
  }
  
  try {
    let query = supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (scope) {
      query = query.eq('scope', scope);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('[Audits] Failed to fetch audit history:', error);
    return [];
  }
}

export async function getAuditHistory(scope: string, days = 7) {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('[Audits] Supabase not configured - returning empty audit history');
    return [];
  }
  
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('scope', scope)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn('[Audits] Failed to fetch audit history:', error);
    return [];
  }
}