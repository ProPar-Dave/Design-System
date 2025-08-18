# Button — Notes
- Purpose: clickable action
- Variants: primary, ghost
- A11y: visible focus ring, ARIA label for icon

## Usage Guidelines
- Use action-oriented labels ("Save", "Continue", not "Click here")
- One primary button per section
- Group related actions together
- Consider loading/disabled states for async actions

## Examples
```tsx
<Button variant="primary">Save Changes</Button>
<Button variant="secondary">Cancel</Button>
```