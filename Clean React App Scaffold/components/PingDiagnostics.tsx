import * as React from 'react';
import { fetchPing, type SimplePingPayload, getPingStatus } from '../utils/ping';
import { projectId } from '../utils/supabase/info';

const PING_BASE_URL = `https://${projectId}.functions.supabase.co/ping`;
const PING_URL = `${PING_BASE_URL}?id=latest`;

function StatusBadge({ v }: { v: string | undefined }) {
  const color = v === 'ok' ? '#22c55e' : v === 'busy' ? '#eab308' : v === 'error' ? '#ef4444' : '#94a3b8';
  return <span style={{background: color + '33', color, padding:'2px 8px', borderRadius:8}}>{v ?? 'unknown'}</span>;
}

export default function PingDiagnostics() {
  const [data, setData] = React.useState<SimplePingPayload | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [auto, setAuto] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [debugInfo, setDebugInfo] = React.useState<any>(null);

  const run = React.useCallback(async () => {
    setLoading(true); setErr(null);
    
    // Get ping system status for debugging
    const pingStatus = getPingStatus();
    setDebugInfo(pingStatus);
    
    // Note: GET requests no longer require token in bulletproof endpoint
    // We still check token status for POST operations (sending pings)
    
    // Check network status
    if (!navigator.onLine) {
      setErr('Device is offline - check network connection');
      setLoading(false);
      return;
    }
    
    // Add cache busting when auto-refresh is enabled
    const url = auto ? `${PING_BASE_URL}?id=latest&t=${Date.now()}` : PING_URL;
    
    try {
      const d = await fetchPing(url);
      if (!d) {
        setErr('No data exists yet - bulletproof endpoint returned empty payload');
      } else {
        setData(d);
        setErr(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      
      // Provide specific error messages based on error type
      if (message.includes('Failed to fetch')) {
        if (!navigator.onLine) {
          setErr('Network error: Device appears offline');
        } else {
          setErr('Network error: CORS, firewall, or Edge Function not deployed');
        }
      } else if (message.includes('401') || message.includes('Unauthorized')) {
        setErr(`Authentication failed: ${message} - This should not happen for GET requests`);
      } else if (message.includes('404')) {
        setErr('Endpoint not found: Edge Function not deployed or wrong URL');
      } else if (message.includes('500')) {
        setErr('Server error: Check Edge Function logs in Supabase dashboard');
      } else if (message.includes('timeout') || message.includes('aborted')) {
        setErr('Request timeout: Network or server too slow');
      } else {
        setErr(`Unknown error: ${message}`);
      }
    }
    
    setLoading(false);
  }, [auto]);

  React.useEffect(() => { run(); }, [run]);
  React.useEffect(() => {
    if (!auto) return; const id = setInterval(run, 5000); return () => clearInterval(id);
  }, [auto, run]);

  return (
    <section>
      <header style={{display:'flex', alignItems:'center', gap:12, justifyContent:'space-between'}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <h3>Ping (Bulletproof)</h3>
          {debugInfo && (
            <div style={{
              padding:'2px 6px', 
              borderRadius:'4px', 
              fontSize:'11px', 
              fontWeight:600,
              background: debugInfo.network?.online 
                ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: debugInfo.network?.online 
                ? '#22c55e' : '#ef4444'
            }}>
              {debugInfo.network?.online 
                ? '● ONLINE' : '● OFFLINE'}
            </div>
          )}
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <label style={{display:'flex', alignItems:'center', gap:6}}>
            <input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)} /> auto
          </label>
          <button onClick={run} disabled={loading} style={{
            padding:'6px 12px', 
            borderRadius:'6px', 
            border:'1px solid var(--color-border)', 
            background:'var(--color-panel)', 
            color:'var(--color-text)',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button 
            onClick={() => {
              // Quick system check - updated for bulletproof endpoint
              const status = getPingStatus();
              if (!status.network?.online) {
                alert('❌ Network offline\n\nCheck your internet connection');
              } else if (!status.tokenConfigured) {
                alert('⚠️ Token not configured for POST operations\n\nGET works without token, but run: window.setupPingToken("your-token") to send pings');
              } else {
                alert('✅ System ready\n\nGET: Works without auth\nPOST: Token configured');
              }
            }}
            style={{
              padding:'6px 12px', 
              borderRadius:'6px', 
              border:'1px solid var(--color-border)', 
              background:'var(--color-accent)', 
              color:'var(--color-text)',
              cursor:'pointer',
              fontSize:'12px'
            }}
          >
            Quick Check
          </button>
        </div>
      </header>

      <div style={{margin:'12px 0'}}>
        <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
          <strong>Status:</strong> <StatusBadge v={data?.status} />
          {data?.ts && <span>• {new Date(data.ts).toLocaleString()}</span>}
          {data?.actor && <span>• by {data.actor}</span>}
        </div>
        {err && (
          <div style={{
            color:'#ef4444', 
            background:'rgba(239, 68, 68, 0.1)', 
            border:'1px solid rgba(239, 68, 68, 0.3)',
            padding:'8px 12px', 
            borderRadius:'6px', 
            marginTop:'8px',
            fontSize:'14px'
          }}>
            ⚠️ {err}
          </div>
        )}
      </div>

      <pre style={{maxHeight:280, overflow:'auto', background:'#0f162e', color:'#e6ecff', padding:12, borderRadius:8}}>
{JSON.stringify(data ?? { note: 'No data yet. Try sending a ping first.' }, null, 2)}
      </pre>

      {debugInfo && (
        <details style={{marginTop:12, background:'var(--color-panel)', border:'1px solid var(--color-border)', borderRadius:8, padding:8}}>
          <summary style={{cursor:'pointer', fontWeight:600}}>Debug Information</summary>
          <div style={{marginTop:8, fontSize:12}}>
            <div><strong>System Enabled:</strong> {debugInfo.enabled ? '✅' : '❌'} <small>(for POST operations)</small></div>
            <div><strong>Token Configured:</strong> {debugInfo.tokenConfigured ? '✅' : '❌'} <small>(POST only - GET works without)</small></div>
            <div><strong>Network Online:</strong> {debugInfo.network?.online ? '✅' : '❌'}</div>
            <div><strong>Circuit Breaker:</strong> {debugInfo.circuitBreaker?.open ? '🔴 Open' : '✅ Closed'}</div>
            <div><strong>Failed Endpoints:</strong> {debugInfo.failedEndpoints?.length || 0}</div>
            <div><strong>Project ID:</strong> <code>{projectId}</code></div>
            <div><strong>Endpoint:</strong> <code>{PING_URL}</code></div>
          </div>
        </details>
      )}

      <details style={{marginTop:12}}>
        <summary>Troubleshooting & Setup (Updated for Bulletproof Endpoint)</summary>
        
        <div style={{marginTop:8}}>
          <h4 style={{margin:'8px 0 4px'}}>What's Changed:</h4>
          <ul style={{margin:'4px 0',paddingLeft:'20px', fontSize:'14px'}}>
            <li><strong>GET requests:</strong> No longer require authentication - always return valid JSON</li>
            <li><strong>POST requests:</strong> Still require PING_TOKEN for security</li>
            <li><strong>Error handling:</strong> Never returns 404 or empty body - always valid JSON response</li>
            <li><strong>CORS:</strong> Properly configured with no-store headers</li>
          </ul>
        </div>

        <div style={{marginTop:12}}>
          <h4 style={{margin:'8px 0 4px'}}>Quick Setup Steps:</h4>
          <ol style={{margin:'4px 0',paddingLeft:'20px', fontSize:'14px'}}>
            <li>GET works immediately - no setup needed</li>
            <li>For POST: Run <code>window.setupPingToken("your-actual-ping-token")</code></li>
            <li>Test: <code>window.ping("test", {'{ message: "hello" }'})</code></li>
            <li>Check status: <code>window.getPingStatus()</code></li>
          </ol>
        </div>

        <div style={{marginTop:12}}>
          <h4 style={{margin:'8px 0 4px'}}>Updated Manual Testing:</h4>
          <pre style={{fontSize:'12px', background:'var(--color-muted)', padding:'8px', borderRadius:'4px', overflow:'auto'}}>
{`# GET without auth (bulletproof):
curl -s "${PING_URL}" | jq

# Health check:
curl -s "${PING_BASE_URL}?id=health" | jq

# POST with token (replace TOKEN):
curl -s -X POST "${PING_BASE_URL}" \\
  -H "x-ping-token: TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"success","message":"test"}' | jq

# Check deployment:
curl -s "${PING_BASE_URL.replace('?id=latest', '')}"
# Should return JSON with "Method Not Allowed" not 404`}
          </pre>
        </div>

        <div style={{marginTop:12}}>
          <h4 style={{margin:'8px 0 4px'}}>Deployment Commands:</h4>
          <pre style={{fontSize:'12px', background:'var(--color-muted)', padding:'8px', borderRadius:'4px'}}>
{`# Deploy bulletproof function:
supabase functions deploy ping --no-verify-jwt

# Set secrets:
supabase secrets set PING_TOKEN=your-secret-token

# Optional Slack integration:
supabase secrets set SLACK_WEBHOOK_URL=your-webhook-url`}
          </pre>
        </div>
      </details>
    </section>
  );
}