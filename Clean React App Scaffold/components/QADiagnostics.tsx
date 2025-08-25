import React from 'react';
import { runSmokeQA, QAItem } from '../src/qa/smoke';

interface QADiagnosticsProps {
  className?: string;
}

export function QADiagnostics({ className = '' }: QADiagnosticsProps) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentResults, setCurrentResults] = React.useState<{ pass: boolean; items: QAItem[] } | null>(null);
  const [auditHistory, setAuditHistory] = React.useState<any[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const showMessage = (msg: string, duration = 3000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), duration);
  };

  const handleRunQA = async () => {
    setIsRunning(true);
    try {
      console.log('[QA] Running smoke tests...');
      const results = await runSmokeQA();
      setCurrentResults(results);
      
      if (results.pass) {
        showMessage('✓ All QA checks passed!');
        console.log('[QA] All tests passed');
      } else {
        showMessage('❌ Some QA checks failed');
        console.warn('[QA] Some tests failed:', results.items.filter(item => !item.ok));
      }
    } catch (error) {
      console.error('[QA] Error running tests:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showMessage(`Error running QA tests: ${errorMessage}`);
      
      // Set a fallback result showing the error
      setCurrentResults({
        pass: false,
        items: [{
          name: 'qa.systemError',
          ok: false,
          note: `QA system error: ${errorMessage}`
        }]
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveSnapshots = async () => {
    try {
      const { saveGoldenSnapshots } = await import('../src/lib/safetyBoot');
      await saveGoldenSnapshots('manual');
      showMessage('✓ Golden snapshots saved');
    } catch (error) {
      console.error('[QA] Error saving snapshots:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('SUPABASE') || errorMessage.includes('import.meta')) {
        showMessage('⚠️ Supabase not configured - snapshots disabled');
      } else {
        showMessage(`Error saving snapshots: ${errorMessage}`);
      }
    }
  };

  const handleExportResults = () => {
    if (!currentResults) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      pass: currentResults.pass,
      items: currentResults.items,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qa-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('✓ QA results exported');
  };

  const loadAuditHistory = async () => {
    try {
      const { getAuditHistory } = await import('../src/lib/audits');
      const audits = await getAuditHistory('smoke', 7);
      setAuditHistory(audits);
      setShowHistory(true);
    } catch (error) {
      console.error('[QA] Error loading audit history:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('SUPABASE') || errorMessage.includes('import.meta')) {
        showMessage('⚠️ Supabase not configured - history disabled');
      } else {
        showMessage(`Error loading audit history: ${errorMessage}`);
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (ok: boolean) => ok ? '✓' : '❌';
  const getStatusColor = (ok: boolean) => ok ? 'var(--success-text)' : 'var(--error-text)';

  return (
    <div className={`qa-diagnostics ${className}`}>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>Quality Assurance</h3>
        <p style={{ color: 'var(--color-muted-foreground)', marginBottom: 'var(--space-lg)' }}>
          Automated smoke tests for registry integrity, token functionality, and system health.
        </p>

        {message && (
          <div 
            style={{
              padding: 'var(--space-sm)',
              marginBottom: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--info-bg)',
              border: '1px solid var(--info-border)',
              color: 'var(--info-text)'
            }}
          >
            {message}
          </div>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <button
            onClick={handleRunQA}
            disabled={isRunning}
            className="adsm-button-primary"
            style={{ minWidth: '120px' }}
          >
            {isRunning ? 'Running...' : 'Run QA Tests'}
          </button>
          
          <button
            onClick={handleSaveSnapshots}
            className="adsm-button-secondary"
          >
            Save Snapshots
          </button>
          
          {currentResults && (
            <button
              onClick={handleExportResults}
              className="adsm-button-secondary"
            >
              Export Results
            </button>
          )}
          
          <button
            onClick={loadAuditHistory}
            className="adsm-button-secondary"
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>

        {currentResults && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div 
              style={{
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                background: currentResults.pass ? 'var(--success-bg)' : 'var(--error-bg)',
                border: `1px solid ${currentResults.pass ? 'var(--success-border)' : 'var(--error-border)'}`,
                marginBottom: 'var(--space-md)'
              }}
            >
              <h4 style={{ margin: '0 0 var(--space-sm)', color: currentResults.pass ? 'var(--success-text)' : 'var(--error-text)' }}>
                {currentResults.pass ? '✓ All Tests Passed' : '❌ Some Tests Failed'}
              </h4>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: currentResults.pass ? 'var(--success-text)' : 'var(--error-text)' }}>
                {currentResults.items.length} checks completed • {currentResults.items.filter(i => i.ok).length} passed • {currentResults.items.filter(i => !i.ok).length} failed
              </p>
            </div>

            <div style={{ 
              background: 'var(--color-panel)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: 'var(--space-sm) var(--space-md)', 
                background: 'var(--color-accent)', 
                borderBottom: '1px solid var(--color-border)',
                fontWeight: 'var(--font-weight-semibold)'
              }}>
                Test Results
              </div>
              
              {currentResults.items.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    borderBottom: index < currentResults.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-sm)'
                  }}
                >
                  <span style={{ color: getStatusColor(item.ok), fontSize: '14px', marginTop: '2px' }}>
                    {getStatusIcon(item.ok)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: '2px' }}>
                      {item.name}
                    </div>
                    {item.note && (
                      <div style={{ 
                        fontSize: 'var(--font-size-sm)', 
                        color: 'var(--color-muted-foreground)',
                        lineHeight: 'var(--line-height-relaxed)'
                      }}>
                        {item.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showHistory && auditHistory.length > 0 && (
          <div>
            <h4 style={{ marginBottom: 'var(--space-md)' }}>Audit History (Last 7 Days)</h4>
            <div style={{ 
              background: 'var(--color-panel)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden'
            }}>
              {auditHistory.map((audit, index) => (
                <div 
                  key={audit.id}
                  style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    borderBottom: index < auditHistory.length - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <span style={{ color: getStatusColor(audit.status === 'pass') }}>
                      {audit.status === 'pass' ? '✓' : '❌'}
                    </span>
                    <span style={{ marginLeft: 'var(--space-sm)' }}>
                      {audit.summary?.filter((item: QAItem) => item.ok).length || 0} / {audit.summary?.length || 0} passed
                    </span>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted-foreground)' }}>
                    {formatTimestamp(audit.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}