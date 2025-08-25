import React from 'react';
import { QADiagnostics } from './QADiagnostics';
import { registry } from '../preview/registry';
import { loadTokens } from '../src/lib/TokenRuntime';

function SystemDiagnostics() {
  const [systemInfo, setSystemInfo] = React.useState<any>(null);
  
  React.useEffect(() => {
    const checkSystemHealth = () => {
      const info = {
        registryCount: Object.keys(registry).length,
        tokensCount: Object.keys(loadTokens()).length,
        theme: document.querySelector('#adsm-root')?.getAttribute('data-theme') || 'unknown',
        timestamp: new Date().toISOString()
      };
      setSystemInfo(info);
    };
    
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h3 style={{ marginBottom: 'var(--space-md)' }}>System Health</h3>
      <p style={{ color: 'var(--color-muted-foreground)', marginBottom: 'var(--space-lg)' }}>
        Component registry, theme system, and application health diagnostics.
      </p>
      
      <div style={{ 
        display: 'grid', 
        gap: 'var(--space-md)', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' 
      }}>
        <div style={{ 
          background: 'var(--color-panel)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)'
        }}>
          <h4 style={{ marginBottom: 'var(--space-sm)' }}>Registry</h4>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-xs)' }}>
            {systemInfo?.registryCount || 0}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-foreground)' }}>
            Registered components
          </div>
        </div>
        
        <div style={{ 
          background: 'var(--color-panel)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)'
        }}>
          <h4 style={{ marginBottom: 'var(--space-sm)' }}>Tokens</h4>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-xs)' }}>
            {systemInfo?.tokensCount || 0}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-foreground)' }}>
            Design tokens active
          </div>
        </div>
        
        <div style={{ 
          background: 'var(--color-panel)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-lg)'
        }}>
          <h4 style={{ marginBottom: 'var(--space-sm)' }}>Theme</h4>
          <div style={{ 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: 'var(--font-weight-bold)', 
            marginBottom: 'var(--space-xs)',
            textTransform: 'capitalize'
          }}>
            {systemInfo?.theme || 'Unknown'}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-foreground)' }}>
            Current theme mode
          </div>
        </div>
      </div>
      
      <div style={{ 
        background: 'var(--color-panel)', 
        border: '1px solid var(--color-border)', 
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-lg)',
        marginTop: 'var(--space-lg)'
      }}>
        <h4 style={{ marginBottom: 'var(--space-md)' }}>Component Registry Details</h4>
        <div style={{ 
          display: 'grid', 
          gap: 'var(--space-sm)', 
          maxHeight: '300px', 
          overflowY: 'auto',
          fontSize: 'var(--font-size-sm)'
        }}>
          {Object.entries(registry).map(([id, entry]) => (
            <div 
              key={id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: 'var(--space-xs)',
                background: 'var(--color-accent)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span>{id}</span>
              <span style={{ color: 'var(--color-muted-foreground)' }}>
                {entry.Component ? '✓' : '❌'} Component
                {entry.schema && Object.keys(entry.schema).length > 0 ? ' • ✓ Schema' : ' • ❌ Schema'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Diagnostics() {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'qa' | 'system' | 'tokens'>('overview');

  return (
    <div className="content space-y-8">
      <header>
        <h1>Diagnostics</h1>
        <p className="text-muted-foreground">
          System health checks, QA automation, and development utilities.
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="adsm-debug-tabs">
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'qa', label: 'QA & Snapshots' },
            { id: 'system', label: 'System' },
            { id: 'tokens', label: 'Tokens' }
          ].map(tab => (
            <button
              key={tab.id}
              className="adsm-tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div style={{ 
              background: 'var(--color-panel)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-lg)'
            }}>
              <h3 style={{ marginBottom: 'var(--space-md)' }}>System Status</h3>
              <div style={{ display: 'grid', gap: 'var(--space-md)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-sm)' }}>🎯</div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>QA & Snapshots</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-foreground)' }}>
                    Automated testing and state management
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-sm)' }}>🔧</div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>System Health</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-foreground)' }}>
                    Component registry and theme integrity
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-sm)' }}>🎨</div>
                  <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>Token System</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-foreground)' }}>
                    Design token validation and editor
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'var(--info-bg)', 
              border: '1px solid var(--info-border)', 
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)'
            }}>
              <h4 style={{ margin: '0 0 var(--space-sm)', color: 'var(--info-text)' }}>
                💡 Quick Actions
              </h4>
              <ul style={{ margin: 0, paddingLeft: 'var(--space-lg)', color: 'var(--info-text)' }}>
                <li>Use <strong>QA & Snapshots</strong> tab to run automated tests and save system state</li>
                <li>Check <strong>System</strong> tab for component registry and theme diagnostics</li>
                <li>Use <strong>Tokens</strong> tab for design system token validation</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'qa' && (
          <QADiagnostics />
        )}

        {activeTab === 'system' && (
          <SystemDiagnostics />
        )}

        {activeTab === 'tokens' && (
          <div>
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Token System Diagnostics</h3>
            <p style={{ color: 'var(--color-muted-foreground)', marginBottom: 'var(--space-lg)' }}>
              Token validation and system integrity checks.
            </p>
            
            <div style={{ 
              background: 'var(--color-panel)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-lg)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-md)' }}>🚧</div>
              <h4 style={{ marginBottom: 'var(--space-sm)' }}>Token Diagnostics</h4>
              <p style={{ color: 'var(--color-muted-foreground)', marginBottom: 'var(--space-md)' }}>
                Advanced token system diagnostics are available through the QA tab.
              </p>
              <button 
                onClick={() => setActiveTab('qa')}
                className="adsm-button-primary"
              >
                Go to QA & Snapshots
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}