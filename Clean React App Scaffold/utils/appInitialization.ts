import { configureLogger, logEvent, safeLogEvent } from '../diagnostics/logger';
import { getBrowserInfo, getAppVersion } from '../diagnostics/utils';
import { isDevelopment, safePing, safeInitPingSystem, announceToScreenReader } from './appHelpers';
import { migrateTokensToSemanticVars } from '../tokensMigration';
import { migrateCatalogStorage } from './catalog';
import { loadDevelopmentUtilities } from './devUtilities';
import { getTheme } from '../src/theme/themeManager';

export const APP_FEATURES = [
  'diagnostics-system',
  'accessibility-enhancements',
  'drawer-layout-system',
  'token-based-theming',
  'high-contrast-components',
  'nav-accessibility-improvements',
  'wcag-aa-compliance',
  'navigation-audit-system',
  'form-field-audit-system',
  'button-audit-system',
  'atom-contract-testing',
  'regression-testing-system',
  'visual-diff-testing',
  'color-blindness-testing',
  'automatic-fallback-handling',
  'comprehensive-form-validation',
  'interactive-state-checking',
  'button-variant-validation'
];

export const ACCESSIBILITY_FEATURES = [
  'Comprehensive navigation accessibility audit system',
  'Complete form field accessibility validation',
  'Complete button and CTA accessibility validation',
  'Atom contract testing for prop→className consistency',
  'Visual regression testing for molecules',
  'Quick audit mode for development feedback',
  'Full audit mode with color-blind simulations',
  'WCAG AA compliant contrast ratios (≥4.5:1) in all themes',
  'Automatic fallback handling for insufficient contrast',
  'Color blindness simulation and testing',
  'Token-based styling with semantic variables',
  'Enhanced keyboard navigation and focus management',
  'Screenshots and before/after comparison capture',
  'Interactive state validation (hover, focus, disabled, error)',
  'Placeholder contrast validation and enhancement',
  'Form field consistency checking across types',
  'Button variant distinction and consistency checking',
  'Touch target size validation for mobile accessibility',
  'Label and ARIA attribute validation',
  'Real-time contrast monitoring and enforcement',
  'Comprehensive diagnostics and audit reporting'
];

function initializeSession(): string {
  let sessionId = sessionStorage.getItem('adsm:session-id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('adsm:session-id', sessionId);
    sessionStorage.setItem('adsm:session-start', String(Date.now()));
    sessionStorage.setItem('adsm:nav-count', '0');
    sessionStorage.setItem('adsm:component-enter-time', '0');
    sessionStorage.setItem('adsm:prev-session', sessionId);
  }
  return sessionId;
}

async function runTokenMigration(): Promise<void> {
  try {
    const migrationResult = migrateTokensToSemanticVars();
    if (migrationResult.migrated > 0) {
      safeLogEvent('info', 'tokens/migration', { 
        operation: 'legacy-to-semantic',
        migratedCount: migrationResult.migrated,
        success: true 
      });
      announceToScreenReader(`Migrated ${migrationResult.migrated} legacy design tokens to semantic variables`);
    } else {
      safeLogEvent('debug', 'tokens/migration', { 
        operation: 'legacy-to-semantic',
        message: 'No legacy tokens found'
      });
    }
  } catch (error) {
    console.warn('Token migration failed:', error);
    safeLogEvent('error', 'tokens/migration', { 
      operation: 'legacy-to-semantic',
      error: String(error) 
    });
  }
}

async function runCatalogMigration(): Promise<void> {
  try {
    migrateCatalogStorage();
    safeLogEvent('info', 'catalog/import', { 
      operation: 'migration',
      success: true 
    });
  } catch (error) {
    console.warn('Catalog migration failed:', error);
    safePing('error', {
      job: 'catalog-migration',
      message: error instanceof Error ? error.message : String(error)
    });
    safeLogEvent('error', 'catalog/import', { 
      operation: 'migration',
      error: String(error) 
    });
  }
}

function sendPublishNotification(): void {
  setTimeout(() => {
    safePing('publish', {
      id: 'latest',
      event: 'publish',
      message: 'Enhanced with comprehensive button accessibility audit and WCAG AA compliance',
      url: window.location.origin,
      version: getAppVersion(),
      features: ACCESSIBILITY_FEATURES
    });
  }, 1000);
}

export async function initializeApp(): Promise<void> {
  // Configure logger first
  configureLogger({ 
    enableConsole: isDevelopment(), 
    enableLocal: true 
  });

  // Initialize session tracking for diagnostics
  const sessionId = initializeSession();

  // Log app boot start with session info
  logEvent('info', 'app/boot', { 
    timestamp: Date.now(),
    version: getAppVersion(),
    theme: getTheme(),
    browser: getBrowserInfo(),
    url: location.href,
    session: {
      id: sessionId,
      isNewSession: !sessionStorage.getItem('adsm:prev-session'),
      startTime: sessionStorage.getItem('adsm:session-start')
    }
  });

  // Mark this session as having been seen
  sessionStorage.setItem('adsm:prev-session', sessionId);

  // Initialize ping system first (will be silent if disabled)
  safeInitPingSystem();
  
  // Track app initialization start (don't await to avoid blocking)
  safePing('start', { 
    job: 'app-bootstrap',
    timestamp: Date.now()
  });

  // Note: Theme system is now initialized in App.tsx via themeManager
  // This ensures tokens are applied before any rendering occurs
  
  // Run one-time token migration after theme tokens are applied
  await runTokenMigration();
  
  // Run catalog migration once
  await runCatalogMigration();

  // Track successful initialization (don't await to avoid blocking)
  safePing('done', { 
    job: 'app-bootstrap',
    timestamp: Date.now()
  });

  // Log successful boot completion
  safeLogEvent('info', 'app/boot', { 
    status: 'complete',
    duration: Date.now(),
    features: APP_FEATURES
  });

  // Send notification about accessibility enhancements
  sendPublishNotification();

  // Load development utilities if in development mode
  if (isDevelopment()) {
    await loadDevelopmentUtilities();
  }
}

export function handleInitializationError(error: unknown): void {
  console.error('App initialization failed:', error);
  safePing('error', {
    job: 'app-bootstrap',
    message: error instanceof Error ? error.message : String(error)
  });
  safeLogEvent('error', 'app/boot', {
    error: String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
}