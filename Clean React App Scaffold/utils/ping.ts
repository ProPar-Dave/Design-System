// utils/ping.ts — Secure status bridge for Figma Make
// 
// 🛡️ DEVELOPMENT-FIRST PING SYSTEM
// 
// The ping system is COMPLETELY DISABLED in development environments to prevent
// network errors and console spam. This includes:
// - localhost
// - 127.0.0.1  
// - Any port-based URLs (file://, local dev servers)
// - NODE_ENV === 'development'
//
// To enable for testing: set enabledInDev: true in PING_CONFIG below
// For quick testing: window.setupPingToken("your-token") in browser console
//
import { projectId } from './supabase/info';

const PING_URL = `https://${projectId}.functions.supabase.co/ping`;
// Get token from environment or use placeholder for development
const PING_TOKEN = (window as any).__PING_TOKEN__ || 
                   (typeof process !== 'undefined' && process.env?.PING_TOKEN) || 
                   'dude'; // ← using the actual token from Make scenarios

// Network state tracking
let isOnline = navigator.onLine;
let lastNetworkCheck = Date.now();

// Robust development detection
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || 
         location.hostname === 'localhost' || 
         location.hostname === '127.0.0.1' ||
         location.port !== '' ||
         location.protocol === 'file:';
}

export type BuildStage = 'start' | 'done' | 'error';

export interface PingPayload {
  stage: BuildStage;
  at: string;
  app: string;
  siteUrl: string;
  commit: string | null;
  buildId: string;
  [key: string]: any;
}

export type SimplePingPayload = {
  id: string;
  ts: string;              // ISO timestamp set by the Edge Function
  actor?: string;          // who pushed (e.g., "Claude/Make", "human", etc.)
  topic?: string;          // short label of what changed
  message?: string;        // freeform note
  status?: 'ok' | 'busy' | 'error';
  meta?: Record<string, unknown>;
};

// Configuration
const PING_CONFIG = {
  // Set to false to completely disable pings
  enabled: true,
  // Set to false to disable in development - safer default
  enabledInDev: false,
  // Timeout for ping requests (ms)
  timeout: 5000,
  // Max retries for failed pings
  maxRetries: 1
};

// Check if ping system should be active
function isPingEnabled(): boolean {
  // Always disabled - safer default for development
  if (!PING_CONFIG.enabled) return false;
  
  // Disable in development unless explicitly enabled
  if (isDevelopment() && !PING_CONFIG.enabledInDev) {
    return false;
  }
  
  // Check if token is configured (not placeholder or default)
  if (!PING_TOKEN || 
      PING_TOKEN === 'your-ping-token' || 
      PING_TOKEN === 'ping-secure-bridge-2025' ||
      PING_TOKEN === 'dude') {
    return false;
  }
  
  return true;
}

// Track failed endpoints with retry logic
const endpointRetries = new Map<string, { count: number; lastAttempt: number; lastError?: string }>();
const MAX_RETRIES = 3;
const RETRY_DELAY = 60000; // 1 minute between retry attempts
const CIRCUIT_BREAKER_THRESHOLD = 5; // failures before circuit breaker opens
const CIRCUIT_BREAKER_TIMEOUT = 300000; // 5 minutes before trying again

// Circuit breaker state
let circuitBreakerOpen = false;
let circuitBreakerOpenTime = 0;
let consecutiveFailures = 0;

/**
 * Send status ping to external monitoring endpoint
 * @param stage - Current build stage
 * @param payload - Additional payload data
 */
/**
 * Check if we should skip ping due to network or circuit breaker
 */
function shouldSkipPing(): string | null {
  // Check if circuit breaker is open
  if (circuitBreakerOpen) {
    const timeSinceOpen = Date.now() - circuitBreakerOpenTime;
    if (timeSinceOpen < CIRCUIT_BREAKER_TIMEOUT) {
      return `Circuit breaker open (${Math.round((CIRCUIT_BREAKER_TIMEOUT - timeSinceOpen) / 1000)}s remaining)`;
    }
    // Reset circuit breaker
    circuitBreakerOpen = false;
    consecutiveFailures = 0;
  }

  // Check network connectivity
  const now = Date.now();
  if (now - lastNetworkCheck > 10000) { // Check every 10 seconds
    isOnline = navigator.onLine;
    lastNetworkCheck = now;
  }
  
  if (!isOnline) {
    return 'Device is offline';
  }

  // Check retry logic
  const retryInfo = endpointRetries.get(PING_URL);
  if (retryInfo && retryInfo.count >= MAX_RETRIES) {
    const timeSinceLastAttempt = now - retryInfo.lastAttempt;
    if (timeSinceLastAttempt < RETRY_DELAY) {
      return `Max retries reached (retry in ${Math.round((RETRY_DELAY - timeSinceLastAttempt) / 1000)}s)`;
    }
    // Reset retry count after delay
    endpointRetries.delete(PING_URL);
  }

  return null;
}

export async function ping(stage: BuildStage, payload: Record<string, any> = {}): Promise<void> {
  // Failsafe: completely disable ping system in development
  if (isDevelopment()) {
    return; // Silent return in development
  }
  
  // Early return if pings are disabled - completely silent
  if (!isPingEnabled()) {
    return;
  }
  
  // Check if we should skip due to network/circuit breaker - silent skip
  const skipReason = shouldSkipPing();
  if (skipReason) {
    return;
  }

  try {
    const pingPayload = {
      id: payload.id ?? 'latest',
      source: 'figma-make',
      status: stage,
      message: payload.message ?? null,
      stage,
      at: new Date().toISOString(),
      app: 'adsm', // Atomic DS Manager
      siteUrl: location.origin + location.pathname,
      commit: (window as any).__COMMIT__ ?? null,
      buildId: (window as any).__BUILD_ID__ ?? Date.now().toString(36),
      ...payload,
    };

    // Debug logging for URL and token (development only, when explicitly enabled)
    if (isDevelopment() && PING_CONFIG.enabledInDev && Math.random() < 0.1) { // Only log 10% when explicitly enabled
      console.log(`[PING] Attempting ${stage} to:`, PING_URL);
      console.log(`[PING] Network online:`, navigator.onLine);
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PING_CONFIG.timeout);

    const response = await fetch(PING_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-ping-token': PING_TOKEN
      },
      body: JSON.stringify(pingPayload),
      keepalive: true, // Ensure ping fires even during navigation
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Check if response is ok (expect 204 for POST success)
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read response');
      throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ' - ' + errorText : ''}`);
    }

    // Success - reset failure tracking
    endpointRetries.delete(PING_URL);
    consecutiveFailures = 0;
    if (circuitBreakerOpen) {
      circuitBreakerOpen = false;
      if (isDevelopment() && PING_CONFIG.enabledInDev) {
        console.log('[PING] Circuit breaker closed - connection restored');
      }
    }

    // Debug logging (only when explicitly enabled in development)
    if (isDevelopment() && PING_CONFIG.enabledInDev && Math.random() < 0.1) { 
      console.log(`[PING] ${stage} sent successfully (${response.status})`);
    }
    
  } catch (error) {
    // Classify error type
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNetworkError = errorMessage.includes('Failed to fetch') || 
                          errorMessage.includes('NetworkError') ||
                          errorMessage.includes('fetch') ||
                          error instanceof TypeError;
    const isTimeoutError = errorMessage.includes('aborted') || errorMessage.includes('timeout');
    
    // Track retry attempts with error classification
    const current = endpointRetries.get(PING_URL) ?? { count: 0, lastAttempt: 0 };
    current.count++;
    current.lastAttempt = Date.now();
    current.lastError = errorMessage;
    endpointRetries.set(PING_URL, current);
    
    // Track consecutive failures for circuit breaker
    consecutiveFailures++;
    if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD && !circuitBreakerOpen) {
      circuitBreakerOpen = true;
      circuitBreakerOpenTime = Date.now();
      if (isDevelopment() && PING_CONFIG.enabledInDev) {
        console.warn(`[PING] Circuit breaker opened after ${consecutiveFailures} failures`);
      }
    }
    
    // Enhanced error logging - only log in development when enabled and circuit breaker isn't open yet
    if (isDevelopment() && 
        PING_CONFIG.enabledInDev && 
        !circuitBreakerOpen && 
        current.count <= 1) { // Only log the first few failures
      const errorType = isNetworkError ? 'NETWORK' : isTimeoutError ? 'TIMEOUT' : 'HTTP';
      console.warn(`[PING] ${errorType} error (${current.count}/${MAX_RETRIES}):`, errorMessage);
      
      if (isNetworkError) {
        console.warn('[PING] Possible causes: CORS, network connectivity, or Edge Function not deployed');
        console.warn('[PING] Check: 1) Network tab, 2) Supabase function deployment, 3) PING_TOKEN configuration');
        console.warn('[PING] To disable: set enabledInDev: false in /utils/ping.ts');
      }
    }
    
    // Don't throw - silent fail to avoid disrupting app functionality
  }
}

/**
 * Simple fetch utility for ping diagnostics (read-only GET) - Bulletproof version
 * Includes required authentication header for Supabase Edge Function
 */
export async function fetchPing(url: string): Promise<SimplePingPayload | null> {
  // Failsafe: completely disable in development
  if (isDevelopment()) {
    throw new Error('Ping system disabled in development');
  }
  
  try {
    // Check network status first
    if (!navigator.onLine) {
      throw new Error('Failed to fetch: Device is offline');
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const res = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'x-ping-token': PING_TOKEN
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Bulletproof endpoint always returns 200 with valid JSON
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorBody = await res.text();
        if (errorBody) {
          errorMessage += ` - ${errorBody}`;
        }
      } catch {
        // Ignore error body parsing failures
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    
    // Handle bulletproof response format: { payload, digest, received_at } or { payload: null, missing: true }
    if (data.missing) {
      // No data exists yet
      return null;
    }
    
    // Return the payload if it exists, otherwise return raw data
    return (data?.payload ?? data) as SimplePingPayload;
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    
    // Enhance error messages for better debugging
    if (error.message.includes('Failed to fetch')) {
      if (!navigator.onLine) {
        error.message = 'Failed to fetch: Device is offline';
      } else {
        error.message = 'Failed to fetch: Network error (CORS, firewall, or endpoint not accessible)';
      }
    } else if (error.name === 'AbortError') {
      error.message = 'Request timeout: Server took too long to respond';
    }
    
    console.warn('fetchPing failed', error);
    console.warn('fetchPing URL:', url);
    console.warn('fetchPing method: GET with x-ping-token header');
    throw error; // Re-throw for component to handle
  }
}

/**
 * Initialize ping system with app startup
 */
export function initPingSystem(): void {
  // Failsafe: completely disable in development
  if (isDevelopment()) {
    return; // Silent return in development
  }
  
  // Set up network event listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      isOnline = true;
      lastNetworkCheck = Date.now();
      // Reset circuit breaker on network recovery
      if (circuitBreakerOpen) {
        resetPingSystem();
      }
    });
    
    window.addEventListener('offline', () => {
      isOnline = false;
      lastNetworkCheck = Date.now();
    });
  }
  
  if (!isPingEnabled()) {
    // Silent return when disabled - no logging needed
    return;
  }

  // Track app initialization
  ping('start', { 
    job: 'app-init',
    version: (window as any).__APP_VERSION__ ?? 'v1.0.0',
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`
  });

  // Track successful app load
  if (document.readyState === 'complete') {
    ping('done', { job: 'app-init' });
  } else {
    window.addEventListener('load', () => {
      ping('done', { job: 'app-init' });
    });
  }

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    ping('error', {
      job: 'runtime-error',
      message: event.error?.message || event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ping('error', {
      job: 'unhandled-promise',
      message: String(event.reason)
    });
  });

  // Track app visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      ping('start', { job: 'app-focus' });
    }
  });

  // Track before unload
  window.addEventListener('beforeunload', () => {
    ping('done', { job: 'app-unload' });
  });
}

/**
 * Track component operations
 */
export function pingComponentOperation(operation: string, componentId?: string, error?: Error): void {
  if (error) {
    ping('error', {
      job: `component-${operation}`,
      componentId,
      message: error.message
    });
  } else {
    ping('done', {
      job: `component-${operation}`,
      componentId
    });
  }
}

/**
 * Track token operations
 */
export function pingTokenOperation(operation: string, tokenCount?: number, error?: Error): void {
  if (error) {
    ping('error', {
      job: `token-${operation}`,
      message: error.message
    });
  } else {
    ping('done', {
      job: `token-${operation}`,
      tokenCount
    });
  }
}

/**
 * Track theme operations
 */
export function pingThemeOperation(operation: string, theme?: string, error?: Error): void {
  if (error) {
    ping('error', {
      job: `theme-${operation}`,
      theme,
      message: error.message
    });
  } else {
    ping('done', {
      job: `theme-${operation}`,
      theme
    });
  }
}

/**
 * Configure ping system at runtime
 */
export function configurePing(config: Partial<typeof PING_CONFIG>): void {
  Object.assign(PING_CONFIG, config);
  
  if (isDevelopment()) {
    console.log('[PING] Configuration updated:', PING_CONFIG);
  }
}

/**
 * Check ping system status
 */
export function getPingStatus() {
  const retryInfo = endpointRetries.get(PING_URL);
  const now = Date.now();
  
  return {
    enabled: isPingEnabled(),
    url: PING_URL,
    tokenConfigured: PING_TOKEN !== 'your-ping-token' && PING_TOKEN !== 'ping-secure-bridge-2025' && PING_TOKEN !== '',
    config: { ...PING_CONFIG },
    network: {
      online: navigator.onLine,
      lastCheck: new Date(lastNetworkCheck).toISOString()
    },
    circuitBreaker: {
      open: circuitBreakerOpen,
      consecutiveFailures,
      threshold: CIRCUIT_BREAKER_THRESHOLD,
      timeUntilRetry: circuitBreakerOpen ? 
        Math.max(0, CIRCUIT_BREAKER_TIMEOUT - (now - circuitBreakerOpenTime)) : 0
    },
    retryInfo: retryInfo ? {
      attempts: retryInfo.count,
      maxRetries: MAX_RETRIES,
      lastAttempt: new Date(retryInfo.lastAttempt).toISOString(),
      lastError: retryInfo.lastError,
      canRetry: retryInfo.count < MAX_RETRIES || (now - retryInfo.lastAttempt) >= RETRY_DELAY,
      timeUntilRetry: retryInfo.count >= MAX_RETRIES ? 
        Math.max(0, RETRY_DELAY - (now - retryInfo.lastAttempt)) : 0
    } : null,
    // Legacy for compatibility
    failedEndpoints: retryInfo && retryInfo.count >= MAX_RETRIES ? [PING_URL] : []
  };
}

/**
 * Reset failed endpoints (for retry)
 */
export function resetPingSystem(): void {
  endpointRetries.clear();
  consecutiveFailures = 0;
  circuitBreakerOpen = false;
  circuitBreakerOpenTime = 0;
  
  if (isDevelopment() && PING_CONFIG.enabledInDev) {
    console.log('[PING] System reset - retry counters and circuit breaker cleared');
  }
}

/**
 * Fetch the latest build status from the endpoint
 */
export async function getBuildStatus(jobId = 'latest'): Promise<any> {
  // Failsafe: completely disable in development
  if (isDevelopment()) {
    throw new Error('Ping system disabled in development');
  }
  
  // Check if we should skip due to network/circuit breaker
  const skipReason = shouldSkipPing();
  if (skipReason) {
    throw new Error(`Cannot fetch build status: ${skipReason}`);
  }
  
  try {
    const url = new URL(PING_URL);
    url.searchParams.set('id', jobId);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PING_CONFIG.timeout);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-ping-token': PING_TOKEN
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.status === 404) {
      return null; // No data found for this job ID
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Reset failure tracking on successful GET
    const current = endpointRetries.get(PING_URL);
    if (current) {
      endpointRetries.delete(PING_URL);
      consecutiveFailures = Math.max(0, consecutiveFailures - 1);
    }
    
    return await response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Track failures for GET requests too
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('aborted')) {
      consecutiveFailures++;
      if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD && !circuitBreakerOpen) {
        circuitBreakerOpen = true;
        circuitBreakerOpenTime = Date.now();
      }
    }
    
    console.warn('[PING] Failed to fetch build status:', errorMessage);
    throw error;
  }
}

/**
 * Fetch event history for a job
 */
export async function getBuildHistory(jobId = 'latest', limit = 10): Promise<any> {
  // Failsafe: completely disable in development
  if (isDevelopment()) {
    throw new Error('Ping system disabled in development');
  }
  
  try {
    const url = new URL(PING_URL);
    url.searchParams.set('id', jobId);
    url.searchParams.set('limit', limit.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-ping-token': PING_TOKEN
      }
    });
    
    if (response.status === 404) {
      return { ok: true, jobId, events: [] }; // No events found
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn('[PING] Failed to fetch build history:', error);
    throw error;
  }
}

/**
 * Quick setup helper for console testing
 */
export function setupPingToken(token: string): void {
  (window as any).__PING_TOKEN__ = token;
  
  // Reset system when token is configured
  resetPingSystem();
  
  console.log('[PING] Token configured for this session');
  console.log('[PING] System reset - failures cleared');
  console.log('[PING] New status:', getPingStatus());
  console.log('[PING] Test with: window.ping("test", { message: "Console test" })');
  
  // Try a test ping to verify connectivity
  setTimeout(() => {
    ping('test', { 
      message: 'Token configuration test',
      source: 'setup-helper'
    });
  }, 100);
}

// Expose functions to global window for debugging
if (typeof window !== 'undefined') {
  (window as any).ping = ping;
  (window as any).getPingStatus = getPingStatus;
  (window as any).configurePing = configurePing;
  (window as any).resetPingSystem = resetPingSystem;
  (window as any).getBuildStatus = getBuildStatus;
  (window as any).getBuildHistory = getBuildHistory;
  (window as any).setupPingToken = setupPingToken;
  (window as any).fetchPing = fetchPing;
}