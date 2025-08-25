import React from 'react';
import { getCurrentRoute, navigateTo } from '../src/router/index';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
}

const navigationItems: NavigationItem[] = [
  { id: 'overview', label: 'Overview', href: '#/overview', icon: '📊' },
  { id: 'guidelines', label: 'Guidelines', href: '#/guidelines', icon: '📋' },
  { id: 'tokens', label: 'Tokens', href: '#/tokens', icon: '🎨' },
  { id: 'components', label: 'Components', href: '#/components', icon: '🧩' },
  { id: 'mini-layouts', label: 'Mini Layouts', href: '#/mini-layouts', icon: '📱' },
  { id: 'diagnostics', label: 'Diagnostics', href: '#/diagnostics', icon: '🔧' },
  { id: 'releases', label: 'Releases', href: '#/releases', icon: '🚀' }
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [active, setActive] = React.useState<string>(getCurrentRoute());
  React.useEffect(()=>{
    const onRoute = (e: any)=> setActive(e?.detail?.route ?? getCurrentRoute());
    addEventListener('adsm:route-change', onRoute);
    return ()=> removeEventListener('adsm:route-change', onRoute);
  },[]);

  return (
    <div className="adsm-layout flex h-screen bg-background">
      <aside className="adsm-sidebar w-64 bg-sidebar border-r border-sidebar-border">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground">Atomic DS Manager</h1>
              <p className="text-xs text-muted-foreground">Design System Tools</p>
            </div>
          </div>
          
          <nav className="adsm-nav">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <a
                    className={`side-nav__item flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      active === item.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                    href={item.href}
                    aria-current={active===item.id ? 'page' : undefined}
                    onClick={(e)=>{ e.preventDefault(); navigateTo(item.id); }}
                  >
                    {item.icon && <span className="text-base">{item.icon}</span>}
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
      
      <main className="adsm-main flex-1 overflow-auto">
        <div className="adsm-content">
          {children}
        </div>
      </main>
    </div>
  );
}