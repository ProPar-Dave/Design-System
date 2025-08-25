import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo: React.ErrorInfo }> | React.ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to console for debugging
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        if (React.isValidElement(this.props.fallback)) {
          return this.props.fallback;
        } else {
          const FallbackComponent = this.props.fallback as React.ComponentType<{
            error: Error;
            errorInfo: React.ErrorInfo;
          }>;
          return (
            <FallbackComponent
              error={this.state.error}
              errorInfo={this.state.errorInfo!}
            />
          );
        }
      }

      // Default fallback UI
      return (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem',
          background: 'var(--color-panel)',
          border: '2px solid red',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text)',
          zIndex: 9999,
          maxWidth: '400px'
        }}>
          <h4>Something went wrong</h4>
          <details style={{ marginTop: '0.5rem' }}>
            <summary>Error details</summary>
            <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem', overflow: 'auto' }}>
              {this.state.error.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export function ErrorBoundaryWrapper({ 
  children, 
  fallback,
  onError 
}: {
  children: React.ReactNode;
  fallback?: React.ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}) {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}