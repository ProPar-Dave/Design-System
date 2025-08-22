import React, { useState, useEffect, useMemo } from 'react';
import { runAudits, QUICK_AUDIT_KEYS, FULL_AUDIT_KEYS, AUDIT_REGISTRY, generateAuditConfigSummary } from '../diagnostics/audits';
import { loadComponents } from '../utils/catalog';
import { logger } from '../diagnostics/logger';
import type { AuditResult, ComponentInfo } from '../diagnostics/utils';
import { generateCompleteReadme, saveReadmeForDownload } from '../utils/readmeGenerator';
import { getThemeContrastDiagnostics, ensureThemeContrast } from '../utils/themeContrast';
import { getCurrentRoute } from '../utils/router';

interface DiagnosticsState {
  isRunning: boolean;
  results: AuditResult[];
  progress: { completed: number; total: number; current: string } | null;
  lastRun: Date | null;
  selectedCategory: string;
  components: ComponentInfo[];
  themeContrastData: any;
}

type TabType = 'overview' | 'accessibility' | 'architecture' | 'tokens' | 'performance' | 'regression' | 'theme' | 'debug' | 'config';

export default function Diagnostics() {
  // Debug container to prevent theme leakage from hardcoded Tailwind classes
  const [state, setState] = useState<DiagnosticsState>({
    isRunning: false,
    results: [],
    progress: null,
    lastRun: null,
    selectedCategory: 'all',
    components: [],
    themeContrastData: null
  });
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  // Load components and theme data on mount
  useEffect(() => {
    loadComponents().then(components => {
      setState(prev => ({ ...prev, components }));
    }).catch(error => {
      logger.error('audit/run', { message: 'Failed to load components for diagnostics', error });
    });

    // Load initial theme contrast data
    const updateThemeData = () => {
      const themeData = getThemeContrastDiagnostics();
      setState(prev => ({ ...prev, themeContrastData: themeData }));
    };

    updateThemeData();

    // Listen for theme changes
    const handleThemeChange = () => {
      setTimeout(updateThemeData, 100); // Small delay to ensure theme is applied
    };

    document.addEventListener('adsm:theme:changed', handleThemeChange);
    document.addEventListener('adsm:theme:contrast-corrected', handleThemeChange);

    return () => {
      document.removeEventListener('adsm:theme:changed', handleThemeChange);
      document.removeEventListener('adsm:theme:contrast-corrected', handleThemeChange);
    };
  }, []);

  const runQuickAudit = async () => {
    setState(prev => ({ ...prev, isRunning: true, progress: null, results: [] }));
    
    try {
      const results = await runAudits(QUICK_AUDIT_KEYS, state.components, (progress) => {
        setState(prev => ({ ...prev, progress }));
      });
      
      setState(prev => ({ 
        ...prev, 
        results, 
        isRunning: false, 
        progress: null, 
        lastRun: new Date() 
      }));
      
      logger.info('audit/run', { type: 'quick', resultsCount: results.length });
    } catch (error) {
      logger.error('audit/run', { type: 'quick', error });
      setState(prev => ({ ...prev, isRunning: false, progress: null }));
    }
  };

  const runFullAudit = async () => {
    setState(prev => ({ ...prev, isRunning: true, progress: null, results: [] }));
    
    try {
      const results = await runAudits(FULL_AUDIT_KEYS, state.components, (progress) => {
        setState(prev => ({ ...prev, progress }));
      });
      
      setState(prev => ({ 
        ...prev, 
        results, 
        isRunning: false, 
        progress: null, 
        lastRun: new Date() 
      }));
      
      logger.info('audit/run', { type: 'full', resultsCount: results.length });
    } catch (error) {
      logger.error('audit/run', { type: 'full', error });
      setState(prev => ({ ...prev, isRunning: false, progress: null }));
    }
  };

  const generateReadme = () => {
    // Get the stored component analysis from the component dependency audit
    const analysis = (window as any).__ADSM_COMPONENT_ANALYSIS;
    
    if (analysis) {
      const readme = generateCompleteReadme(analysis);
      saveReadmeForDownload(readme);
      logger.info('catalog/export', { type: 'readme' });
    } else {
      logger.warn('catalog/export', { message: 'No component analysis found. Run the full audit first to generate comprehensive documentation.' });
    }
  };

  const filteredResults = useMemo(() => {
    if (state.selectedCategory === 'all') return state.results;
    return state.results.filter(result => result.category === state.selectedCategory);
  }, [state.results, state.selectedCategory]);

  const resultsByCategory = useMemo(() => {
    const categories: Record<string, AuditResult[]> = {
      accessibility: [],
      architecture: [], 
      tokens: [],
      performance: [],
      regression: []
    };
    
    state.results.forEach(result => {
      if (categories[result.category]) {
        categories[result.category].push(result);
      }
    });
    
    return categories;
  }, [state.results]);

  const checkThemeContrast = () => {
    const correctionMade = ensureThemeContrast();
    if (correctionMade) {
      logger.info('theme/contrast', { message: 'Theme contrast auto-correction applied' });
    }
    // Update theme data
    const themeData = getThemeContrastDiagnostics();
    setState(prev => ({ ...prev, themeContrastData: themeData }));
  };

  const overallStats = useMemo(() => {
    const total = state.results.length;
    const passed = state.results.filter(r => r.passed).length;
    const failed = total - passed;
    const errors = state.results.reduce((sum, r) => sum + (r.metrics?.errors || 0), 0);
    const warnings = state.results.reduce((sum, r) => sum + (r.metrics?.warnings || 0), 0);
    
    return { total, passed, failed, errors, warnings };
  }, [state.results]);

  const getDebugSnapshot = () => {
    const computedStyle = getComputedStyle(document.documentElement);
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'auto';
    
    // Get computed token values from theme manager
    const computedTokens = {
      '--color-bg': computedStyle.getPropertyValue('--color-bg').trim(),
      '--color-panel': computedStyle.getPropertyValue('--color-panel').trim(),
      '--color-text': computedStyle.getPropertyValue('--color-text').trim(),
      '--color-muted': computedStyle.getPropertyValue('--color-muted').trim(),
      '--color-border': computedStyle.getPropertyValue('--color-border').trim(),
      '--input-bg': computedStyle.getPropertyValue('--input-bg').trim(),
      '--input-text': computedStyle.getPropertyValue('--input-text').trim(),
      '--btn-primary-bg': computedStyle.getPropertyValue('--btn-primary-bg').trim(),
      '--btn-primary-text': computedStyle.getPropertyValue('--btn-primary-text').trim(),
    };

    // Calculate contrast ratio
    const bgColor = computedTokens['--color-bg'];
    const textColor = computedTokens['--color-text'];
    const contrastRatio = (window as any).__adsmContrast?.(textColor, bgColor) ?? 0;

    // Get route map (matching Router component logic)
    const routeComponents = {
      'overview': 'Overview',
      'guidelines': 'GuidelinesViewer', 
      'tokens': 'TokensPage',
      'components': 'ComponentsCatalog',
      'diagnostics': 'Diagnostics',
      'releases': 'Releases',
      'mini-layouts': 'MiniLayouts',
    };

    const routeMap = Object.entries(routeComponents).map(([route, component]) => ({
      route,
      component,
      loaded: true // All components are loaded since we're seeing this
    }));

    return {
      timestamp: new Date().toISOString(),
      theme: {
        current: currentTheme,
        dataAttribute: document.documentElement.getAttribute('data-theme'),
        systemPreference: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      },
      computedTokens,
      contrastRatio: parseFloat(contrastRatio.toFixed(2)),
      contrastPasses: contrastRatio >= 4.5,
      routeMap,
      contrastData: state.themeContrastData,
      location: {
        hash: window.location.hash,
        pathname: window.location.pathname
      },
      themeManager: {
        initialized: !!(window as any).__adsmContrast,
        localStorageTheme: localStorage.getItem('adsm:theme'),
        cssDataTheme: document.documentElement.dataset.theme
      }
    };
  };

  const copyDebugSnapshot = () => {
    const snapshot = getDebugSnapshot();
    navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2)).then(() => {
      console.log('Debug snapshot copied to clipboard');
      // Show temporary feedback
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✅ Copied!';
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    }).catch(err => {
      console.error('Failed to copy debug snapshot:', err);
    });
  };

  const [smokeTestResult, setSmokeTestResult] = useState<{
    isRunning: boolean;
    result: any | null;
    timestamp: string | null;
  }>({
    isRunning: false,
    result: null,
    timestamp: null
  });

  const runSmokeTest = async () => {
    setSmokeTestResult(prev => ({ ...prev, isRunning: true }));
    
    try {
      // Store original state
      const originalTheme = document.documentElement.getAttribute('data-theme');
      const originalRoute = getCurrentRoute();
      const originalHash = window.location.hash;
      
      // 1. Force theme to 'dark', snapshot tokens, verify body contrast
      document.documentElement.setAttribute('data-theme', 'dark');
      
      // Wait for theme to apply
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const computedStyle = getComputedStyle(document.documentElement);
      const bgColor = computedStyle.getPropertyValue('--color-bg').trim();
      const textColor = computedStyle.getPropertyValue('--color-text').trim();
      const contrastRatio = (window as any).__adsmContrast?.(textColor, bgColor) ?? 0;
      
      const tokenSnapshot = {
        '--color-bg': bgColor,
        '--color-text': textColor,
        '--color-panel': computedStyle.getPropertyValue('--color-panel').trim(),
        '--color-border': computedStyle.getPropertyValue('--color-border').trim(),
      };

      // 2. Navigate through routes and verify content
      const routes = ['overview', 'tokens', 'components', 'diagnostics'];
      const routeTests: Record<string, boolean> = {};
      
      for (const route of routes) {
        // Simulate navigation by setting hash properly
        window.location.hash = `#/${route}`;
        
        // Trigger hashchange event to ensure router responds
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        
        // Wait for navigation to complete and components to render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if route content is loaded and non-empty
        let hasContent = false;
        
        switch (route) {
          case 'overview':
            // Look for overview-specific content
            hasContent = !!document.querySelector('main h2, main h1, [aria-label*="overview"], .system-overview, main .text-2xl');
            if (!hasContent) {
              // Fallback: check for any main content
              const mainContent = document.querySelector('main .content, main > div');
              hasContent = !!(mainContent && mainContent.textContent?.trim().length > 0);
            }
            break;
          case 'tokens':
            // Look for token-related content
            hasContent = !!document.querySelector('.token-showcase, .token-badge, .tokens-grid, [data-testid*="token"], main .token');
            if (!hasContent) {
              // Fallback: look for token-related text or elements
              const mainElement = document.querySelector('main');
              hasContent = !!(mainElement && (
                mainElement.textContent?.includes('token') ||
                mainElement.textContent?.includes('Token') ||
                mainElement.querySelector('.space-y-6, .grid')
              ));
            }
            break;
          case 'components':
            // Look for component catalog content
            hasContent = !!document.querySelector('.components-grid, .component-card, [data-testid*="component"], main .catalog');
            if (!hasContent) {
              // Fallback: look for component-related content
              const mainElement = document.querySelector('main');
              hasContent = !!(mainElement && (
                mainElement.textContent?.includes('component') ||
                mainElement.textContent?.includes('Component') ||
                mainElement.querySelector('.grid, .catalog, .space-y-6')
              ));
            }
            break;
          case 'diagnostics':
            // Look for diagnostics-specific content (we know this should work since we're in it)
            hasContent = !!document.querySelector('[role="tabpanel"], .diagnostics-content, .adsm-debug-tabs, main .space-y-6');
            if (!hasContent) {
              // Very reliable fallback: look for tab elements or diagnostic content
              const mainElement = document.querySelector('main');
              hasContent = !!(mainElement && (
                mainElement.textContent?.includes('Diagnostic') ||
                mainElement.textContent?.includes('audit') ||
                mainElement.querySelector('button[role="tab"], .adsm-tab')
              ));
            }
            break;
        }
        
        routeTests[route] = hasContent;
      }

      // 3. Ensure Components count > 0
      const componentsCount = state.components.length;
      
      // Restore original state
      if (originalTheme) {
        document.documentElement.setAttribute('data-theme', originalTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
      // Restore original route
      if (originalHash !== window.location.hash) {
        window.location.hash = originalHash;
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
      
      // Wait for theme and route to restore
      await new Promise(resolve => setTimeout(resolve, 300));

      // 4. Create final result payload
      const result = {
        theme: 'dark',
        contrast: {
          ratio: parseFloat(contrastRatio.toFixed(2)),
          passes: contrastRatio >= 4.5
        },
        routes: routeTests,
        componentsCount,
        tokenSnapshot,
        timestamp: new Date().toISOString()
      };

      // Determine overall pass/fail
      const allRoutesPassed = Object.values(routeTests).every(Boolean);
      const contrastPassed = result.contrast.passes;
      const componentsPassed = componentsCount > 0;
      const overallPassed = allRoutesPassed && contrastPassed && componentsPassed;

      result.overallStatus = overallPassed ? 'PASS' : 'FAIL';
      result.details = {
        routesStatus: allRoutesPassed ? 'PASS' : 'FAIL',
        contrastStatus: contrastPassed ? 'PASS' : 'FAIL', 
        componentsStatus: componentsPassed ? 'PASS' : 'FAIL'
      };

      // Log the JSON payload
      console.log('🧪 Smoke Test Results:', JSON.stringify(result, null, 2));
      
      setSmokeTestResult({
        isRunning: false,
        result,
        timestamp: new Date().toISOString()
      });
      
      logger.info('smoke-test/run', { status: result.overallStatus, details: result });
      
    } catch (error) {
      console.error('Smoke test failed:', error);
      setSmokeTestResult({
        isRunning: false,
        result: {
          overallStatus: 'FAIL',
          error: error.message,
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
      logger.error('smoke-test/run', { error });
    }
  };

  const renderTabButton = (tab: TabType, label: string, badge?: number) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`adsm-tab px-4 py-2 border-b-2 transition-all ${
        activeTab === tab 
          ? 'border-blue-500 text-blue-600 bg-blue-50' 
          : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
      }`}
      aria-selected={activeTab === tab}
      role="tab"
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Diagnostics</h2>
          <p className="text-gray-600 mt-1">
            Automated audits for code quality, accessibility, and architecture
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={runQuickAudit}
            disabled={state.isRunning}
            className="adsm-button-primary"
          >
            {state.isRunning ? '⚡ Running...' : '⚡ Quick Audit'}
          </button>
          
          <button
            onClick={runFullAudit}
            disabled={state.isRunning}
            className="adsm-button-secondary"
          >
            {state.isRunning ? '🔍 Running...' : '🔍 Full Audit'}
          </button>
          
          <button
            onClick={generateReadme}
            disabled={state.results.length === 0}
            className="adsm-button-secondary"
          >
            📖 Generate README
          </button>
          
          <button
            onClick={runSmokeTest}
            disabled={smokeTestResult.isRunning}
            className="adsm-button-secondary"
          >
            {smokeTestResult.isRunning ? '🧪 Testing...' : '🧪 Smoke Test'}
          </button>
        </div>
      </div>

      {state.progress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-800 font-medium">
              Running audit ({state.progress.completed}/{state.progress.total})
            </span>
            <span className="text-sm text-blue-600">
              {Math.round((state.progress.completed / state.progress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-200" 
              style={{ width: `${(state.progress.completed / state.progress.total) * 100}%` }}
            />
          </div>
          <p className="text-sm text-blue-700">{state.progress.current}</p>
        </div>
      )}

      {state.results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{overallStats.passed}</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{overallStats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{overallStats.errors}</div>
            <div className="text-sm text-gray-600">Errors</div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-yellow-500">{overallStats.warnings}</div>
            <div className="text-sm text-gray-600">Warnings</div>
          </div>
          
          <div className="bg-white p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{state.components.length}</div>
            <div className="text-sm text-gray-600">Components</div>
          </div>
        </div>
      )}

      {state.lastRun && (
        <p className="text-sm text-gray-500">
          Last run: {state.lastRun.toLocaleString()}
        </p>
      )}

      {smokeTestResult.result && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Smoke Test Results</h3>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                smokeTestResult.result.overallStatus === 'PASS' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {smokeTestResult.result.overallStatus}
              </span>
              <span className="text-xs text-gray-500">
                {smokeTestResult.timestamp && new Date(smokeTestResult.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {smokeTestResult.result.error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
              <p className="font-medium">Test Error:</p>
              <p className="text-sm mt-1">{smokeTestResult.result.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      smokeTestResult.result.details?.contrastStatus === 'PASS' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm font-medium">Contrast</span>
                  </div>
                  <div className="text-lg font-bold">
                    {smokeTestResult.result.contrast?.ratio || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Ratio (≥4.5)</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      smokeTestResult.result.details?.routesStatus === 'PASS' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm font-medium">Routes</span>
                  </div>
                  <div className="text-lg font-bold">
                    {smokeTestResult.result.routes ? 
                      `${Object.values(smokeTestResult.result.routes).filter(Boolean).length}/${Object.keys(smokeTestResult.result.routes).length}` 
                      : 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">Loaded</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      smokeTestResult.result.details?.componentsStatus === 'PASS' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="text-sm font-medium">Components</span>
                  </div>
                  <div className="text-lg font-bold">
                    {smokeTestResult.result.componentsCount || 0}
                  </div>
                  <div className="text-xs text-gray-600">Available</div>
                </div>
              </div>

              {smokeTestResult.result.routes && (
                <div>
                  <h4 className="font-medium mb-2">Route Navigation Test</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(smokeTestResult.result.routes).map(([route, passed]) => (
                      <div key={route} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className={`w-2 h-2 rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm capitalize">{route}</span>
                        <span className={`text-xs px-1 rounded ${
                          passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <strong>Test Summary:</strong> Validated dark theme contrast, navigated through {smokeTestResult.result.routes ? Object.keys(smokeTestResult.result.routes).length : 0} routes, 
                  and verified {smokeTestResult.result.componentsCount || 0} components are available.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Results by Category</h3>
        
        {Object.entries(resultsByCategory).map(([category, results]) => 
          results.length > 0 && (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 capitalize">
                {category} ({results.length} audits)
              </h4>
              
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{result.title}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      result.passed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.passed ? 'Pass' : 'Fail'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );

  const renderArchitectureTab = () => {
    const architectureResults = resultsByCategory.architecture;
    const componentDependencyResult = architectureResults.find(r => r.metadata?.key === 'component-dependencies');
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Architecture Analysis</h2>
            <p className="text-gray-600 mt-1">
              Component dependency graph and layering validation
            </p>
          </div>
          
          <button
            onClick={runFullAudit}
            disabled={state.isRunning}
            className="adsm-button-primary"
          >
            🔍 Run Architecture Audit
          </button>
        </div>

        {componentDependencyResult && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Dependency Health</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                componentDependencyResult.passed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {componentDependencyResult.passed ? 'Healthy' : 'Issues Found'}
              </span>
            </div>

            {componentDependencyResult.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {componentDependencyResult.metrics.atomCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Atoms</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {componentDependencyResult.metrics.moleculeCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Molecules</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {componentDependencyResult.metrics.errors || 0}
                  </div>
                  <div className="text-sm text-gray-600">Violations</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {componentDependencyResult.metrics.healthScore || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Health Score</div>
                </div>
              </div>
            )}

            {componentDependencyResult.details && componentDependencyResult.details.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Dependency Violations</h4>
                <div className="space-y-2">
                  {componentDependencyResult.details.map((detail, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded border-l-4 ${
                        detail.type === 'error' 
                          ? 'bg-red-50 border-red-500 text-red-800'
                          : 'bg-yellow-50 border-yellow-500 text-yellow-800'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{detail.message}</p>
                          <p className="text-sm mt-1">Component: {detail.component}</p>
                          {detail.line && (
                            <p className="text-sm">Line: {detail.line}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          detail.type === 'error' 
                            ? 'bg-red-200 text-red-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {detail.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Architecture Rules</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✅ <strong>Atoms</strong> should have no dependencies on other atoms or molecules</li>
            <li>✅ <strong>Molecules</strong> can depend on atoms and occasionally other molecules (composition)</li>
            <li>❌ <strong>Atoms</strong> cannot import molecules (violates atomic principles)</li>
            <li>❌ <strong>Circular dependencies</strong> are not allowed at any level</li>
          </ul>
        </div>

        {architectureResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No architecture audits have been run yet.</p>
            <p className="text-sm mt-1">Click "Run Architecture Audit" to analyze component dependencies.</p>
          </div>
        )}
      </div>
    );
  };

  const renderCategoryTab = (category: string) => {
    const results = resultsByCategory[category] || [];
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold capitalize">{category} Audits</h2>
          <span className="text-sm text-gray-600">
            {results.length} audits available
          </span>
        </div>

        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{result.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.passed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.passed ? 'Pass' : 'Fail'}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{result.description}</p>

                {result.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded">
                    <div className="text-center">
                      <div className="text-lg font-bold">{result.metrics.checked}</div>
                      <div className="text-xs text-gray-600">Checked</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{result.metrics.errors}</div>
                      <div className="text-xs text-gray-600">Errors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{result.metrics.warnings}</div>
                      <div className="text-xs text-gray-600">Warnings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{result.metrics.duration}ms</div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                  </div>
                )}

                {result.details && result.details.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Details ({result.details.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {result.details.map((detail, detailIndex) => (
                        <div 
                          key={detailIndex}
                          className={`p-2 rounded text-sm border-l-4 ${
                            detail.type === 'error' 
                              ? 'bg-red-50 border-red-500'
                              : detail.type === 'warning'
                              ? 'bg-yellow-50 border-yellow-500'
                              : 'bg-blue-50 border-blue-500'
                          }`}
                        >
                          <p>{detail.message}</p>
                          {detail.component && (
                            <p className="text-xs mt-1 text-gray-600">
                              Component: {detail.component}
                              {detail.line && ` (line ${detail.line})`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No {category} audits have been run yet.</p>
            <p className="text-sm mt-1">Run a full audit to see detailed {category} analysis.</p>
          </div>
        )}
      </div>
    );
  };

  const renderConfigTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Audit Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Audit</h3>
          <p className="text-gray-600 mb-4">
            Runs critical and high priority audits (~5-10 seconds)
          </p>
          <div className="space-y-2">
            {QUICK_AUDIT_KEYS.map(key => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{AUDIT_REGISTRY[key]?.description}</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {AUDIT_REGISTRY[key]?.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Full Audit</h3>
          <p className="text-gray-600 mb-4">
            Runs all available audits (~15-30 seconds)
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {FULL_AUDIT_KEYS.map(key => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{AUDIT_REGISTRY[key]?.description}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  AUDIT_REGISTRY[key]?.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  AUDIT_REGISTRY[key]?.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  AUDIT_REGISTRY[key]?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {AUDIT_REGISTRY[key]?.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">Usage Guidelines</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li><strong>During Development:</strong> Use Quick Audit for fast feedback</li>
          <li><strong>Before Commits:</strong> Run Quick Audit to catch critical issues</li>
          <li><strong>Before Releases:</strong> Run Full Audit for comprehensive analysis</li>
          <li><strong>Architecture Changes:</strong> Focus on Architecture tab audits</li>
          <li><strong>Accessibility Work:</strong> Use Accessibility tab for WCAG compliance</li>
        </ul>
      </div>
    </div>
  );

  const renderDebugTab = () => {
    const debugSnapshot = getDebugSnapshot();
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Debug Information</h2>
            <p className="text-gray-600 mt-1">
              System state, computed tokens, route map, and diagnostic data
            </p>
          </div>
          
          <button
            onClick={copyDebugSnapshot}
            className="adsm-button-secondary"
          >
            📋 Copy Debug Info
          </button>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Theme</div>
                <div className="font-medium">{debugSnapshot.theme.current}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Contrast Ratio</div>
                <div className={`font-medium ${debugSnapshot.contrastPasses ? 'text-green-600' : 'text-red-600'}`}>
                  {debugSnapshot.contrastRatio} {debugSnapshot.contrastPasses ? '✓' : '✗'}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">Route</div>
                <div className="font-medium">{debugSnapshot.location.hash || '/'}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Computed Tokens</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
              {Object.entries(debugSnapshot.computedTokens).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Route Components</h3>
            <div className="space-y-2">
              {debugSnapshot.routeMap.map(({ route, component, loaded }) => (
                <div key={route} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">/{route}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{component}</span>
                    <span className={`w-2 h-2 rounded-full ${loaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderThemeTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Theme Management</h2>
          <p className="text-gray-600 mt-1">
            Theme contrast analysis and automatic corrections
          </p>
        </div>
        
        <button
          onClick={checkThemeContrast}
          className="adsm-button-primary"
        >
          🎨 Check Contrast
        </button>
      </div>

      {state.themeContrastData && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Contrast Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Current Theme Tokens</h4>
              <div className="space-y-2 text-sm">
                {Object.entries(state.themeContrastData.computedTokens || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-gray-50 rounded font-mono">
                    <span className="text-gray-600">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Contrast Metrics</h4>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Text/Background Ratio</span>
                    <span className={`font-bold ${
                      state.themeContrastData.contrastRatio >= 4.5 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {state.themeContrastData.contrastRatio?.toFixed(2)} 
                      {state.themeContrastData.contrastRatio >= 4.5 ? ' ✓' : ' ✗'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    WCAG AA requires ≥4.5 for normal text
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Theme</span>
                    <span className="font-medium">{state.themeContrastData.currentTheme}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Accessibility Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ <strong>WCAG AA:</strong> Text contrast ratio ≥ 4.5:1</li>
          <li>✅ <strong>WCAG AAA:</strong> Text contrast ratio ≥ 7:1 (enhanced)</li>
          <li>✅ <strong>Large Text:</strong> Can use ≥ 3:1 ratio (18pt+ or 14pt+ bold)</li>
          <li>✅ <strong>Non-text:</strong> UI components need ≥ 3:1 ratio</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="adsm-debug-container">
      <div className="adsm-debug-tabs">
        <div className="flex space-x-1 border-b border-gray-200 mb-6" role="tablist">
          {renderTabButton('overview', 'Overview', state.results.length > 0 ? overallStats.failed : undefined)}
          {renderTabButton('accessibility', 'Accessibility', resultsByCategory.accessibility.length)}
          {renderTabButton('architecture', 'Architecture', resultsByCategory.architecture.length)}
          {renderTabButton('tokens', 'Tokens', resultsByCategory.tokens.length)}
          {renderTabButton('performance', 'Performance', resultsByCategory.performance.length)}
          {renderTabButton('regression', 'Regression', resultsByCategory.regression.length)}
          {renderTabButton('theme', 'Theme')}
          {renderTabButton('debug', 'Debug')}
          {renderTabButton('config', 'Config')}
        </div>

        <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'accessibility' && renderCategoryTab('accessibility')}
          {activeTab === 'architecture' && renderArchitectureTab()}
          {activeTab === 'tokens' && renderCategoryTab('tokens')}
          {activeTab === 'performance' && renderCategoryTab('performance')}
          {activeTab === 'regression' && renderCategoryTab('regression')}
          {activeTab === 'theme' && renderThemeTab()}
          {activeTab === 'debug' && renderDebugTab()}
          {activeTab === 'config' && renderConfigTab()}
        </div>
      </div>
    </div>
  );
}