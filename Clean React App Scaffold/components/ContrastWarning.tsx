import React from 'react';
import { getCurrentContrastRatio, onThemeChange } from '../src/theme/themeManager';

export function ContrastWarning() {
  const [contrastRatio, setContrastRatio] = React.useState<number>(0);
  const [showWarning, setShowWarning] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkContrast = () => {
      const ratio = getCurrentContrastRatio();
      setContrastRatio(ratio);
      setShowWarning(ratio < 4.5);
    };

    // Check initial contrast
    checkContrast();

    // Listen for theme changes
    const unsubscribe = onThemeChange(() => {
      setTimeout(checkContrast, 100); // Small delay to ensure CSS has been applied
    });

    // Listen for contrast corrections
    const handleContrastCorrection = (e: CustomEvent) => {
      checkContrast();
    };

    document.addEventListener('adsm:theme:contrast-corrected', handleContrastCorrection as EventListener);

    return () => {
      unsubscribe();
      document.removeEventListener('adsm:theme:contrast-corrected', handleContrastCorrection as EventListener);
    };
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development' || !showWarning) {
    return null;
  }

  return (
    <div className="adsm-debug">
      <div className="contrast-warning">
        <strong>⚠️ Contrast Warning:</strong> Current ratio {contrastRatio.toFixed(2)}:1 is below WCAG AA standard (4.5:1).
        <br />
        <small>Safe fallback colors have been applied automatically.</small>
      </div>
    </div>
  );
}