import * as React from 'react';

/**
 * Focus trap hook for accessible modal/drawer components
 * Manages keyboard navigation and prevents focus from escaping the container
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>) {
  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      const selectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ];
      
      return Array.from(root.querySelectorAll<HTMLElement>(selectors.join(',')))
        .filter(el => {
          // Filter out hidden or disabled elements
          return !el.hasAttribute('disabled') && 
                 !el.getAttribute('aria-hidden') &&
                 el.offsetWidth > 0 && 
                 el.offsetHeight > 0;
        });
    };

    // Focus first focusable element on mount
    const setInitialFocus = () => {
      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      if (firstElement) {
        firstElement.focus();
      } else {
        // If no focusable elements, focus the container itself
        root.setAttribute('tabindex', '-1');
        root.focus();
      }
    };

    // Handle Tab key navigation
    const handleTabNavigation = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab: Move backwards
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: Move forwards
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Set initial focus after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(setInitialFocus, 50);

    // Add event listener for tab navigation
    root.addEventListener('keydown', handleTabNavigation);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      root.removeEventListener('keydown', handleTabNavigation);
    };
  }, [containerRef]);
}