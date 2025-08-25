// Legacy controller file - DEPRECATED
// Use DrawerController.ts instead
// This file is kept temporarily for backward compatibility

import { open, close, subscribe, getCurrent, type DrawerItem } from './DrawerController';

// Legacy API compatibility layer
export type { DrawerItem };

type LegacyState = { open: boolean; item?: DrawerItem | null };

export function getDrawerState(): LegacyState { 
  const current = getCurrent();
  return { open: !!current, item: current };
}

export function openDrawer(item: DrawerItem) {
  console.warn('[DEPRECATED] openDrawer is deprecated. Use open() from DrawerController instead.');
  open(item);
}

export function closeDrawer() {
  console.warn('[DEPRECATED] closeDrawer is deprecated. Use close() from DrawerController instead.');
  close();
}

// Legacy subscribe wrapper that adapts new API to old API
export function subscribe(fn: (s: LegacyState) => void) {
  console.warn('[DEPRECATED] Legacy subscribe API is deprecated. Use new API from DrawerController instead.');
  
  return subscribe((newState) => {
    const legacyState: LegacyState = {
      open: !!newState.current,
      item: newState.current
    };
    fn(legacyState);
  });
}