# Make.com POST Module Quick Verification Guide
**Atomic DS Manager • Ping Endpoint Testing**

## Configuration Summary
```
URL: https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
Method: POST
Headers:
  x-ping-token: dude
  content-type: application/json
Body: {
  "id": "latest",
  "event": "publish", 
  "message": "Figma Make finished",
  "url": "https://daily-stem-67845579.figma.site/",
  "version": "0.1.2"
}
```

**Expected Response:** `200 OK` with `{"ok": true, "digest": "..."}`

---

## Quick Verification Steps

### Step 1: Manual cURL Test (Recommended First)
```bash
curl -i -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
  -d '{
    "id": "latest",
    "event": "publish",
    "message": "Figma Make finished", 
    "url": "https://daily-stem-67845579.figma.site/",
    "version": "0.1.2"
  }' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
```

**Expected Response:**
```
HTTP/2 200
content-type: application/json

{"ok": true, "digest": "abc123..."}
```

### Step 2: Make.com Module Test
1. **Create Test Scenario**
   - Add single "HTTP • Make a Request" module
   - Configure exactly as shown above
   - Run once manually

2. **Check Response**
   - Status should be `200`
   - Body should contain `{"ok": true, "digest": "..."}`
   - No error messages in execution log

### Step 3: Verify Data Storage
```bash
# GET to confirm data was stored
curl -i -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

**Expected GET Response:**
```json
{
  "payload": {
    "id": "latest",
    "event": "publish",
    "message": "Figma Make finished",
    "url": "https://daily-stem-67845579.figma.site/",
    "version": "0.1.2",
    "ts": "2025-01-15T..."
  },
  "digest": "abc123...",
  "received_at": "2025-01-15T..."
}
```

---

## Make.com Module Configuration Details

### HTTP • Make a Request Settings
```
Method: POST
URL: https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
Parse Response: Yes
Timeout: 10 seconds

Headers:
┌─────────────────┬─────────────────────────┐
│ Name            │ Value                   │
├─────────────────┼─────────────────────────┤
│ x-ping-token    │ dude                   │
│ content-type    │ application/json       │
└─────────────────┴─────────────────────────┘

Body Type: Raw
Content Type: JSON (application/json)
Request Content:
{
  "id": "latest",
  "event": "publish",
  "message": "Figma Make finished",
  "url": "https://daily-stem-67845579.figma.site/",
  "version": "0.1.2"
}
```

### Success Indicators
- ✅ **Status Code:** `200`
- ✅ **Response Body:** Contains `"ok": true`
- ✅ **Response Time:** Under 2 seconds
- ✅ **No Errors:** Clean execution log

---

## Troubleshooting Common Issues

### Issue 1: HTTP 401 Unauthorized
**Symptoms:**
```json
{"code": 401, "message": "Bad or missing x-ping-token"}
```

**Solutions:**
- Verify header name is exactly `x-ping-token` (lowercase, hyphen)
- Verify header value is exactly `dude` (no extra spaces)
- Check Make.com isn't auto-encoding the header

### Issue 2: HTTP 400 Bad Request
**Symptoms:**
```json
{"code": 400, "message": "Invalid JSON payload"}
```

**Solutions:**
- Ensure Body Type is set to "Raw"
- Ensure Content Type is "JSON (application/json)"
- Verify JSON syntax is valid (no trailing commas)

### Issue 3: HTTP 500 Internal Server Error
**Symptoms:**
```json
{"code": 500, "message": "Internal server error"}
```

**Solutions:**
- Wait 30 seconds and retry (might be cold start)
- Check Supabase function deployment status
- Verify Supabase project is active

### Issue 4: Timeout or Network Error
**Symptoms:**
- Request times out
- "Failed to fetch" error
- Connection refused

**Solutions:**
- Check internet connectivity
- Verify Make.com can reach external URLs
- Try increasing timeout to 30 seconds

---

## Advanced Verification

### Test Different Payloads
```bash
# Test minimal payload
curl -i -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
  -d '{"id": "test", "event": "minimal"}' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping

# Test with extra fields
curl -i -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
  -d '{
    "id": "latest",
    "event": "build-complete",
    "message": "Production deployment ready",
    "url": "https://daily-stem-67845579.figma.site/",
    "version": "0.1.3",
    "meta": {
      "source": "Make.com",
      "duration": "45s",
      "commit": "abc123"
    }
  }' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
```

### Verify Change Detection
```bash
# POST first payload
curl -sS -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
  -d '{"id": "latest", "event": "v1", "message": "First"}' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping

# POST second payload (should have different digest)
curl -sS -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
  -d '{"id": "latest", "event": "v2", "message": "Second"}' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
```

### Load Testing
```bash
# Send multiple requests quickly
for i in {1..5}; do
  curl -sS -X POST \
    -H "x-ping-token: dude" \
    -H "content-type: application/json" \
    -d "{\"id\": \"test-$i\", \"event\": \"load-test\", \"message\": \"Request $i\"}" \
    https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping &
done
wait
```

---

## Make.com Specific Checks

### Execution Log Verification
1. **Run the module once**
2. **Check execution details:**
   - Request headers sent
   - Request body sent
   - Response status received
   - Response body received
   - Execution time

### Data Mapping Verification
```javascript
// In Make.com, test these mappings work:
Status Code: {{response.statusCode}}
Response OK: {{response.data.ok}}
Digest: {{response.data.digest}}
Timestamp: {{formatDate(now; "YYYY-MM-DD HH:mm:ss")}}
```

### Error Handling Setup
```javascript
// Add these conditions to handle errors:
Success Condition: {{response.statusCode = 200}}
Error Condition: {{response.statusCode ≠ 200}}
Error Message: {{response.data.message}}
```

---

## Integration with Auto-Monitor

Once POST is verified, the auto-polling monitor should:

1. **Detect the change** (new digest)
2. **Send notification** with build details
3. **Reset interval** to 15 minutes
4. **Update state** in Data Store

### Monitor Verification
```bash
# After successful POST, check monitor picks it up
curl -sS -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

The monitor should detect this as a change and send notifications.

---

## Security Notes

### Token Security
- ✅ Token `dude` is safe for testing
- ✅ No sensitive data exposed in logs
- ✅ HTTPS enforced on all requests
- ⚠️ Consider rotating token for production use

### Data Privacy
- All ping data is stored in private Supabase tables
- Only authenticated requests can read/write
- Data retention follows Supabase policies

---

## Success Checklist

### Initial Setup
- [ ] Manual cURL POST returns 200 OK
- [ ] Manual cURL GET returns stored data
- [ ] Make.com module configured correctly
- [ ] Make.com test execution succeeds

### Integration Testing
- [ ] Auto-monitor detects POST changes
- [ ] Notifications sent to correct channels
- [ ] State properly maintained in Data Store
- [ ] Error handling works correctly

### Production Readiness
- [ ] Consistent response times (< 2s)
- [ ] No failed requests in logs
- [ ] Monitoring system stable
- [ ] Team trained on usage

---

## Next Steps After Verification

1. **Deploy Full Auto-Monitor** using the configuration guide
2. **Set up Build Integration** to POST after deployments
3. **Configure Team Notifications** for appropriate channels
4. **Monitor Performance** for the first week
5. **Document Process** for team handoff

---

## Quick Reference

### Essential URLs
- **POST Endpoint:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping`
- **GET Endpoint:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest`

### Essential Headers
- **Authentication:** `x-ping-token: dude`
- **Content Type:** `content-type: application/json`

### Expected Response
```json
{"ok": true, "digest": "hash-string"}
```

If you get this response, your Make.com POST module is correctly configured and ready for production use! 🚀