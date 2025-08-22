import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { 
  Home, 
  FileText, 
  Palette, 
  Grid3X3, 
  Activity, 
  Package,
  Layers,
  ChevronRight 
} from 'lucide-react';
import { getCurrentRoute, navigate } from '../utils/router';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  route: string;
  isActive?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, route, isActive, onClick }: NavItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(route);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-accent ${
        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
      role="menuitem"
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {isActive && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
    </button>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const currentRoute = getCurrentRoute();

  const navigationItems = [
    { icon: <Home className="w-4 h-4" />, label: 'Overview', route: 'overview' },
    { icon: <FileText className="w-4 h-4" />, label: 'Guidelines', route: 'guidelines' },
    { icon: <Palette className="w-4 h-4" />, label: 'Tokens', route: 'tokens' },
    { icon: <Grid3X3 className="w-4 h-4" />, label: 'Components', route: 'components' },
    { icon: <Layers className="w-4 h-4" />, label: 'Mini Layouts', route: 'mini-layouts' },
    { icon: <Activity className="w-4 h-4" />, label: 'Diagnostics', route: 'diagnostics' },
    { icon: <Package className="w-4 h-4" />, label: 'Releases', route: 'releases' }
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside 
        className="w-64 border-r bg-card flex flex-col"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-semibold">Atomic DS Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Design System Toolkit</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4" role="menu">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <NavItem
                key={item.route}
                icon={item.icon}
                label={item.label}
                route={item.route}
                isActive={currentRoute === item.route}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}