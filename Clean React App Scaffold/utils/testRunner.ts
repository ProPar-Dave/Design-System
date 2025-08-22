/**
 * Test runner for development and CI environments
 * Provides CLI-style output and automated testing capabilities
 */

import { runQuickAudit, runFullAudit } from '../diagnostics/regressionAudit';
import { getAllAtomTestSuites, validateTestSuiteCompleteness } from './atomTestSuites';
import { testAtomContract } from './testing';
import { logger } from '../diagnostics/logger';

export interface TestRunnerOptions {
  mode: 'quick' | 'full';
  verbose: boolean;
  exitOnFailure: boolean;
  components?: string[];
}

export interface TestRunnerResult {
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  errors: string[];
  summary: string;
}

/**
 * Main test runner entry point
 */
export async function runTests(options: TestRunnerOptions = { mode: 'quick', verbose: false, exitOnFailure: false }): Promise<TestRunnerResult> {
  const startTime = performance.now();
  
  console.log(`\n🧪 Starting ${options.mode.toUpperCase()} regression tests...`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    let result;
    
    if (options.mode === 'quick') {
      result = await runQuickAudit();
    } else {
      result = await runFullAudit();
    }
    
    const duration = performance.now() - startTime;
    
    // Display results
    displayTestResults(result, options.verbose);
    
    const testRunnerResult: TestRunnerResult = {
      success: result.summary.failed === 0,
      totalTests: result.summary.totalTests,
      passedTests: result.summary.passed,
      failedTests: result.summary.failed,
      duration: Math.round(duration),
      errors: result.results.filter(r => !r.passed).flatMap(r => r.failures.map(f => f.message)),
      summary: generateSummary(result)
    };
    
    if (options.exitOnFailure && !testRunnerResult.success) {
      console.log('\n❌ Tests failed. Exiting with error code 1.');
      // In a real environment, this would call process.exit(1)
    }
    
    return testRunnerResult;
    
  } catch (error) {
    console.error('\n💥 Test runner failed:', error);
    return {
      success: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 1,
      duration: Math.round(performance.now() - startTime),
      errors: [String(error)],
      summary: `Test runner failed: ${error}`
    };
  }
}

/**
 * Display formatted test results in console
 */
function displayTestResults(result: any, verbose: boolean): void {
  console.log(`\n📊 Test Results (${result.mode.type.toUpperCase()} mode)`);
  console.log(`${'─'.repeat(40)}`);
  
  // Summary stats
  console.log(`⏱️  Duration: ${result.summary.duration}ms`);
  console.log(`📋 Total Tests: ${result.summary.totalTests}`);
  console.log(`✅ Passed: ${result.summary.passed}`);
  console.log(`❌ Failed: ${result.summary.failed}`);
  console.log(`📈 Success Rate: ${Math.round((result.summary.passed / result.summary.totalTests) * 100)}%`);
  
  // Results by component
  console.log(`\n📦 Component Results:`);
  result.results.forEach((componentResult: any) => {
    const icon = componentResult.passed ? '✅' : '❌';
    const duration = Math.round(componentResult.duration);
    console.log(`  ${icon} ${componentResult.component} (${componentResult.testType}) - ${duration}ms`);
    
    if (!componentResult.passed && verbose) {
      componentResult.failures.forEach((failure: any, index: number) => {
        console.log(`    ${index + 1}. ${failure.message}`);
        if (verbose) {
          console.log(`       Expected: ${failure.expected}`);
          console.log(`       Actual: ${failure.actual}`);
        }
      });
    }
  });
  
  // Recommendations
  if (result.recommendations.length > 0) {
    console.log(`\n💡 Recommendations:`);
    result.recommendations.forEach((rec: string, index: number) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }
  
  // Final status
  if (result.summary.failed === 0) {
    console.log(`\n🎉 All tests passed! Your atomic system is stable.`);
  } else {
    console.log(`\n⚠️  ${result.summary.failed} test(s) failed. Review the issues above.`);
  }
}

/**
 * Generate a concise summary string
 */
function generateSummary(result: any): string {
  const { passed, failed, totalTests, duration } = result.summary;
  const successRate = Math.round((passed / totalTests) * 100);
  
  return `${passed}/${totalTests} tests passed (${successRate}%) in ${duration}ms`;
}

/**
 * Run specific component tests
 */
export async function runComponentTests(componentNames: string[], verbose: boolean = false): Promise<TestRunnerResult> {
  const startTime = performance.now();
  
  console.log(`\n🧪 Testing specific components: ${componentNames.join(', ')}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    const testSuites = getAllAtomTestSuites();
    const filteredSuites = testSuites.filter(suite => 
      componentNames.includes(suite.component)
    );
    
    if (filteredSuites.length === 0) {
      console.log('❌ No matching components found.');
      return {
        success: false,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        duration: 0,
        errors: ['No matching components found'],
        summary: 'No tests run'
      };
    }
    
    let totalPassed = 0;
    let totalFailed = 0;
    const errors: string[] = [];
    
    for (const testSuite of filteredSuites) {
      console.log(`\n🔧 Testing ${testSuite.component}...`);
      
      const MockComponent = { displayName: testSuite.component } as any;
      const result = await testAtomContract(MockComponent, testSuite);
      
      if (result.passed) {
        totalPassed++;
        console.log(`  ✅ ${testSuite.component}: ${testSuite.testCases.length} test cases passed`);
      } else {
        totalFailed++;
        console.log(`  ❌ ${testSuite.component}: ${result.failures.length} failures`);
        
        if (verbose) {
          result.failures.forEach((failure, index) => {
            console.log(`    ${index + 1}. ${failure.message}`);
          });
        }
        
        errors.push(...result.failures.map(f => f.message));
      }
      
      // Validate test suite completeness
      const validation = validateTestSuiteCompleteness(testSuite);
      if (!validation.isComplete && verbose) {
        console.log(`  ⚠️  Test suite completeness issues:`);
        validation.missing.forEach(missing => {
          console.log(`    • Missing: ${missing}`);
        });
        validation.suggestions.forEach(suggestion => {
          console.log(`    💡 ${suggestion}`);
        });
      }
    }
    
    const duration = Math.round(performance.now() - startTime);
    const totalTests = filteredSuites.length;
    
    console.log(`\n📊 Component Test Summary`);
    console.log(`${'─'.repeat(30)}`);
    console.log(`✅ Passed: ${totalPassed}/${totalTests}`);
    console.log(`❌ Failed: ${totalFailed}/${totalTests}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    
    return {
      success: totalFailed === 0,
      totalTests,
      passedTests: totalPassed,
      failedTests: totalFailed,
      duration,
      errors,
      summary: `${totalPassed}/${totalTests} components passed`
    };
    
  } catch (error) {
    console.error('💥 Component testing failed:', error);
    return {
      success: false,
      totalTests: 0,
      passedTests: 0,
      failedTests: 1,
      duration: Math.round(performance.now() - startTime),
      errors: [String(error)],
      summary: `Component testing failed: ${error}`
    };
  }
}

/**
 * Validate all test suites for completeness
 */
export function validateTestSuites(): void {
  console.log(`\n🔍 Validating test suite completeness...`);
  console.log(`${'='.repeat(50)}`);
  
  const testSuites = getAllAtomTestSuites();
  let allValid = true;
  
  testSuites.forEach(testSuite => {
    const validation = validateTestSuiteCompleteness(testSuite);
    
    if (validation.isComplete) {
      console.log(`✅ ${testSuite.component}: Complete (${testSuite.testCases.length} test cases)`);
    } else {
      allValid = false;
      console.log(`⚠️  ${testSuite.component}: Incomplete`);
      validation.missing.forEach(missing => {
        console.log(`    ❌ Missing: ${missing}`);
      });
    }
    
    if (validation.suggestions.length > 0) {
      validation.suggestions.forEach(suggestion => {
        console.log(`    💡 ${suggestion}`);
      });
    }
  });
  
  if (allValid) {
    console.log(`\n🎉 All test suites are complete!`);
  } else {
    console.log(`\n⚠️  Some test suites need improvement. See details above.`);
  }
}

/**
 * Performance benchmark for testing system
 */
export async function benchmarkTests(): Promise<void> {
  console.log(`\n⚡ Benchmarking test performance...`);
  console.log(`${'='.repeat(40)}`);
  
  const iterations = 5;
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await runQuickAudit();
    const end = performance.now();
    times.push(end - start);
    
    console.log(`  Run ${i + 1}: ${Math.round(end - start)}ms`);
  }
  
  const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log(`\n📊 Benchmark Results:`);
  console.log(`  Average: ${Math.round(avgTime)}ms`);
  console.log(`  Min: ${Math.round(minTime)}ms`);
  console.log(`  Max: ${Math.round(maxTime)}ms`);
  console.log(`  Std Dev: ${Math.round(Math.sqrt(times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / times.length))}ms`);
}

// Global development utilities
declare global {
  interface Window {
    testAtomContracts: () => Promise<TestRunnerResult>;
    testComponent: (componentName: string) => Promise<TestRunnerResult>;
    validateTestSuites: () => void;
    benchmarkTests: () => Promise<void>;
    runQuickAudit: () => Promise<any>;
    runFullRegressionAudit: () => Promise<any>;
  }
}

// Export development utilities to global scope
if (typeof window !== 'undefined') {
  window.testAtomContracts = () => runTests({ mode: 'quick', verbose: true, exitOnFailure: false });
  window.testComponent = (componentName: string) => runComponentTests([componentName], true);
  window.validateTestSuites = validateTestSuites;
  window.benchmarkTests = benchmarkTests;
  window.runQuickAudit = runQuickAudit;
  window.runFullRegressionAudit = runFullAudit;
}