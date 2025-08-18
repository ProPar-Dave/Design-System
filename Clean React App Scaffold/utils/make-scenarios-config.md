# Make.com Scenarios Configuration Guide
**Atomic DS Manager • Supabase Ping Integration**

## Fixed Configuration Values
- **Ping Endpoint:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping`
- **Auth Header:** `x-ping-token: dude`
- **Record ID:** `latest`

---

## Scenario A: "Atomic DS • Build → Supabase Ping"
**Purpose:** POST build status to Supabase, then GET to confirm storage.

### Module 1: HTTP • Make a Request (POST)
**Configuration:**
- **Method:** `POST`
- **URL:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping`
- **Headers:**
  - **Name:** `x-ping-token` **Value:** `dude`
  - **Name:** `content-type` **Value:** `application/json`
- **Body Type:** Raw
- **Content Type:** JSON (application/json)
- **Request Content:**
```json
{
  "id": "latest",
  "event": "build:complete",
  "message": "Production build published",
  "url": "https://daily-stem-67845579.figma.site/",
  "version": "{{formatDate(now; "YYYY.M.D-HHmm")}}",
  "meta": {
    "source": "Make",
    "commit": "{{optionalCommitOrTag}}"
  }
}
```
- **Parse Response:** Yes
- **Timeout:** 40 seconds

### Module 2: Router (Error Handling for POST)
**Configuration:**
- **Route 1 (Success):**
  - **Filter:** `{{between(1.statusCode; 200; 299)}}`
  - **Label:** "POST Success"
- **Route 2 (Error):**
  - **Filter:** `{{not(between(1.statusCode; 200; 299))}}`
  - **Label:** "POST Failed"

### Module 3: HTTP • Make a Request (GET - Success Path)
**Connect to:** Route 1 (POST Success) from Module 2
**Configuration:**
- **Method:** `GET`
- **URL:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest`
- **Headers:**
  - **Name:** `x-ping-token` **Value:** `dude`
- **Parse Response:** Yes
- **Timeout:** 30 seconds

### Module 4: Tools • Text Aggregator (Success Message)
**Connect to:** Module 3
**Configuration:**
- **Text:**
```
✅ Ping saved @ {{formatDate(now; "YYYY-MM-DD HH:mm:ss")}}
{{3.data}}
```

### Module 5: Slack • Post Message (Success Notification)
**Connect to:** Module 4
**Configuration:**
- **Channel:** `#build-notifications` (or your preferred channel)
- **Text:** `{{4.text}}`
- **Username:** `Build Bot`
- **Icon:** `:white_check_mark:`

### Module 6: Tools • Compose String (Error Message - POST Failed)
**Connect to:** Route 2 (POST Failed) from Module 2
**Configuration:**
- **Text:**
```
❌ Build ping failed: {{1.statusCode}} {{1.data}}
```

### Module 7: Slack • Post Message (Error Notification)
**Connect to:** Module 6
**Configuration:**
- **Channel:** `#build-notifications` (or your preferred channel)
- **Text:** `{{6.text}}`
- **Username:** `Build Bot`
- **Icon:** `:x:`

### Module 8: Tools • Stop (Error Termination)
**Connect to:** Module 7
**Configuration:**
- **Status:** Error
- **Message:** `{{6.text}}`

---

## Scenario B: "Atomic DS • Ping Monitor (On-Demand)"
**Purpose:** Fetch latest payload and display compact status.

### Module 1: HTTP • Make a Request (GET)
**Configuration:**
- **Method:** `GET`
- **URL:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest`
- **Headers:**
  - **Name:** `x-ping-token` **Value:** `dude`
- **Parse Response:** Yes
- **Timeout:** 30 seconds

### Module 2: Router (Status Check)
**Configuration:**
- **Route 1 (Success):**
  - **Filter:** `{{1.statusCode = 200}}`
  - **Label:** "GET Success"
- **Route 2 (Error):**
  - **Filter:** `{{1.statusCode != 200}}`
  - **Label:** "GET Failed"

### Module 3: Tools • JSON to Text (Success Path)
**Connect to:** Route 1 (GET Success) from Module 2
**Configuration:**
- **Text:**
```
{{1.data.payload.id}} | {{1.data.payload.ts}} | {{1.data.payload.event}} | {{1.data.payload.message}}
```

### Module 4: Slack • Post Message (Status Report)
**Connect to:** Module 3
**Configuration:**
- **Channel:** `#build-status` (or your preferred channel)
- **Text:** `📡 latest → {{3.text}}`
- **Username:** `Ping Monitor`
- **Icon:** `:satellite_antenna:`

### Module 5: Tools • Compose String (Error Message)
**Connect to:** Route 2 (GET Failed) from Module 2
**Configuration:**
- **Text:**
```
monitor: fetch failed {{1.statusCode}}
```

### Module 6: Slack • Post Message (Error Notification)
**Connect to:** Module 5
**Configuration:**
- **Channel:** `#build-status` (or your preferred channel)
- **Text:** `⚠️ {{5.text}}`
- **Username:** `Ping Monitor`
- **Icon:** `:warning:`

### Module 7: Tools • Stop (Error Termination)
**Connect to:** Module 6
**Configuration:**
- **Status:** Error
- **Message:** `{{5.text}}`

---

## Testing Procedures

### Test Scenario A (Build → Supabase Ping):
1. **Run manually** from Make dashboard
2. **Expected Flow:**
   - Module 1: POST returns 200 with `{"ok": true, "digest": "..."}`
   - Module 3: GET returns 200 with payload data
   - Module 5: Slack notification sent
3. **Verify in Supabase:**
   - Check ping_latest table for new record
   - Confirm digest matches

### Test Scenario B (Ping Monitor):
1. **Run manually** from Make dashboard
2. **Expected Output:**
   - Module 1: GET returns 200
   - Module 4: Slack message with format: `📡 latest → latest | 2025-01-15T... | build:complete | Production build published`

---

## Manual Testing Commands

### Test POST directly:
```bash
curl -sS -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
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
curl -sS -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

---

## Expected Response Formats

### POST Success Response:
```json
{
  "ok": true,
  "digest": "a1b2c3d4e5f6..."
}
```

### GET Success Response:
```json
{
  "payload": {
    "id": "latest",
    "event": "build:complete",
    "message": "Production build published",
    "url": "https://daily-stem-67845579.figma.site/",
    "version": "2025.1.15-1430",
    "meta": {
      "source": "Make",
      "commit": null
    }
  },
  "digest": "a1b2c3d4e5f6...",
  "received_at": "2025-01-15T14:30:45.123Z"
}
```

---

## Alternative Notification Options

If you prefer **Email** instead of **Slack**:

### Replace Slack modules with Email • Send an Email:
- **To:** `your-email@domain.com`
- **Subject:** 
  - Success: `✅ Build Ping Success`
  - Error: `❌ Build Ping Failed`
  - Monitor: `📡 Ping Status`
- **Body:** Use the same text content as Slack messages

---

## Troubleshooting

### Common Issues:
- **401 Unauthorized:** Verify `x-ping-token: dude` header is exact
- **404 Not Found:** Check endpoint URL spelling
- **Parse Error:** Ensure "Parse Response" is enabled
- **Timeout:** Increase timeout values if network is slow

### Debug Steps:
1. Check execution details in Make for full request/response
2. Test endpoints manually with curl commands
3. Verify Supabase function is deployed and accessible
4. Check Make scenario logs for detailed error messages

### Success Criteria:
- ✅ POST returns `{"ok": true, "digest": "..."}`
- ✅ GET returns payload with all fields: `id`, `ts`, `event`, `message`, `url`, `version`
- ✅ Notifications sent to Slack/Email when scenarios run
- ✅ Error handling triggers on non-200 responses

---

## Deployment Checklist

### Before First Run:
- [ ] Supabase ping function is deployed
- [ ] `PING_TOKEN=dude` is set in Supabase secrets
- [ ] Make.com has access to your Slack workspace (if using Slack)
- [ ] Test endpoints manually with curl commands
- [ ] Both scenarios created and saved in Make

### After Setup:
- [ ] Run Scenario A manually once
- [ ] Run Scenario B to confirm data retrieval
- [ ] Check notifications are received
- [ ] Verify data appears in Supabase ping_latest table

---

Once you've created both scenarios following these instructions, run them and share any error messages or unexpected results. I can help troubleshoot specific issues that arise during testing.