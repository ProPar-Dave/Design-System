// utils/importer.ts - Safe JSON import/export utilities with robust validation

import { DsComponent, normalizeCatalog, validateComponent, type Level, type Status } from './catalog';

// Import validation result
export interface ImportValidationResult {
  isValid: boolean;
  components: DsComponent[];
  errors: string[];
  warnings: string[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    skipped: number;
  };
}

// Export options
export interface ExportOptions {
  includeBuiltins?: boolean;
  formatOutput?: boolean;
  includeMetadata?: boolean;
  filename?: string;
}

// Enhanced JSON validation with detailed error reporting
export function validateJsonStructure(jsonString: string): ImportValidationResult {
  const result: ImportValidationResult = {
    isValid: false,
    components: [],
    errors: [],
    warnings: [],
    summary: {
      total: 0,
      valid: 0,
      invalid: 0,
      skipped: 0
    }
  };

  // Input validation
  if (!jsonString || typeof jsonString !== 'string') {
    result.errors.push('Invalid input: expected non-empty string');
    return result;
  }

  const trimmed = jsonString.trim();
  if (!trimmed) {
    result.errors.push('Empty JSON data');
    return result;
  }

  // Parse JSON with error handling
  let parsed: any;
  try {
    parsed = JSON.parse(trimmed);
  } catch (error) {
    if (error instanceof SyntaxError) {
      result.errors.push(`Invalid JSON syntax: ${error.message}`);
    } else {
      result.errors.push('Failed to parse JSON');
    }
    return result;
  }

  // Validate parsed structure
  if (!parsed) {
    result.errors.push('Empty JSON data after parsing');
    return result;
  }

  // Extract component array from different JSON structures
  let componentList: any[] = [];
  
  if (Array.isArray(parsed)) {
    componentList = parsed;
  } else if (parsed && typeof parsed === 'object') {
    // Try multiple possible array keys
    const possibleKeys = ['components', 'items', 'catalog', 'data', 'list'];
    let found = false;
    
    for (const key of possibleKeys) {
      if (Array.isArray(parsed[key])) {
        componentList = parsed[key];
        found = true;
        break;
      }
    }
    
    // If no array found but object looks like a single component
    if (!found && hasComponentFields(parsed)) {
      componentList = [parsed];
      result.warnings.push('Single component detected, converted to array');
    } else if (!found) {
      result.errors.push(`No component array found. Expected one of: ${possibleKeys.join(', ')}`);
      return result;
    }
  } else {
    result.errors.push('Invalid JSON format: expected array or object');
    return result;
  }

  if (!Array.isArray(componentList)) {
    result.errors.push('Component data is not an array');
    return result;
  }

  if (componentList.length === 0) {
    result.errors.push('No components found in file');
    return result;
  }

  // Validate each component
  result.summary.total = componentList.length;
  const validComponents: DsComponent[] = [];
  
  componentList.forEach((rawComponent, index) => {
    try {
      // Basic structure validation
      if (!rawComponent || typeof rawComponent !== 'object') {
        result.errors.push(`Component ${index + 1}: Not an object`);
        result.summary.invalid++;
        return;
      }

      // Detailed validation
      const validation = validateComponent(rawComponent);
      
      if (validation.isValid) {
        // Normalize and add to valid components
        const normalized = normalizeComponent(rawComponent);
        if (normalized) {
          validComponents.push(normalized);
          result.summary.valid++;
        } else {
          result.errors.push(`Component ${index + 1}: Failed to normalize after validation`);
          result.summary.invalid++;
        }
      } else {
        // Add detailed validation errors
        validation.issues.forEach(issue => {
          result.errors.push(`Component ${index + 1} (${rawComponent.name || rawComponent.id || 'unnamed'}): ${issue}`);
        });
        result.summary.invalid++;
      }
    } catch (error) {
      result.errors.push(`Component ${index + 1}: Unexpected error - ${error instanceof Error ? error.message : String(error)}`);
      result.summary.invalid++;
    }
  });

  result.summary.skipped = result.summary.total - result.summary.valid - result.summary.invalid;
  
  // Set result status
  if (validComponents.length === 0) {
    result.errors.push('No valid components could be imported - all entries were malformed');
    result.isValid = false;
  } else {
    result.components = validComponents;
    result.isValid = true;
    
    // Add summary warning if some components were skipped
    if (result.summary.invalid > 0 || result.summary.skipped > 0) {
      result.warnings.push(`${result.summary.invalid + result.summary.skipped} components were skipped due to validation errors`);
    }
  }

  return result;
}

// Helper function to detect if an object looks like a component
function hasComponentFields(obj: any): boolean {
  if (!obj || typeof obj !== 'object') return false;
  
  const requiredFields = ['id', 'name', 'level'];
  const hasRequired = requiredFields.some(field => field in obj);
  
  const possibleFields = ['version', 'status', 'tags', 'dependencies', 'notes', 'demo', 'code'];
  const hasPossible = possibleFields.some(field => field in obj);
  
  return hasRequired && hasPossible;
}

// Safe component normalization wrapper
function normalizeComponent(raw: any): DsComponent | null {
  try {
    // Import the normalize function from catalog
    const { normalizeComponent: normalize } = require('./catalog');
    return normalize(raw);
  } catch (error) {
    console.warn('Failed to normalize component:', error);
    return null;
  }
}

// Enhanced safe import with validation
export function safeImportComponents(fileText: string): DsComponent[] {
  const validation = validateJsonStructure(fileText);
  
  if (!validation.isValid) {
    const errorMessage = validation.errors.length > 0 
      ? validation.errors[0] // Use the first error as the main message
      : 'Unknown validation error';
    throw new Error(errorMessage);
  }

  return validation.components;
}

// Generate normalized export data
export function generateExportData(
  components: DsComponent[], 
  options: ExportOptions = {}
): string {
  const {
    formatOutput = true,
    includeMetadata = true
  } = options;

  // Filter components based on options
  let exportComponents = [...components];
  
  if (!options.includeBuiltins) {
    exportComponents = exportComponents.filter(c => 
      c.id && !c.id.includes('builtin-')
    );
  }

  // Normalize all components to ensure consistent format
  const normalized = normalizeCatalog(exportComponents);

  // Create export object
  const exportData: any = {
    components: normalized
  };

  // Add metadata if requested
  if (includeMetadata) {
    exportData.metadata = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      totalComponents: normalized.length,
      componentsByLevel: {
        atom: normalized.filter(c => c.level === 'atom').length,
        molecule: normalized.filter(c => c.level === 'molecule').length,
        organism: normalized.filter(c => c.level === 'organism').length
      },
      componentsByStatus: {
        draft: normalized.filter(c => c.status === 'draft').length,
        ready: normalized.filter(c => c.status === 'ready').length
      }
    };
  }

  // Format output
  const jsonString = formatOutput 
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData);

  return jsonString;
}

// Download helper
export function downloadJson(
  data: string, 
  filename: string = `adsm-components-${Date.now()}.json`
): void {
  try {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(`Failed to download file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Enhanced import error formatting
export function formatImportErrors(validation: ImportValidationResult): string {
  const { errors, warnings, summary } = validation;
  
  let message = '';
  
  if (errors.length > 0) {
    message += `Errors (${errors.length}):\n`;
    errors.slice(0, 5).forEach((error, index) => {
      message += `  ${index + 1}. ${error}\n`;
    });
    
    if (errors.length > 5) {
      message += `  ... and ${errors.length - 5} more errors\n`;
    }
    message += '\n';
  }
  
  if (warnings.length > 0) {
    message += `Warnings (${warnings.length}):\n`;
    warnings.forEach((warning, index) => {
      message += `  ${index + 1}. ${warning}\n`;
    });
    message += '\n';
  }
  
  message += `Summary: ${summary.valid}/${summary.total} components will be imported`;
  
  return message.trim();
}

// Validation preview for UI
export function validateImportPreview(fileText: string): {
  canImport: boolean;
  preview: {
    totalFound: number;
    validComponents: number;
    errorSummary: string;
  };
} {
  try {
    const validation = validateJsonStructure(fileText);
    
    return {
      canImport: validation.isValid && validation.components.length > 0,
      preview: {
        totalFound: validation.summary.total,
        validComponents: validation.summary.valid,
        errorSummary: validation.errors.length > 0 
          ? `${validation.errors.length} validation errors found`
          : validation.warnings.length > 0
          ? `${validation.warnings.length} warnings`
          : 'All components valid'
      }
    };
  } catch (error) {
    return {
      canImport: false,
      preview: {
        totalFound: 0,
        validComponents: 0,
        errorSummary: `Failed to validate: ${error instanceof Error ? error.message : String(error)}`
      }
    };
  }
}