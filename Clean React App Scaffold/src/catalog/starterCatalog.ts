// Embedded starter catalog as fallback
import type { DsComponent } from '../../utils/catalog';

export const starterCatalog: DsComponent[] = [
  {
    id: "atom-button-primary",
    name: "Primary Button",
    level: "atom",
    version: "1.0.0",
    status: "ready",
    tags: ["action", "interactive", "clickable"],
    dependencies: [],
    description: "Main action button with primary styling",
    previewKind: "button",
    notes: "Use for primary actions like submit, save, or confirm"
  },
  {
    id: "atom-button-secondary",
    name: "Secondary Button",
    level: "atom",
    version: "1.0.0",
    status: "ready",
    tags: ["action", "interactive", "secondary"],
    dependencies: [],
    description: "Secondary action button with outline styling",
    previewKind: "button",
    notes: "Use for secondary actions like cancel or back"
  },
  {
    id: "atom-input-text",
    name: "Text Input",
    level: "atom",
    version: "1.0.0",
    status: "ready",
    tags: ["form", "input", "text"],
    dependencies: [],
    description: "Basic text input field",
    previewKind: "input",
    notes: "Standard text input with consistent styling"
  },
  {
    id: "atom-label",
    name: "Label",
    level: "atom",
    version: "1.0.0",
    status: "ready",
    tags: ["form", "label", "accessibility"],
    dependencies: [],
    description: "Form label with consistent styling",
    previewKind: "label",
    notes: "Always use with form controls for accessibility"
  },
  {
    id: "atom-chip",
    name: "Chip",
    level: "atom",
    version: "1.0.0",
    status: "ready",
    tags: ["display", "tag", "badge"],
    dependencies: [],
    description: "Small labeled chip for tags and categories",
    previewKind: "chip",
    notes: "Use for tags, categories, or status indicators"
  },
  {
    id: "atom-divider",
    name: "Divider",
    level: "atom",
    version: "1.0.0",
    status: "ready",
    tags: ["layout", "separator", "visual"],
    dependencies: [],
    description: "Visual separator line",
    previewKind: "divider",
    notes: "Use to separate content sections"
  },
  {
    id: "atom-checkbox",
    name: "Checkbox",
    level: "atom",
    version: "1.0.0",
    status: "ready",
    tags: ["form", "input", "boolean"],
    dependencies: [],
    description: "Checkbox input for boolean selection",
    previewKind: "checkbox",
    notes: "Use for boolean choices in forms"
  },
  {
    id: "atom-switch",
    name: "Switch",
    level: "atom",
    version: "1.0.0",
    status: "ready",
    tags: ["form", "toggle", "boolean"],
    dependencies: [],
    description: "Toggle switch for on/off states",
    previewKind: "switch",
    notes: "Use for settings and preferences"
  },
  {
    id: "molecule-field-row",
    name: "Field Row",
    level: "molecule",
    version: "1.0.0",
    status: "ready",
    tags: ["form", "layout", "field"],
    dependencies: ["atom-label", "atom-input-text"],
    description: "Form field with label and input",
    previewKind: "field",
    notes: "Standard form field pattern"
  },
  {
    id: "molecule-card",
    name: "Card",
    level: "molecule",
    version: "1.0.0",
    status: "ready",
    tags: ["layout", "container", "content"],
    dependencies: [],
    description: "Content container with styling",
    previewKind: "card",
    notes: "Use for grouping related content"
  },
  {
    id: "molecule-alert",
    name: "Alert",
    level: "molecule",
    version: "1.0.0",
    status: "ready",
    tags: ["feedback", "notification", "message"],
    dependencies: ["atom-button-secondary"],
    description: "Alert message with icon and action",
    previewKind: "alert",
    notes: "Use for important notifications"
  },
  {
    id: "molecule-toolbar",
    name: "Toolbar",
    level: "molecule",
    version: "1.0.0",
    status: "ready",
    tags: ["layout", "actions", "navigation"],
    dependencies: ["atom-button-primary", "atom-button-secondary"],
    description: "Action toolbar with buttons",
    previewKind: "toolbar",
    notes: "Use for grouped actions and controls"
  }
];