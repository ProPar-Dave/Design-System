import type { ComponentAnalysis, ComponentApi, MoleculeConfig, LayeringSummary } from '../diagnostics/componentDependencyAudit';

export interface ReadmeSection {
  title: string;
  content: string;
  level: number;
}

export interface ReadmeConfig {
  includeAtoms: boolean;
  includeMolecules: boolean;
  includeTokens: boolean;
  includeAudits: boolean;
  includeGraph: boolean;
}

export function generateReadmeSections(
  analysis: ComponentAnalysis,
  config: ReadmeConfig = {
    includeAtoms: true,
    includeMolecules: true,
    includeTokens: true,
    includeAudits: true,
    includeGraph: true
  }
): ReadmeSection[] {
  const sections: ReadmeSection[] = [];

  if (config.includeAtoms) {
    sections.push(generateAtomsApiSection(analysis.atomsApi));
  }

  if (config.includeMolecules) {
    sections.push(generateMoleculesSection(analysis.moleculesConfig));
  }

  if (config.includeTokens) {
    sections.push(generateTokenSurfaceSection(analysis));
  }

  if (config.includeAudits) {
    sections.push(generateAuditGuideSection(analysis.layeringSummary));
  }

  if (config.includeGraph) {
    sections.push(generateDependencyGraphSection(analysis));
  }

  return sections;
}

function generateAtomsApiSection(atomsApi: Record<string, ComponentApi>): ReadmeSection {
  let content = `
This section documents all atomic components in the design system, their props, variants, and usage guidelines.

## Design Principles

Atoms are the fundamental building blocks of our design system. They should:
- Have no dependencies on other atoms or molecules
- Use only design tokens for styling
- Be completely self-contained and reusable
- Follow accessibility best practices
- Support all required variants and states

## Component Directory
`;

  const sortedAtoms = Object.entries(atomsApi).sort(([a], [b]) => a.localeCompare(b));

  // Generate table of contents
  content += `
### Quick Reference

| Component | Props | Variants | Description |
|-----------|-------|----------|-------------|
`;

  sortedAtoms.forEach(([path, api]) => {
    const propsCount = api.props.length;
    const variantsCount = api.variants.length;
    const description = api.description || 'No description available';
    
    content += `| [${api.name}](#${api.name.toLowerCase()}) | ${propsCount} | ${variantsCount} | ${description} |\n`;
  });

  // Generate detailed documentation for each atom
  content += `\n## Components\n`;

  sortedAtoms.forEach(([path, api]) => {
    content += generateAtomDocumentation(api);
  });

  return {
    title: 'Atoms API Reference',
    content,
    level: 1
  };
}

function generateAtomDocumentation(api: ComponentApi): string {
  let doc = `
### ${api.name}

${api.description || 'A reusable atomic component.'}

**File:** \`${api.name}.tsx\`  
**Exports:** ${api.exports.join(', ')}

#### Props

`;

  if (api.props.length === 0) {
    doc += 'This component accepts no props.\n';
  } else {
    doc += `
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
`;

    api.props.forEach(prop => {
      const required = prop.required ? '✅' : '❌';
      const defaultValue = prop.default || '-';
      const description = prop.description || '-';
      
      doc += `| \`${prop.name}\` | \`${prop.type}\` | ${required} | \`${defaultValue}\` | ${description} |\n`;
    });
  }

  if (api.variants.length > 0) {
    doc += `
#### Variants

Available variants: ${api.variants.map(v => `\`${v}\``).join(', ')}

`;
  }

  doc += `
#### Usage Example

\`\`\`tsx
import { ${api.name} } from './components/atoms/${api.name}';

// Basic usage
<${api.name} />

${api.props.length > 0 ? `// With props
<${api.name} ${api.props.slice(0, 2).map(p => `${p.name}="${p.type.includes('string') ? 'value' : 'true'}"`).join(' ')} />` : ''}
\`\`\`

#### Accessibility Notes

- Ensure proper ARIA labels when using interactive variants
- Test with keyboard navigation and screen readers
- Maintain sufficient color contrast ratios

---
`;

  return doc;
}

function generateMoleculesSection(moleculesConfig: Record<string, MoleculeConfig>): ReadmeSection {
  let content = `
Molecules are combinations of atoms that work together as a unit. They represent more complex UI patterns while maintaining composability and reusability.

## Design Principles

Molecules should:
- Compose multiple atoms into meaningful patterns
- Avoid dependencies on other molecules (except composition patterns)
- Implement specific user interface patterns
- Maintain consistent spacing and layout
- Handle complex interactions between atoms

## Molecule Directory

| Component | Intended Atoms | Current Imports | Status |
|-----------|----------------|-----------------|---------|
`;

  const sortedMolecules = Object.entries(moleculesConfig).sort(([a], [b]) => a.localeCompare(b));

  sortedMolecules.forEach(([path, config]) => {
    const intendedAtoms = config.intendedAtoms.map(atom => atom.split('/').pop()?.replace('.tsx', '')).join(', ') || 'None';
    const actualImports = config.actualImports.length;
    const status = config.violations.length === 0 ? '✅ Clean' : `⚠️ ${config.violations.length} issues`;
    
    content += `| ${config.name} | ${intendedAtoms} | ${actualImports} imports | ${status} |\n`;
  });

  content += `
## Component Details
`;

  sortedMolecules.forEach(([path, config]) => {
    content += `
### ${config.name}

${config.description || 'A molecular component that combines multiple atoms.'}

**Intended Atoms:** ${config.intendedAtoms.map(atom => `\`${atom.split('/').pop()?.replace('.tsx', '')}\``).join(', ') || 'None specified'}

**Current Dependencies:** ${config.actualImports.length} total imports

`;

    if (config.violations.length > 0) {
      content += `
**⚠️ Architecture Issues:**
${config.violations.map(v => `- ${v}`).join('\n')}

`;
    }

    content += `
**Usage Guidelines:**
- Use this component when you need ${config.name.toLowerCase()} functionality
- Ensure all required atoms are available in your context
- Follow the composition patterns established in the implementation
- Test interactive states and accessibility features

---
`;
  });

  return {
    title: 'Molecules Reference',
    content,
    level: 1
  };
}

function generateTokenSurfaceSection(analysis: ComponentAnalysis): ReadmeSection {
  const content = `
The Token Surface Map defines which design tokens each component is allowed to use. This ensures consistency, prevents token proliferation, and makes it easier to maintain the design system.

## Token Surface Principles

1. **Atoms** should only use core design tokens (colors, spacing, typography, borders)
2. **Molecules** can use component-specific tokens in addition to core tokens
3. **Raw values** (like \`#ff0000\` or \`16px\`) should never be used directly
4. **Token violations** are automatically detected and reported in diagnostics

## Token Categories

### Core Tokens
Used by atoms for fundamental styling:
- \`--color-*\` - Color palette tokens
- \`--space-*\` - Spacing and sizing tokens  
- \`--font-*\` - Typography tokens
- \`--radius-*\` - Border radius tokens
- \`--border-*\` - Border width tokens

### Component Tokens  
Used by molecules for specific component styling:
- \`--button-*\` - Button component tokens
- \`--input-*\` - Input component tokens
- \`--card-*\` - Card component tokens
- \`--chip-*\` - Chip component tokens

## Allowed Token Surface by Component

### Atoms
| Component | Allowed Token Categories | Example Tokens |
|-----------|-------------------------|----------------|
| Button | color, space, font, radius | \`--color-primary\`, \`--space-md\`, \`--font-weight-medium\` |
| Input | color, space, font, radius, border | \`--color-border\`, \`--space-sm\`, \`--radius-md\` |
| Chip | color, space, font, radius | \`--color-muted\`, \`--space-xs\`, \`--font-size-sm\` |

### Molecules  
| Component | Allowed Token Categories | Additional Tokens |
|-----------|-------------------------|-------------------|
| Card | All core + component | \`--card-bg\`, \`--card-border\`, \`--card-shadow\` |
| Alert | All core + component | \`--alert-*\` tokens for variants |
| Toast | All core + component | \`--toast-*\` tokens for positioning |

## Token Validation

The system automatically validates token usage in all components:

### Quick Audit
Checks for common violations:
- Raw color values (\`#hex\`, \`rgb()\`, \`hsl()\`)
- Raw spacing values (\`px\`, \`rem\`, \`em\` without tokens)
- Disallowed token categories

### Full Audit  
Comprehensive analysis including:
- Cross-reference with token allowlist
- Unused token detection
- Token consistency validation
- Performance impact analysis

Run these audits from the Diagnostics panel → Token Surface tab.

## Violation Examples

❌ **Bad:** Raw values
\`\`\`css
.button {
  background: #3b82f6;  /* Should use --color-primary */
  padding: 12px 16px;   /* Should use --space-sm --space-md */
}
\`\`\`

✅ **Good:** Token usage  
\`\`\`css
.button {
  background: var(--color-primary);
  padding: var(--space-sm) var(--space-md);
}
\`\`\`

❌ **Bad:** Atom using component tokens
\`\`\`css
/* In Button.tsx (atom) */
.button {
  background: var(--card-bg); /* Atoms shouldn't use component tokens */
}
\`\`\`

✅ **Good:** Atom using core tokens
\`\`\`css  
/* In Button.tsx (atom) */
.button {
  background: var(--color-primary); /* Core token is appropriate */
}
\`\`\`

## Adding New Tokens

1. **Core tokens:** Add to \`/styles/tokens/core.css\`
2. **Component tokens:** Add to \`/styles/tokens/components.css\`  
3. **Update allowlist:** Modify \`/diagnostics/tokenSurfaceConfig.ts\`
4. **Run validation:** Use Diagnostics → Token Surface → Full Audit

This ensures new tokens are properly categorized and validated.
`;

  return {
    title: 'Token Surface Map',
    content,
    level: 1
  };
}

function generateAuditGuideSection(summary: LayeringSummary): ReadmeSection {
  const healthStatus = summary.healthScore >= 90 ? '🟢 Excellent' : 
                      summary.healthScore >= 70 ? '🟡 Good' : 
                      summary.healthScore >= 50 ? '🟠 Needs Attention' : '🔴 Critical';

  const content = `
The Atomic DS Manager includes comprehensive audit tools to ensure code quality, accessibility, and architectural integrity. This guide explains how to run and interpret different types of audits.

## Current System Health

**Overall Score:** ${summary.healthScore}/100 ${healthStatus}

| Metric | Count | Status |
|--------|-------|---------|
| Total Atoms | ${summary.totalAtoms} | ✅ |
| Total Molecules | ${summary.totalMolecules} | ✅ |
| Violating Atoms | ${summary.violatingAtoms} | ${summary.violatingAtoms === 0 ? '✅' : '⚠️'} |
| Violating Molecules | ${summary.violatingMolecules} | ${summary.violatingMolecules === 0 ? '✅' : '⚠️'} |
| Circular Dependencies | ${summary.circularDependencies} | ${summary.circularDependencies === 0 ? '✅' : '🔴'} |

## Audit Types

### Quick Audit (⚡ ~2-5 seconds)

**What it checks:**
- Component accessibility basics (ARIA, keyboard nav)  
- Token surface violations (raw colors, spacing)
- Import/export syntax validation
- Basic architectural layering

**When to use:**
- During development
- Before committing code
- Quick health checks
- CI/CD pipeline gates

**How to run:**
1. Open Diagnostics panel (⌘/Ctrl + D)
2. Click "Run Quick Audit" 
3. Review results in real-time
4. Fix critical issues immediately

### Full Audit (🔍 ~10-30 seconds)

**What it checks:**
- Complete accessibility analysis (WCAG AA compliance)
- Comprehensive token validation
- Component dependency graph analysis  
- Performance impact assessment
- Cross-browser compatibility checks
- Security vulnerability scanning

**When to use:**
- Before releases
- Weekly code reviews  
- Architecture planning
- Performance optimization
- Compliance audits

**How to run:**
1. Open Diagnostics panel (⌘/Ctrl + D)
2. Switch to "Full Audit" tab
3. Click "Run Complete Analysis"
4. Wait for comprehensive report
5. Review detailed recommendations

## Audit Categories

### 🏗️ Architecture Audits

**Component Layering:** Ensures atoms don't import molecules, molecules don't import other molecules
- **Pass:** Clean dependency graph
- **Warn:** Molecule-to-molecule imports (check if intentional composition)  
- **Fail:** Atom-to-molecule imports (violates atomic principles)

**Circular Dependencies:** Detects import cycles that can cause build issues
- **Pass:** No circular dependencies
- **Fail:** Any circular import detected

### 🎨 Token Surface Audits

**Token Compliance:** Validates allowed token usage per component type
- **Pass:** Only approved tokens used
- **Warn:** Deprecated token usage
- **Fail:** Raw values or disallowed tokens

**Token Consistency:** Checks for consistent token application
- **Pass:** Consistent usage patterns
- **Warn:** Inconsistent but valid usage
- **Fail:** Contradictory token applications

### ♿ Accessibility Audits

**WCAG AA Compliance:** Comprehensive accessibility validation
- **Pass:** Meets all WCAG AA criteria
- **Warn:** Minor accessibility improvements needed
- **Fail:** Accessibility barriers detected

**Keyboard Navigation:** Tests keyboard interaction patterns
- **Pass:** Full keyboard accessibility
- **Warn:** Some keyboard shortcuts missing
- **Fail:** Keyboard navigation broken

### 🚀 Performance Audits

**Bundle Analysis:** Checks component bundle size and optimization
- **Pass:** Optimal bundle size
- **Warn:** Bundle size approaching limits
- **Fail:** Bundle size too large

**Render Performance:** Analyzes component rendering efficiency  
- **Pass:** Efficient rendering
- **Warn:** Minor performance issues
- **Fail:** Performance bottlenecks detected

## Interpreting Results

### Error Levels

🔴 **Critical Errors:** Must fix before deployment
- Security vulnerabilities
- Accessibility barriers  
- Circular dependencies
- Architecture violations

🟡 **Warnings:** Should fix in next iteration
- Minor accessibility improvements
- Token inconsistencies  
- Performance optimizations
- Code style issues

🔵 **Info:** Consider for future improvements
- Enhancement suggestions
- Best practice recommendations
- Optimization opportunities

### Taking Action

1. **Start with Critical Errors:** Fix red items first
2. **Address Warnings:** Tackle yellow items by priority
3. **Plan Improvements:** Schedule blue items for future sprints
4. **Re-run Audits:** Validate fixes with fresh audit runs
5. **Track Progress:** Use audit history to monitor improvements

## Automation Integration

### CI/CD Pipeline

Add audit checks to your build process:

\`\`\`yaml
# In your workflow file
- name: Run Quick Audit
  run: npm run audit:quick
  
- name: Run Full Audit (Release only)
  if: github.ref == 'refs/heads/main'
  run: npm run audit:full
\`\`\`

### Git Hooks

Prevent commits with critical errors:

\`\`\`bash
# In .git/hooks/pre-commit
npm run audit:quick --fail-on-error
\`\`\`

### IDE Integration  

Some editors support real-time audit feedback through the LSP protocol or custom extensions.

## Audit History & Tracking

The system maintains audit history to track improvements over time:

- **Trend Analysis:** See health score progression
- **Regression Detection:** Identify when new issues were introduced  
- **Release Gates:** Ensure quality before deployments
- **Team Metrics:** Track team adherence to standards

Access audit history from Diagnostics → History tab.

## Troubleshooting Common Issues

### "Atom imports molecule" Error
**Cause:** Atom component importing from molecules folder  
**Fix:** Refactor to use only other atoms or create a new molecule

### "Raw color detected" Warning  
**Cause:** Hard-coded color values instead of tokens
**Fix:** Replace with appropriate \`--color-*\` token

### "Circular dependency" Error
**Cause:** Components importing each other directly or indirectly
**Fix:** Refactor to break the cycle, often by extracting shared logic

### "Missing ARIA labels" Warning
**Cause:** Interactive elements without accessibility labels  
**Fix:** Add appropriate \`aria-label\`, \`aria-labelledby\`, or \`aria-describedby\`

For more help, consult the diagnostic details or contact the design system team.
`;

  return {
    title: 'Audit Guide',
    content,
    level: 1
  };
}

function generateDependencyGraphSection(analysis: ComponentAnalysis): ReadmeSection {
  const { graph, atomsApi, moleculesConfig } = analysis;
  
  // Generate a simple text-based dependency graph
  let graphVisualization = '';
  
  // Group by component type
  const atoms = Object.keys(atomsApi).map(path => path.split('/').pop()?.replace('.tsx', '')).filter(Boolean);
  const molecules = Object.keys(moleculesConfig).map(path => path.split('/').pop()?.replace('.tsx', '')).filter(Boolean);
  
  graphVisualization += `
## Atoms (${atoms.length})
\`\`\`
${atoms.map(atom => `📦 ${atom}`).join('\n')}
\`\`\`

## Molecules (${molecules.length})
\`\`\`
`;

  // Show molecule dependencies
  Object.entries(moleculesConfig).forEach(([path, config]) => {
    const moleculeName = path.split('/').pop()?.replace('.tsx', '') || '';
    const atomDeps = config.intendedAtoms.map(atom => atom.split('/').pop()?.replace('.tsx', '')).filter(Boolean);
    
    graphVisualization += `🔗 ${moleculeName}\n`;
    if (atomDeps.length > 0) {
      atomDeps.forEach(atom => {
        graphVisualization += `   └── 📦 ${atom}\n`;
      });
    } else {
      graphVisualization += `   └── (no atom dependencies)\n`;
    }
    graphVisualization += '\n';
  });

  graphVisualization += '```';

  const content = `
This section visualizes the component dependency relationships and provides tools for analyzing the component architecture.

## Dependency Principles

The component graph follows these architectural rules:

1. **Atoms** are leaf nodes with no dependencies on other atoms or molecules
2. **Molecules** depend only on atoms (and occasionally other molecules for composition)
3. **No circular dependencies** are allowed at any level
4. **Clear ownership** - each component has a well-defined purpose and scope

## Current Architecture

${graphVisualization}

## Architecture Health

| Metric | Value | Target | Status |
|--------|-------|---------|---------|
| Total Components | ${atoms.length + molecules.length} | - | ℹ️ |
| Dependency Violations | ${analysis.graph.violations.filter(v => v.severity === 'error').length} | 0 | ${analysis.graph.violations.filter(v => v.severity === 'error').length === 0 ? '✅' : '❌'} |
| Architecture Score | ${analysis.layeringSummary.healthScore}% | 90%+ | ${analysis.layeringSummary.healthScore >= 90 ? '✅' : analysis.layeringSummary.healthScore >= 70 ? '⚠️' : '❌'} |

## Dependency Rules

### ✅ Allowed Dependencies

\`\`\`
Atoms → (none)           # Atoms are self-contained
Molecules → Atoms        # Molecules compose atoms
Molecules → Molecules    # Only for composition patterns
\`\`\`

### ❌ Forbidden Dependencies

\`\`\`
Atoms → Molecules        # Would violate atomic principles  
Atoms → Atoms            # Would create coupling
Circular → Dependencies  # Would break module resolution
\`\`\`

## Analyzing Dependencies

### Using Diagnostics Panel

1. **Open Diagnostics** (⌘/Ctrl + D)
2. **Navigate to Architecture tab**
3. **Run Component Analysis**
4. **Review dependency graph and violations**

### Manual Analysis

You can also analyze dependencies manually:

\`\`\`bash
# Find all imports in atoms
grep -r "import.*from.*molecules" src/components/atoms/

# Find cross-molecule dependencies  
grep -r "import.*from.*molecules" src/components/molecules/

# Check for circular imports
npm run check-circular
\`\`\`

## Common Patterns

### ✅ Good: Molecule composing atoms
\`\`\`tsx
// molecules/Card.tsx
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';

export function Card({ title, action }: CardProps) {
  return (
    <div className="card">
      <Text variant="heading">{title}</Text>
      <Button onClick={action}>Learn More</Button>
    </div>
  );
}
\`\`\`

### ✅ Good: Molecule composition pattern
\`\`\`tsx
// molecules/FormGroup.tsx  
import { Alert } from './Alert'; // Composition of molecules is OK

export function FormGroup({ error, children }: FormGroupProps) {
  return (
    <div className="form-group">
      {children}
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
\`\`\`

### ❌ Bad: Atom importing molecule
\`\`\`tsx
// atoms/Button.tsx - WRONG!
import { Alert } from '../molecules/Alert'; // Atoms can't use molecules

export function Button({ showError }: ButtonProps) {
  return (
    <button>
      Click me
      {showError && <Alert>Error!</Alert>} {/* This breaks atomic principles */}
    </button>
  );
}
\`\`\`

### ❌ Bad: Circular dependency
\`\`\`tsx
// molecules/A.tsx
import { B } from './B';

// molecules/B.tsx  
import { A } from './A'; // Circular!
\`\`\`

## Refactoring Patterns

### Breaking Circular Dependencies

**Problem:** Components A and B import each other

**Solution 1:** Extract shared logic
\`\`\`tsx
// utils/shared.ts
export const sharedLogic = () => { /* ... */ };

// A.tsx
import { sharedLogic } from '../utils/shared';

// B.tsx  
import { sharedLogic } from '../utils/shared';
\`\`\`

**Solution 2:** Invert the dependency  
\`\`\`tsx
// Make B compose A instead of A importing B
// B.tsx
import { A } from './A';

export function B() {
  return <div><A /></div>;
}
\`\`\`

### Moving Atom Logic to Molecules

**Problem:** Atom trying to import molecule functionality

**Solution:** Create a new molecule that composes both
\`\`\`tsx
// molecules/ButtonWithAlert.tsx
import { Button } from '../atoms/Button';
import { Alert } from './Alert';

export function ButtonWithAlert(props) {
  return (
    <div>
      <Button {...props} />
      <Alert>Additional info</Alert>
    </div>
  );
}
\`\`\`

## Monitoring Tools

### Automated Checks

The system provides several tools for monitoring architectural health:

- **Real-time validation** during development
- **CI/CD integration** for pre-merge checks
- **Dependency tracking** in diagnostics panel  
- **Architecture metrics** in releases

### Performance Impact

Proper dependency management improves:

- **Bundle size:** Smaller, more efficient builds
- **Tree shaking:** Better dead code elimination  
- **Load times:** Reduced dependency chains
- **Maintainability:** Clearer component relationships

Monitor these metrics through the Performance tab in Diagnostics.
`;

  return {
    title: 'Component Dependency Graph',
    content,
    level: 1
  };
}

export function generateCompleteReadme(analysis: ComponentAnalysis): string {
  const sections = generateReadmeSections(analysis);
  
  const header = `# Atomic Design System Manager

This is an automatically generated reference for the ADSM component architecture, APIs, and development guidelines.

**Generated on:** ${new Date().toISOString().split('T')[0]}  
**System Health:** ${analysis.layeringSummary.healthScore}/100  
**Components:** ${analysis.layeringSummary.totalAtoms} atoms, ${analysis.layeringSummary.totalMolecules} molecules

---

`;

  const tableOfContents = `## Table of Contents

${sections.map(section => `- [${section.title}](#${section.title.toLowerCase().replace(/\s+/g, '-')})`).join('\n')}

---

`;

  const body = sections.map(section => `# ${section.title}\n\n${section.content}`).join('\n\n');

  return header + tableOfContents + body;
}

// Utility to save README to localStorage for download
export function saveReadmeForDownload(content: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adsm-generated-readme', content);
    
    // Create download link
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ADSM-README.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}