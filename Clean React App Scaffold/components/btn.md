# Button — Notes

A fundamental interactive element for triggering actions and navigation.

## Purpose
- Primary actions (form submission, confirmations)
- Secondary actions (cancel, alternative paths)
- Navigation triggers

## Variants
- **Primary**: Main call-to-action, uses accent color
- **Secondary**: Supporting actions, outlined style
- **Tertiary**: Minimal actions, text-only

## Accessibility
- Always includes focus states
- Supports keyboard navigation (Enter/Space)
- Screen reader friendly with proper ARIA labels
- Sufficient color contrast ratios

## Usage Guidelines
- Use action-oriented labels ("Save", "Continue", not "Click here")
- One primary button per section
- Group related actions together
- Consider loading/disabled states for async actions

## Examples
```tsx
<Button variant="primary">Save Changes</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="tertiary" size="small">Learn More</Button>
```