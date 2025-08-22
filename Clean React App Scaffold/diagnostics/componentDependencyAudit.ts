import type { AuditResult, ComponentInfo } from './utils';

export interface ComponentDependency {
  from: string;
  to: string;
  importType: 'atom' | 'molecule' | 'external' | 'util';
  line?: number;
  importStatement?: string;
}

export interface ComponentGraph {
  nodes: Set<string>;
  edges: ComponentDependency[];
  violations: ComponentViolation[];
}

export interface ComponentViolation {
  type: 'atom-imports-molecule' | 'molecule-imports-molecule' | 'circular-dependency';
  from: string;
  to: string;
  severity: 'error' | 'warning';
  message: string;
  line?: number;
}

export interface ComponentAnalysis {
  graph: ComponentGraph;
  atomsApi: Record<string, ComponentApi>;
  moleculesConfig: Record<string, MoleculeConfig>;
  layeringSummary: LayeringSummary;
}

export interface ComponentApi {
  name: string;
  props: PropDefinition[];
  variants: string[];
  exports: string[];
  description?: string;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  default?: string;
  description?: string;
}

export interface MoleculeConfig {
  name: string;
  intendedAtoms: string[];
  actualImports: string[];
  violations: string[];
  description?: string;
}

export interface LayeringSummary {
  totalAtoms: number;
  totalMolecules: number;
  violatingAtoms: number;
  violatingMolecules: number;
  circularDependencies: number;
  healthScore: number;
}

// Import parsing utilities
const IMPORT_PATTERNS = {
  namedImport: /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g,
  defaultImport: /import\s+(\w+)\s*from\s*['"]([^'"]+)['"]/g,
  namespaceImport: /import\s*\*\s*as\s+(\w+)\s*from\s*['"]([^'"]+)['"]/g,
  sideEffectImport: /import\s*['"]([^'"]+)['"]/g,
};

function categorizeImportPath(importPath: string): 'atom' | 'molecule' | 'external' | 'util' {
  if (importPath.includes('/atoms/')) return 'atom';
  if (importPath.includes('/molecules/')) return 'molecule';
  if (importPath.startsWith('./') || importPath.startsWith('../')) return 'util';
  return 'external';
}

function parseImportsFromContent(content: string, filePath: string): ComponentDependency[] {
  const dependencies: ComponentDependency[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Try all import patterns
    Object.entries(IMPORT_PATTERNS).forEach(([patternName, regex]) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        const importPath = match[2] || match[1]; // Handle different capture groups
        const importType = categorizeImportPath(importPath);
        
        // Only track atom/molecule imports
        if (importType === 'atom' || importType === 'molecule') {
          dependencies.push({
            from: filePath,
            to: importPath,
            importType,
            line: lineNum,
            importStatement: line.trim()
          });
        }
      }
    });
  });

  return dependencies;
}

function extractComponentType(filePath: string): 'atom' | 'molecule' | 'other' {
  if (filePath.includes('/atoms/')) return 'atom';
  if (filePath.includes('/molecules/')) return 'molecule';
  return 'other';
}

function detectViolations(dependencies: ComponentDependency[]): ComponentViolation[] {
  const violations: ComponentViolation[] = [];

  dependencies.forEach(dep => {
    const fromType = extractComponentType(dep.from);
    const toType = dep.importType;

    // Violation: Atom importing molecule
    if (fromType === 'atom' && toType === 'molecule') {
      violations.push({
        type: 'atom-imports-molecule',
        from: dep.from,
        to: dep.to,
        severity: 'error',
        message: `Atom "${dep.from}" cannot import molecule "${dep.to}". Atoms should not depend on molecules.`,
        line: dep.line
      });
    }

    // Violation: Molecule importing another molecule (except composition patterns)
    if (fromType === 'molecule' && toType === 'molecule') {
      const isCompositionPattern = checkIfCompositionPattern(dep);
      if (!isCompositionPattern) {
        violations.push({
          type: 'molecule-imports-molecule',
          from: dep.from,
          to: dep.to,
          severity: 'warning',
          message: `Molecule "${dep.from}" imports molecule "${dep.to}". Consider if this is appropriate composition or should be refactored.`,
          line: dep.line
        });
      }
    }
  });

  return violations;
}

function checkIfCompositionPattern(dependency: ComponentDependency): boolean {
  // Simple heuristic: if the import statement contains composition keywords
  const compositionKeywords = ['compose', 'wrapper', 'container', 'layout'];
  const statement = dependency.importStatement?.toLowerCase() || '';
  const toPath = dependency.to.toLowerCase();
  
  return compositionKeywords.some(keyword => 
    statement.includes(keyword) || toPath.includes(keyword)
  );
}

function detectCircularDependencies(dependencies: ComponentDependency[]): ComponentViolation[] {
  const violations: ComponentViolation[] = [];
  const graph = new Map<string, Set<string>>();

  // Build adjacency list
  dependencies.forEach(dep => {
    if (!graph.has(dep.from)) graph.set(dep.from, new Set());
    graph.get(dep.from)!.add(dep.to);
  });

  // DFS to detect cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(node: string, path: string[]): boolean {
    if (recursionStack.has(node)) {
      // Found a cycle
      const cycleStart = path.indexOf(node);
      const cycle = path.slice(cycleStart).concat([node]);
      
      violations.push({
        type: 'circular-dependency',
        from: cycle[0],
        to: cycle[cycle.length - 1],
        severity: 'error',
        message: `Circular dependency detected: ${cycle.join(' → ')}`
      });
      return true;
    }

    if (visited.has(node)) return false;

    visited.add(node);
    recursionStack.add(node);

    const neighbors = graph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor, [...path, node])) return true;
    }

    recursionStack.delete(node);
    return false;
  }

  // Check all nodes for cycles
  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      hasCycle(node, []);
    }
  }

  return violations;
}

async function analyzeComponentApi(filePath: string, content: string): Promise<ComponentApi> {
  const name = filePath.split('/').pop()?.replace('.tsx', '') || 'Unknown';
  
  // Extract props interface (simple regex-based extraction)
  const propsInterfaceMatch = content.match(/interface\s+(\w*Props)\s*\{([^}]+)\}/s);
  const props: PropDefinition[] = [];
  
  if (propsInterfaceMatch) {
    const propsBody = propsInterfaceMatch[2];
    const propLines = propsBody.split('\n').filter(line => line.trim());
    
    propLines.forEach(line => {
      const propMatch = line.match(/(\w+)(\??):\s*([^;]+);?/);
      if (propMatch) {
        const [, propName, optional, type] = propMatch;
        props.push({
          name: propName,
          type: type.trim(),
          required: !optional,
          description: extractPropComment(content, propName)
        });
      }
    });
  }

  // Extract variants from union types or enums
  const variants = extractVariants(content);
  
  // Extract exports
  const exports = extractExports(content);

  return {
    name,
    props,
    variants,
    exports,
    description: extractComponentComment(content)
  };
}

function extractPropComment(content: string, propName: string): string | undefined {
  const lines = content.split('\n');
  const propIndex = lines.findIndex(line => line.includes(`${propName}:`));
  
  if (propIndex > 0) {
    const prevLine = lines[propIndex - 1].trim();
    if (prevLine.startsWith('//') || prevLine.startsWith('*')) {
      return prevLine.replace(/^(\/\/|\*)\s*/, '');
    }
  }
  
  return undefined;
}

function extractComponentComment(content: string): string | undefined {
  const lines = content.split('\n');
  const componentMatch = content.match(/export\s+(?:default\s+)?(?:function|const)\s+(\w+)/);
  
  if (componentMatch) {
    const componentIndex = lines.findIndex(line => line.includes(componentMatch[0]));
    if (componentIndex > 0) {
      let comment = '';
      let i = componentIndex - 1;
      
      while (i >= 0 && (lines[i].trim().startsWith('//') || lines[i].trim().startsWith('*'))) {
        comment = lines[i].trim().replace(/^(\/\/|\*)\s*/, '') + ' ' + comment;
        i--;
      }
      
      return comment.trim() || undefined;
    }
  }
  
  return undefined;
}

function extractVariants(content: string): string[] {
  const variants: string[] = [];
  
  // Look for variant union types
  const variantMatches = content.matchAll(/(?:variant|size|color)\s*:\s*['"]([^'"]+)['"]|['"]([^'"]+)['"]\s*\|/g);
  
  for (const match of variantMatches) {
    const variant = match[1] || match[2];
    if (variant && !variants.includes(variant)) {
      variants.push(variant);
    }
  }
  
  return variants;
}

function extractExports(content: string): string[] {
  const exports: string[] = [];
  
  // Extract named exports
  const namedExportMatches = content.matchAll(/export\s+\{\s*([^}]+)\s*\}/g);
  for (const match of namedExportMatches) {
    const exportNames = match[1].split(',').map(name => name.trim().split(' ')[0]);
    exports.push(...exportNames);
  }
  
  // Extract default export
  const defaultExportMatch = content.match(/export\s+default\s+(?:function\s+)?(\w+)/);
  if (defaultExportMatch) {
    exports.push(defaultExportMatch[1]);
  }
  
  return exports;
}

export async function runComponentDependencyAudit(
  components: ComponentInfo[]
): Promise<AuditResult> {
  const startTime = Date.now();
  
  try {
    const dependencies: ComponentDependency[] = [];
    const atomsApi: Record<string, ComponentApi> = {};
    const moleculesConfig: Record<string, MoleculeConfig> = {};

    // Parse all components for dependencies and API
    for (const component of components) {
      if (!component.content) continue;

      const deps = parseImportsFromContent(component.content, component.id);
      dependencies.push(...deps);

      const componentType = extractComponentType(component.id);
      
      if (componentType === 'atom') {
        atomsApi[component.id] = await analyzeComponentApi(component.id, component.content);
      } else if (componentType === 'molecule') {
        const api = await analyzeComponentApi(component.id, component.content);
        const atomImports = deps.filter(d => d.importType === 'atom').map(d => d.to);
        const moleculeImports = deps.filter(d => d.importType === 'molecule').map(d => d.to);
        
        moleculesConfig[component.id] = {
          name: api.name,
          intendedAtoms: atomImports,
          actualImports: [...atomImports, ...moleculeImports],
          violations: moleculeImports.length > 0 ? ['imports-molecules'] : [],
          description: api.description
        };
      }
    }

    // Detect violations
    const layerViolations = detectViolations(dependencies);
    const circularViolations = detectCircularDependencies(dependencies);
    const allViolations = [...layerViolations, ...circularViolations];

    // Build graph
    const nodes = new Set([
      ...dependencies.map(d => d.from),
      ...dependencies.map(d => d.to)
    ]);

    const graph: ComponentGraph = {
      nodes,
      edges: dependencies,
      violations: allViolations
    };

    // Generate summary
    const atomComponents = Object.keys(atomsApi);
    const moleculeComponents = Object.keys(moleculesConfig);
    const violatingAtoms = allViolations.filter(v => 
      v.type === 'atom-imports-molecule' && atomComponents.some(a => v.from.includes(a))
    ).length;
    const violatingMolecules = allViolations.filter(v => 
      v.type === 'molecule-imports-molecule' && moleculeComponents.some(m => v.from.includes(m))
    ).length;
    const circularDeps = allViolations.filter(v => v.type === 'circular-dependency').length;

    const layeringSummary: LayeringSummary = {
      totalAtoms: atomComponents.length,
      totalMolecules: moleculeComponents.length,
      violatingAtoms,
      violatingMolecules,
      circularDependencies: circularDeps,
      healthScore: Math.max(0, 100 - (violatingAtoms * 10 + violatingMolecules * 5 + circularDeps * 20))
    };

    const analysis: ComponentAnalysis = {
      graph,
      atomsApi,
      moleculesConfig,
      layeringSummary
    };

    // Store analysis for README generation
    if (typeof window !== 'undefined') {
      (window as any).__ADSM_COMPONENT_ANALYSIS = analysis;
    }

    const duration = Date.now() - startTime;
    const errorCount = allViolations.filter(v => v.severity === 'error').length;
    const warningCount = allViolations.filter(v => v.severity === 'warning').length;

    return {
      passed: errorCount === 0,
      category: 'architecture',
      title: 'Component Dependency Audit',
      description: 'Validates component layering and dependency relationships',
      details: allViolations.map(violation => ({
        type: violation.severity,
        message: violation.message,
        component: violation.from,
        line: violation.line
      })),
      metrics: {
        duration,
        checked: components.length,
        errors: errorCount,
        warnings: warningCount,
        healthScore: layeringSummary.healthScore,
        atomCount: atomComponents.length,
        moleculeCount: moleculeComponents.length,
        violationCount: allViolations.length
      }
    };

  } catch (error) {
    return {
      passed: false,
      category: 'architecture',
      title: 'Component Dependency Audit',
      description: 'Failed to analyze component dependencies',
      details: [{
        type: 'error',
        message: `Audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        component: 'system'
      }],
      metrics: {
        duration: Date.now() - startTime,
        checked: 0,
        errors: 1,
        warnings: 0
      }
    };
  }
}