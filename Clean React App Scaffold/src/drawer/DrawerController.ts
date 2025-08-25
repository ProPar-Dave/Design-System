import { useState, useEffect } from 'react';

export type DrawerItem = {
  id: string;
  name: string;
  level?: string;
  status?: string;
  version?: string;
  description?: string;
};

type State = { current: DrawerItem | null };
const state: State = { current: null };
let listeners: Array<(s: State) => void> = [];

export function subscribe(fn: (s: State) => void) {
  listeners.push(fn);
  fn(state);
  return () => (listeners = listeners.filter(l => l !== fn));
}
function emit() { for (const l of listeners) l(state); }

export function open(item: DrawerItem) {
  state.current = item;
  emit();
}
export function close() {
  if (state.current) {
    state.current = null;
    emit();
  }
}
export function getCurrent() { return state.current; }

// Hook for components to use the drawer controller
export function useDrawerController() {
  const [drawerState, setDrawerState] = useState(state);
  
  useEffect(() => {
    const unsubscribe = subscribe(setDrawerState);
    return unsubscribe;
  }, []);

  return {
    isOpen: !!drawerState.current,
    item: drawerState.current,
    open,
    close
  };
}