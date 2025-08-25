// src/diagnostics/systemChecks.ts
import { supabaseConfigured } from '../lib/supabaseClient';

export function runtimeTripwire(): string[] {
  const warnings: string[] = [];

  // Only warn about Supabase if it's expected to be configured
  const auditsEnabled = supabaseConfigured;
  if (!auditsEnabled) {
    // Only log this as info, not a warning, since local-only mode is valid
    console.info("[Audits] Supabase not configured – audit recording disabled (local mode OK)");
  }

  // Check for other potential issues
  const root = document.documentElement;
  const theme = root.dataset.theme;
  if (!theme) {
    warnings.push('Theme not applied - check theme manager initialization.');
  }

  const hasNamespace = document.getElementById('adsm-root')?.classList.contains('adsm-ui');
  if (!hasNamespace) {
    warnings.push('App namespace missing - check AppFrame component.');
  }

  return warnings;
}

export function getSystemStatus() {
  const warnings = runtimeTripwire();
  
  return {
    healthy: warnings.length === 0,
    warnings,
    supabaseMode: supabaseConfigured ? 'connected' : 'local-only',
    timestamp: new Date().toISOString(),
    environment: window.location.href.includes('vercel.app') || window.location.href.includes('netlify.app') 
      ? 'production' 
      : 'development'
  };
}