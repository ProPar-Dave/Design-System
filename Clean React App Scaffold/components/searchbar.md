# Search Bar — Notes

Composed molecule combining input field with search functionality and optional clear action.

## Architecture
This is a **molecule** that composes:
- Text input (atom)
- Search icon
- Clear button (atom) - when `clearable` prop is true

## Features
- Real-time search suggestions
- Keyboard shortcuts (Escape to clear)
- Mobile-optimized touch targets
- Loading states for async search

## Usage Patterns
- Site-wide search
- Filtering data tables
- Product/content discovery
- Command palette interfaces

## Props
- `placeholder`: Guidance text
- `clearable`: Shows X button to clear input
- `onSearch`: Callback for search submissions
- `loading`: Shows loading spinner

## Dependencies
Requires `input` and `btn` components to be available.