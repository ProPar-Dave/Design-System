# Legacy Build Status Setup Guide

⚠️ **DEPRECATED**: This guide is for the legacy build status system. 

**For new setups, use the secure status bridge system instead:**
See `/utils/secure-ping-setup.md` for the recommended secure implementation.

---

This guide shows how to set up the legacy Supabase-based build status tracking system.

## Overview

The system consists of:
- **Supabase Edge Function** (`build-status`) that accepts POST events and serves GET status
- **Database table** (`build_status`) to store event history  
- **Frontend ping utility** that sends events at key lifecycle points
- **Optional auth token** to prevent endpoint abuse

## 1. Deploy the Edge Function

The Edge Function is already created at `/supabase/functions/build-status/index.ts`. Deploy it:

```bash
# From your project root
supabase functions deploy build-status --no-verify-jwt
```

## 2. Set Up the Database

Run the migration to create the `build_status` table:

```bash
supabase db push
```

Or manually run the SQL from `/supabase/migrations/20250115000000_build_status_table.sql` in your Supabase SQL Editor.

## 3. Configure the Ping Token

Update the ping token in `/utils/ping.ts`:

```ts
const PING_TOKEN = 'your-actual-secret-token'; // ← Replace this
```

**Important**: Use the same token that you configured in the Supabase secret `PING_TOKEN`.

## 4. Test the Setup

### Test from Browser Console

Open your app and run:

```js
// Check ping system status
console.log(window.getPingStatus())

// Test a ping manually
window.ping('test', { message: 'Manual test from console' })

// Fetch current status
window.getBuildStatus().then(console.log)
```

### Test with curl

```bash
# Test ping endpoint
curl -X POST https://bjpcjlemlfnmrqseldmb.functions.supabase.co/build-status \
  -H "Content-Type: application/json" \
  -H "x-ping-token: your-actual-secret-token" \
  -d '{"stage":"test","app":"adsm","siteUrl":"https://test.example.com","buildId":"test-123"}'

# Check status
curl -H "x-ping-token: your-actual-secret-token" \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/build-status
```

## 5. Enable Development Mode (Optional)

To test pings during development, update the configuration in `/utils/ping.ts`:

```ts
const PING_CONFIG = {
  enabled: true,
  enabledInDev: true, // ← Set to true for development testing
  timeout: 5000,
  maxRetries: 1
};
```

## Endpoints

- **POST**: `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/build-status`
- **GET**: `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/build-status`

## Payload Format

Events sent to the endpoint follow this format:

```json
{
  "stage": "start | done | error",
  "at": "2025-01-15T12:00:00.000Z",
  "app": "adsm",
  "siteUrl": "https://your-site.figma.site/",
  "commit": "abcdef123",
  "buildId": "abc123",
  "version": "v1.0.0",
  "job": "app-init | component-create | token-update | etc",
  "message": "optional error message"
}
```

## Response Format

GET requests return:

```json
{
  "ok": true,
  "status": {
    "id": "...",
    "created_at": "2025-01-15T12:00:00Z",
    "stage": "done",
    "at": "2025-01-15T12:00:00Z",
    "app": "adsm",
    "site_url": "https://your-site.figma.site/",
    "build_id": "abc123",
    "version": "v1.0.0",
    "message": null,
    "job": "app-init",
    "payload": { /* original POST data */ }
  }
}
```

## Security

- The `build_status` table has RLS enabled with no public policies
- Only the Edge Function (using service role) can read/write data
- Optional `x-ping-token` header provides basic authentication
- CORS allows your site origin for browser requests

## Troubleshooting

### "Failed to fetch" Errors
1. **Token not configured**: Update `PING_TOKEN` in `/utils/ping.ts`
2. **Development mode**: Set `enabledInDev: true` if testing locally
3. **Edge Function not deployed**: Run `supabase functions deploy build-status`

### No Pings Being Sent
Check the browser console for ping status:
```js
window.getPingStatus()
```

Look for:
- `enabled: false` - System disabled
- `tokenConfigured: false` - Token not set up
- Failed endpoints array - Previous failures

### Console Messages
- `[PING] System disabled or not configured` - Normal when token not set
- `[PING] Skipped {stage} (disabled or not configured)` - Pings disabled
- `[PING] Endpoint failed, disabling future pings` - Edge Function unreachable

## For Claude Integration

Share this GET URL with Claude for status checking:
```
https://bjpcjlemlfnmrqseldmb.functions.supabase.co/build-status
```

Claude can fetch this endpoint to check your latest build status when requested.