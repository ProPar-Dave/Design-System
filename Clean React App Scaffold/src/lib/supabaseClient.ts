// src/lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Construct Supabase URL from project ID
const URL = `https://${projectId}.supabase.co`;
const KEY = publicAnonKey;

export const supabaseConfigured = Boolean(URL && KEY && projectId && KEY.length > 10);

let client: SupabaseClient | null = null;
if (supabaseConfigured) {
  try {
    client = createClient(URL, KEY, {
      auth: { persistSession: false },
    });
  } catch (error) {
    console.warn('[Supabase] Failed to create client:', error);
    client = null;
  }
}

export const supabase = client;

/** Non-blocking health check used by Diagnostics */
export function supabaseHealth() {
  // Return structured info but never throw — diagnostics will display a warning
  return {
    configured: supabaseConfigured,
    urlPresent: Boolean(URL),
    keyPresent: Boolean(KEY),
    projectId: projectId || 'not set',
    message: supabaseConfigured ? 'Supabase configured' : 'Supabase not configured (audits disabled)'
  };
}

// Legacy exports for compatibility
export function isSupabaseConfigured() {
  return supabaseConfigured;
}

export function getSupabase(): SupabaseClient | null {
  return client;
}

export function getSupabaseConfigStatus() {
  return {
    configured: supabaseConfigured,
    url: URL || 'not set',
    projectId: projectId || 'not set',
    hasValidKey: Boolean(KEY && KEY.length > 10),
    mode: supabaseConfigured ? 'connected' : 'local-only'
  };
}