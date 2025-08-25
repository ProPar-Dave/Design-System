import * as React from 'react';

export type DrawerItem = {
  id: string; 
  name: string; 
  level: 'atom'|'molecule'|'organism';
  status?: string; 
  version?: string; 
  description?: string;
  [k: string]: any;
};

type State = { open: boolean; item?: DrawerItem | null };

let subscribers: Array<(s:State)=>void> = [];
let state: State = { open: false, item: null };

export function getDrawerState(){ return state; }
export function subscribe(fn:(s:State)=>void){ 
  subscribers.push(fn); 
  return ()=>{ 
    subscribers = subscribers.filter(f=>f!==fn); 
  }; 
}

function emit(){ 
  subscribers.forEach(fn=>fn(state)); 
}

export function openDrawer(item: DrawerItem){
  state = { open: true, item };
  document.documentElement.classList.add('adsm-drawer-open');
  emit();
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Drawer] open', {id:item?.id, name:item?.name});
  }
}

export function closeDrawer(){
  state = { open: false, item: null };
  document.documentElement.classList.remove('adsm-drawer-open');
  emit();
  if (process.env.NODE_ENV !== 'production') console.log('[Drawer] close');
}