# Make.com Auto-Polling Ping Monitor Setup Guide
**Atomic DS Manager • Smart Backoff Monitor**

## Overview
This guide creates an intelligent ping monitor that:
- Polls `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest` 
- Uses linear backoff: 15 → 30 → 45 → 60 minutes when unchanged
- Resets to 15 minutes when changes detected
- Persists state in Make Data Store
- Provides rich notifications with build details
- Handles errors gracefully without disrupting timing

---

## Prerequisites (One-Time Setup)

### 1. Create Data Store
**Name:** `ping_state`

**Structure:**
```json
{
  "key": "singleton",
  "last_hash": null,
  "last_ts": null,
  "interval_minutes": 15,
  "next_due_ts": null
}
```

**Fields Configuration:**
- **key** (String, Primary Key): `singleton`
- **last_hash** (String): Digest of last seen payload
- **last_ts** (String): ISO timestamp of last payload
- **interval_minutes** (Number): Current polling interval
- **next_due_ts** (String): ISO timestamp when next fetch is allowed

### 2. Set Scenario Variables
**Go to:** Scenario Settings → Variables

**Add these variables:**
- **PING_URL:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest`
- **PING_TOKEN:** `dude`
- **NOTIFY_CHANNEL:** (Your Slack webhook URL or channel - optional)

---

## Scenario: "Atomic DS • Auto-Polling Ping Monitor"

### Basic Settings
- **Name:** `Atomic DS • Auto-Polling Ping Monitor`
- **Schedule:** Every 15 minutes (this is the heartbeat - scenario skips work until due)
- **Timezone:** Your local timezone
- **Max Executions:** 1 (prevent overlapping runs)

---

## Module Configuration

### Module 1: Data Store • Get Record
**Purpose:** Retrieve current monitoring state

**Settings:**
- **Data Store:** `ping_state`
- **Key:** `singleton`
- **If record doesn't exist:** Continue with empty values

---

### Module 2: Tools • Set Multiple Variables (Timing Logic)
**Purpose:** Calculate timing and determine if fetch is due

**Variables:**
```javascript
// Current time in ISO format
now_iso = {{formatDate(now; "YYYY-MM-DDTHH:mm:ss\Z")}}

// Check if fetch is due (true if next_due_ts is empty or past)
due = {{if(empty(1.next_due_ts); true; greaterOrEqual(parseDate(now_iso; "YYYY-MM-DDTHH:mm:ss\Z"); parseDate(1.next_due_ts; "YYYY-MM-DDTHH:mm:ss\Z")))}}

// Current interval (default to 15 if empty)
interval = {{if(empty(1.interval_minutes); 15; 1.interval_minutes)}}

// Debug info
debug_status = Due: {{due}}, Interval: {{interval}}m, Next: {{1.next_due_ts}}
```

---

### Module 3: Router (Skip if Not Due)
**Purpose:** Exit early if not time to fetch yet

#### Route 1: "Not Due - Skip"
**Filter:** `{{2.due}} ≠ true`
**Action:** Connect to **Module 15: Logger (Skipped)**

#### Route 2: "Due - Continue Fetch"
**Filter:** `{{2.due}} = true`
**Action:** Continue to HTTP request

---

## Fetch Path (Route 2: Due)

### Module 4: HTTP • Make Request (GET Ping)
**Connect to:** Router Route 2

**Settings:**
- **Method:** `GET`
- **URL:** `{{PING_URL}}`
- **Headers:**
  - **Name:** `x-ping-token` **Value:** `{{PING_TOKEN}}`
- **Timeout:** 5000ms
- **Parse Response:** Yes

---

### Module 5: Router (HTTP Status Check)
**Connect to:** Module 4

#### Route A: "HTTP Error"
**Filter:** `{{4.statusCode}} ≠ 200`
**Action:** Go to error handling

#### Route B: "HTTP Success"  
**Filter:** `{{4.statusCode}} = 200`
**Action:** Continue to payload processing

---

## Error Handling Path (Route A)

### Module 6A: Tools • Set Variables (Error Info)
**Connect to:** Router Route A

**Variables:**
```javascript
error_message = monitor: fetch failed {{4.statusCode}}
error_details = Status: {{4.statusCode}}, Body: {{4.data}}
```

### Module 7A: Slack • Post Message (Error Notification)
**Connect to:** Module 6A

**Settings:**
- **Channel:** `#build-notifications`
- **Text:**
```
⚠️ Ping Monitor Error

❌ **{{6A.error_message}}**
📊 **Details:** {{6A.error_details}}
🕐 **Time:** {{formatDate(2.now_iso; "MMM D, h:mm A")}}

Will retry in {{2.interval}} minutes
```

### Module 8A: Data Store • Update Record (Maintain Interval)
**Connect to:** Module 7A

**Settings:**
- **Data Store:** `ping_state`
- **Key:** `singleton`
- **Fields:**
```javascript
last_hash = {{1.last_hash}}
last_ts = {{1.last_ts}}
interval_minutes = {{2.interval}}
next_due_ts = {{formatDate(addMinutes(parseDate(2.now_iso; "YYYY-MM-DDTHH:mm:ss\Z"); 2.interval); "YYYY-MM-DDTHH:mm:ss\Z")}}
```

---

## Success Processing Path (Route B)

### Module 6B: Tools • Set Variables (Extract Payload)
**Connect to:** Router Route B

**Variables:**
```javascript
// Extract payload fields
p_id = {{4.data.payload.id}}
p_ts = {{4.data.payload.ts}}
p_event = {{4.data.payload.event}}
p_message = {{4.data.payload.message}}
p_url = {{4.data.payload.url}}
p_version = {{4.data.payload.version}}

// Create digest for change detection
digest = {{if(and(p_id; p_ts); concat(p_id; "|"; p_ts; "|"; p_event; "|"; p_message); toString(4.data))}}

// Check if content changed
changed = {{not(equals(digest; 1.last_hash))}}

// Format timestamp for display
ts_human = {{if(p_ts; formatDate(parseDate(p_ts; "YYYY-MM-DDTHH:mm:ss\Z"); "ddd, MMM D YYYY h:mm A"); "Unknown")}}
```

---

### Module 7B: Router (Change Detection)
**Connect to:** Module 6B

#### Route C: "Changed - Notify & Reset"
**Filter:** `{{6B.changed}} = true`

#### Route D: "Unchanged - Increase Backoff"
**Filter:** `{{6B.changed}} ≠ true`

---

## Changed Path (Route C: Notify & Reset)

### Module 8C: Tools • Set Variables (Reset Logic)
**Connect to:** Router Route C

**Variables:**
```javascript
new_interval = 15
next_due = {{formatDate(addMinutes(parseDate(2.now_iso; "YYYY-MM-DDTHH:mm:ss\Z"); new_interval); "YYYY-MM-DDTHH:mm:ss\Z")}}

// Rich notification message
notification_text = 🚀 Build Update Detected!

📋 **Event:** {{6B.p_event}}
💬 **Message:** {{6B.p_message}}
🕐 **When:** {{6B.ts_human}}
{{if(6B.p_url; concat("🔗 **URL:** ", 6B.p_url); "")}}
{{if(6B.p_version; concat("🏷️ **Version:** ", 6B.p_version); "")}}

⏰ Monitor reset to 15-minute interval
```

### Module 9C: Slack • Post Message (Change Notification)
**Connect to:** Module 8C

**Settings:**
- **Channel:** `#build-notifications`
- **Username:** `Build Monitor`
- **Icon:** `:rocket:`
- **Text:** `{{8C.notification_text}}`

### Module 10C: Data Store • Update Record (Reset State)
**Connect to:** Module 9C

**Settings:**
- **Data Store:** `ping_state`
- **Key:** `singleton`
- **Fields:**
```javascript
last_hash = {{6B.digest}}
last_ts = {{6B.p_ts}}
interval_minutes = {{8C.new_interval}}
next_due_ts = {{8C.next_due}}
```

---

## Unchanged Path (Route D: Increase Backoff)

### Module 8D: Tools • Set Variables (Backoff Logic)
**Connect to:** Router Route D

**Variables:**
```javascript
// Calculate new interval (max 60 minutes)
new_interval = {{min(60; add(2.interval; 15))}}

// Calculate next due time
next_due = {{formatDate(addMinutes(parseDate(2.now_iso; "YYYY-MM-DDTHH:mm:ss\Z"); new_interval); "YYYY-MM-DDTHH:mm:ss\Z")}}

// Status message
status_msg = No changes detected. Interval: {{2.interval}}m → {{new_interval}}m. Next check: {{formatDate(parseDate(next_due; "YYYY-MM-DDTHH:mm:ss\Z"); "h:mm A")}}
```

### Module 9D: Data Store • Update Record (Update Backoff)
**Connect to:** Module 8D

**Settings:**
- **Data Store:** `ping_state`
- **Key:** `singleton`
- **Fields:**
```javascript
last_hash = {{if(empty(1.last_hash); 6B.digest; 1.last_hash)}}
last_ts = {{if(empty(1.last_ts); 6B.p_ts; 1.last_ts)}}
interval_minutes = {{8D.new_interval}}
next_due_ts = {{8D.next_due}}
```

### Module 10D: Slack • Post Message (Backoff Status - Optional)
**Connect to:** Module 9D

**Settings:**
- **Channel:** `#build-status` (low-priority channel or skip this module)
- **Username:** `Build Monitor`
- **Icon:** `:hourglass:`
- **Text:** `⏱️ {{8D.status_msg}}`

---

## Skip Path (Route 1: Not Due)

### Module 15: Logger (Skipped - Optional)
**Connect to:** Router Route 1

**Settings:**
- **Level:** Info
- **Message:**
```
⏭️ Monitor skipped - not due yet
Next check: {{formatDate(parseDate(1.next_due_ts; "YYYY-MM-DDTHH:mm:ss\Z"); "ddd, h:mm A")}} ({{2.interval}}m interval)
```

---

## Testing & Verification

### Initial Test
1. **Create Data Store** with `ping_state` structure
2. **Create Scenario** with all modules connected
3. **Run manually** first time - should fetch and set initial state
4. **Check Data Store** - verify record created with proper values

### Test Change Detection
```bash
# POST new data to trigger change
curl -sS -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
  -d '{
    "id": "latest",
    "event": "test-build",
    "message": "Testing auto-monitor",
    "url": "https://daily-stem-67845579.figma.site/",
    "version": "test-1.0.0"
  }' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
```

**Expected:** Next scenario run detects change, sends notification, resets to 15min

### Test Backoff Sequence
1. **Don't change data** - let scenario run multiple times
2. **Observe progression:** 15 → 30 → 45 → 60 → 60 minutes
3. **Check Data Store** after each run to verify interval increases

### Manual Controls

#### Force Next Check
Update Data Store record:
```json
{
  "next_due_ts": "{{formatDate(now; "YYYY-MM-DDTHH:mm:ss\Z")}}"
}
```

#### Reset Backoff
Update Data Store record:
```json
{
  "interval_minutes": 15,
  "next_due_ts": "{{formatDate(now; "YYYY-MM-DDTHH:mm:ss\Z")}}"
}
```

#### Clear State (Full Reset)
Delete and recreate Data Store record

---

## Alternative Notification Setups

### Email Instead of Slack
Replace Slack modules with **Email • Send Email**:

**Settings:**
- **To:** `your-email@domain.com`
- **Subject:** 
  - Change: `🚀 Build Update: {{6B.p_event}}`
  - Error: `⚠️ Ping Monitor Error`
- **Body:** Use same message content as Slack

### Discord Webhook
Use **HTTP • Make Request**:

**Settings:**
- **Method:** `POST`
- **URL:** `https://discord.com/api/webhooks/YOUR_WEBHOOK_URL`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "content": "{{notification_text}}",
  "username": "Build Monitor"
}
```

### Microsoft Teams
Use **Microsoft Teams • Post Message**:

**Settings:**
- **Team/Channel:** Your build channel
- **Message:** Format for Teams markdown

---

## Advanced Customizations

### Custom Backoff Intervals
Modify Module 8D calculation:
```javascript
// Custom sequence: 15, 20, 30, 60
intervals_map = {"15": 20, "20": 30, "30": 60, "60": 60}
new_interval = {{get(intervals_map; toString(2.interval); 60)}}
```

### Multiple Ping Endpoints
Duplicate scenario for different endpoints:
- **PING_URL_RELEASES:** `...ping?id=releases`
- **PING_URL_STAGING:** `...ping?id=staging`

Each gets its own Data Store record and notification channel.

### Rich Error Recovery
Add exponential backoff for HTTP errors:
```javascript
// On errors, double interval but cap at 60
error_interval = {{min(60; multiply(2.interval; 2))}}
```

---

## Troubleshooting

### Common Issues

#### Scenario Not Fetching
- **Check:** `due` calculation in Module 2
- **Verify:** `next_due_ts` format is correct ISO string
- **Fix:** Set `next_due_ts` to current time to force fetch

#### Changes Not Detected  
- **Check:** `digest` creation includes all relevant fields
- **Verify:** `last_hash` is being stored correctly
- **Test:** Compare digest values manually

#### Backoff Not Working
- **Check:** Interval calculation logic in Module 8D
- **Verify:** Data Store updates are successful
- **Debug:** Log `new_interval` values

#### HTTP Errors
- **Check:** `PING_TOKEN` variable is set to `dude`
- **Verify:** Endpoint URL is correct
- **Test:** Manual curl request

### Debug Commands

#### Check Current State
```bash
# GET current endpoint state
curl -sS -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

#### Force State Change
```bash
# POST new data
curl -sS -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
  -d '{
    "id": "latest",
    "event": "debug-test", 
    "message": "Testing monitor",
    "version": "debug-1.0"
  }' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
```

---

## Success Criteria Checklist

### Functional ✅
- [ ] Scenario runs every 15 minutes on schedule
- [ ] Skips fetch when not due based on backoff state
- [ ] Detects content changes accurately via digest comparison
- [ ] Implements linear backoff: 15→30→45→60 minutes
- [ ] Resets to 15 minutes after detecting changes
- [ ] Persists state in Data Store between runs
- [ ] Sends rich notifications for build updates
- [ ] Handles HTTP errors without disrupting timing
- [ ] Provides manual reset/force capabilities

### Performance ✅
- [ ] Executions complete quickly (under 30 seconds)
- [ ] Data Store operations are reliable
- [ ] HTTP timeouts are reasonable (5 seconds)
- [ ] No memory leaks or resource issues

### Monitoring ✅
- [ ] Error notifications sent when HTTP fails
- [ ] State changes logged/visible in Data Store
- [ ] Backoff progression observable
- [ ] Change detection working accurately
- [ ] Notifications received in proper channels

---

## Production Deployment

### Pre-Launch
- [ ] Test all paths (change/no-change/error)
- [ ] Verify notifications reach correct channels
- [ ] Confirm Data Store permissions
- [ ] Set proper scenario schedule (every 15 minutes)

### Go-Live
- [ ] Enable scenario scheduling
- [ ] Monitor first few runs for issues
- [ ] Verify backoff behavior over time
- [ ] Check notification quality and frequency

### Ongoing Maintenance
- [ ] Review scenario execution logs weekly
- [ ] Clean up old Data Store records if needed
- [ ] Update notification channels as team changes
- [ ] Rotate PING_TOKEN if security requires
- [ ] Adjust backoff intervals based on build frequency

---

This auto-polling monitor provides intelligent, efficient monitoring of your Atomic DS builds with minimal API overhead and timely notifications when updates occur.