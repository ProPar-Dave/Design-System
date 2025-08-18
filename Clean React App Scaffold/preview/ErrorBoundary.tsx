import * as React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error) => React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Preview error caught:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }
      
      return (
        <div style={{
          padding: '16px',
          border: '2px dashed var(--color-destructive)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-destructive)',
          color: 'var(--color-destructive-foreground)',
          textAlign: 'center',
          fontSize: '14px',
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>
            Preview failed to render
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            {this.state.error.message}
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.6 }}>
            Check props or fix the renderer
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional component error handling
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      console.warn('Preview hook error:', error);
    }
  }, [error]);

  return { error, handleError, resetError };
}