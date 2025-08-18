# Figma Make Status Endpoint Configuration

This file contains configuration examples for setting up the status endpoint that receives ping notifications from the Atomic DS Manager.

## Quick Setup

### 1. Update the Ping URL

In `/utils/ping.ts`, replace the placeholder URL:

```ts
// Change this line:
const PING_URL = 'https://your-worker-domain.workers.dev/figma-make-hook';

// To your actual worker URL:
const PING_URL = 'https://my-worker.my-subdomain.workers.dev/figma-make-hook';
```

### 2. Enable Development Mode (Optional)

To test pings during development, update the configuration in `/utils/ping.ts`:

```ts
const PING_CONFIG = {
  enabled: true,
  enabledInDev: true, // ← Set to true for development testing
  timeout: 5000,
  maxRetries: 1
};
```

### 3. Disable Pings (If Not Needed)

To completely disable the ping system:

```ts
const PING_CONFIG = {
  enabled: false, // ← Disable all pings
  enabledInDev: false,
  timeout: 5000,
  maxRetries: 1
};
```

## Cloudflare Worker Setup

### 1. `wrangler.toml`

```toml
name = "figma-make-hook"
main = "src/index.ts"
compatibility_date = "2024-10-01"

[[kv_namespaces]]
binding = "STATE"
id = "<create-via-wrangler>"
```

### 2. `src/index.ts`

```ts
export default {
  async fetch(req: Request, env: any) {
    const url = new URL(req.url);

    // Handle incoming pings from Figma Make
    if (req.method === 'POST' && url.pathname === '/figma-make-hook') {
      try {
        const data = await req.json().catch(() => ({}));
        const stamp = Date.now();
        
        // Store the latest status in KV
        await env.STATE.put('last', JSON.stringify({ 
          ok: true, 
          stamp, 
          ...data 
        }));
        
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 
            'Content-Type': 'application/json', 
            'Cache-Control': 'no-store',
            'Access-Control-Allow-Origin': '*'
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: error.message 
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Serve status for polling
    if (url.pathname === '/status') {
      const raw = (await env.STATE.get('last')) ?? '{}';
      return new Response(raw, {
        headers: { 
          'Content-Type': 'application/json', 
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*'
        },
      });
    }

    return new Response('Figma Make Status Endpoint');
  },
} satisfies ExportedHandler;
```

### 3. Deployment Commands

```bash
# Create KV namespace
wrangler kv:namespace create STATE

# Deploy the worker
wrangler deploy
```

## Testing the Setup

### 1. Test the Endpoint

```bash
# Test ping endpoint
curl -X POST https://your-worker-name.your-subdomain.workers.dev/figma-make-hook \
  -H "Content-Type: application/json" \
  -d '{"stage":"test","at":"2025-01-14T12:00:00.000Z","app":"adsm"}'

# Check status
curl https://your-worker-name.your-subdomain.workers.dev/status
```

### 2. Test from Browser Console

Open your app and run in the browser console:

```js
// Check ping system status
console.log(window.getPingStatus?.());

// Test a ping manually
window.ping?.('test', { message: 'Manual test' });

// Reset failed endpoints
window.resetPingSystem?.();
```

## Troubleshooting

### "Failed to fetch" Errors

This usually means:
1. **Placeholder URL**: Update `PING_URL` to your actual worker URL
2. **CORS Issues**: Make sure your worker returns proper CORS headers
3. **Worker Not Deployed**: Deploy your Cloudflare Worker
4. **Development Mode**: Set `enabledInDev: true` if testing locally

### No Pings Being Sent

Check the ping configuration:
1. **System Disabled**: `PING_CONFIG.enabled` is `false`
2. **Development Mode**: `PING_CONFIG.enabledInDev` is `false` in development
3. **Failed Endpoint**: The endpoint failed once and is now blacklisted
4. **Placeholder URL**: Still using the default placeholder URL

### Console Messages

- `[PING] System disabled or not configured` - Normal when no endpoint is set up
- `[PING] Skipped {stage} (disabled or not configured)` - Pings are disabled
- `[PING] Endpoint failed, disabling future pings` - Worker endpoint is unreachable

## Payload Format

The ping system sends payloads in this format:

```json
{
  "stage": "start | done | error",
  "at": "2025-01-14T12:00:00.000Z",
  "app": "adsm",
  "siteUrl": "https://your-site.figma.site/",
  "commit": "abcdef123",
  "buildId": "ln2d3s",
  "job": "app-bootstrap | token-update | component-create | etc",
  "version": "v1.0.0",
  "message": "optional error message"
}
```

## Alternative: Simple File-Based Status

If you prefer not to use Cloudflare Workers, you can update a simple JSON file on your server:

1. **Create `/status.json`** on your server
2. **Update it** from your deployment script:
   ```json
   { 
     "stage": "done", 
     "at": "2025-01-14T12:00:00Z", 
     "version": "v1.0.0",
     "buildId": "abc123"
   }
   ```
3. **Update PING_URL** to point to your file endpoint
4. **Poll that URL** instead of the worker endpoint

## Runtime Configuration

You can configure the ping system at runtime:

```js
// Disable pings
configurePing({ enabled: false });

// Change timeout
configurePing({ timeout: 10000 });

// Enable development mode
configurePing({ enabledInDev: true });
```

## Security Considerations

- The worker endpoint accepts any origin (`Access-Control-Allow-Origin: *`)
- Consider adding authentication tokens if needed:
  ```ts
  const authToken = req.headers.get('Authorization');
  if (authToken !== 'Bearer your-secret-token') {
    return new Response('Unauthorized', { status: 401 });
  }
  ```
- KV storage has limits - old entries will eventually expire
- No sensitive data should be sent in pings

## Monitoring

You can monitor the status endpoint health by checking:
- Response time of the `/status` endpoint
- Last ping timestamp to detect stale data
- Error rates in ping submissions
- Failed endpoint blacklist status