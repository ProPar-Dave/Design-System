# Make.com Ping Scenarios - Complete Configuration Guide

## Prerequisites

**Shared Constants:**
- `PING_ENDPOINT` = `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping`
- `PING_TOKEN` = `dude` _(use as header `x-ping-token`)_

---

## Step 1: Create Data Store (Required for Scenario B)

1. Go to **Data Stores** in Make.com
2. Click **Create a new data store**
3. **Name:** `ping_state`
4. **Data structure:**
   - `last_hash` (Text)
   - `last_ts` (Text)
   - `interval_minutes` (Number)
5. **Add initial record:**
   - **Key:** `latest`
   - **Data:**
     ```json
     {
       "last_hash": "",
       "last_ts": "",
       "interval_minutes": 15
     }
     ```

---

## Scenario A: "Atomic DS — Build Ping"

**Purpose:** Send POST when build completes, then GET to verify persistence.

### Module 1: Tools → Set Variables
**Configuration:**
- **Variable 1:**
  - Name: `id`
  - Value: `latest`
- **Variable 2:**
  - Name: `event`
  - Value: `build:complete`
- **Variable 3:**
  - Name: `message`
  - Value: `Production build published`
- **Variable 4:**
  - Name: `url`
  - Value: `https://daily-stem-67845579.figma.site/`
- **Variable 5:**
  - Name: `version`
  - Value: `v1.0.0`

### Module 2: HTTP → Make a Request (POST)
**Configuration:**
- **URL:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping`
- **Method:** `POST`
- **Headers:**
  - **Name:** `x-ping-token` **Value:** `dude`
  - **Name:** `Content-Type` **Value:** `application/json`
- **Body Type:** Raw
- **Content Type:** JSON (application/json)
- **Request Content:**
```json
{
  "id": "{{1.id}}",
  "event": "{{1.event}}",
  "message": "{{1.message}}",
  "url": "{{1.url}}",
  "version": "{{1.version}}",
  "meta": {"commit": "abc123"}
}
```
- **Parse Response:** Yes
- **Timeout:** 40 seconds

### Module 3: Router (Error Handling)
**Configuration:**
- **Route 1 (Success):**
  - **Filter:** `{{between(2.statusCode; 200; 299)}}`
  - **Label:** "Success"
- **Route 2 (Error):**
  - **Filter:** `{{not(between(2.statusCode; 200; 299))}}`
  - **Label:** "Error"

### Module 4: HTTP → Make a Request (GET Verification)
**Connect to:** Route 1 (Success) from Module 3
**Configuration:**
- **URL:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id={{1.id}}`
- **Method:** `GET`
- **Headers:** None (bulletproof endpoint doesn't require auth for GET)
- **Parse Response:** Yes
- **Timeout:** 40 seconds

### Module 5: Tools → Set Variable (Success Digest)
**Connect to:** Module 4
**Configuration:**
- **Variable Name:** `digest`
- **Variable Value:**
```
{{4.data.payload.id}}|{{4.data.payload.ts}}|{{4.data.payload.event}}|{{4.data.payload.message}}
```

### Module 6: Data Store → Update a Record (Success State)
**Connect to:** Module 5
**Configuration:**
- **Data Store:** `ping_state`
- **Key:** `latest`
- **Data:**
```json
{
  "last_hash": "{{5.digest}}",
  "last_ts": "{{4.data.payload.ts}}",
  "interval_minutes": 15
}
```

### Module 7: Tools → Compose a String (Error Message)
**Connect to:** Route 2 (Error) from Module 3
**Configuration:**
- **Text:**
```
POST failed with status {{2.statusCode}}: {{2.body}}
```

### Module 8: Tools → Stop (Error Termination)
**Connect to:** Module 7
**Configuration:**
- **Status:** Error
- **Message:** `{{7.text}}`

---

## Scenario B: "Atomic DS — Ping Monitor (Manual)"

**Purpose:** Check for payload changes and update monitoring intervals with backoff.

### Module 1: Data Store → Get a Record
**Configuration:**
- **Data Store:** `ping_state`
- **Key:** `latest`
- **Create a fallback record:** Yes

### Module 2: HTTP → Make a Request (GET)
**Configuration:**
- **URL:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest`
- **Method:** `GET`
- **Headers:** None (no auth needed for bulletproof GET)
- **Parse Response:** Yes
- **Timeout:** 40 seconds

### Module 3: Router (Status Check)
**Configuration:**
- **Route 1 (Success):**
  - **Filter:** `{{between(2.statusCode; 200; 299)}}`
  - **Label:** "HTTP Success"
- **Route 2 (HTTP Error):**
  - **Filter:** `{{not(between(2.statusCode; 200; 299))}}`
  - **Label:** "HTTP Error"

### Module 4: Tools → Set Variable (Current Digest)
**Connect to:** Route 1 (Success) from Module 3
**Configuration:**
- **Variable Name:** `current_digest`
- **Variable Value:**
```
{{2.data.payload.id}}_{{2.data.payload.ts}}_{{2.data.payload.event}}_{{2.data.payload.message}}
```

### Module 5: Router (Change Detection)
**Connect to:** Module 4
**Configuration:**
- **Route 1 (Changed):**
  - **Filter:** `{{4.current_digest != 1.data.last_hash}}`
  - **Label:** "Payload Changed"
- **Route 2 (Same):**
  - **Filter:** `{{4.current_digest = 1.data.last_hash}}`
  - **Label:** "No Change"

### Module 6: Tools → Set Variable (Human Timestamp)
**Connect to:** Route 1 (Changed) from Module 5
**Configuration:**
- **Variable Name:** `humanTS`
- **Variable Value:**
```
{{formatDate(2.data.payload.ts; "YYYY-MM-DD HH:mm:ss[Z]")}}
```

### Module 7: Tools → Compose a String (Change Notice)
**Connect to:** Module 6
**Configuration:**
- **Text:**
```
PING CHANGED: {{2.data.payload.event}} — {{2.data.payload.message}} at {{6.humanTS}}
{{if(2.data.payload.url; concat("URL: ", 2.data.payload.url); "")}}
{{if(2.data.payload.version; concat("Version: ", 2.data.payload.version); "")}}
```

### Module 8: Data Store → Update a Record (Changed State)
**Connect to:** Module 7
**Configuration:**
- **Data Store:** `ping_state`
- **Key:** `latest`
- **Data:**
```json
{
  "last_hash": "{{4.current_digest}}",
  "last_ts": "{{2.data.payload.ts}}",
  "interval_minutes": 15
}
```

### Module 9: Tools → Set Variable (Next Interval)
**Connect to:** Route 2 (Same) from Module 5
**Configuration:**
- **Variable Name:** `nextInterval`
- **Variable Value:**
```
{{min(add(1.data.interval_minutes; 15); 60)}}
```

### Module 10: Data Store → Update a Record (Same State)
**Connect to:** Module 9
**Configuration:**
- **Data Store:** `ping_state`
- **Key:** `latest`
- **Data:**
```json
{
  "last_hash": "{{1.data.last_hash}}",
  "last_ts": "{{1.data.last_ts}}",
  "interval_minutes": {{9.nextInterval}}
}
```

### Module 11: Tools → Compose a String (No Change Notice)
**Connect to:** Module 10
**Configuration:**
- **Text:**
```
NO CHANGE: next check in {{9.nextInterval}} minutes (was {{1.data.interval_minutes}})
```

### Module 12: Tools → Compose a String (HTTP Error Notice)
**Connect to:** Route 2 (HTTP Error) from Module 3
**Configuration:**
- **Text:**
```
HTTP ERROR: status {{2.statusCode}} - {{2.body}}
```

### Module 13: Data Store → Update a Record (Error State)
**Connect to:** Module 12
**Configuration:**
- **Data Store:** `ping_state`
- **Key:** `latest`
- **Data:**
```json
{
  "last_hash": "{{1.data.last_hash}}",
  "last_ts": "{{1.data.last_ts}}",
  "interval_minutes": {{1.data.interval_minutes}}
}
```

---

## Testing Procedures

### Test Scenario A:
1. **Run manually** with default variables
2. **Expected Results:**
   - Module 2 (POST): Status 200, response `{"ok": true, "digest": "..."}`
   - Module 4 (GET): Status 200, response with payload data
   - Module 6: Data store updated with new digest

### Test Scenario B:
1. **First run:** Should report "PING CHANGED" (empty hash initially)
2. **Second run:** Should report "NO CHANGE" with interval = 30
3. **After Scenario A:** Should report "PING CHANGED" again

---

## Manual Testing Commands

### Test POST directly:
```bash
curl -sS -X POST \
  -H "x-ping-token: dude" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "latest",
    "event": "build:complete", 
    "message": "Production build published",
    "url": "https://daily-stem-67845579.figma.site/",
    "version": "v1.0.0"
  }' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
```

### Test GET directly:
```bash
curl -sS "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

### Test Health Check:
```bash
curl -sS "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=health"
```

---

## Troubleshooting

### Common Issues:
- **CORS errors:** Verify endpoint URL exactly matches
- **401 errors:** Check `x-ping-token` header is set to `dude`
- **Data Store errors:** Ensure `ping_state` exists with correct structure
- **Expression errors:** Use Make's expression tester to validate

### Debug Tips:
- Check execution details in Make for full request/response
- Use health endpoint to verify function deployment
- Test with manual curl commands first
- Verify Data Store structure matches expected format

---

## Expected Outputs

### Scenario A Success:
```
POST Response: {"ok": true, "digest": "latest_2025-01-15T..."}
GET Response: {"payload": {...}, "digest": "...", "received_at": "..."}
```

### Scenario B Outputs:
```
Changed: "PING CHANGED: build:complete — Production build published at 2025-01-15 14:30:00Z"
No Change: "NO CHANGE: next check in 30 minutes (was 15)"
```

---

Once you've created both scenarios, run them and share the execution results. I can help troubleshoot any issues that arise!