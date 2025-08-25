import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

// Plugin to generate additional build artifacts
function generateArtifactsPlugin() {
  return {
    name: 'generate-artifacts',
    writeBundle(options: any, bundle: any) {
      const fs = require('fs');
      const path = require('path');
      
      console.log('🏗️  Generating build artifacts...');
      
      try {
        // Generate tokens.json from CSS variables
        const tokensData = generateTokensJSON();
        fs.writeFileSync(
          path.resolve(options.dir, 'tokens.json'),
          JSON.stringify(tokensData, null, 2)
        );
        console.log('✅ Generated dist/tokens.json');
        
        // Generate catalog.json from components
        const catalogData = generateCatalogJSON();
        fs.writeFileSync(
          path.resolve(options.dir, 'catalog.json'),
          JSON.stringify(catalogData, null, 2)
        );
        console.log('✅ Generated dist/catalog.json');
        
        // Also generate catalog.json at root for backwards compatibility
        fs.writeFileSync(
          path.resolve(process.cwd(), 'catalog.json'),
          JSON.stringify(catalogData, null, 2)
        );
        console.log('✅ Generated root catalog.json');
        
        console.log('🎉 All build artifacts generated successfully');
        
      } catch (error) {
        console.error('❌ Error generating artifacts:', error);
        process.exit(1);
      }
    }
  };
}

// Generate tokens JSON from CSS
function generateTokensJSON() {
  const tokens = {
    // Base design tokens
    colors: {
      background: "var(--color-background)",
      foreground: "var(--color-foreground)",
      card: "var(--color-card)",
      "card-foreground": "var(--color-card-foreground)",
      popover: "var(--color-popover)",
      "popover-foreground": "var(--color-popover-foreground)",
      primary: "var(--color-primary)",
      "primary-foreground": "var(--color-primary-foreground)",
      secondary: "var(--color-secondary)",
      "secondary-foreground": "var(--color-secondary-foreground)",
      muted: "var(--color-muted)",
      "muted-foreground": "var(--color-muted-foreground)",
      accent: "var(--color-accent)",
      "accent-foreground": "var(--color-accent-foreground)",
      destructive: "var(--color-destructive)",
      "destructive-foreground": "var(--color-destructive-foreground)",
      border: "var(--color-border)",
      input: "var(--color-input)",
      ring: "var(--color-ring)"
    },
    spacing: {
      "space-4": "var(--space-4)"
    },
    radius: {
      sm: "var(--radius-sm)",
      md: "var(--radius-md)",
      lg: "var(--radius-lg)",
      xl: "var(--radius-xl)"
    },
    typography: {
      "font-size-base": "var(--font-size-base)",
      "font-weight-medium": "var(--font-weight-medium)",
      "font-weight-normal": "var(--font-weight-normal)"
    },
    // Component-specific tokens
    components: {
      chip: {
        bg: "var(--chip-bg)",
        text: "var(--chip-text)",
        hover: "var(--chip-hover)",
        active: "var(--chip-active)",
        border: "var(--chip-border)"
      },
      button: {
        primary: {
          bg: "var(--button-primary-bg)",
          text: "var(--button-primary-text)",
          hover: "var(--button-primary-hover)",
          active: "var(--button-primary-active)",
          disabled: "var(--button-primary-disabled)"
        },
        secondary: {
          bg: "var(--button-secondary-bg)",
          text: "var(--button-secondary-text)",
          border: "var(--button-secondary-border)",
          hover: "var(--button-secondary-hover)",
          active: "var(--button-secondary-active)",
          disabled: "var(--button-secondary-disabled)"
        }
      },
      input: {
        bg: "var(--input-bg)",
        text: "var(--input-text)",
        placeholder: "var(--input-placeholder)",
        border: "var(--input-border)",
        "focus-border": "var(--input-focus-border)",
        "disabled-bg": "var(--input-disabled-bg)",
        "disabled-text": "var(--input-disabled-text)"
      },
      tab: {
        "active-fg": "var(--tab-active-fg)",
        "active-bg": "var(--tab-active-bg)",
        "inactive-fg": "var(--tab-inactive-fg)",
        "inactive-bg": "var(--tab-inactive-bg)",
        "hover-bg": "var(--tab-hover-bg)"
      }
    },
    // Interactive states
    states: {
      hover: {
        bg: "var(--color-hover-bg)"
      },
      active: {
        bg: "var(--color-active-bg)"
      },
      disabled: {
        bg: "var(--color-disabled-bg)",
        text: "var(--color-disabled-text)"
      },
      focus: {
        ring: "var(--color-focus-ring)"
      }
    },
    // Status colors
    status: {
      success: {
        bg: "var(--success-bg)",
        text: "var(--success-text)",
        border: "var(--success-border)"
      },
      warning: {
        bg: "var(--warning-bg)",
        text: "var(--warning-text)",
        border: "var(--warning-border)"
      },
      error: {
        bg: "var(--error-bg)",
        text: "var(--error-text)",
        border: "var(--error-border)"
      },
      info: {
        bg: "var(--info-bg)",
        text: "var(--info-text)",
        border: "var(--info-border)"
      }
    }
  };

  return {
    name: "Atomic DS Manager Tokens",
    version: "1.2.0",
    description: "Design system tokens for consistent styling",
    tokens,
    themes: {
      light: {
        colors: {
          background: "#ffffff",
          foreground: "oklch(0.145 0 0)",
          primary: "#030213",
          "primary-foreground": "oklch(1 0 0)",
          ring: "#3b82f6"
        }
      },
      dark: {
        colors: {
          background: "oklch(0.145 0 0)",
          foreground: "oklch(0.985 0 0)",
          primary: "oklch(0.985 0 0)",
          "primary-foreground": "oklch(0.205 0 0)",
          ring: "#60a5fa"
        }
      }
    }
  };
}

// Generate catalog JSON from components
function generateCatalogJSON() {
  // This would normally read from the actual component data
  // For now, providing a structured example that matches the app's format
  return {
    name: "Atomic DS Manager Component Catalog",
    version: "1.2.0",
    description: "Component library for design system management",
    components: [
      {
        id: "button-primary",
        name: "Primary Button",
        level: "atom",
        version: "1.0.0",
        status: "ready",
        description: "Main action button with primary styling",
        tags: ["interactive", "form", "cta"],
        dependencies: [],
        propsSpec: [
          {
            name: "children",
            label: "Button Text",
            kind: "text",
            required: true,
            description: "The text content of the button"
          },
          {
            name: "disabled",
            label: "Disabled",
            kind: "boolean",
            default: false,
            description: "Whether the button is disabled"
          },
          {
            name: "size",
            label: "Size",
            kind: "select",
            options: ["sm", "md", "lg"],
            default: "md",
            description: "Button size variant"
          }
        ],
        previewKind: "button"
      },
      {
        id: "button-secondary",
        name: "Secondary Button",
        level: "atom",
        version: "1.0.0",
        status: "ready",
        description: "Alternative action button with outlined styling",
        tags: ["interactive", "form", "secondary"],
        dependencies: [],
        propsSpec: [
          {
            name: "children",
            label: "Button Text", 
            kind: "text",
            required: true,
            description: "The text content of the button"
          },
          {
            name: "variant",
            label: "Variant",
            kind: "select",
            options: ["outline", "ghost"],
            default: "outline",
            description: "Visual style variant"
          }
        ],
        previewKind: "button"
      },
      {
        id: "input-text",
        name: "Text Input",
        level: "atom",
        version: "1.0.0", 
        status: "ready",
        description: "Single-line text input field",
        tags: ["form", "input", "text"],
        dependencies: [],
        propsSpec: [
          {
            name: "placeholder",
            label: "Placeholder",
            kind: "text",
            description: "Placeholder text when input is empty"
          },
          {
            name: "disabled",
            label: "Disabled",
            kind: "boolean",
            default: false,
            description: "Whether the input is disabled"
          },
          {
            name: "type",
            label: "Input Type",
            kind: "select",
            options: ["text", "email", "password", "number"],
            default: "text",
            description: "HTML input type"
          }
        ],
        previewKind: "input"
      },
      {
        id: "card-basic",
        name: "Card",
        level: "molecule",
        version: "1.0.0",
        status: "ready",
        description: "Container component for grouping related content",
        tags: ["container", "layout", "surface"],
        dependencies: [],
        propsSpec: [
          {
            name: "title",
            label: "Title",
            kind: "text",
            description: "Card title text"
          },
          {
            name: "children",
            label: "Content",
            kind: "text",
            required: true,
            description: "Card content"
          }
        ],
        previewKind: "card"
      }
    ],
    meta: {
      generated: new Date().toISOString(),
      buildVersion: "1.2.0",
      totalComponents: 4,
      levels: {
        atom: 3,
        molecule: 1,
        organism: 0
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    generateArtifactsPlugin()
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'App.tsx'),
      name: 'AtomicDSManager',
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    // Ensure CSS is extracted as a separate file
    cssCodeSplit: false
  },
  css: {
    extract: 'adsm.css'
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@/components': resolve(__dirname, './components'),
      '@/utils': resolve(__dirname, './utils'),
      '@/styles': resolve(__dirname, './styles'),
      '@/pages': resolve(__dirname, './src/pages')
    }
  }
});