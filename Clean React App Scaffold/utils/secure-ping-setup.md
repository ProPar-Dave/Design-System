# Secure Status Bridge Setup Guide

This guide shows how to set up the secure status bridge system between Figma Make/Claude and external monitoring via Supabase Edge Functions.

## Overview

The system provides:
- **Secure endpoint** requiring tokens on both GET and POST
- **Status snapshots** (latest per job ID) 
- **Event history** (append-only log)
- **Configurable CORS** with allowed origins
- **Job-based organization** for different Make runs

## 1. Database Setup

Run the migration to create the status bridge tables:

```bash
supabase db push
```

This creates:
- `ping_status` - Latest status per job ID
- `ping_events` - Complete event history with timestamps

## 2. Configure Secrets

Set up the required secrets in your Supabase dashboard (Project Settings → Configuration → Secrets):

```bash
# Required - your shared authentication token
PING_TOKEN=your-long-random-secret-token

# Optional - comma-separated allowed origins for CORS
PING_ALLOWED_ORIGINS=https://daily-stem-67845579.figma.site,https://www.make.com

# Auto-provided by Supabase
SUPABASE_URL=https://bjpcjlemlfnmrqseldmb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 3. Deploy Edge Function

Deploy the secure ping endpoint:

```bash
supabase functions deploy ping --no-verify-jwt
```

## 4. Configure Frontend

Update the ping token in `/utils/ping.ts`:

```ts
const PING_TOKEN = 'your-long-random-secret-token'; // ← Same as PING_TOKEN secret
```

## Endpoints

- **POST**: `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping`
- **GET**: `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest`
- **GET History**: `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest&limit=10`

## API Usage

### POST - Send Status Update

```bash
curl -X POST https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping \
  -H "Content-Type: application/json" \
  -H "x-ping-token: your-long-random-secret-token" \
  -d '{
    "id": "run-123",
    "source": "figma-make",
    "status": "building",
    "message": "Starting component generation",
    "payload": {
      "runId": "run-123",
      "commit": "abc123",
      "url": "https://daily-stem-67845579.figma.site"
    }
  }'
```

**Payload Format:**
- `id` - Job identifier (default: "latest")
- `source` - Source system (default: "figma-make")
- `status` - Status value (e.g. "start", "done", "error")
- `message` - Optional human-readable message
- `payload` - Complete request data for history

### GET - Fetch Latest Status

```bash
# Latest status for default job
curl -H "x-ping-token: your-long-random-secret-token" \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping

# Latest status for specific job
curl -H "x-ping-token: your-long-random-secret-token" \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=run-123
```

**Response Format:**
```json
{
  "ok": true,
  "data": {
    "id": "run-123",
    "source": "figma-make",
    "status": "done",
    "message": "Build completed successfully",
    "payload": { /* original POST data */ },
    "updated_at": "2025-01-15T12:00:00Z"
  }
}
```

### GET - Fetch Event History

```bash
# Last 10 events for job
curl -H "x-ping-token: your-long-random-secret-token" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=run-123&limit=10"
```

**Response Format:**
```json
{
  "ok": true,
  "jobId": "run-123",
  "events": [
    {
      "id": "uuid",
      "job_id": "run-123",
      "source": "figma-make",
      "status": "done",
      "message": "Build completed",
      "payload": { /* original data */ },
      "created_at": "2025-01-15T12:00:00Z"
    }
  ]
}
```

## Frontend Testing

Open your app's browser console and run:

```js
// Check system status
window.getPingStatus()

// Test ping with custom job ID
window.ping('test', { 
  id: 'test-run-456',
  message: 'Manual test from console' 
})

// Get latest status for job
window.getBuildStatus('test-run-456')

// Get event history for job
window.getBuildHistory('test-run-456', 5)
```

## CORS Configuration

The system supports configurable CORS origins:

```bash
# Strict CORS (recommended for production)
PING_ALLOWED_ORIGINS=https://daily-stem-67845579.figma.site,https://www.make.com

# Permissive CORS (development only)
PING_ALLOWED_ORIGINS=*
```

Origins not in the allowed list will receive CORS errors on browser requests.

## Security Features

- **Token required on all requests** (GET and POST)
- **Service role database access** (no public RLS bypass)
- **Configurable CORS origins** 
- **Request logging** for audit trails
- **Error handling** with proper HTTP status codes

## Figma Make Integration

**HTTP Request Module Configuration:**

- **Method**: POST
- **URL**: `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping`
- **Headers**:
  - `Content-Type: application/json`
  - `x-ping-token: {{env.PING_TOKEN}}`
- **Body**:
```json
{
  "id": "{{ run.id | default: 'latest' }}",
  "source": "figma-make",
  "status": "{{ run.status }}",
  "message": "{{ step.name }}",
  "payload": {
    "runId": "{{ run.id }}",
    "commit": "{{ git.sha }}",
    "url": "{{ deploy.url }}",
    "durationMs": "{{ run.duration_ms }}"
  }
}
```

## Monitoring for Claude

Share this GET URL with Claude for status monitoring:

```
https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest
```

Claude can fetch this endpoint (with token) to check your latest build status.

## Troubleshooting

### 401 Unauthorized
- Check `PING_TOKEN` matches between frontend config and Supabase secrets
- Ensure `x-ping-token` header is included in all requests

### CORS Errors
- Add your domain to `PING_ALLOWED_ORIGINS` 
- Check browser network tab for actual Origin header value

### 500 Database Errors
- Verify migration ran successfully: `supabase db push`
- Check Edge Function logs: `supabase functions logs ping`

### No Data Found
- Confirm you're querying the correct job ID
- Check that POSTs are succeeding before trying GETs
- Use diagnostic panel to test end-to-end flow

## Rollback

To remove the system:
```bash
# Delete Edge Function
supabase functions delete ping

# Drop tables (optional)
# DROP TABLE public.ping_events;
# DROP TABLE public.ping_status;
```

The rest of your app remains unchanged.