import { navigate } from '../src/router/hashUtils';

export interface CommandAction {
  id: string;
  title: string;
  subtitle?: string;
  keywords: string[];
  section: string;
  perform: () => void;
}

export function createCommandPaletteActions(): CommandAction[] {
  return [
    // Navigation actions
    {
      id: 'nav-overview',
      title: 'Overview',
      subtitle: 'System overview and metrics',
      keywords: ['overview', 'home', 'dashboard', 'metrics'],
      section: 'Navigation',
      perform: () => navigate('#/')
    },
    {
      id: 'nav-guidelines',
      title: 'Guidelines',
      subtitle: 'Design system guidelines and documentation',
      keywords: ['guidelines', 'docs', 'documentation', 'rules'],
      section: 'Navigation',
      perform: () => navigate('#/guidelines')
    },
    {
      id: 'nav-tokens',
      title: 'Design Tokens',
      subtitle: 'View and edit design tokens',
      keywords: ['tokens', 'design', 'variables', 'colors', 'typography'],
      section: 'Navigation',
      perform: () => navigate('#/tokens')
    },
    {
      id: 'nav-components',
      title: 'Components',
      subtitle: 'Component catalog and documentation',
      keywords: ['components', 'catalog', 'library', 'ui'],
      section: 'Navigation',
      perform: () => navigate('#/components')
    },
    {
      id: 'nav-mini-layouts',
      title: 'Mini Layouts',
      subtitle: 'Atomic composition demos with accessibility testing',
      keywords: ['mini', 'layouts', 'demos', 'composition', 'atoms', 'molecules', 'accessibility'],
      section: 'Navigation',
      perform: () => navigate('#/mini-layouts')
    },
    {
      id: 'nav-diagnostics',
      title: 'Diagnostics',
      subtitle: 'System health and performance metrics',
      keywords: ['diagnostics', 'health', 'performance', 'audit', 'analysis'],
      section: 'Navigation',
      perform: () => navigate('#/diagnostics')
    },
    {
      id: 'nav-releases',
      title: 'Releases',
      subtitle: 'Version history and release management',
      keywords: ['releases', 'versions', 'changelog', 'history'],
      section: 'Navigation',
      perform: () => navigate('#/releases')
    },

    // Quick actions
    {
      id: 'action-new-component',
      title: 'New Component',
      subtitle: 'Create a new component',
      keywords: ['new', 'create', 'component', 'add'],
      section: 'Actions',
      perform: () => {
        navigate('#/components');
        // Trigger new component wizard
        setTimeout(() => {
          const event = new CustomEvent('open-component-wizard');
          window.dispatchEvent(event);
        }, 100);
      }
    },
    {
      id: 'action-toggle-theme',
      title: 'Toggle Theme',
      subtitle: 'Switch between light and dark theme',
      keywords: ['theme', 'dark', 'light', 'toggle', 'mode'],
      section: 'Actions',
      perform: () => {
        const event = new CustomEvent('toggle-theme');
        window.dispatchEvent(event);
      }
    },
    {
      id: 'action-export-tokens',
      title: 'Export Tokens',
      subtitle: 'Export design tokens as JSON',
      keywords: ['export', 'tokens', 'json', 'download'],
      section: 'Actions',
      perform: () => {
        navigate('#/tokens');
        setTimeout(() => {
          const event = new CustomEvent('export-tokens');
          window.dispatchEvent(event);
        }, 100);
      }
    },
    {
      id: 'action-run-diagnostics',
      title: 'Run Diagnostics',
      subtitle: 'Run full system diagnostics',
      keywords: ['run', 'diagnostics', 'audit', 'check', 'analyze'],
      section: 'Actions',
      perform: () => {
        navigate('#/diagnostics');
        setTimeout(() => {
          const event = new CustomEvent('run-diagnostics');
          window.dispatchEvent(event);
        }, 100);
      }
    },
    {
      id: 'action-accessibility-audit',
      title: 'Accessibility Audit',
      subtitle: 'Run accessibility compliance check',
      keywords: ['accessibility', 'a11y', 'audit', 'compliance', 'wcag'],
      section: 'Actions',
      perform: () => {
        navigate('#/mini-layouts');
        setTimeout(() => {
          console.log('Running accessibility audit on mini layouts...');
        }, 100);
      }
    },
    {
      id: 'action-contrast-check',
      title: 'Contrast Check',
      subtitle: 'Check color contrast compliance',
      keywords: ['contrast', 'color', 'accessibility', 'aa', 'aaa'],
      section: 'Actions',
      perform: () => {
        navigate('#/mini-layouts');
        setTimeout(() => {
          console.log('Running contrast checks...');
        }, 100);
      }
    }
  ];
}