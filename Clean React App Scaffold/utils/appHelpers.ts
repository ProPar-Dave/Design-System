// utils/appHelpers.ts
import { parseHash } from './router';
import { saveCurrentRoute } from './catalog';
import { getAppVersion } from '../diagnostics/utils';
import { safeLogEvent } from '../diagnostics/logger';
import { ping, pingThemeOperation, pingTokenOperation, initPingSystem } from './ping';
import { devWarn } from '../src/utils/log';

// Development detection - same logic as ping.ts to ensure consistency
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || 
         location.hostname === 'localhost' || 
         location.hostname === '127.0.0.1' ||
         location.port !== '' ||
         location.protocol === 'file:';
}

// Safe ping wrapper that prevents calls in development
export function safePing(stage: any, payload?: any): Promise<void> {
  if (isDevelopment()) {
    return Promise.resolve(); // Silent return in development
  }
  return ping(stage, payload).catch(() => {}); // Ignore all ping failures
}

// Safe ping operation wrappers
export function safePingThemeOperation(operation: string, theme?: string, error?: Error): void {
  if (isDevelopment()) return;
  pingThemeOperation(operation, theme, error);
}

export function safePingTokenOperation(operation: string, tokenCount?: number, error?: Error): void {
  if (isDevelopment()) return;
  pingTokenOperation(operation, tokenCount, error);
}

export function safeInitPingSystem(): void {
  if (isDevelopment()) return;
  try {
    initPingSystem();
  } catch (error) {
    // Ping system initialization failed - continue without it
    devWarn('Ping system initialization failed:', error);
  }
}

// Screen reader announcement utility
export function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.style.cssText = `
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  `;
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Get page title for announcements
export function getPageTitle(path: string): string {
  const titles: Record<string, string> = {
    '/': 'Overview',
    '/guidelines': 'Guidelines',
    '/tokens': 'Tokens',
    '/components': 'Components',
    '/releases': 'Releases',
    '/diagnostics': 'Diagnostics',
    '/alert-demo': 'Alert Demo'
  };
  
  if (path.startsWith('/components/')) {
    return `Component: ${path.slice('/components/'.length)}`;
  }
  
  return titles[path] || 'Page';
}

// Navigation links data for consistency
export const navLinks = [
  { href: "#/", label: "Overview", path: "/" },
  { href: "#/guidelines", label: "Guidelines", path: "/guidelines" },
  { href: "#/tokens", label: "Tokens", path: "/tokens" },
  { href: "#/components", label: "Components", path: "/components" },
  { href: "#/releases", label: "Releases", path: "/releases" },
  { href: "#/diagnostics", label: "Diagnostics", path: "/diagnostics" },
  { href: "#/alert-demo", label: "Alert Demo", path: "/alert-demo" }
];

// Page title mappings
export const pathToTitle: Record<string, string> = {
  '/': 'Atomic DS Manager',
  '/guidelines': 'Atomic DS Manager • Guidelines',
  '/tokens': 'Atomic DS Manager • Tokens',
  '/components': 'Atomic DS Manager • Components',
  '/releases': 'Atomic DS Manager • Releases',
  '/diagnostics': 'Atomic DS Manager • Diagnostics',
  '/alert-demo': 'Atomic DS Manager • Alert Demo'
};