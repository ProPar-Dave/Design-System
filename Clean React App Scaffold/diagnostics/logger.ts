// diagnostics/logger.ts
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type EventName =
  | 'app/boot'
  | 'theme/change'
  | 'route/change'
  | 'drawer/open'
  | 'drawer/close'
  | 'catalog/import'
  | 'catalog/export'
  | 'audit/run'
  | 'perf/measure';

export interface LogEvent<T = Record<string, unknown>> {
  ts: number;                // epoch ms
  level: LogLevel;
  name: EventName;
  data?: T;
}

type Sink = (e: LogEvent) => void;

const LS_KEY = 'adsm:logs:ring';
const RING_SIZE = 1000; // keep it light
let sinks: Sink[] = [];

function consoleSink(e: LogEvent) { /* eslint-disable no-console */
  const tag = `[${e.level.toUpperCase()}] ${e.name}`;
  if (e.level === 'error') console.error(tag, e.data); else
  if (e.level === 'warn') console.warn(tag, e.data); else
  if (e.level === 'debug') console.debug(tag, e.data); else
    console.info(tag, e.data);
}

function localStorageSink(e: LogEvent) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const buf: LogEvent[] = raw ? JSON.parse(raw) : [];
    buf.push(e);
    if (buf.length > RING_SIZE) buf.splice(0, buf.length - RING_SIZE);
    localStorage.setItem(LS_KEY, JSON.stringify(buf));
  } catch {
    // Silent fail for localStorage issues (quota exceeded, private mode, etc.)
  }
}

export function configureLogger({ enableConsole = true, enableLocal = true } = {}) {
  sinks = [];
  if (enableConsole) sinks.push(consoleSink);
  if (enableLocal) sinks.push(localStorageSink);
}

export function logEvent<T = Record<string, unknown>>(level: LogLevel, name: EventName, data?: T) {
  const e: LogEvent = { ts: Date.now(), level, name, data };
  for (const s of sinks) {
    try {
      s(e);
    } catch (error) {
      // Prevent sink failures from breaking the app
      console.warn('Logger sink failed:', error);
    }
  }
}

export function logGauge(name: string, value: number, meta?: Record<string, unknown>) {
  logEvent('info', 'perf/measure', { metric: name, value, ...meta });
}

export function startTimer(name: string) {
  const t0 = performance.now();
  return () => { 
    logGauge(name, performance.now() - t0); 
  };
}

export function getLogBuffer(): LogEvent[] {
  try { 
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); 
  } catch { 
    return []; 
  }
}

export function clearLogBuffer() { 
  try {
    localStorage.removeItem(LS_KEY); 
  } catch {
    // Silent fail for localStorage issues
  }
}

// Development/production mode detection
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || 
         location.hostname === 'localhost' || 
         location.hostname === '127.0.0.1' ||
         location.port !== '' ||
         location.protocol === 'file:';
}

// Safe logging wrapper that respects environment
export function safeLogEvent<T = Record<string, unknown>>(
  level: LogLevel, 
  name: EventName, 
  data?: T
) {
  // In production, only log warnings and errors to reduce noise
  if (!isDevelopment() && level === 'debug') {
    return;
  }
  
  logEvent(level, name, data);
}

// Default logger object for easier importing
export const logger = {
  debug: (name: EventName, data?: any) => safeLogEvent('debug', name, data),
  info: (name: EventName, data?: any) => safeLogEvent('info', name, data),
  warn: (name: EventName, data?: any) => safeLogEvent('warn', name, data),
  error: (name: EventName, data?: any) => safeLogEvent('error', name, data),
  gauge: logGauge,
  timer: startTimer,
  getBuffer: getLogBuffer,
  clearBuffer: clearLogBuffer,
  configure: configureLogger,
  isDev: isDevelopment
};

// Initialize logger with default configuration
configureLogger();