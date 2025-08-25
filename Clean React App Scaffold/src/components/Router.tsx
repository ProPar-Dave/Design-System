import React, { Suspense } from 'react';
import Sidebar from '../../components/Sidebar';
import { getCurrentRoute, startRouter } from '../router/index';

// Import pages
import Overview from '../../components/Overview';
import ComponentsCatalog from '../pages/ComponentsCatalog';
import TokensPage from '../../components/TokensPage';
import Diagnostics from '../pages/Diagnostics';
import MiniLayouts from '../../components/MiniLayouts';
import Releases from '../../components/Releases';

function RouterContent() {
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
      case 'diagnostics':
        return <Diagnostics />;
      case 'mini-layouts':
        return <MiniLayouts />;
      case 'releases':
        return <Releases />;
      default:
        return <Overview />;
    }
  };

  return renderPage();
}

// Main Router component with static properties
function Router() {
  return <RouterContent />;
}

// Add static properties for the new structure
Router.Sidebar = Sidebar;
Router.Content = RouterContent;

export default Router;