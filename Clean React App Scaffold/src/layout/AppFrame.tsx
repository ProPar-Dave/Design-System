import React, { Suspense } from 'react';
import '../styles/presentation.css';

interface AppFrameProps {
  children: React.ReactNode;
  isDebugMode?: boolean;
  className?: string;
}

export function AppFrame({ children, isDebugMode = false, className = '' }: AppFrameProps) {
  return (
    <div 
      id="adsm-root"
      className={`adsm-app-frame adsm-ui ${className}`}
      role="application"
      aria-label="Atomic Design System Manager"
    >
      <div className="adsm-app-content">
        <Suspense fallback={
          <div 
            className="adsm-loading-fallback"
            role="status"
            aria-live="polite"
          >
            Loading application…
          </div>
        }>
          {children}
        </Suspense>
      </div>
      
      {isDebugMode && (
        <div className="adsm-debug-overlay">
          <div className="adsm-debug-indicator">
            DEV MODE
          </div>
        </div>
      )}
    </div>
  );
}