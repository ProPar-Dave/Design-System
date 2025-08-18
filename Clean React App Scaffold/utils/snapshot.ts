import * as React from 'react';

/**
 * Safe snapshot utilities for generating component preview thumbnails
 * Uses Canvas API only to avoid external dependency issues
 */

/**
 * Convert DOM element to PNG data URL for thumbnails using Canvas API
 * This is a safe implementation that doesn't rely on external libraries
 */
export async function snapshotToDataUrl(element: HTMLElement): Promise<string | null> {
  if (!element) {
    console.warn('Snapshot: No element provided');
    return null;
  }

  try {
    // Check if we're in development mode - skip actual capture to avoid build issues
    let isDevelopment = true;
    try {
      isDevelopment = process.env.NODE_ENV === 'development' || 
                     (typeof location !== 'undefined' && (
                       location.hostname === 'localhost' || 
                       location.hostname === '127.0.0.1' ||
                       location.port !== ''
                     ));
    } catch {
      // Fallback if environment checking fails
      isDevelopment = true;
    }

    if (isDevelopment) {
      console.log('Snapshot: Using development placeholder');
      return generatePlaceholderImage(element);
    }

    // Try Canvas-based snapshot first
    return await canvasSnapshot(element);
  } catch (error) {
    console.warn('Snapshot generation failed:', error);
    // Return a simple placeholder on any error
    return generatePlaceholderImage(element);
  }
}

/**
 * Canvas-based snapshot implementation
 * Uses HTML5 Canvas to create a simple representation
 */
const canvasSnapshot = async (element: HTMLElement): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const scale = 2; // High DPI
      canvas.width = Math.max(rect.width * scale, 300 * scale);
      canvas.height = Math.max(rect.height * scale, 180 * scale);
      ctx.scale(scale, scale);

      // Get computed styles for better representation
      const computedStyle = getComputedStyle(element);
      const bgColor = computedStyle.backgroundColor || 'transparent';
      const textColor = computedStyle.color || '#000000';

      // Draw background
      if (bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
      }

      // Draw a simple border
      ctx.strokeStyle = computedStyle.borderColor || '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.strokeRect(1, 1, (canvas.width / scale) - 2, (canvas.height / scale) - 2);

      // Add component name if available
      const componentName = element.getAttribute('data-component-name') || 
                           element.closest('[data-component-name]')?.getAttribute('data-component-name') ||
                           'Component';

      ctx.fillStyle = textColor;
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = canvas.width / scale / 2;
      const centerY = canvas.height / scale / 2;
      
      // Draw component name
      ctx.fillText(componentName, centerX, centerY - 10);
      
      // Draw "Preview" label
      ctx.font = '12px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = textColor.replace('rgb', 'rgba').replace(')', ', 0.7)');
      ctx.fillText('Preview', centerX, centerY + 10);

      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    } catch (error) {
      console.warn('Canvas snapshot failed:', error);
      resolve(null);
    }
  });
};

/**
 * Generate a simple placeholder image for development or when Canvas fails
 */
const generatePlaceholderImage = (element: HTMLElement): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  canvas.width = 300;
  canvas.height = 180;

  // Draw placeholder background
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw border
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  // Draw placeholder icon
  ctx.fillStyle = '#9ca3af';
  ctx.font = '48px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('📦', canvas.width / 2, 70);

  // Draw placeholder text
  ctx.fillStyle = '#6b7280';
  ctx.font = '16px system-ui';
  ctx.fillText('Component Preview', canvas.width / 2, 120);
  
  ctx.font = '12px system-ui';
  ctx.fillText('Placeholder thumbnail', canvas.width / 2, 140);

  return canvas.toDataURL('image/png');
};

/**
 * Generate storage key for component thumbnail
 */
export const thumbKey = (componentId: string): string => `adsm:thumb:${componentId}`;

/**
 * Save thumbnail data URL to localStorage
 * Handles quota exceeded and other storage errors gracefully
 */
export const saveThumb = (componentId: string, dataUrl: string): void => {
  try {
    const key = thumbKey(componentId);
    localStorage.setItem(key, dataUrl);
  } catch (error) {
    // Handle quota exceeded or other storage errors
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('Thumbnail storage quota exceeded, clearing old thumbnails');
      clearOldThumbnails();
      // Try saving again after cleanup
      try {
        localStorage.setItem(thumbKey(componentId), dataUrl);
      } catch {
        console.warn('Still unable to save thumbnail after cleanup');
      }
    } else {
      console.warn('Failed to save thumbnail:', error);
    }
  }
};

/**
 * Load thumbnail data URL from localStorage
 */
export const loadThumb = (componentId: string): string | null => {
  try {
    const key = thumbKey(componentId);
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to load thumbnail:', error);
    return null;
  }
};

/**
 * Clear old thumbnails to free up storage space
 * Keeps only the most recent 50 thumbnails
 */
const clearOldThumbnails = (): void => {
  try {
    const thumbKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('adsm:thumb:'))
      .sort()
      .reverse(); // Most recent first

    // Keep only the 50 most recent thumbnails
    const keysToDelete = thumbKeys.slice(50);
    keysToDelete.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore individual removal errors
      }
    });

    console.log(`Cleared ${keysToDelete.length} old thumbnails`);
  } catch (error) {
    console.warn('Failed to clear old thumbnails:', error);
  }
};

/**
 * Generate and save thumbnail for a component
 * Automatically finds the preview stage element and captures it
 */
export const captureComponentThumb = async (componentId: string): Promise<void> => {
  // Look for the preview stage element
  const stageElement = document.querySelector('.adsm-preview-stage') as HTMLElement;
  
  if (!stageElement) {
    console.warn('No preview stage found for thumbnail capture');
    return;
  }

  // Add component name as data attribute for better thumbnails
  stageElement.setAttribute('data-component-name', componentId);

  // Ensure the element is visible and rendered
  if (stageElement.offsetWidth === 0 || stageElement.offsetHeight === 0) {
    console.warn('Preview stage is not visible, skipping thumbnail capture');
    return;
  }

  const dataUrl = await snapshotToDataUrl(stageElement);
  
  if (dataUrl) {
    saveThumb(componentId, dataUrl);
    console.log(`Captured thumbnail for component: ${componentId}`);
  } else {
    console.warn(`Failed to capture thumbnail for component: ${componentId}`);
  }
};

/**
 * Hook for automatic thumbnail capture when preview changes
 * Automatically disabled in development to prevent build issues
 */
export const useThumbCapture = (componentId: string, dependencies: any[] = []) => {
  const isDevelopment = React.useMemo(() => {
    try {
      return process.env.NODE_ENV === 'development' || 
             (typeof location !== 'undefined' && (
               location.hostname === 'localhost' || 
               location.hostname === '127.0.0.1' ||
               location.port !== ''
             ));
    } catch {
      // Fallback if location is not available
      return true;
    }
  }, []);

  const captureThumb = React.useCallback(async () => {
    if (isDevelopment) {
      console.log(`Thumbnail capture disabled in development for: ${componentId}`);
      return;
    }
    
    try {
      // Small delay to ensure preview is fully rendered
      setTimeout(() => {
        captureComponentThumb(componentId);
      }, 500);
    } catch (error) {
      console.warn('Thumbnail capture failed:', error);
    }
  }, [componentId, isDevelopment]);

  React.useEffect(() => {
    if (!isDevelopment) {
      captureThumb();
    }
  }, [...dependencies, isDevelopment]);

  return captureThumb;
};

/**
 * Manual thumbnail capture function for testing/debugging
 * Can be called from browser console: window.adsmCaptureThumb('component-id')
 */
export const manualCaptureThumb = async (componentId: string): Promise<void> => {
  console.log(`Manual thumbnail capture for: ${componentId}`);
  await captureComponentThumb(componentId);
};

/**
 * Generate a development placeholder thumbnail
 * This can be used to test the thumbnail display without actual capture
 */
export const generateDevPlaceholder = (componentId: string): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  canvas.width = 300;
  canvas.height = 180;

  // Generate a subtle pattern based on component ID
  const hash = componentId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const hue = Math.abs(hash) % 360;
  
  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `hsl(${hue}, 20%, 95%)`);
  gradient.addColorStop(1, `hsl(${hue}, 20%, 90%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw border
  ctx.strokeStyle = `hsl(${hue}, 30%, 80%)`;
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  // Draw component name
  ctx.fillStyle = `hsl(${hue}, 40%, 40%)`;
  ctx.font = 'bold 16px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(componentId, canvas.width / 2, 100);
  
  ctx.font = '12px system-ui';
  ctx.fillText('Development Preview', canvas.width / 2, 120);

  return canvas.toDataURL('image/png');
};

// Expose manual capture to global scope for debugging
if (typeof window !== 'undefined') {
  (window as any).adsmCaptureThumb = manualCaptureThumb;
  (window as any).adsmGenerateDevPlaceholder = generateDevPlaceholder;
}