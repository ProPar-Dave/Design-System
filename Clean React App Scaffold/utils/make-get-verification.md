# Make.com GET Module Quick Verification Guide
**Atomic DS Manager • Ping Data Retrieval Testing**

## Configuration Summary
```
URL: https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest
Method: GET
Headers:
  x-ping-token: dude
Parse Response: Yes
Timeout: 10 seconds
```

**Expected Response:** `200 OK` with payload data structure

---

## Quick Verification Steps

### Step 1: Manual cURL Test (Recommended First)
```bash
curl -i -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

**Expected Response Format:**
```json
{
  "payload": {
    "id": "latest",
    "event": "publish",
    "message": "Figma Make finished",
    "url": "https://daily-stem-67845579.figma.site/",
    "version": "0.1.2",
    "ts": "2025-01-15T14:30:45.123Z"
  },
  "digest": "abc123def456...",
  "received_at": "2025-01-15T14:30:45.123Z"
}
```

### Step 2: Make.com Module Test
1. **Create Test Scenario**
   - Add single "HTTP • Make a Request" module
   - Configure exactly as shown above
   - Run once manually

2. **Check Response Structure**
   - Status should be `200`
   - Body should contain `payload`, `digest`, and `received_at` fields
   - Payload should match the data from previous POST

### Step 3: Field Validation
Verify these fields are accessible in Make.com:
```javascript
// Basic structure
{{response.data.payload.id}}          // "latest"
{{response.data.payload.event}}       // "publish"
{{response.data.payload.message}}     // "Figma Make finished"
{{response.data.payload.url}}         // "https://daily-stem-67845579.figma.site/"
{{response.data.payload.version}}     // "0.1.2"
{{response.data.payload.ts}}          // "2025-01-15T14:30:45.123Z"
{{response.data.digest}}              // "abc123def456..."
{{response.data.received_at}}         // "2025-01-15T14:30:45.123Z"
```

---

## Make.com Module Configuration Details

### HTTP • Make a Request Settings
```
Method: GET
URL: https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest
Parse Response: Yes
Timeout: 10 seconds

Headers:
┌─────────────────┬─────────────────┐
│ Name            │ Value           │
├─────────────────┼─────────────────┤
│ x-ping-token    │ dude            │
└─────────────────┴─────────────────┘

Body: (empty - GET request)
```

### Success Indicators
- ✅ **Status Code:** `200`
- ✅ **Response Structure:** Contains `payload`, `digest`, `received_at`
- ✅ **Data Match:** Payload fields match expected values
- ✅ **Parse Success:** Make.com successfully parses JSON response

---

## Response Field Descriptions

### Core Payload Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Record identifier | `"latest"` |
| `event` | string | Event type/category | `"publish"` |
| `message` | string | Human-readable description | `"Figma Make finished"` |
| `url` | string | Optional deployment URL | `"https://daily-stem-67845579.figma.site/"` |
| `version` | string | Optional version identifier | `"0.1.2"` |
| `ts` | string | ISO timestamp when stored | `"2025-01-15T14:30:45.123Z"` |

### Meta Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `digest` | string | Content hash for change detection | `"abc123def456..."` |
| `received_at` | string | ISO timestamp when received | `"2025-01-15T14:30:45.123Z"` |

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
- Ensure header is in the Headers section, not URL parameters

### Issue 2: HTTP 404 Not Found
**Symptoms:**
```json
{"missing": true, "id": "latest", "message": "No data found"}
```

**Solutions:**
- Run the POST module first to create data
- Verify the `id` parameter matches what was POSTed
- Check if data exists by testing with curl

### Issue 3: Empty or Null Response
**Symptoms:**
- Response body is empty
- `payload` field is `null`
- Missing expected fields

**Solutions:**
- Ensure "Parse Response" is enabled
- Verify Content-Type is `application/json`
- Check if data was properly stored via POST first

### Issue 4: Parse Error in Make.com
**Symptoms:**
- Make.com shows "Invalid JSON" error
- Response body shows as raw text
- Cannot access nested fields

**Solutions:**
- Enable "Parse Response" in module settings
- Check response Content-Type header
- Test with manual curl to verify JSON format

---

## Test Scenarios

### Scenario A: Fresh Data Test
```bash
# 1. POST new data
curl -sS -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
  -d '{
    "id": "latest",
    "event": "test-get",
    "message": "Testing GET module",
    "url": "https://daily-stem-67845579.figma.site/",
    "version": "test-1.0"
  }' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping

# 2. GET to verify retrieval
curl -sS -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"

# 3. Run Make.com GET module
# Should return the same data from step 2
```

### Scenario B: Different ID Test
```bash
# Test with custom ID
curl -sS -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
  -d '{"id": "test-123", "event": "custom", "message": "Custom ID test"}' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping

# GET with custom ID (update Make.com URL)
curl -sS -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=test-123"
```

### Scenario C: Missing Data Test
```bash
# GET non-existent ID
curl -sS -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=does-not-exist"

# Expected response:
# {"missing": true, "id": "does-not-exist", "message": "No data found"}
```

---

## Data Mapping in Make.com

### Basic Field Access
```javascript
// Direct payload access
ID: {{1.data.payload.id}}
Event: {{1.data.payload.event}}
Message: {{1.data.payload.message}}
URL: {{1.data.payload.url}}
Version: {{1.data.payload.version}}
Timestamp: {{1.data.payload.ts}}

// Meta fields
Digest: {{1.data.digest}}
Received: {{1.data.received_at}}
```

### Conditional Logic
```javascript
// Check if data exists
Has Data: {{not(1.data.missing)}}

// Safe field access with fallbacks
Event: {{ifempty(1.data.payload.event; "unknown")}}
URL: {{ifempty(1.data.payload.url; "No URL provided")}}
Version: {{ifempty(1.data.payload.version; "No version")}}

// Format timestamp
Formatted Time: {{formatDate(1.data.payload.ts; "MMM D, YYYY h:mm A")}}
```

### Router Conditions
```javascript
// Route based on data existence
Data Exists: {{not(1.data.missing)}}
No Data: {{1.data.missing}}

// Route based on event type
Is Build: {{equals(1.data.payload.event; "publish")}}
Is Test: {{contains(1.data.payload.event; "test")}}

// Route based on presence of URL
Has URL: {{not(empty(1.data.payload.url))}}
```

---

## Integration with Auto-Monitor

### Expected Auto-Monitor Behavior
After successful GET verification, the auto-monitor should:

1. **Fetch same data** from the ping endpoint
2. **Parse payload** correctly using same structure
3. **Compare digest** for change detection
4. **Format notifications** using payload fields

### Monitor Data Mapping
The auto-monitor uses these mappings:
```javascript
// Change detection
digest = {{concat(payload.id; "|"; payload.ts; "|"; payload.event; "|"; payload.message)}}
changed = {{not(equals(digest; stored_hash))}}

// Notification formatting
notification = 🚀 Build Update: {{payload.event}}
Message: {{payload.message}}
When: {{formatDate(payload.ts; "ddd, MMM D h:mm A")}}
URL: {{payload.url}}
Version: {{payload.version}}
```

---

## Advanced Testing

### Load Testing
```bash
# Test multiple rapid requests
for i in {1..10}; do
  curl -sS -H "x-ping-token: dude" \
    "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest" &
done
wait
```

### Response Time Testing
```bash
# Test with timing
time curl -sS -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

### Different ID Patterns
```bash
# Test various ID formats
IDS=("latest" "prod" "staging" "test-123" "build-2025-01-15")
for id in "${IDS[@]}"; do
  echo "Testing ID: $id"
  curl -sS -H "x-ping-token: dude" \
    "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=$id"
  echo ""
done
```

---

## Error Handling Setup

### Make.com Error Routes
Add these conditions after the GET module:

```javascript
// Success route
Status OK: {{1.statusCode = 200}}
Has Payload: {{not(empty(1.data.payload))}}
Not Missing: {{not(1.data.missing)}}

// Error routes
HTTP Error: {{1.statusCode ≠ 200}}
Missing Data: {{1.data.missing}}
Parse Error: {{empty(1.data)}}
```

### Error Message Composition
```javascript
// HTTP error message
HTTP Error: Failed to fetch ping data ({{1.statusCode}}): {{1.data.message}}

// Missing data message  
Missing Data: No ping data found for ID "{{1.data.id}}"

// Parse error message
Parse Error: Invalid response format from ping endpoint
```

---

## Security Validation

### Token Security Check
```bash
# Test without token (should fail)
curl -i "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
# Expected: 401 Unauthorized

# Test with wrong token (should fail)
curl -i -H "x-ping-token: wrong" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
# Expected: 401 Unauthorized

# Test with correct token (should succeed)
curl -i -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
# Expected: 200 OK
```

---

## Success Checklist

### Basic Functionality ✅
- [ ] Manual cURL GET returns 200 OK
- [ ] Response contains expected JSON structure
- [ ] All payload fields are accessible
- [ ] Make.com module configured correctly
- [ ] Make.com test execution succeeds
- [ ] Response parsing works in Make.com

### Field Validation ✅
- [ ] `id` field matches expected value
- [ ] `event` field contains event type
- [ ] `message` field has readable description
- [ ] `ts` field has valid ISO timestamp
- [ ] `digest` field contains hash string
- [ ] Optional fields (`url`, `version`) handled properly

### Error Handling ✅
- [ ] 401 response when token missing/wrong
- [ ] 404 response for non-existent IDs
- [ ] Proper error messages in responses
- [ ] Make.com error routes configured
- [ ] Graceful handling of missing data

### Integration Ready ✅
- [ ] Data format matches auto-monitor expectations
- [ ] Field mappings work correctly
- [ ] Change detection logic compatible
- [ ] Notification formatting successful

---

## Next Steps After GET Verification

### Immediate Actions
1. **Verify POST→GET chain** works end-to-end
2. **Test auto-monitor** detects GET data properly
3. **Validate field mappings** in notification templates
4. **Configure error handling** for production scenarios

### Integration Testing
1. **Deploy auto-monitor** with verified GET configuration
2. **Test change detection** using POST→GET→Monitor flow
3. **Verify notifications** include all expected fields
4. **Monitor performance** over time

### Production Deployment
1. **Document field mappings** for team reference
2. **Set up monitoring** for GET endpoint health
3. **Create backup scenarios** for error recovery
4. **Train team** on troubleshooting procedures

---

## Quick Reference

### Essential Test Commands
```bash
# Quick GET test
curl -sS -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"

# POST then GET test
curl -sS -X POST -H "x-ping-token: dude" -H "content-type: application/json" \
  -d '{"id":"latest","event":"test","message":"Quick test"}' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping && \
curl -sS -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

### Make.com Field Access
```javascript
// Most commonly used fields
{{1.data.payload.event}}      // Event type
{{1.data.payload.message}}    // Description
{{1.data.payload.ts}}         // Timestamp
{{1.data.digest}}             // Change hash
```

### Expected Response Keys
- ✅ `payload.id` - Record identifier
- ✅ `payload.event` - Event category  
- ✅ `payload.message` - Human description
- ✅ `payload.ts` - ISO timestamp
- ✅ `digest` - Content hash
- ✅ `received_at` - Storage timestamp

If all these fields are accessible in Make.com with the expected values, your GET module is correctly configured and ready for integration with the auto-monitoring system! 🚀