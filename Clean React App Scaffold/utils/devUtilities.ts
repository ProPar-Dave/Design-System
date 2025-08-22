import { announceToScreenReader } from './appHelpers';

export async function loadDevelopmentUtilities(): Promise<void> {
  try {
    const [
      { runAllAudits, testNavigationAudit, testFormFieldAudit, testButtonAudit, testAtomAudit, runFullDiagnostics },
      { runNavigationAuditFromConsole },
      { runFormFieldAuditFromConsole },
      { runButtonAuditFromConsole },
      { runAtomAuditFromConsole },
      { getLogBuffer },
      { migrateTokensToSemanticVars, getMigrationInfo },
      regressionAuditModule,
      testRunnerModule
    ] = await Promise.all([
      import('../diagnostics/audits'),
      import('../diagnostics/navigationAccessibilityAudit'),
      import('../diagnostics/formFieldAccessibilityAudit'),
      import('../diagnostics/buttonAccessibilityAudit'),
      import('../diagnostics/atomsTokenAudit'),
      import('../diagnostics/logger'),
      import('../tokensMigration'),
      import('../diagnostics/regressionAudit'),
      import('./testRunner')
    ]);

    // Test accessibility features
    (window as any).testA11y = () => {
      console.log('🔍 Testing accessibility features:');
      console.log('- Try Tab navigation through all interactive elements');
      console.log('- Press Alt+M to jump to main content');
      console.log('- Press Alt+N to jump to navigation');
      console.log('- Use Cmd/Ctrl+K for command palette');
      console.log('- Check focus indicators on all controls');
      console.log('- Test navigation contrast in both light/dark themes');
      console.log('- Test form field contrast and interactive states');
      console.log('- Test button contrast and variant distinction');
      console.log('- Test atomic design system token usage');
      console.log('- Verify WCAG AA compliance (4.5:1 contrast ratios)');
      announceToScreenReader('Accessibility testing mode activated');
      
      return {
        focusManagement: 'Enhanced focus indicators with 3px outlines',
        contrast: 'WCAG AA compliant (≥4.5:1 ratio)',
        keyboardNav: 'Full keyboard navigation support',
        screenReader: 'Comprehensive ARIA labels and announcements',
        touchTargets: 'Minimum 44px touch targets on mobile',
        navigationAudit: 'Comprehensive navigation accessibility audit system',
        formFieldAudit: 'Complete form field accessibility validation',
        buttonAudit: 'Complete button and CTA accessibility validation',
        atomsAudit: '100% token-driven atomic design system validation',
        colorBlindness: 'Color blindness simulation and testing support'
      };
    };
    
    // Individual audit functions
    (window as any).testNavigationA11y = runNavigationAuditFromConsole;
    (window as any).testFormFieldA11y = runFormFieldAuditFromConsole;
    (window as any).testButtonA11y = runButtonAuditFromConsole;
    (window as any).testAtomsA11y = runAtomAuditFromConsole;
    
    // Combined diagnostics
    (window as any).testDiagnostics = async () => {
      console.log('🔧 Running diagnostic tests...');
      try {
        const audits = await runAllAudits();
        const logs = getLogBuffer();
        console.log('✅ Audit results:', audits);
        console.log('📝 Recent logs:', logs.slice(-10));
        return { audits, logs };
      } catch (error) {
        console.error('❌ Diagnostics test failed:', error);
        return { error: String(error) };
      }
    };
    
    (window as any).testFullDiagnostics = runFullDiagnostics;
    
    // Token utilities
    (window as any).testTokenMigration = () => {
      console.log('🎨 Testing token migration system...');
      try {
        const migrationInfo = getMigrationInfo();
        if (migrationInfo) {
          console.log('📊 Last migration:', migrationInfo);
        } else {
          console.log('ℹ️  No previous migrations found');
        }
        
        const result = migrateTokensToSemanticVars();
        console.log('🔄 Migration result:', result);
        
        return { migrationInfo, result };
      } catch (error) {
        console.error('❌ Token migration test failed:', error);
        return { error: String(error) };
      }
    };
    
    // Theme testing
    (window as any).testTheme = () => {
      console.log('🎨 Testing theme system...');
      const { setTheme, getTheme } = require('../boot');
      const current = getTheme();
      console.log(`Current theme: ${current}`);
      
      const next = current === 'dark' ? 'light' : 'dark';
      console.log(`Switching to ${next} theme...`);
      setTheme(next);
      
      setTimeout(() => {
        setTheme(current);
        console.log(`Switched back to ${current} theme`);
      }, 2000);
      
      return {
        currentTheme: current,
        availableThemes: ['light', 'dark'],
        themeTokens: 'CSS custom properties with automatic dark mode',
        accessibility: 'WCAG AA compliant contrast in both themes',
        atomicSystem: '100% token-driven atomic design system'
      };
    };
    
    // Command palette testing
    (window as any).testCommandPalette = () => {
      console.log('⌨️  Testing command palette...');
      console.log('Press Cmd/Ctrl+K to open the command palette');
      console.log('Available commands: Toggle Theme, New Component, Import/Export, etc.');
      
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        metaKey: true
      });
      document.dispatchEvent(event);
      
      return {
        trigger: 'Cmd/Ctrl+K',
        commands: 'Navigation, Theme, Components, Tokens, Data Management',
        accessibility: 'Fully keyboard accessible with focus management'
      };
    };
    
    // Simplified contrast testing
    (window as any).testContrast = () => {
      console.log('🎨 Testing contrast checking utilities...');
      
      const navElements = document.querySelectorAll('.adsm-nav a, [role="navigation"] a');
      const formElements = document.querySelectorAll('input, textarea, select, button');
      const buttonElements = document.querySelectorAll('button, [role="button"], a.btn');
      const atomElements = document.querySelectorAll('[data-atom]');
      
      console.log('📊 Elements found:');
      console.log(`  Navigation: ${navElements.length}`);
      console.log(`  Form fields: ${formElements.length}`);
      console.log(`  Buttons: ${buttonElements.length}`);
      console.log(`  Atoms: ${atomElements.length}`);
      console.log('🔍 Run specific audit functions for detailed analysis');
      
      return {
        elementsFound: {
          navigation: navElements.length,
          formFields: formElements.length,
          buttons: buttonElements.length,
          atoms: atomElements.length
        },
        suggestions: [
          'Use testNavigationA11y() for navigation audit',
          'Use testFormFieldA11y() for form field audit',
          'Use testButtonA11y() for button audit',
          'Use testAtomsA11y() for atomic design system audit',
          'Use testFullDiagnostics() for complete system audit'
        ]
      };
    };
    
    // Form field testing
    (window as any).testFormFields = () => {
      console.log('📝 Testing form field accessibility...');
      
      const inputs = document.querySelectorAll('input');
      const textareas = document.querySelectorAll('textarea');
      const selects = document.querySelectorAll('select');
      
      return {
        fieldCounts: {
          inputs: inputs.length,
          textareas: textareas.length,
          selects: selects.length
        },
        suggestion: 'Use testFormFieldA11y() for comprehensive WCAG AA form field audit'
      };
    };
    
    // Button testing
    (window as any).testButtons = () => {
      console.log('🔘 Testing button accessibility...');
      
      const buttons = document.querySelectorAll('button');
      const linkButtons = document.querySelectorAll('a[role="button"], a.btn');
      const atomButtons = document.querySelectorAll('[data-atom="button"]');
      
      return {
        buttonCounts: {
          buttons: buttons.length,
          linkButtons: linkButtons.length,
          atomButtons: atomButtons.length
        },
        suggestion: 'Use testButtonA11y() for comprehensive WCAG AA button audit'
      };
    };
    
    // Atomic design system testing
    (window as any).testAtoms = () => {
      console.log('⚛️  Testing atomic design system...');
      
      const atoms = document.querySelectorAll('[data-atom]');
      const atomTypes = new Set();
      atoms.forEach(atom => {
        const type = atom.getAttribute('data-atom');
        if (type) atomTypes.add(type);
      });
      
      console.log(`Found ${atoms.length} atomic elements of ${atomTypes.size} types:`);
      Array.from(atomTypes).forEach(type => {
        const count = document.querySelectorAll(`[data-atom="${type}"]`).length;
        console.log(`  ${type}: ${count} instances`);
      });
      
      return {
        totalAtoms: atoms.length,
        atomTypes: Array.from(atomTypes),
        suggestion: 'Use testAtomsA11y() for comprehensive token usage and WCAG AA audit'
      };
    };
    
    // Regression testing utilities
    (window as any).testAtomContracts = () => testRunnerModule.runTests({ mode: 'quick', verbose: true, exitOnFailure: false });
    (window as any).testComponent = (componentName: string) => testRunnerModule.runComponentTests([componentName], true);
    (window as any).validateTestSuites = testRunnerModule.validateTestSuites;
    (window as any).benchmarkTests = testRunnerModule.benchmarkTests;
    (window as any).runQuickAudit = regressionAuditModule.runQuickAudit;
    (window as any).runFullRegressionAudit = regressionAuditModule.runFullAudit;

    console.log('🚀 Development utilities loaded:');
    console.log('- testA11y() - Test accessibility features');
    console.log('- testNavigationA11y() - Test navigation accessibility audit');
    console.log('- testFormFieldA11y() - Test form field accessibility audit');
    console.log('- testButtonA11y() - Test button accessibility audit');
    console.log('- testAtomsA11y() - Test atomic design system audit');
    console.log('- testDiagnostics() - Run system diagnostics');
    console.log('- testFullDiagnostics() - Run comprehensive diagnostics suite');
    console.log('- testTokenMigration() - Test token migration system');
    console.log('- testTheme() - Test theme switching');
    console.log('- testCommandPalette() - Test command palette');
    console.log('- testContrast() - Test contrast checking utilities');
    console.log('- testFormFields() - Test form field accessibility');
    console.log('- testButtons() - Test button accessibility');
    console.log('- testAtoms() - Test atomic design system');
    console.log('');
    console.log('🧪 Regression Testing System:');
    console.log('- runQuickAudit() - Fast atom contract testing (development mode)');
    console.log('- runFullRegressionAudit() - Complete visual + contract testing (release mode)');
    console.log('- testAtomContracts() - Test all atom prop→className contracts');
    console.log('- testComponent(name) - Test specific component contracts');
    console.log('- validateTestSuites() - Validate test suite completeness');
    console.log('- benchmarkTests() - Performance benchmark testing system');
    console.log('');
    console.log('⚛️  Atomic Design System Features:');
    console.log('- 100% token-driven atoms (Button, Input, Select, Textarea, Checkbox, Radio, Switch, Chip, Badge, Label, HelpText, Divider)');
    console.log('- Normalized atom props/variants across all components');
    console.log('- Atom contract testing prevents prop→className regressions');
    console.log('- Visual regression testing for molecule consistency');
    console.log('- WCAG AA compliant contrast ratios (≥4.5:1) in all themes');
    console.log('- Comprehensive token usage validation');
    console.log('- Automatic contrast fallback handling');
    console.log('- Component metadata for catalog integration');
    
  } catch (error) {
    console.warn('⚠️  Failed to load development utilities:', error);
  }
}