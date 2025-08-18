import React from 'react';

export default function NotFound() {
  const handleGoHome = () => {
    window.location.hash = '#/';
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleGoHome();
    }
  };

  return (
    <div className="content" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '32px 16px',
      minHeight: '60vh'
    }}>
      <div style={{
        background: 'var(--color-panel)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '480px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '64px',
          fontWeight: 'bold',
          color: 'var(--color-muted)',
          marginBottom: '16px',
          lineHeight: 1
        }}>
          404
        </div>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: 'var(--color-text)',
          margin: '0 0 12px'
        }}>
          Page Not Found
        </h1>
        
        <p style={{
          color: 'var(--color-muted)',
          marginBottom: '24px',
          lineHeight: 1.5
        }}>
          The page you're looking for doesn't exist or may have been moved.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleGoBack}
            style={{
              background: 'var(--button-bg, var(--color-accent))',
              color: 'var(--button-fg, var(--color-background))',
              border: '1px solid var(--button-border, var(--color-border))',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              const el = e.currentTarget;
              const hover = getComputedStyle(document.documentElement).getPropertyValue('--button-bg-hover').trim();
              if (hover) el.style.background = hover;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--button-bg, var(--color-accent))';
            }}
          >
            Go Back
          </button>
          
          <button
            onClick={handleGoHome}
            style={{
              background: 'transparent',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--color-muted)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Go Home
          </button>
        </div>
        
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <div style={{ color: 'var(--color-muted)', marginBottom: '8px' }}>
            Quick Navigation:
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="#/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Overview</a>
            <a href="#/guidelines" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Guidelines</a>
            <a href="#/tokens" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Tokens</a>
            <a href="#/components" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Components</a>
            <a href="#/releases" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Releases</a>
          </div>
        </div>
      </div>
    </div>
  );
}