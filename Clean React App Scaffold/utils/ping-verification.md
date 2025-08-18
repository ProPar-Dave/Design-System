# Supabase Ping Verification Guide

Quick verification steps for the secure ping system between Figma Make and this chat.

## Current Configuration

**Endpoint**: `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping`
**Auth**: `Authorization: Bearer ping-secure-bridge-2025`
**Current Token**: `ping-secure-bridge-2025` (⚠️ Update this to your actual secret)

## Test Commands

### 1. Baseline GET (expect 404 initially)

```bash
curl -i "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest" \
  -H "Authorization: Bearer ping-secure-bridge-2025"
```

Expected: `404 Not Found` (no data stored yet)

### 2. Store Test Data (POST)

```bash
curl -i -X POST \
  -H "Authorization: Bearer ping-secure-bridge-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "figma-make",
    "event": "COMPLETE",
    "runId": "run-2025-08-14-001",
    "message": "Build & publish finished",
    "url": "https://daily-stem-67845579.figma.site/",
    "ts": "'$(date -u +%FT%TZ)'"
  }' \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

Expected: `204 No Content`

### 3. Verify Data (GET)

```bash
curl -s "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest" \
  -H "Authorization: Bearer ping-secure-bridge-2025" | jq
```

Expected: `200 OK` with the JSON payload

### 4. Test Unauthorized Access

```bash
curl -i "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

Expected: `401 Unauthorized`

## Browser Testing

Open browser console on your app and run:

```js
// Check ping system status
window.getPingStatus()

// Test ping with current config
window.ping('test', { 
  id: 'manual-test-' + Date.now(),
  message: 'Manual browser test' 
})

// Fetch status (will fail if token not configured)
window.getBuildStatus('latest').then(console.log).catch(console.error)

// Enable development pings for testing
window.configurePing({ enabledInDev: true })
```

## Make.com Integration

**HTTP Request Module:**
- **Method**: POST
- **URL**: `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest`
- **Headers**:
  - `Authorization: Bearer {{env.PING_TOKEN}}`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "source": "figma-make",
  "event": "{{if(scenario.error; "FAIL"; "COMPLETE")}}",
  "runId": "{{execution_id}}",
  "message": "{{last.module.name}} finished",
  "url": "https://daily-stem-67845579.figma.site/",
  "ts": "{{formatDate(now; "YYYY-MM-DD[T]HH:mm:ss[Z]")}}"
}
```

## Claude Integration Prompt

Add this to your Make-controlled Claude step:

```
When the build is finished, make this HTTP request:

POST https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest
Authorization: Bearer ${PING_TOKEN}
Content-Type: application/json

{
  "source": "figma-make",
  "event": "COMPLETE", 
  "runId": "{{execution_id}}",
  "message": "Publishing done",
  "url": "https://daily-stem-67345579.figma.site/",
  "ts": "{{formatDate(now; "YYYY-MM-DD[T]HH:mm:ss[Z]")}}"
}

Retry up to 3 times if it fails. Expect 204 No Content on success.
```

## Status Responses

**Successful POST**: `204 No Content`
**Successful GET**: `200 OK` with JSON payload
**No data found**: `404 Not Found`
**Unauthorized**: `401 Unauthorized`
**Server error**: `500 Internal Server Error`

## Troubleshooting

### 401 Unauthorized
- Check token matches between frontend and Supabase secret
- Ensure `Authorization: Bearer TOKEN` format

### 404 Not Found
- No data stored yet for that ID
- Do a POST first, then GET

### CORS Errors
- Server-to-server requests (Make/Claude) don't have CORS issues
- Browser requests need origin in PING_ALLOWED_ORIGINS

### Development Mode
```js
// Enable pings in development
window.configurePing({ enabledInDev: true })

// Check current status
window.getPingStatus()
```

## Public Status URL for Claude

Share this URL with Claude for status monitoring:
```
https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest
```

Claude will need the same Bearer token to access it.

## Next Steps

1. **Update Token**: Replace `ping-secure-bridge-2025` with your actual secret
2. **Deploy Functions**: `supabase functions deploy ping --no-verify-jwt`
3. **Run Migrations**: `supabase db push`
4. **Test End-to-End**: Run the curl commands above
5. **Wire to Make**: Add HTTP request at end of scenario
6. **Share with Claude**: Provide the GET URL and token