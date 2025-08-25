const ROUTES = new Set(['overview','guidelines','tokens','components','mini-layouts','diagnostics','releases']);

export function getCurrentRoute(): string {
  const raw = location.hash || '#/overview';
  const m = raw.match(/^#\/([a-z0-9\-]+)/i);
  const name = (m?.[1] || 'overview').toLowerCase();
  return ROUTES.has(name) ? name : 'overview';
}

export function navigateTo(name: string) {
  const next = ROUTES.has(name) ? name : 'overview';
  if (location.hash !== `#/${next}`) location.hash = `#/${next}`;
  dispatchEvent(new CustomEvent('adsm:route-change', { detail: { route: next }}));
}

export function startRouter(onChange: (route:string)=>void) {
  const handler = () => {
    const r = getCurrentRoute();
    onChange(r);
    dispatchEvent(new CustomEvent('adsm:route-change', { detail: { route: r }}));
  };
  const onDrawer = () => handler(); // keep URL-derived ID in sync
  addEventListener('hashchange', handler);
  addEventListener('adsm:drawer:open', onDrawer as any);
  // initial
  if (!location.hash) navigateTo('overview'); else handler();
  return () => {
    removeEventListener('hashchange', handler);
    removeEventListener('adsm:drawer:open', onDrawer as any);
  };
}