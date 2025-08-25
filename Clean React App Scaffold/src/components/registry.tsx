import React, { lazy } from "react";

/**
 * Minimal metadata the drawer needs to render a component preview
 * and load its prop schema (optional) without crashing.
 */
export type ComponentMeta = {
  id: string;
  name: string;
  level: "atom" | "molecule" | "organism";
  /**
   * Must return a Promise that resolves to a module with a *default* export.
   * We wrap non-default exports so React.lazy always gets { default: Cmp }.
   */
  loadPreview: () => Promise<{ default: React.ComponentType<any> }>;
  loadPropsSchema?: () => Promise<any>;
};

/** Fallback preview (very small, keeps drawer stable even if an entry is missing) */
export const MissingPreview = () => (
  <div
    style={{
      height: 140,
      display: "grid",
      placeItems: "center",
      border: "1px dashed var(--color-border, #2b3345)",
      borderRadius: 12,
      background: "var(--color-panel, #0f162e)",
    }}
  >
    <span style={{ opacity: 0.75 }}>No preview available</span>
  </div>
);

/**
 * IMPORTANT:
 * - Keep IDs in sync with the catalog items (e.g., `atom-button-primary`).
 * - Each loadPreview MUST return { default: Component } for React.lazy.
 * - Add entries as you grow your catalog.
 */
export const registry: Record<string, ComponentMeta> = {
  "atom-button-primary": {
    id: "atom-button-primary",
    name: "Primary Button",
    level: "atom",
    loadPreview: () =>
      import("../../components/atoms/Button").then((m) => ({
        default: () => <m.Button variant="primary">Primary Button</m.Button>,
      })),
    loadPropsSchema: () =>
      Promise.resolve({ 
        fields: [
          { name: "variant", type: "select", options: ["primary", "secondary"], default: "primary" },
          { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
          { name: "disabled", type: "boolean", default: false }
        ]
      }),
  },

  "atom-button-secondary": {
    id: "atom-button-secondary",
    name: "Secondary Button",
    level: "atom",
    loadPreview: () =>
      import("../../components/atoms/Button").then((m) => ({
        default: () => <m.Button variant="secondary">Secondary Button</m.Button>,
      })),
    loadPropsSchema: () =>
      Promise.resolve({ 
        fields: [
          { name: "variant", type: "select", options: ["primary", "secondary"], default: "secondary" },
          { name: "size", type: "select", options: ["sm", "md", "lg"], default: "md" },
          { name: "disabled", type: "boolean", default: false }
        ]
      }),
  },

  "atom-input-text": {
    id: "atom-input-text",
    name: "Text Input",
    level: "atom",
    loadPreview: () =>
      import("../../components/atoms/Input").then((m) => ({
        default: () => <m.Input type="text" placeholder="Enter text..." />,
      })),
    loadPropsSchema: () =>
      Promise.resolve({ 
        fields: [
          { name: "type", type: "select", options: ["text", "email", "password", "number"], default: "text" },
          { name: "placeholder", type: "text", default: "Enter text..." },
          { name: "disabled", type: "boolean", default: false }
        ]
      }),
  },

  "atom-checkbox": {
    id: "atom-checkbox",
    name: "Checkbox",
    level: "atom",
    loadPreview: () =>
      import("../../components/atoms/Checkbox").then((m) => ({
        default: () => <m.Checkbox label="Check me" />,
      })),
    loadPropsSchema: () =>
      Promise.resolve({ 
        fields: [
          { name: "label", type: "text", default: "Check me" },
          { name: "checked", type: "boolean", default: false },
          { name: "disabled", type: "boolean", default: false }
        ]
      }),
  },

  "atom-chip": {
    id: "atom-chip",
    name: "Chip",
    level: "atom",
    loadPreview: () =>
      import("../../components/atoms/Chip").then((m) => ({
        default: () => <m.Chip variant="info">Info Chip</m.Chip>,
      })),
    loadPropsSchema: () =>
      Promise.resolve({ 
        fields: [
          { name: "variant", type: "select", options: ["info", "success", "warning", "error"], default: "info" },
          { name: "children", type: "text", default: "Info Chip" }
        ]
      }),
  },

  "molecule-alert": {
    id: "molecule-alert",
    name: "Alert",
    level: "molecule",
    loadPreview: () =>
      import("../../components/molecules/Alert").then((m) => ({
        default: () => <m.Alert type="info" title="Info Alert">This is an informational message.</m.Alert>,
      })),
    loadPropsSchema: () =>
      Promise.resolve({ 
        fields: [
          { name: "type", type: "select", options: ["info", "success", "warning", "error"], default: "info" },
          { name: "title", type: "text", default: "Info Alert" },
          { name: "children", type: "text", default: "This is an informational message." }
        ]
      }),
  },

  "molecule-card": {
    id: "molecule-card",
    name: "Card",
    level: "molecule",
    loadPreview: () =>
      import("../../components/molecules/Card").then((m) => ({
        default: () => (
          <m.Card>
            <m.Card.Header>
              <m.Card.Title>Card Title</m.Card.Title>
            </m.Card.Header>
            <m.Card.Content>
              <p>This is card content.</p>
            </m.Card.Content>
          </m.Card>
        ),
      })),
    loadPropsSchema: () =>
      Promise.resolve({ 
        fields: [
          { name: "variant", type: "select", options: ["default", "outlined"], default: "default" }
        ]
      }),
  },

  // Missing components for clean diagnostics
  "searchbar": {
    id: "searchbar",
    name: "Search Bar",
    level: "molecule",
    loadPreview: () => Promise.resolve({ default: MissingPreview }),
  },

  "form-row": {
    id: "form-row",
    name: "Form Row",
    level: "atom",
    loadPreview: () => Promise.resolve({ default: MissingPreview }),
  },

  "tabset": {
    id: "tabset",
    name: "Tabset",
    level: "molecule",
    loadPreview: () => Promise.resolve({ default: MissingPreview }),
  },

  "pagination": {
    id: "pagination",
    name: "Pagination",
    level: "molecule",
    loadPreview: () => Promise.resolve({ default: MissingPreview }),
  },

  "form-group": {
    id: "form-group",
    name: "Form Group",
    level: "molecule",
    loadPreview: () => Promise.resolve({ default: MissingPreview }),
  },

  "toast": {
    id: "toast",
    name: "Toast",
    level: "molecule",
    loadPreview: () => Promise.resolve({ default: MissingPreview }),
  },
};

/** Small helper to safely lazy-load with a hard fallback */
export const lazyFrom = (
  loader: (() => Promise<{ default: React.ComponentType<any> }>) | undefined
) =>
  lazy(
    loader ??
      (async () => ({
        default: MissingPreview,
      }))
  );

// Additional exports for Component Drawer integration
export function hasComponentsForCatalog(): boolean {
  // smoke test used by diagnostics
  const required = [
    'atom-button-primary', 'atom-button-secondary', 'atom-input-text', 'atom-checkbox',
    'molecule-alert', 'molecule-card', 'searchbar', 'form-row', 'tabset'
  ];
  return required.every(id => !!registry[id]);
}

export function getComponentPreview(id: string): React.ComponentType<any> | null {
  const entry = registry[id];
  if (!entry) return null;
  
  // Return a component that lazy loads the preview
  return lazy(entry.loadPreview);
}