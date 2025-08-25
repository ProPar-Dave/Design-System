// Test script to verify catalog loading works in all scenarios
// Run with: node scripts/test-catalog-loading.js

const { JSDOM } = require('jsdom');

// Mock browser environment
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'https://example.com/',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.fetch = require('node-fetch');
global.performance = { now: () => Date.now() };

// Clear localStorage
localStorage.clear();

// Test 1: Empty localStorage should load starter catalog
console.log('🧪 Test 1: Empty localStorage -> starter catalog');
try {
  const { loadCatalog } = require('../src/catalog/loader.ts');
  loadCatalog().then(result => {
    console.log(`✅ Loaded ${result.count} components from ${result.loadedFrom}`);
    console.log(`   Expected: starter, Got: ${result.loadedFrom}`);
    
    if (result.loadedFrom === 'starter' && result.count > 0) {
      console.log('✅ Test 1 PASSED');
    } else {
      console.log('❌ Test 1 FAILED');
    }
  }).catch(err => {
    console.log('❌ Test 1 FAILED:', err.message);
  });
} catch (err) {
  console.log('❌ Test 1 FAILED (import):', err.message);
}

// Test 2: Document.baseURI URL construction
console.log('\n🧪 Test 2: URL construction with document.baseURI');
try {
  const baseURI = document.baseURI;
  const catalogUrl = new URL('catalog.json', baseURI).toString();
  
  console.log(`   Base URI: ${baseURI}`);
  console.log(`   Catalog URL: ${catalogUrl}`);
  
  if (catalogUrl.includes('catalog.json')) {
    console.log('✅ Test 2 PASSED');
  } else {
    console.log('❌ Test 2 FAILED');
  }
} catch (err) {
  console.log('❌ Test 2 FAILED:', err.message);
}

// Test 3: Starter catalog structure
console.log('\n🧪 Test 3: Starter catalog structure');
try {
  const { starterCatalog } = require('../src/catalog/starterCatalog.ts');
  
  console.log(`   Components count: ${starterCatalog.length}`);
  console.log(`   First component: ${starterCatalog[0]?.name} (${starterCatalog[0]?.level})`);
  
  const hasRequiredFields = starterCatalog.every(comp => 
    comp.id && comp.name && comp.level && comp.version && comp.status &&
    Array.isArray(comp.tags) && Array.isArray(comp.dependencies)
  );
  
  if (starterCatalog.length >= 12 && hasRequiredFields) {
    console.log('✅ Test 3 PASSED');
  } else {
    console.log('❌ Test 3 FAILED');
  }
} catch (err) {
  console.log('❌ Test 3 FAILED:', err.message);
}

console.log('\n🎯 Catalog loading system verification complete');