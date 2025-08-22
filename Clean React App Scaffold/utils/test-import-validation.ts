// utils/test-import-validation.ts - Test utilities for import validation
// This file can be used in development to test the import system

import { validateJsonStructure, formatImportErrors } from './importer';

// Test cases for import validation
export const testCases = {
  validArray: {
    name: 'Valid Component Array',
    json: JSON.stringify([
      {
        id: 'test-button',
        name: 'Test Button',
        level: 'atom',
        version: '1.0.0',
        status: 'ready',
        tags: ['ui', 'button'],
        dependencies: []
      }
    ]),
    expectedValid: true
  },
  
  validObject: {
    name: 'Valid Component Object',
    json: JSON.stringify({
      components: [
        {
          id: 'test-input',
          name: 'Test Input',
          level: 'atom',
          version: '1.0.0',
          status: 'draft',
          tags: ['form'],
          dependencies: []
        }
      ]
    }),
    expectedValid: true
  },
  
  invalidJson: {
    name: 'Invalid JSON Syntax',
    json: '{ invalid json }',
    expectedValid: false
  },
  
  missingRequired: {
    name: 'Missing Required Fields',
    json: JSON.stringify([
      {
        name: 'Incomplete Component'
        // Missing id, level, version, status, tags, dependencies
      }
    ]),
    expectedValid: false
  },
  
  invalidLevel: {
    name: 'Invalid Level Value',
    json: JSON.stringify([
      {
        id: 'test-component',
        name: 'Test Component',
        level: 'invalid-level',
        version: '1.0.0',
        status: 'ready',
        tags: [],
        dependencies: []
      }
    ]),
    expectedValid: false
  },
  
  emptyArray: {
    name: 'Empty Array',
    json: JSON.stringify([]),
    expectedValid: false
  },
  
  mixedValidInvalid: {
    name: 'Mixed Valid and Invalid Components',
    json: JSON.stringify([
      {
        id: 'valid-component',
        name: 'Valid Component',
        level: 'atom',
        version: '1.0.0',
        status: 'ready',
        tags: [],
        dependencies: []
      },
      {
        name: 'Invalid Component'
        // Missing required fields
      }
    ]),
    expectedValid: true // Should be valid because at least one component is valid
  }
};

// Run validation tests
export function runImportValidationTests(): void {
  console.log('🧪 Running Import Validation Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  Object.entries(testCases).forEach(([key, testCase]) => {
    console.log(`Testing: ${testCase.name}`);
    
    try {
      const result = validateJsonStructure(testCase.json);
      const actualValid = result.isValid;
      
      if (actualValid === testCase.expectedValid) {
        console.log(`✅ PASS - Expected: ${testCase.expectedValid}, Got: ${actualValid}`);
        passed++;
      } else {
        console.log(`❌ FAIL - Expected: ${testCase.expectedValid}, Got: ${actualValid}`);
        console.log(`   Errors: ${result.errors.join(', ')}`);
        failed++;
      }
      
      // Show additional details for debugging
      if (result.summary.total > 0) {
        console.log(`   Summary: ${result.summary.valid}/${result.summary.total} valid components`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR - ${error instanceof Error ? error.message : String(error)}`);
      failed++;
    }
    
    console.log('');
  });
  
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('🔍 Some tests failed. Check the validation logic.');
  }
}

// Test error formatting
export function testErrorFormatting(): void {
  console.log('🧪 Testing Error Formatting...\n');
  
  const testResult = validateJsonStructure(testCases.mixedValidInvalid.json);
  const formatted = formatImportErrors(testResult);
  
  console.log('Formatted Error Output:');
  console.log('---');
  console.log(formatted);
  console.log('---\n');
}

// Utility to test with custom JSON
export function testCustomJson(jsonString: string): void {
  console.log('🧪 Testing Custom JSON...\n');
  
  const result = validateJsonStructure(jsonString);
  
  console.log(`Valid: ${result.isValid}`);
  console.log(`Total components found: ${result.summary.total}`);
  console.log(`Valid components: ${result.summary.valid}`);
  console.log(`Invalid components: ${result.summary.invalid}`);
  
  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.log('\nWarnings:');
    result.warnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
  }
  
  console.log('\nFormatted Error Message:');
  console.log(formatImportErrors(result));
}

// Export test runner for development console
if (typeof window !== 'undefined') {
  (window as any).testImportValidation = runImportValidationTests;
  (window as any).testErrorFormatting = testErrorFormatting;
  (window as any).testCustomJson = testCustomJson;
  
  console.log('🧪 Import validation test utilities loaded. Available functions:');
  console.log('  - testImportValidation() - Run all validation tests');
  console.log('  - testErrorFormatting() - Test error message formatting');
  console.log('  - testCustomJson(jsonString) - Test custom JSON input');
}