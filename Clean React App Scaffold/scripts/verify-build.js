#!/usr/bin/env node

/**
 * Build Verification Script
 * Validates that all required artifacts are generated correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Atomic DS Manager build artifacts...\n');

// Expected artifacts configuration
const REQUIRED_ARTIFACTS = [
  {
    path: 'dist/index.js',
    type: 'esm',
    description: 'ESM bundle for consumption',
    minSize: 1000, // bytes
    checks: ['exists', 'size', 'esm']
  },
  {
    path: 'dist/adsm.css', 
    type: 'css',
    description: 'Extracted CSS styles',
    minSize: 500,
    checks: ['exists', 'size', 'css']
  },
  {
    path: 'dist/tokens.json',
    type: 'json',
    description: 'Design system tokens',
    minSize: 100,
    checks: ['exists', 'size', 'json', 'tokens-schema']
  },
  {
    path: 'dist/catalog.json',
    type: 'json', 
    description: 'Component catalog',
    minSize: 100,
    checks: ['exists', 'size', 'json', 'catalog-schema']
  },
  {
    path: 'catalog.json',
    type: 'json',
    description: 'Root catalog copy',
    minSize: 100,
    checks: ['exists', 'size', 'json', 'catalog-schema']
  },
  {
    path: 'tokens.json',
    type: 'json',
    description: 'Root tokens copy', 
    minSize: 100,
    checks: ['exists', 'size', 'json', 'tokens-schema']
  }
];

let allPassed = true;
let totalErrors = 0;

/**
 * Verification functions
 */

function checkExists(filePath) {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    console.log(`❌ Missing file: ${filePath}`);
    return false;
  }
  return true;
}

function checkSize(filePath, minSize) {
  try {
    const stats = fs.statSync(filePath);
    const size = stats.size;
    
    if (size < minSize) {
      console.log(`⚠️  File too small: ${filePath} (${size} bytes, expected >= ${minSize})`);
      return false;
    }
    
    const sizeStr = formatBytes(size);
    console.log(`📏 ${path.basename(filePath)}: ${sizeStr}`);
    return true;
  } catch (error) {
    console.log(`❌ Cannot read file size: ${filePath}`);
    return false;
  }
}

function checkJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    console.log(`✅ Valid JSON: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.log(`❌ Invalid JSON: ${filePath} - ${error.message}`);
    return false;
  }
}

function checkESM(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic ESM checks
    const hasExport = /export\s+/.test(content) || /export\s*{/.test(content);
    const hasImport = /import\s+/.test(content) || /from\s+['"]/.test(content);
    
    if (!hasExport) {
      console.log(`⚠️  No exports found in ESM bundle: ${filePath}`);
      return false;
    }
    
    console.log(`✅ Valid ESM bundle: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.log(`❌ Cannot validate ESM: ${filePath}`);
    return false;
  }
}

function checkCSS(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Basic CSS checks
    const hasCustomProps = /--[a-zA-Z-]+\s*:/.test(content);
    const hasSelectors = /[.#a-zA-Z][^{]*{/.test(content);
    
    if (!hasCustomProps) {
      console.log(`⚠️  No CSS custom properties found: ${filePath}`);
    }
    
    if (!hasSelectors) {
      console.log(`❌ No CSS selectors found: ${filePath}`);
      return false;
    }
    
    console.log(`✅ Valid CSS: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.log(`❌ Cannot validate CSS: ${filePath}`);
    return false;
  }
}

function checkTokensSchema(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check required top-level properties
    const requiredProps = ['name', 'version', 'tokens'];
    const missingProps = requiredProps.filter(prop => !content[prop]);
    
    if (missingProps.length > 0) {
      console.log(`❌ Missing tokens schema properties: ${missingProps.join(', ')}`);
      return false;
    }
    
    // Check tokens structure
    if (!content.tokens || typeof content.tokens !== 'object') {
      console.log(`❌ Invalid tokens structure in ${filePath}`);
      return false;
    }
    
    // Count token categories
    const categories = Object.keys(content.tokens);
    console.log(`📊 Token categories: ${categories.length} (${categories.join(', ')})`);
    
    console.log(`✅ Valid tokens schema: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.log(`❌ Tokens schema validation failed: ${filePath} - ${error.message}`);
    return false;
  }
}

function checkCatalogSchema(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check required top-level properties
    const requiredProps = ['name', 'version', 'components'];
    const missingProps = requiredProps.filter(prop => !content[prop]);
    
    if (missingProps.length > 0) {
      console.log(`❌ Missing catalog schema properties: ${missingProps.join(', ')}`);
      return false;
    }
    
    // Check components array
    if (!Array.isArray(content.components)) {
      console.log(`❌ Components is not an array in ${filePath}`);
      return false;
    }
    
    // Validate component structure
    const invalidComponents = content.components.filter((comp, index) => {
      const requiredCompProps = ['id', 'name', 'level', 'version', 'status'];
      const missingCompProps = requiredCompProps.filter(prop => !comp[prop]);
      
      if (missingCompProps.length > 0) {
        console.log(`❌ Component[${index}] missing properties: ${missingCompProps.join(', ')}`);
        return true;
      }
      
      return false;
    });
    
    if (invalidComponents.length > 0) {
      console.log(`❌ Found ${invalidComponents.length} invalid components`);
      return false;
    }
    
    // Report statistics
    const componentCount = content.components.length;
    const levels = content.components.reduce((acc, comp) => {
      acc[comp.level] = (acc[comp.level] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`📊 Components: ${componentCount} total`);
    console.log(`📊 Levels: ${Object.entries(levels).map(([level, count]) => `${level}(${count})`).join(', ')}`);
    
    console.log(`✅ Valid catalog schema: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.log(`❌ Catalog schema validation failed: ${filePath} - ${error.message}`);
    return false;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Main verification process
 */

console.log('📋 Checking required artifacts:\n');

for (const artifact of REQUIRED_ARTIFACTS) {
  console.log(`🔍 Verifying: ${artifact.path}`);
  console.log(`   ${artifact.description}`);
  
  let artifactPassed = true;
  let errors = 0;
  
  for (const check of artifact.checks) {
    let checkPassed = false;
    
    switch (check) {
      case 'exists':
        checkPassed = checkExists(artifact.path);
        break;
      case 'size':
        checkPassed = checkSize(artifact.path, artifact.minSize);
        break;
      case 'json':
        checkPassed = checkJSON(artifact.path);
        break;
      case 'esm':
        checkPassed = checkESM(artifact.path);
        break;
      case 'css':
        checkPassed = checkCSS(artifact.path);
        break;
      case 'tokens-schema':
        checkPassed = checkTokensSchema(artifact.path);
        break;
      case 'catalog-schema':
        checkPassed = checkCatalogSchema(artifact.path);
        break;
    }
    
    if (!checkPassed) {
      artifactPassed = false;
      errors++;
    }
  }
  
  if (artifactPassed) {
    console.log(`✅ ${artifact.path} - All checks passed\n`);
  } else {
    console.log(`❌ ${artifact.path} - ${errors} check(s) failed\n`);
    allPassed = false;
    totalErrors += errors;
  }
}

// Final summary
console.log('=' .repeat(60));
if (allPassed) {
  console.log('🎉 All build artifacts verified successfully!');
  console.log('\n📦 Ready for distribution:');
  
  REQUIRED_ARTIFACTS.forEach(artifact => {
    if (fs.existsSync(artifact.path)) {
      const size = formatBytes(fs.statSync(artifact.path).size);
      console.log(`   ✅ ${artifact.path} (${size})`);
    }
  });
  
  console.log('\n🚀 Build verification completed - artifacts ready for deployment!');
  process.exit(0);
} else {
  console.log(`❌ Build verification failed with ${totalErrors} error(s)`);
  console.log('\n🔧 Fix the issues above and run the build again.');
  process.exit(1);
}