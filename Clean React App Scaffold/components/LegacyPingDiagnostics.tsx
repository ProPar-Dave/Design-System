// components/LegacyPingDiagnostics.tsx
// Comprehensive ping system diagnostics (original version)

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getPingStatus, resetPingSystem, ping, getBuildStatus, getBuildHistory } from '../utils/ping';
import { AlertCircle, CheckCircle, RefreshCw, Send, Database } from 'lucide-react';

export function LegacyPingDiagnostics() {
  const [status, setStatus] = useState<any>(null);
  const [buildStatus, setBuildStatus] = useState<any>(null);
  const [buildHistory, setBuildHistory] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [jobId, setJobId] = useState('latest');

  const refreshStatus = () => {
    setStatus(getPingStatus());
  };

  const fetchBuildStatus = async () => {
    setFetching(true);
    try {
      const result = await getBuildStatus(jobId);
      if (result === null) {
        setBuildStatus({ ok: true, data: null, message: 'No data found for this job ID' });
      } else {
        setBuildStatus({ ok: true, data: result });
      }
    } catch (error) {
      setBuildStatus({ ok: false, error: String(error) });
    } finally {
      setFetching(false);
    }
  };

  const fetchBuildHistory = async () => {
    setFetchingHistory(true);
    try {
      const result = await getBuildHistory(jobId, 10);
      setBuildHistory(result);
    } catch (error) {
      setBuildHistory({ ok: false, error: String(error) });
    } finally {
      setFetchingHistory(false);
    }
  };

  const testPing = async () => {
    setTesting(true);
    try {
      await ping('test', { 
        id: jobId,
        message: 'Test from diagnostic panel',
        source: 'diagnostic-panel',
        timestamp: Date.now()
      });
      setTimeout(() => {
        refreshStatus();
        setTesting(false);
      }, 1000);
    } catch (error) {
      setTesting(false);
    }
  };

  const resetSystem = () => {
    resetPingSystem();
    refreshStatus();
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  if (!status) return null;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Database className="w-5 h-5" />
        <h3 className="font-semibold">Ping System Diagnostics</h3>
      </div>

      {/* System Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>System Status</span>
          <Badge variant={status.enabled ? 'default' : 'secondary'}>
            {status.enabled ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Disabled
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Token Configured</span>
          <Badge variant={status.tokenConfigured ? 'default' : 'destructive'}>
            {status.tokenConfigured ? 'Yes' : 'No'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Development Mode</span>
          <Badge variant={status.config.enabledInDev ? 'default' : 'secondary'}>
            {status.config.enabledInDev ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Network Status</span>
          <Badge variant={status.network?.online ? 'default' : 'destructive'}>
            {status.network?.online ? 'Online' : 'Offline'}
          </Badge>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>Endpoint: {status.url}</div>
          <div>Timeout: {status.config.timeout}ms</div>
        </div>

        {status.circuitBreaker?.open && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-800 dark:text-red-200">
              <strong>Circuit Breaker Open:</strong>
              <div className="mt-1 space-y-1 text-xs">
                <div>Consecutive failures: {status.circuitBreaker.consecutiveFailures}/{status.circuitBreaker.threshold}</div>
                <div>Retry in: {Math.round(status.circuitBreaker.timeUntilRetry / 1000)}s</div>
                <div>Reason: Too many network failures</div>
              </div>
            </div>
          </div>
        )}

        {status.retryInfo && !status.circuitBreaker?.open && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Retry Status:</strong>
              <div className="mt-1 space-y-1 text-xs">
                <div>Attempts: {status.retryInfo.attempts}/{status.retryInfo.maxRetries}</div>
                <div>Last attempt: {new Date(status.retryInfo.lastAttempt).toLocaleString()}</div>
                {status.retryInfo.lastError && (
                  <div>Last error: {status.retryInfo.lastError.substring(0, 100)}...</div>
                )}
                <div>Can retry: {status.retryInfo.canRetry ? 'Yes' : `No (retry in ${Math.round(status.retryInfo.timeUntilRetry / 1000)}s)`}</div>
              </div>
            </div>
          </div>
        )}

        {status.failedEndpoints.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-800 dark:text-red-200">
              <strong>Failed Endpoints:</strong>
              <ul className="mt-1 ml-4">
                {status.failedEndpoints.map((endpoint: string, i: number) => (
                  <li key={i} className="text-xs font-mono">{endpoint}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Job ID Input */}
      <div className="flex items-center gap-2">
        <label htmlFor="job-id" className="text-sm font-medium">Job ID:</label>
        <input
          id="job-id"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          placeholder="latest"
          className="px-2 py-1 border rounded text-sm bg-background"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={refreshStatus}
          size="sm"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>

        <Button
          onClick={testPing}
          size="sm"
          disabled={!status.enabled || testing}
        >
          <Send className="w-4 h-4 mr-1" />
          {testing ? 'Testing...' : 'Test Ping'}
        </Button>

        <Button
          onClick={fetchBuildStatus}
          size="sm"
          variant="outline"
          disabled={fetching}
        >
          <Database className="w-4 h-4 mr-1" />
          {fetching ? 'Fetching...' : 'Get Status'}
        </Button>

        <Button
          onClick={fetchBuildHistory}
          size="sm"
          variant="outline"
          disabled={fetchingHistory}
        >
          <Database className="w-4 h-4 mr-1" />
          {fetchingHistory ? 'Fetching...' : 'Get History'}
        </Button>

        {(status.failedEndpoints.length > 0 || status.retryInfo || status.circuitBreaker?.open) && (
          <Button
            onClick={resetSystem}
            size="sm"
            variant="destructive"
          >
            Reset System
          </Button>
        )}
      </div>

      {/* Build Status */}
      {buildStatus && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Latest Status ({jobId})</h4>
          {buildStatus.ok ? (
            buildStatus.data ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      buildStatus.data.event === 'COMPLETE' || buildStatus.data.status === 'done' ? 'default' :
                      buildStatus.data.event === 'FAIL' || buildStatus.data.status === 'error' ? 'destructive' : 'secondary'
                    }
                  >
                    {buildStatus.data.event || buildStatus.data.status || 'unknown'}
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400">
                    {buildStatus.data.ts ? new Date(buildStatus.data.ts).toLocaleString() : 
                     buildStatus.data.at ? new Date(buildStatus.data.at).toLocaleString() : 'No timestamp'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Run ID: {buildStatus.data.runId || buildStatus.data.buildId || 'N/A'}</div>
                  <div>Source: {buildStatus.data.source || 'N/A'}</div>
                </div>
                {buildStatus.data.message && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Message: {buildStatus.data.message}
                  </div>
                )}
                {buildStatus.data.url && (
                  <div className="text-xs">
                    <a href={buildStatus.data.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                      {buildStatus.data.url}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                {buildStatus.message || `No status found for job "${jobId}"`}
              </div>
            )
          ) : (
            <div className="text-sm text-red-600 dark:text-red-400">
              Error: {buildStatus.error}
            </div>
          )}
        </div>
      )}

      {/* Build History */}
      {buildHistory && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Event History ({jobId})</h4>
          {buildHistory.ok ? (
            buildHistory.events && buildHistory.events.length > 0 ? (
              <div className="space-y-2">
                {buildHistory.events.map((event: any, index: number) => (
                  <div key={event.id || index} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                    <Badge 
                      variant={
                        event.status === 'done' ? 'default' :
                        event.status === 'error' ? 'destructive' : 'secondary'
                      }
                      size="sm"
                    >
                      {event.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </span>
                    {event.message && (
                      <span className="text-xs truncate flex-1">
                        {event.message}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No events found for job "{jobId}"</div>
            )
          ) : (
            <div className="text-sm text-red-600 dark:text-red-400">
              Error: {buildHistory.error}
            </div>
          )}
        </div>
      )}

      {/* Setup Help */}
      {!status.enabled && (
        <div className="border-t pt-4 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>To enable ping system:</strong></p>
          <ol className="mt-1 ml-4 space-y-1">
            <li>1. Deploy the Supabase Edge Function: <code className="text-xs bg-muted px-1 rounded">supabase functions deploy ping</code></li>
            <li>2. Set PING_TOKEN secret in Supabase Dashboard</li>
            <li>3. Configure token in /utils/ping.ts OR run in console: <code className="text-xs bg-muted px-1 rounded">window.setupPingToken('your-token')</code></li>
            <li>4. For development: Enable dev mode in ping config</li>
          </ol>
          <p className="mt-2"><strong>Quick test:</strong></p>
          <ul className="mt-1 ml-4">
            <li>• Check status: <code className="text-xs bg-muted px-1 rounded">window.getPingStatus()</code></li>
            <li>• Test ping: <code className="text-xs bg-muted px-1 rounded">{'window.ping("test", { message: "test" })'}</code></li>
          </ul>
        </div>
      )}

      {/* Troubleshooting */}
      {((status.retryInfo && status.retryInfo.attempts > 0) || status.circuitBreaker?.open || !status.network?.online) && (
        <div className="border-t pt-4 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Troubleshooting connection issues:</strong></p>
          <ul className="mt-1 ml-4 space-y-1">
            {!status.network?.online && <li>• <span className="text-red-600 dark:text-red-400">Device is offline</span> - Check internet connection</li>}
            {status.circuitBreaker?.open && <li>• <span className="text-red-600 dark:text-red-400">Circuit breaker open</span> - Too many failures, waiting for cooldown</li>}
            <li>• Check network connectivity to Supabase ({status.url})</li>
            <li>• Verify PING_TOKEN matches Supabase secret</li>
            <li>• Ensure Edge Function is deployed: <code className="text-xs bg-muted px-1 rounded">supabase functions deploy ping</code></li>
            <li>• Check browser Network tab for CORS or 404 errors</li>
            <li>• Test manually: <code className="text-xs bg-muted px-1 rounded">{`fetch('${status.url}?id=latest', {headers: {"Authorization": "Bearer TOKEN"}})`}</code></li>
            {status.retryInfo?.lastError && (
              <li>• Last error: <code className="text-xs bg-muted px-1 rounded text-red-600 dark:text-red-400">{status.retryInfo.lastError.substring(0, 80)}...</code></li>
            )}
          </ul>
          <div className="mt-2 text-xs text-muted-foreground">
            System will auto-retry when conditions improve. Use "Reset System" to force immediate retry.
          </div>
        </div>
      )}
    </Card>
  );
}