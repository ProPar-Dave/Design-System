# Make.com Build Notes Integration Guide
**Atomic DS Manager • Include Claude Build Notes in Notifications**

## Overview
This guide configures your Make.com scenario to include Claude's build notes from Figma Make in ping notifications. The build notes will be stored in the `message` field and automatically appear in auto-monitor notifications.

---

## Make.com HTTP Module Configuration

### Module: HTTP • Make a Request (POST)
**Replace your current Body with this enhanced payload:**

```json
{
  "id": "latest",
  "event": "publish",
  "message": "{{Build Notes}}",
  "url": "{{Public URL}}",
  "version": "{{Build Version}}",
  "notes": "{{Build Notes}}",
  "author": "{{User Name}}",
  "duration": "{{Execution Duration}}",
  "source": "figma-make",
  "timestamp": "{{formatDate(now; \"YYYY-MM-DDTHH:mm:ss\\Z\")}}",
  "build_id": "{{Build ID}}",
  "commit": "{{Commit Hash}}",
  "meta": {
    "user": "{{User Name}}",
    "duration": "{{Execution Duration}}",
    "build_type": "figma-make",
    "project": "atomic-ds-manager"
  }
}
```

### Complete Module Settings
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
Request Content: (JSON payload above)
```

---

## Figma Make Variable Mapping

### Primary Variables (Required)
| Variable | Description | Example | Fallback |
|----------|-------------|---------|----------|
| `{{Build Notes}}` | Claude's build summary | "Added responsive header component with mobile navigation" | "Build completed" |
| `{{Public URL}}` | Deployed site URL | "https://daily-stem-67845579.figma.site/" | "" |
| `{{Build Version}}` | Version identifier | "v1.2.3" or "2025.1.15-1430" | "latest" |

### Secondary Variables (Optional)
| Variable | Description | Example | Fallback |
|----------|-------------|---------|----------|
| `{{User Name}}` | Who triggered the build | "Claude" or "User Name" | "figma-make" |
| `{{Execution Duration}}` | Build time | "45s" or "1m 23s" | "" |
| `{{Build ID}}` | Unique build identifier | "build-abc123" | "" |
| `{{Commit Hash}}` | Git commit (if available) | "abc123def" | "" |

### Variable Configuration in Make.com
If variables aren't automatically available, you can create them manually:

```javascript
// In a "Set Variables" module before the HTTP request
Build Notes = {{ifempty(TriggerData.buildNotes; "Build completed successfully")}}
Public URL = {{ifempty(TriggerData.publicUrl; "")}}
Build Version = {{ifempty(TriggerData.version; formatDate(now; "YYYY.M.D-HHmm"))}}
User Name = {{ifempty(TriggerData.userName; "Figma Make")}}
Execution Duration = {{ifempty(TriggerData.duration; "")}}
```

---

## Key Benefits of This Structure

### 1. Rich Notifications
The auto-monitor will now display:
```
🚀 Build Update Detected!

📋 Event: publish
💬 Message: Added responsive header component with mobile navigation  
🕐 Timestamp: Wed, Jan 15 2025 2:30 PM
🔗 URL: https://daily-stem-67845579.figma.site/
🏷️ Version: v1.2.3

⏰ Monitor reset to 15-minute interval
```

### 2. Dual Storage
- **`message`**: Primary display field (used by notifications)
- **`notes`**: Archive field (preserved in full payload)

### 3. Rich Metadata
Additional context stored in `meta` object for future use:
- User information
- Build duration
- Build type classification
- Project identification

---

## Testing the Configuration

### Step 1: Manual Test with Sample Data
Replace variables with test data for initial verification:

```json
{
  "id": "latest",
  "event": "publish", 
  "message": "Added responsive navigation header with mobile breakpoints and improved accessibility",
  "url": "https://daily-stem-67845579.figma.site/",
  "version": "v1.2.3",
  "notes": "Added responsive navigation header with mobile breakpoints and improved accessibility",
  "author": "Claude",
  "duration": "45s",
  "source": "figma-make",
  "timestamp": "2025-01-15T14:30:45Z",
  "build_id": "build-test-123",
  "meta": {
    "user": "Claude",
    "duration": "45s", 
    "build_type": "figma-make",
    "project": "atomic-ds-manager"
  }
}
```

### Step 2: Verify with cURL
```bash
curl -sS -X POST \
  -H "x-ping-token: dude" \
  -H "content-type: application/json" \
  -d '{
    "id": "latest",
    "event": "publish",
    "message": "Added responsive navigation header with mobile breakpoints and improved accessibility", 
    "url": "https://daily-stem-67845579.figma.site/",
    "version": "v1.2.3",
    "source": "figma-make"
  }' \
  https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
```

**Expected Response:**
```json
{"ok": true, "digest": "abc123..."}
```

### Step 3: Confirm Data Retrieval
```bash
curl -sS -H "x-ping-token: dude" \
  "https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping?id=latest"
```

**Expected Response:**
```json
{
  "payload": {
    "id": "latest",
    "event": "publish",
    "message": "Added responsive navigation header with mobile breakpoints and improved accessibility",
    "url": "https://daily-stem-67845579.figma.site/",
    "version": "v1.2.3", 
    "notes": "Added responsive navigation header with mobile breakpoints and improved accessibility",
    "author": "Claude",
    "ts": "2025-01-15T14:30:45.123Z"
  },
  "digest": "abc123...",
  "received_at": "2025-01-15T14:30:45.123Z"
}
```

---

## Auto-Monitor Integration

### How Build Notes Appear in Notifications

The auto-monitor uses the `message` field for notifications, so Claude's build notes will automatically appear:

```javascript
// Auto-monitor notification template
notification_text = 🚀 Build Update Detected!

📋 **Event:** {{payload.event}}
💬 **Message:** {{payload.message}}  // ← This contains Claude's build notes
🕐 **When:** {{formatted_timestamp}}
{{if(payload.url; concat("🔗 **URL:** ", payload.url); "")}}
{{if(payload.version; concat("🏷️ **Version:** ", payload.version); "")}}

⏰ Monitor reset to 15-minute interval
```

### Example Notification Output
```
🚀 Build Update Detected!

📋 Event: publish
💬 Message: Added responsive navigation header with mobile breakpoints and improved accessibility
🕐 When: Wed, Jan 15 2025 2:30 PM  
🔗 URL: https://daily-stem-67845579.figma.site/
🏷️ Version: v1.2.3

⏰ Monitor reset to 15-minute interval
```

---

## Advanced Configuration Options

### Dynamic Message Formatting
For more structured build notes, you can format the message field:

```javascript
// In Make.com Set Variables module
Formatted Message = Build Complete: {{Build Notes}}
{{if(Build Version; concat(" (", Build Version, ")"); "")}}
{{if(User Name; concat(" by ", User Name); "")}}
```

### Conditional Fields
Handle missing variables gracefully:

```javascript
// Safe variable handling
Safe Message = {{ifempty(Build Notes; "Build completed successfully")}}
Safe URL = {{ifempty(Public URL; "")}}
Safe Version = {{ifempty(Build Version; formatDate(now; "build-YYYY-MM-DD"))}}
Safe Author = {{ifempty(User Name; "Automated Build")}}
```

### Build Type Classification
Categorize different types of builds:

```javascript
// Build type detection
Build Type = {{if(contains(Build Notes; "component"); "component-update"; 
           if(contains(Build Notes; "style"); "styling-update";
           if(contains(Build Notes; "fix"); "bug-fix"; "general-update")))}}

// Use in event field
Event Field = {{Build Type}}
```

---

## Error Handling

### Missing Build Notes
If `{{Build Notes}}` is empty or unavailable:

```json
{
  "message": "{{ifempty(Build Notes; \"Build completed - no notes provided\")}}"
}
```

### Validation in Make.com
Add a Router module before the HTTP request:

```javascript
// Check if essential data is available
Has Build Notes: {{not(empty(Build Notes))}}
Has URL: {{not(empty(Public URL))}}

// Route conditions
Good Data: {{and(Has Build Notes; Has URL)}}
Missing Data: {{not(and(Has Build Notes; Has URL))}}
```

### Fallback Payload
For missing data scenarios:

```json
{
  "id": "latest",
  "event": "build-incomplete",
  "message": "Build completed but notes unavailable",
  "source": "figma-make",
  "timestamp": "{{formatDate(now; \"YYYY-MM-DDTHH:mm:ss\\Z\")}}"
}
```

---

## Integration with Existing Systems

### Backwards Compatibility
This enhanced payload structure is fully compatible with:
- ✅ Existing auto-monitor logic
- ✅ Current change detection system  
- ✅ Notification formatting
- ✅ Data storage structure

### Migration from Existing Setup
If you have an existing payload, gradually migrate:

1. **Week 1**: Update payload structure, keep existing `message` simple
2. **Week 2**: Start using `{{Build Notes}}` in `message` field
3. **Week 3**: Add additional metadata fields
4. **Week 4**: Full rich payload with all fields

---

## Troubleshooting

### Build Notes Not Appearing
**Issue**: Notifications show generic message instead of Claude's notes

**Solutions**:
- Verify `{{Build Notes}}` variable is mapped correctly
- Check Make.com execution log for variable values
- Test with manual build notes first
- Ensure JSON syntax is valid

### Variable Mapping Issues
**Issue**: Make.com shows "Variable not found" errors

**Solutions**:
- Use `{{ifempty(Build Notes; "fallback text")}}` for safety
- Check trigger module provides required variables
- Add Set Variables module to define missing variables
- Use static text for testing, then add variables

### Notification Formatting Problems
**Issue**: Build notes appear but formatting is broken

**Solutions**:
- Escape special characters in JSON
- Use proper JSON string formatting
- Test message field independently
- Check auto-monitor message template

---

## Best Practices

### Message Content Guidelines
- **Keep concise**: Aim for 1-2 sentences summarizing key changes
- **Be specific**: "Added responsive header" vs "Made changes"  
- **Include context**: Mention what was changed and why
- **Use action words**: "Added", "Fixed", "Updated", "Improved"

### Version Numbering
- **Semantic versioning**: `v1.2.3` for releases
- **Date-based**: `2025.1.15-1430` for automated builds
- **Build numbers**: `build-123` for internal tracking

### Metadata Usage
Store rich context in `meta` for future features:
- Performance metrics
- Build statistics  
- User preferences
- System information

---

## Success Verification Checklist

### Configuration ✅
- [ ] HTTP module updated with new payload structure
- [ ] `message` field mapped to `{{Build Notes}}`
- [ ] All required headers configured
- [ ] JSON syntax validated

### Testing ✅
- [ ] Manual test with sample data succeeds  
- [ ] cURL verification returns expected data
- [ ] Make.com execution completes without errors
- [ ] Variables map correctly in execution log

### Integration ✅  
- [ ] Auto-monitor detects payload changes
- [ ] Notifications include Claude's build notes
- [ ] Message formatting displays correctly
- [ ] Change detection still works properly

### Production ✅
- [ ] Build notes appear in real notifications
- [ ] Team receives meaningful build summaries
- [ ] Historical build data includes notes
- [ ] Error handling works for missing data

---

## Example Scenarios

### Scenario 1: Component Addition
**Claude's Build Notes**: "Added responsive navigation header with mobile breakpoints and accessibility improvements"

**Notification Result**:
```
🚀 Build Update Detected!

📋 Event: publish
💬 Message: Added responsive navigation header with mobile breakpoints and accessibility improvements
🕐 When: Wed, Jan 15 2025 2:30 PM
🔗 URL: https://daily-stem-67845579.figma.site/
🏷️ Version: v1.3.0
```

### Scenario 2: Bug Fix
**Claude's Build Notes**: "Fixed sidebar navigation overflow on mobile devices and improved touch targets"

**Notification Result**:
```
🚀 Build Update Detected!

📋 Event: publish  
💬 Message: Fixed sidebar navigation overflow on mobile devices and improved touch targets
🕐 When: Wed, Jan 15 2025 3:45 PM
🔗 URL: https://daily-stem-67845579.figma.site/
🏷️ Version: v1.2.1
```

### Scenario 3: Style Updates
**Claude's Build Notes**: "Updated color tokens for better contrast compliance and refreshed button styles"

**Notification Result**:
```
🚀 Build Update Detected!

📋 Event: publish
💬 Message: Updated color tokens for better contrast compliance and refreshed button styles  
🕐 When: Wed, Jan 15 2025 4:15 PM
🔗 URL: https://daily-stem-67845579.figma.site/
🏷️ Version: v1.2.2
```

---

## Quick Reference

### Essential JSON Structure
```json
{
  "id": "latest",
  "event": "publish",
  "message": "{{Build Notes}}",
  "url": "{{Public URL}}",
  "version": "{{Build Version}}",
  "source": "figma-make"
}
```

### Variable Safety Pattern
```javascript
"message": "{{ifempty(Build Notes; \"Build completed successfully\")}}"
```

### Testing Command
```bash
curl -H "x-ping-token: dude" -H "content-type: application/json" \
  -d '{"id":"latest","event":"publish","message":"Test build notes"}' \
  -X POST https://bjpcjlemlfnmrqseldmb.functions.supabase.co/ping
```

Once configured, Claude's detailed build notes will automatically appear in your team's build notifications, providing rich context about what changed in each deployment! 🚀