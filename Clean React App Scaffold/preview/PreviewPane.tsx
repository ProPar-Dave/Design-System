import * as React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { getEntry } from './registry';

interface PreviewPaneProps {
  id?: string;
  props?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

const defaultContainerStyle: React.CSSProperties = {
  padding: '16px',
  background: 'var(--color-background)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  minHeight: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const fallbackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100px',
  color: 'var(--color-muted-foreground)',
  fontSize: '14px',
  textAlign: 'center',
  background: 'var(--color-muted)',
  border: '2px dashed var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '16px',
};

function PreviewFallback({ id, reason }: { id?: string; reason?: string }) {
  return (
    <div style={fallbackStyle}>
      <div style={{ marginBottom: '8px', fontSize: '16px' }}>
        📦
      </div>
      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
        No preview available
      </div>
      {id && (
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          Component: {id}
        </div>
      )}
      {reason && (
        <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
          {reason}
        </div>
      )}
    </div>
  );
}

export function PreviewPane({ id, props = {}, className, style }: PreviewPaneProps) {
  const entry = getEntry(id);
  
  // Merge default props with provided props
  const mergedProps = React.useMemo(() => {
    if (!entry) return props;
    return { ...(entry.defaults || {}), ...props };
  }, [entry, props]);

  const containerStyle = React.useMemo(() => ({
    ...defaultContainerStyle,
    ...style,
  }), [style]);

  if (!entry) {
    return (
      <div className={className} style={containerStyle}>
        <PreviewFallback id={id} reason="Component not found in registry" />
      </div>
    );
  }

  if (!entry.render || typeof entry.render !== 'function') {
    return (
      <div className={className} style={containerStyle}>
        <PreviewFallback id={id} reason="No render function available" />
      </div>
    );
  }

  return (
    <div className={`adsm-preview-wrap ${className || ''}`} style={containerStyle}>
      <ErrorBoundary 
        fallback={(error) => (
          <div style={fallbackStyle}>
            <div style={{ marginBottom: '8px', fontSize: '16px' }}>
              ⚠️
            </div>
            <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--color-destructive)' }}>
              Preview failed to render
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {error.message}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>
              Check props or fix the renderer
            </div>
          </div>
        )}
      >
        <div className="adsm-preview-stage">
          {entry.render(mergedProps)}
        </div>
      </ErrorBoundary>
    </div>
  );
}

// Hook for using preview data
export function usePreviewData(id?: string) {
  return React.useMemo(() => {
    const entry = getEntry(id);
    return {
      hasPreview: !!entry,
      schema: entry?.schema || {},
      defaults: entry?.defaults || {},
      entry,
    };
  }, [id]);
}