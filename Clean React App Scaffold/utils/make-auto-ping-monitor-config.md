# Make.com Auto-Polling Ping Monitor Configuration
**Atomic DS Manager • Smart Backoff Ping Monitor**

## Overview
This configuration creates an intelligent ping monitor that:
- Polls every 15 minutes initially
- Implements linear backoff: 15 → 30 → 45 → 60 minutes when no changes detected
- Resets to 15 minutes when changes are found
- Uses Make Data Store for state persistence
- Provides rich notifications for build updates

---

## Step 1: Create Data Store

### Data Store Configuration
**Name:** `ping_state`

**Structure:**
```json
{
  "id": "monitor_latest",
  "last_hash": null,
  "last_ts": null,
  "interval_minutes": 15,
  "next_allowed_at": null
}
```

### Data Store Fields
1. **id** (Key, Text)
   - Type: Text
   - Key: Yes
   - Default: `monitor_latest`

2. **last_hash** (Text)
   - Type: Text
   - Description: Digest of last seen payload

3. **last_ts** (Text)
   - Type: Text
   - Description: ISO timestamp of last payload

4. **interval_minutes** (Number)
   - Type: Number
   - Description: Current polling interval

5. **next_allowed_at** (Text)
   - Type: Text
   - Description: ISO timestamp when next fetch is allowed

### Initial Record (Optional)
Create initial record with ID `monitor_latest`:
```json
{
  "id": "monitor_latest",
  "last_hash": null,
  "last_ts": null,
  "interval_minutes": 15,
  "next_allowed_at": null
}
```

---

## Step 2: Create Scenario - "Atomic DS • Auto Ping Monitor"

### Basic Settings
- **Name:** `Atomic DS • Auto Ping Monitor`
- **Schedule:** Every 15 minutes
- **Timezone:** Your local timezone
- **Status:** Active

---

## Module Configuration

### Module 1: Data Store • Get a Record
**Purpose:** Retrieve current state

**Configuration:**
- **Data Store:** `ping_state`
- **Record ID:** `monitor_latest`
- **Create if doesn't exist:** Yes
- **Default values for new record:**
  ```json
  {
    "id": "monitor_latest",
    "last_hash": null,
    "last_ts": null,
    "interval_minutes": 15,
    "next_allowed_at": null
  }
  ```

---

### Module 2: Tools • Set Variable (Timing Logic)
**Purpose:** Calculate timing and determine if fetch is due

**Variables to Set:**
```javascript
// Current time in ISO format
now = {{formatDate(now; "YYYY-MM-DDTHH:mm:ss[Z]")}}

// Current interval (default to 15 if missing)
interval = {{ifempty(1.interval_minutes; 15)}}

// Next allowed time (from data store)
next_allowed_at = {{1.next_allowed_at}}

// Determine if we should fetch now
should_fetch = {{or(empty(next_allowed_at); greaterOrEqual(now; next_allowed_at))}}

// Debug info (optional)
debug_info = Interval: {{interval}}m, Next: {{next_allowed_at}}, Should fetch: {{should_fetch}}
```

---

### Module 3: Router (Fetch Decision)
**Purpose:** Route based on whether fetch is due

#### Route 1: "Fetch Due" 
**Filter:** `{{2.should_fetch}} = true`
**Label:** `Fetch Due`

#### Route 2: "Skip This Round"
**Filter:** `{{2.should_fetch}} ≠ true`
**Label:** `Skip This Round`

---

## Route 1: Fetch Due Path

### Module 4A: HTTP • Make a Request (GET Ping)
**Connect to:** Router Route 1

**Configuration:**
- **Method:** `GET`
- **URL:** `https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest`
- **Headers:**
  - **Name:** `x-ping-token` **Value:** `dude`
- **Parse Response:** Yes
- **Timeout:** 30 seconds

---

### Module 5A: Tools • Set Variable (Process Response)
**Connect to:** Module 4A

**Variables to Set:**
```javascript
// Extract payload data
id = {{4A.data.payload.id}}
ts = {{4A.data.payload.ts}}
event = {{4A.data.payload.event}}
message = {{4A.data.payload.message}}
url = {{4A.data.payload.url}}
version = {{4A.data.payload.version}}

// Create digest for change detection
digest = {{if(and(id; ts); concat(id; "|"; ts; "|"; event; "|"; message); toJSON(4A.data))}}

// Check if content changed
changed = {{not(equals(digest; 1.last_hash))}}

// Format timestamp for display
formatted_ts = {{if(ts; formatDate(ts; "ddd, DD MMM YYYY HH:mm:ss [UTC]"); "Unknown")}}
```

---

### Module 6A: Router (Change Detection)
**Connect to:** Module 5A

#### Route A1: "Changed - Notify & Reset"
**Filter:** `{{5A.changed}} = true`
**Label:** `Changed - Notify & Reset`

#### Route A2: "Unchanged - Increase Backoff"
**Filter:** `{{5A.changed}} ≠ true`
**Label:** `Unchanged - Increase Backoff`

---

## Route A1: Changed - Notify & Reset

### Module 7A1: Slack • Post Message (Change Notification)
**Connect to:** Router Route A1

**Configuration:**
- **Channel:** `#build-notifications` (or your preferred channel)
- **Username:** `Build Monitor`
- **Icon:** `:bell:`
- **Text:**
```
🔔 Build Update Detected!

📋 **Event:** {{5A.event}}
💬 **Message:** {{5A.message}}
🕐 **Timestamp:** {{5A.formatted_ts}}
{{if(5A.url; concat("🔗 **URL:** ", 5A.url); "")}}
{{if(5A.version; concat("🏷️ **Version:** ", 5A.version); "")}}

⏰ Monitor reset to 15-minute interval
```

### Module 8A1: Data Store • Update Record (Reset State)
**Connect to:** Module 7A1

**Configuration:**
- **Data Store:** `ping_state`
- **Record ID:** `monitor_latest`
- **Fields to Update:**
  ```javascript
  last_hash = {{5A.digest}}
  last_ts = {{5A.ts}}
  interval_minutes = 15
  next_allowed_at = {{addMinutes(2.now; 15; "YYYY-MM-DDTHH:mm:ss[Z]")}}
  ```

---

## Route A2: Unchanged - Increase Backoff

### Module 7A2: Tools • Set Variable (Calculate Backoff)
**Connect to:** Router Route A2

**Variables to Set:**
```javascript
// Calculate new interval (max 60 minutes)
new_interval = {{if(greater(add(2.interval; 15); 60); 60; add(2.interval; 15))}}

// Calculate next allowed time
new_next = {{addMinutes(2.now; new_interval; "YYYY-MM-DDTHH:mm:ss[Z]")}}

// Status message
status_msg = No changes detected. Interval: {{2.interval}}m → {{new_interval}}m. Next check: {{formatDate(new_next; "HH:mm")}}
```

### Module 8A2: Data Store • Update Record (Update Backoff)
**Connect to:** Module 7A2

**Configuration:**
- **Data Store:** `ping_state`
- **Record ID:** `monitor_latest`
- **Fields to Update:**
  ```javascript
  last_hash = {{ifempty(1.last_hash; 5A.digest)}}
  last_ts = {{ifempty(1.last_ts; 5A.ts)}}
  interval_minutes = {{7A2.new_interval}}
  next_allowed_at = {{7A2.new_next}}
  ```

### Module 9A2: Slack • Post Message (Backoff Notification - Optional)
**Connect to:** Module 8A2

**Configuration:**
- **Channel:** `#build-status` (optional, low-priority channel)
- **Username:** `Build Monitor`
- **Icon:** `:hourglass:`
- **Text:** `⏱️ {{7A2.status_msg}}`

---

## Route 2: Skip This Round Path

### Module 4B: Slack • Post Message (Skip Notification - Optional)
**Connect to:** Router Route 2

**Configuration:**
- **Channel:** `#build-status` (optional, debug channel)
- **Username:** `Build Monitor`
- **Icon:** `:clock1:`
- **Text:**
```
⏭️ Monitor skipped this round
⏰ Next check: {{formatDate(2.next_allowed_at; "ddd, HH:mm")}} ({{2.interval}}m interval)
```

---

## Error Handling

### HTTP Error Handler (for Module 4A)
**Connect to:** Module 4A (Error Handling)

#### Module E1: Tools • Set Variable (Error Info)
**Variables to Set:**
```javascript
error_status = {{4A.statusCode}}
error_message = {{4A.data}}
error_time = {{formatDate(now; "YYYY-MM-DD HH:mm:ss")}}
```

#### Module E2: Slack • Post Message (Error Notification)
**Connect to:** Module E1

**Configuration:**
- **Channel:** `#build-notifications`
- **Username:** `Build Monitor`
- **Icon:** `:warning:`
- **Text:**
```
⚠️ Ping Monitor Error

❌ **Status:** {{E1.error_status}}
💬 **Error:** {{E1.error_message}}
🕐 **Time:** {{E1.error_time}}

Will retry at next scheduled interval ({{2.interval}}m)
```

#### Module E3: Data Store • Update Record (Maintain Interval)
**Connect to:** Module E2

**Configuration:**
- **Data Store:** `ping_state`
- **Record ID:** `monitor_latest`
- **Fields to Update:**
  ```javascript
  // Don't change interval on errors, just set next check time
  next_allowed_at = {{addMinutes(2.now; 2.interval; "YYYY-MM-DDTHH:mm:ss[Z]")}}
  ```

---

## Testing Procedures

### Initial Test
1. **Create Data Store** with ping_state configuration
2. **Create Scenario** with all modules
3. **Run manually** first time to verify:
   - Data store record is created/updated
   - HTTP request succeeds
   - Notifications are sent
   - Timing logic works

### Test Change Detection
1. **POST new data** to ping endpoint using curl:
   ```bash
   curl -sS -X POST \
     -H "x-ping-token: dude" \
     -H "content-type: application/json" \
     -d '{
       "id": "latest",
       "event": "test-change",
       "message": "Testing change detection",
       "url": "https://daily-stem-67845579.figma.site/",
       "version": "test-1.0.0"
     }' \
     https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
   ```

2. **Run scenario** - should detect change and send notification
3. **Run scenario again** - should start backoff sequence

### Test Backoff Sequence
1. **Don't change endpoint data**
2. **Run scenario manually** multiple times
3. **Verify interval progression:** 15 → 30 → 45 → 60 → 60
4. **Check data store** after each run

### Test Reset Behavior
1. **POST new data** after backoff has increased
2. **Run scenario** - should detect change and reset to 15 minutes
3. **Verify notification** includes reset message

---

## Monitoring Dashboard

### Key Metrics to Track
- **Last successful ping time**
- **Current interval setting**
- **Number of consecutive unchanged checks**
- **Total notifications sent**
- **Error frequency**

### Data Store Queries
```javascript
// Current state
GET ping_state/monitor_latest

// Check if monitoring is healthy
// (next_allowed_at should be reasonable future time)
```

---

## Troubleshooting

### Common Issues

#### Scenario Not Fetching
- **Check:** `should_fetch` calculation in Module 2
- **Verify:** `next_allowed_at` is properly formatted ISO string
- **Debug:** Add temporary logger to see timing values

#### Changes Not Detected
- **Check:** `digest` creation in Module 5A
- **Verify:** `last_hash` is being stored correctly
- **Test:** Compare digest values manually

#### Backoff Not Working
- **Check:** Interval calculation in Module 7A2
- **Verify:** Data store updates are successful
- **Debug:** Log `new_interval` and `new_next` values

#### Notifications Not Sent
- **Check:** Slack channel permissions
- **Verify:** Message formatting doesn't break Slack
- **Test:** Send simple message first

### Debug Commands

#### Manual Data Store Reset
```json
{
  "id": "monitor_latest",
  "last_hash": null,
  "last_ts": null,
  "interval_minutes": 15,
  "next_allowed_at": null
}
```

#### Force Next Check
Set `next_allowed_at` to current time or earlier:
```javascript
next_allowed_at = {{formatDate(now; "YYYY-MM-DDTHH:mm:ss[Z]")}}
```

---

## Advanced Configurations

### Alternative Notification Channels

#### Email Notifications
Replace Slack modules with **Email • Send an Email**:
- **Subject:** `Build Monitor: {{event}} - {{message}}`
- **Body:** Use same message format as Slack

#### Microsoft Teams
Use **Microsoft Teams • Post Message**:
- **Team/Channel:** Your build notifications channel
- **Message:** Format for Teams markup

#### Webhook Notifications
Use **HTTP • Make a Request** for custom webhooks:
- **Method:** POST
- **URL:** Your webhook endpoint
- **Body:** JSON payload with ping data

### Custom Backoff Strategies

#### Exponential Backoff
Replace linear calculation with:
```javascript
new_interval = {{if(greater(multiply(2.interval; 2); 120); 120; multiply(2.interval; 2))}}
```

#### Custom Intervals
```javascript
// Custom sequence: 15, 20, 30, 45, 60
intervals = [15, 20, 30, 45, 60]
current_index = {{indexOf(intervals; 2.interval)}}
new_interval = {{if(greater(add(current_index; 1); 4); 60; get(intervals; add(current_index; 1)))}}
```

---

## Security Notes

### Data Store Security
- **Access Control:** Ensure only your Make organization can access
- **Data Encryption:** Make encrypts data store contents
- **API Keys:** Never store API keys in data store

### Endpoint Security
- **Header Validation:** Endpoint validates `x-ping-token: dude`
- **Rate Limiting:** Supabase provides built-in rate limiting
- **HTTPS Only:** All requests use HTTPS

---

## Success Criteria

### Functional Requirements
- ✅ Polls endpoint every 15 minutes initially
- ✅ Detects content changes accurately
- ✅ Implements linear backoff (15→30→45→60)
- ✅ Resets to 15 minutes after changes
- ✅ Persists state between runs
- ✅ Sends notifications for changes
- ✅ Handles errors gracefully

### Performance Requirements
- ✅ Executions complete within 2 minutes
- ✅ Data store operations are reliable
- ✅ HTTP requests timeout appropriately
- ✅ Memory usage stays reasonable

### Monitoring Requirements
- ✅ Failed executions are logged
- ✅ Error notifications are sent
- ✅ State changes are tracked
- ✅ Timing logic is auditable

---

## Deployment Checklist

### Pre-Deployment
- [ ] Supabase ping endpoint is accessible
- [ ] `x-ping-token: dude` authentication works
- [ ] Slack/notification channels are configured
- [ ] Make.com has required permissions

### Post-Deployment
- [ ] Data store created successfully
- [ ] Initial scenario run completes
- [ ] Change detection works
- [ ] Backoff logic functions
- [ ] Error handling activates
- [ ] Notifications are received

### Ongoing Maintenance
- [ ] Monitor scenario execution logs
- [ ] Review notification frequency
- [ ] Check data store growth
- [ ] Validate endpoint health
- [ ] Update tokens as needed

---

## Next Steps

Once configured and tested:
1. **Monitor for 1 week** to verify backoff behavior
2. **Adjust notification channels** based on team preferences  
3. **Add custom metrics** if needed
4. **Document any customizations** for team handoff
5. **Set up alerting** for scenario failures

The auto-polling monitor will now intelligently manage its check frequency based on build activity, reducing unnecessary API calls while ensuring prompt notifications when changes occur.