import React from 'react';
import NotFound from './NotFound';
import { useHashState, getCurrentRoute } from '../utils/router';

// Import all page components directly from their source files
import Overview from './Overview';
import GuidelinesViewer from './GuidelinesViewer';
import TokensPage from './TokensPage';
import ComponentsCatalog from './ComponentsCatalog';
import Diagnostics from './Diagnostics';
import Releases from './Releases';
import { MiniLayouts } from './MiniLayouts';

// Safety guard to prevent blank routes
const safe = (Component: React.ComponentType | undefined, name: string) => {
  if (!Component) {
    console.error(`❌ Route component missing: ${name}`);
    console.error(`This usually indicates an import or export issue with the ${name} component.`);
    return () => (
      <div className="adsm-debug">
        <div className="debug-content">
          <h3 className="debug-title">
            ⚠️ Route component missing: {name}
          </h3>
          <p className="debug-description">
            This component failed to load. Check the console for more details.
          </p>
          <div className="debug-details">
            <strong>Development Info:</strong><br />
            • Check that the component exists in /components/{name}.tsx<br />
            • Verify the export statement in the component file<br />
            • Ensure the import statement in Router.tsx is correct
          </div>
        </div>
      </div>
    );
  }
  return Component;
};

export function Router() {
  const [hashState] = useHashState();
  const currentRoute = getCurrentRoute();
  
  // Console diagnostics on mount
  React.useEffect(() => {
    console.group('🔍 Router Component Diagnostics');
    
    const componentStatus = [
      { component: 'Overview', loaded: !!Overview, type: typeof Overview },
      { component: 'GuidelinesViewer', loaded: !!GuidelinesViewer, type: typeof GuidelinesViewer },
      { component: 'TokensPage', loaded: !!TokensPage, type: typeof TokensPage },
      { component: 'ComponentsCatalog', loaded: !!ComponentsCatalog, type: typeof ComponentsCatalog },
      { component: 'Diagnostics', loaded: !!Diagnostics, type: typeof Diagnostics },
      { component: 'Releases', loaded: !!Releases, type: typeof Releases },
      { component: 'MiniLayouts', loaded: !!MiniLayouts, type: typeof MiniLayouts },
    ];
    
    console.table(componentStatus);
    
    // Log any missing components
    const missing = componentStatus.filter(c => !c.loaded);
    if (missing.length > 0) {
      console.error('❌ Missing route components:', missing.map(c => c.component));
      missing.forEach(({ component, type }) => {
        console.error(`  ${component}: ${type} (expected: function)`);
      });
    } else {
      console.log('✅ All route components loaded successfully');
    }
    
    // Log current route info
    console.log('📍 Route Info:', {
      currentRoute,
      hashState,
      matchedComponent: routes[currentRoute] ? 'found' : 'not found',
      fallbackToNotFound: !routes[currentRoute]
    });
    
    console.groupEnd();
  }, [currentRoute, hashState]);

  // Safe component references
  const SafeOverview = safe(Overview, 'Overview');
  const SafeGuidelinesViewer = safe(GuidelinesViewer, 'GuidelinesViewer');
  const SafeTokensPage = safe(TokensPage, 'TokensPage');
  const SafeComponentsCatalog = safe(ComponentsCatalog, 'ComponentsCatalog');
  const SafeDiagnostics = safe(Diagnostics, 'Diagnostics');
  const SafeReleases = safe(Releases, 'Releases');
  const SafeMiniLayouts = safe(MiniLayouts, 'MiniLayouts');

  // Route mapping with safe components
  const routes: Record<string, React.ComponentType> = {
    'overview': SafeOverview,
    'guidelines': SafeGuidelinesViewer,
    'tokens': SafeTokensPage,
    'components': SafeComponentsCatalog,
    'diagnostics': SafeDiagnostics,
    'releases': SafeReleases,
    'mini-layouts': SafeMiniLayouts,
  };

  const Component = routes[currentRoute] || NotFound;

  // Development mode debugging info
  const isDevelopment = process.env.NODE_ENV === 'development';
  const componentMissing = currentRoute && !routes[currentRoute];

  return (
    <main 
      className="content"
      role="main"
      aria-label={`${currentRoute} page content`}
    >
      {isDevelopment && componentMissing && (
        <div className="adsm-debug">
          <div className="debug-banner debug-banner-warning">
            <strong>DEV MODE:</strong> Route "{currentRoute}" not found in component registry. 
            Falling back to NotFound component.
          </div>
        </div>
      )}
      
      {isDevelopment && (
        <div className="adsm-debug">
          <div className="debug-panel debug-panel-info">
            Route: {currentRoute}<br />
            Component: {Component.name || 'Anonymous'}
          </div>
        </div>
      )}
      
      <Component />
    </main>
  );
}