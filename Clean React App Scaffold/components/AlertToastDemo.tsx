import React from 'react';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { runAlertToastAccessibilityAudit, validateAlertToastTokens } from '../diagnostics/alertAccessibilityAudit';
import { safeLogEvent } from '../diagnostics/logger';

// Screen reader announcement utility
function announceToScreenReader(message: string) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.style.cssText = `
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  `;
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

interface DemoAlertProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'destructive' | 'info';
  title: string;
  description: string;
  showIcon?: boolean;
}

const DemoAlert = React.memo(({ variant, title, description, showIcon = true }: DemoAlertProps) => {
  const icons = {
    default: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    destructive: '🚫',
    info: 'ℹ️'
  };

  return (
    <Alert variant={variant} className="demo-alert" data-variant={variant}>
      {showIcon && (
        <span 
          aria-hidden="true"
          style={{ fontSize: '16px', marginRight: '8px' }}
        >
          {icons[variant]}
        </span>
      )}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
        <button
          style={{
            background: 'transparent',
            border: '1px solid currentColor',
            borderRadius: '4px',
            padding: '4px 8px',
            marginLeft: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            color: 'inherit'
          }}
          onClick={() => {
            announceToScreenReader(`${title} alert dismissed`);
            safeLogEvent('info', 'accessibility/alert-interaction', {
              action: 'dismiss',
              variant,
              title
            });
          }}
          aria-label={`Dismiss ${title} alert`}
        >
          Dismiss
        </button>
      </AlertDescription>
    </Alert>
  );
});

const AlertToastDemo = () => {
  const [auditResult, setAuditResult] = React.useState<any>(null);
  const [tokenValidation, setTokenValidation] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const runAudit = React.useCallback(async () => {
    setLoading(true);
    
    try {
      // Wait a moment for any alerts to render
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const audit = await runAlertToastAccessibilityAudit();
      const validation = validateAlertToastTokens();
      
      setAuditResult(audit);
      setTokenValidation(validation);
      
      announceToScreenReader(
        `Audit completed. ${audit.data.alertsFound} alerts and ${audit.data.toastsFound} toasts found. ${audit.issues.length} issues discovered. ${audit.data.fallbacksApplied} fallbacks applied.`
      );
    } catch (error) {
      console.error('Audit failed:', error);
      announceToScreenReader('Audit failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  }, []);

  const showToast = React.useCallback((type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: 'Success!', description: 'Operation completed successfully with accessible design.' },
      error: { title: 'Error Occurred', description: 'An error occurred. High contrast design ensures readability.' },
      warning: { title: 'Warning Notice', description: 'Please review this warning with proper color contrast.' },
      info: { title: 'Information', description: 'This information toast uses accessible color tokens.' }
    };
    
    const message = messages[type];
    
    toast[type](message.title, {
      description: message.description,
      action: {
        label: 'View Details',
        onClick: () => {
          announceToScreenReader(`${message.title} details viewed`);
          safeLogEvent('info', 'accessibility/toast-interaction', {
            action: 'view-details',
            type,
            title: message.title
          });
        }
      }
    });

    safeLogEvent('info', 'accessibility/toast-shown', {
      type,
      title: message.title,
      hasAction: true,
      timestamp: Date.now()
    });
  }, []);

  const buttonStyle = {
    background: 'var(--button-primary-bg)',
    color: 'var(--button-primary-text)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    minHeight: '44px',
    transition: 'all 0.2s ease'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'var(--button-secondary-bg)',
    color: 'var(--button-secondary-text)',
    border: '2px solid var(--button-secondary-border)'
  };

  return (
    <div style={{ 
      display: 'grid', 
      gap: '24px', 
      padding: '20px',
      background: 'var(--color-background)',
      color: 'var(--color-text)',
      minHeight: '100vh'
    }}>
      <header>
        <h1 style={{ margin: '0 0 16px', color: 'var(--color-text)' }}>
          Alert & Toast Accessibility Demo
        </h1>
        <p style={{ color: 'var(--color-muted-foreground)', margin: '0 0 20px', lineHeight: 1.5 }}>
          Comprehensive WCAG AA compliant alert and toast notifications with automatic contrast fallbacks,
          color blindness simulation, and accessibility auditing.
        </p>
      </header>

      {/* Action Controls */}
      <section>
        <h2 style={{ margin: '0 0 16px' }}>Testing Controls</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={runAudit}
            disabled={loading}
            style={buttonStyle}
            onFocus={(e) => {
              e.currentTarget.style.outline = '3px solid var(--color-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.outlineOffset = '0';
            }}
          >
            {loading ? 'Running Audit...' : 'Run Accessibility Audit'}
          </button>
          
          <button
            onClick={() => showToast('success')}
            style={secondaryButtonStyle}
            onFocus={(e) => {
              e.currentTarget.style.outline = '3px solid var(--color-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.outlineOffset = '0';
            }}
          >
            Show Success Toast
          </button>
          
          <button
            onClick={() => showToast('error')}
            style={secondaryButtonStyle}
            onFocus={(e) => {
              e.currentTarget.style.outline = '3px solid var(--color-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.outlineOffset = '0';
            }}
          >
            Show Error Toast
          </button>
          
          <button
            onClick={() => showToast('warning')}
            style={secondaryButtonStyle}
            onFocus={(e) => {
              e.currentTarget.style.outline = '3px solid var(--color-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.outlineOffset = '0';
            }}
          >
            Show Warning Toast
          </button>
          
          <button
            onClick={() => showToast('info')}
            style={secondaryButtonStyle}
            onFocus={(e) => {
              e.currentTarget.style.outline = '3px solid var(--color-ring)';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
              e.currentTarget.style.outlineOffset = '0';
            }}
          >
            Show Info Toast
          </button>
        </div>
      </section>

      {/* Alert Examples */}
      <section>
        <h2 style={{ margin: '0 0 16px' }}>Alert Components</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <DemoAlert 
            variant="success"
            title="Success Alert"
            description="This success alert uses semantic tokens with WCAG AA contrast ratios for optimal accessibility."
          />
          
          <DemoAlert 
            variant="warning"
            title="Warning Alert"
            description="Warning alerts maintain proper contrast while conveying urgency through semantic color tokens."
          />
          
          <DemoAlert 
            variant="error"
            title="Error Alert"
            description="Error alerts ensure critical information is communicated with maximum contrast and clarity."
          />
          
          <DemoAlert 
            variant="info"
            title="Information Alert"
            description="Information alerts provide helpful context with accessible color schemes and proper focus management."
          />
          
          <DemoAlert 
            variant="destructive"
            title="Destructive Action Alert"
            description="Destructive alerts use high-contrast colors to clearly communicate dangerous actions to users."
          />
        </div>
      </section>

      {/* Custom Alert Status Examples */}
      <section>
        <h2 style={{ margin: '0 0 16px' }}>Custom Status Examples</h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="adsm-success" role="alert" aria-live="polite">
            <h3 style={{ margin: '0 0 8px', fontWeight: 600 }}>Account Created Successfully</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Your account has been created with enhanced accessibility features enabled by default.
              All notifications will use high-contrast, WCAG AA compliant colors.
            </p>
          </div>
          
          <div className="adsm-warning" role="alert" aria-live="polite">
            <h3 style={{ margin: '0 0 8px', fontWeight: 600 }}>Password Expiry Warning</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Your password will expire in 3 days. Please update it to maintain secure access.
              This warning uses accessible color contrast ratios for clear visibility.
            </p>
          </div>
          
          <div className="adsm-error" role="alert" aria-live="assertive">
            <h3 style={{ margin: '0 0 8px', fontWeight: 600 }}>Connection Error</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Unable to connect to the server. The error message maintains high contrast for accessibility
              and uses assertive announcement for screen readers.
            </p>
          </div>
          
          <div className="adsm-info" role="status" aria-live="polite">
            <h3 style={{ margin: '0 0 8px', fontWeight: 600 }}>Feature Update Available</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>
              New accessibility features are available including enhanced contrast controls and 
              color blindness simulation for better inclusive design.
            </p>
          </div>
        </div>
      </section>

      {/* Audit Results */}
      {auditResult && (
        <section>
          <h2 style={{ margin: '0 0 16px' }}>Audit Results</h2>
          <div style={{
            border: `2px solid ${auditResult.ok ? 'var(--success-border)' : 'var(--error-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            background: auditResult.ok ? 'var(--success-bg)' : 'var(--error-bg)'
          }}>
            <h3 style={{ 
              margin: '0 0 12px', 
              color: auditResult.ok ? 'var(--success-text)' : 'var(--error-text)'
            }}>
              {auditResult.ok ? '✅ Accessibility Audit Passed' : '❌ Accessibility Issues Found'}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{auditResult.data.alertsFound}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Alerts Audited</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{auditResult.data.toastsFound}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Toasts Audited</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{auditResult.data.contrastChecks.length}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Contrast Checks</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: auditResult.data.fallbacksApplied > 0 ? 'var(--success-text)' : 'inherit' }}>
                  {auditResult.data.fallbacksApplied}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Fallbacks Applied</div>
              </div>
            </div>

            {auditResult.issues.length > 0 && (
              <details style={{ marginTop: '16px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
                  View Issues ({auditResult.issues.length})
                </summary>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                  {auditResult.issues.map((issue: any, index: number) => (
                    <li key={index} style={{ marginBottom: '8px' }}>
                      <strong>{issue.severity}:</strong> {issue.detail}
                      {issue.node && (
                        <code style={{ 
                          background: 'rgba(0,0,0,0.1)', 
                          padding: '2px 4px', 
                          borderRadius: '3px',
                          marginLeft: '8px',
                          fontSize: '12px'
                        }}>
                          {issue.node}
                        </code>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </section>
      )}

      {/* Token Validation Results */}
      {tokenValidation && (
        <section>
          <h2 style={{ margin: '0 0 16px' }}>Token Validation</h2>
          <div style={{
            border: `2px solid ${tokenValidation.valid ? 'var(--success-border)' : 'var(--error-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            background: tokenValidation.valid ? 'var(--success-bg)' : 'var(--error-bg)'
          }}>
            <h3 style={{ 
              margin: '0 0 12px', 
              color: tokenValidation.valid ? 'var(--success-text)' : 'var(--error-text)'
            }}>
              {tokenValidation.valid ? '✅ All Alert/Toast Tokens Valid' : '❌ Token Issues Found'}
            </h3>
            
            {!tokenValidation.valid && (
              <div>
                <h4 style={{ margin: '0 0 8px' }}>Issues:</h4>
                <ul style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
                  {tokenValidation.issues.map((issue: string, index: number) => (
                    <li key={index} style={{ marginBottom: '4px' }}>{issue}</li>
                  ))}
                </ul>
                
                {tokenValidation.recommendations.length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 8px' }}>Recommendations:</h4>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                      {tokenValidation.recommendations.map((rec: string, index: number) => (
                        <li key={index} style={{ marginBottom: '4px' }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default AlertToastDemo;