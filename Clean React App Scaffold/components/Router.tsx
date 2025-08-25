import React, { Suspense } from 'react';
import { getCurrentRoute, startRouter } from '../src/router/index';

// Import pages
import Overview from './Overview';
import ComponentsCatalog from './ComponentsCatalog';
import TokensPage from './TokensPage';
import GuidelinesViewer from './GuidelinesViewer';
import Releases from './Releases';
import Diagnostics from './Diagnostics';
import NotFound from './NotFound';
import MiniLayouts from './MiniLayouts';

// Import new primitives demos
const PrimitivesDemo = React.lazy(() => import('../src/pages/PrimitivesDemo'));
const PrimitivesPhase1Demo = React.lazy(() => import('../src/pages/PrimitivesPhase1Demo'));

export function Router() {
  const [currentRoute, setCurrentRoute] = React.useState(getCurrentRoute());
  
  React.useEffect(() => {
    const cleanup = startRouter(setCurrentRoute);
    return cleanup;
  }, []);

  const renderPage = () => {
    switch (currentRoute) {
      case 'overview':
        return <Overview />;
      case 'components':
        return <ComponentsCatalog />;
      case 'tokens':
        return <TokensPage />;
      case 'guidelines':
        return <GuidelinesViewer />;
      case 'releases':
        return <Releases />;
      case 'diagnostics':
        return <Diagnostics />;
      case 'mini-layouts':
        return <MiniLayouts />;
      case 'primitives-demo':
        return (
          <Suspense fallback={<div>Loading Primitives Demo...</div>}>
            <PrimitivesDemo />
          </Suspense>
        );
      case 'primitives-phase1':
        return (
          <Suspense fallback={<div>Loading Phase 1 Demo...</div>}>
            <PrimitivesPhase1Demo />
          </Suspense>
        );
      default:
        return <NotFound />;
    }
  };

  return renderPage();
}