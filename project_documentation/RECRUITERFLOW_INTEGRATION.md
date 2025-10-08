# Recruiterflow API Integration

## Overview

This document details the integration with Recruiterflow CRM, which serves as the **source of truth** for all job and candidate data.

**API Reference**: [@recruiterflow_docs/rf_api_docs.yaml](../recruiterflow_docs/rf_api_docs.yaml)

---

## API Basics

### Base Configuration
- **Base URL**: `https://api.recruiterflow.com`
- **Authentication**: Header-based API key
  ```
  RF-Api-Key: your-api-key-here
  ```
- **Content Type**: `application/json` (unless otherwise specified)
- **API Version**: OpenAPI 3.0.0

### Rate Limiting
- Check Recruiterflow documentation for current rate limits
- Implement exponential backoff for failed requests
- Cache responses where appropriate

---

## Key Endpoints We'll Use

### 1. Job Management

#### Get Job List
```
GET /api/external/job/list
```
**Purpose**: Fetch all jobs with filtering capabilities
**Parameters**:
- `items_per_page` (optional): Number of records per page
- `current_page` (optional): Page number
- `include_count` (optional): Include total count
- Additional filters: TBD from full API docs

**Use Cases**:
- Initial sync of all active jobs
- Periodic refresh to catch any missed webhooks
- Filtering for "actively sourcing" jobs only

---

#### Get Single Job
```
GET /api/external/job/{id}
```
**Purpose**: Fetch detailed information about a specific job
**Parameters**:
- `id` (required): Job ID

**Use Cases**:
- Webhook handler to fetch updated job details
- User clicks into job details on dashboard
- Refresh individual job data

---

### 2. Candidate Pipeline Data

#### Get Stage Movements
```
GET /api/external/candidate/activities/stage-movement/list
```
**Purpose**: Track candidate progression through pipeline stages
**Parameters**:
- `id` (required): Candidate ID
- `after` (optional): After time in ISO format
- `before` (optional): Before time in ISO format
- `items_per_page` (optional): Pagination
- `current_page` (optional): Page number
- `include_count` (optional): Total count

**Response Structure** (from API docs):
```json
{
  "data": {
    "id": "24",
    "name": "Candidate Name",
    "jobs": [
      {
        "id": 1,
        "name": "Job Title",
        "added_by": { "id": 1, "name": "User", "email": "user@example.com" },
        "transitions": [
          {
            "from": "Sourced",
            "to": "Recruiter Screen",
            "entered": "2023-03-29T14:26:43+0000",
            "left": "2023-03-29T14:26:44+0000",
            "stage_moved_by": { "id": 1, "name": "User", "email": "user@example.com" }
          }
        ]
      }
    ]
  }
}
```

**Use Cases**:
- Calculate pipeline staleness metrics (avg time in each stage)
- Display candidate pipeline snapshot on dashboard
- Identify bottlenecks in client decision-making

---

### 3. Candidate Activities

#### Get Candidate Activity List
```
GET /api/external/candidate/activity/list
```
**Purpose**: Fetch all activities for a candidate
**Parameters**:
- `id` (required): Candidate ID
- `items_per_page`, `current_page`, `include_count` (optional)

**Use Cases**:
- Track candidate engagement
- Display activity timeline
- Calculate "last contacted" metrics

---

### 4. Custom Fields (for linking)

#### Get Job Custom Fields
```
GET /api/external/job/custom-field/list
```
**Purpose**: List all custom fields available for jobs

**Use Case**:
- We may create a custom field in Recruiterflow called `scoring_system_id` or `current_rank`
- This allows bidirectional linking between our system and Recruiterflow
- Enables syncing calculated rank back to Recruiterflow for visibility

---

## Webhook Integration

### Webhook Events to Listen For

Based on typical CRM webhook patterns (exact events TBD from RF docs):

| Event | Trigger | Our Action |
|-------|---------|------------|
| `job.created` | New job opened in RF | Create job record in Supabase, trigger scoring notification |
| `job.updated` | Job details changed | Update cached job data in Supabase |
| `job.archived` | Job closed/archived | Mark job as inactive, retain scoring history |
| `candidate.stage_changed` | Candidate moved in pipeline | Update pipeline_snapshots table |
| `candidate.added_to_job` | New candidate added | Update candidate count for job |

### Webhook Security

**Signature Validation**:
- Recruiterflow likely sends a signature header (e.g., `X-Recruiterflow-Signature`)
- Store webhook secret in environment variable: `RECRUITERFLOW_WEBHOOK_SECRET`
- Validate HMAC signature before processing payload
- Reject requests with invalid signatures

**Example Validation** (pseudocode):
```typescript
const receivedSignature = request.headers.get('X-Recruiterflow-Signature');
const payload = await request.text();
const expectedSignature = hmacSHA256(payload, WEBHOOK_SECRET);

if (receivedSignature !== expectedSignature) {
  return c.json({ error: 'Invalid signature' }, 403);
}
```

---

## Data Synchronization Strategy

### Source of Truth Rules
- **Job metadata** (client, title, dates, fee, status): Recruiterflow is source of truth
- **Candidate pipeline**: Recruiterflow is source of truth
- **Scoring data**: Our Supabase database is source of truth
- **Calculated ranks**: Our system owns this, may optionally sync back to RF

### Sync Mechanisms

#### 1. Real-time (Primary): Webhooks
- Instant updates when jobs/candidates change
- Minimal API quota usage
- Requires reliable webhook delivery

#### 2. Polling (Fallback): Scheduled Sync
- Cloudflare Workers cron job every 15-30 minutes
- Catches any missed webhooks
- Full sync of active jobs

**Cron Configuration** (in wrangler.toml):
```toml
[triggers]
crons = ["*/30 * * * *"]  # Every 30 minutes
```

#### 3. Manual Refresh
- User-triggered refresh button on dashboard
- Admin "force sync" operation
- Useful for troubleshooting

### Handling Sync Conflicts
- **Job deleted in RF**: Mark as `is_active = false` in Supabase, keep scoring history
- **Job data mismatch**: RF data always wins, overwrite local cache
- **Sync failure**: Log error in `sync_log` table, display staleness indicator on dashboard

---

## Data Mapping

### Recruiterflow Job → Supabase `jobs` Table

| RF Field | Our Field | Notes |
|----------|-----------|-------|
| `id` | `recruiterflow_job_id` | Primary link |
| `name` | `job_title` | Job title |
| `company.name` | `client_name` | Client/company name |
| `created_at` | `date_opened` | When job was created |
| `status` | `status` | Job status (actively_sourcing, etc.) |
| `fee` or custom field | `estimated_fee` | Revenue potential |
| Last sync time | `last_synced` | Timestamp of last update |
| Status check | `is_active` | Boolean for filtering |

**Note**: Exact field names TBD after reviewing full RF API response structure.

---

## Error Handling

### API Request Failures
```typescript
async function fetchFromRecruiterflow(endpoint: string) {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(`https://api.recruiterflow.com${endpoint}`, {
        headers: {
          'RF-Api-Key': API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`RF API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      attempt++;
      if (attempt >= MAX_RETRIES) {
        // Log to sync_log table
        await logSyncError(endpoint, error.message);
        throw error;
      }
      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
}
```

### Webhook Failures
- If webhook processing fails, log error but return 200 to prevent retries
- Store failed webhook payload for manual retry
- Alert admin if webhook failures exceed threshold

---

## Caching Strategy

### What to Cache
- **Job list**: Cache for 5-10 minutes in Workers KV
- **Job details**: Cache for 5 minutes, invalidate on webhook
- **Pipeline data**: Cache for 15 minutes, complex to fetch

### Cache Invalidation
- On `job.updated` webhook: Invalidate job-specific cache
- On `candidate.stage_changed`: Invalidate pipeline cache for that job
- Manual refresh: Clear all caches

---

## Implementation Checklist

### Phase 1: Basic Job Sync
- [ ] Create Recruiterflow API client utility
- [ ] Implement `GET /api/external/job/list` fetching
- [ ] Implement `GET /api/external/job/{id}` fetching
- [ ] Map RF job data to Supabase schema
- [ ] Create sync function to populate `jobs` table
- [ ] Add error handling and logging

### Phase 2: Webhook Handling
- [ ] Create webhook endpoint in Workers
- [ ] Implement signature validation
- [ ] Handle `job.created` event
- [ ] Handle `job.updated` event
- [ ] Handle `job.archived` event
- [ ] Test webhook delivery with RF

### Phase 3: Pipeline Data
- [ ] Implement stage movement fetching
- [ ] Calculate pipeline staleness metrics
- [ ] Store in `pipeline_snapshots` table
- [ ] Display on dashboard

### Phase 4: Scheduled Sync
- [ ] Set up Workers cron trigger
- [ ] Implement full job sync logic
- [ ] Add sync status logging
- [ ] Create admin dashboard for sync monitoring

### Phase 5: Custom Fields (Optional)
- [ ] Create custom field in RF for `current_rank`
- [ ] Implement API calls to update custom field
- [ ] Sync rank back to RF after calculation

---

## Testing Strategy

### Development Testing
1. **Postman/Insomnia**: Test all endpoints with real API key
2. **Mock Webhooks**: Use webhook testing tools to simulate events
3. **Local Workers**: Test sync logic locally with `wrangler dev`

### Integration Testing
1. Create test job in Recruiterflow
2. Verify it syncs to Supabase
3. Update job in RF, verify webhook triggers update
4. Archive job, verify it marks as inactive

### Edge Cases to Test
- Job deleted in RF while being scored
- Webhook received while sync in progress
- API rate limit exceeded
- Network timeout during sync
- Invalid/corrupted webhook payload

---

## Security Considerations

### API Key Management
- Store in Cloudflare Workers secrets (never commit)
- Rotate periodically
- Use different keys for dev/staging/production if available

### Webhook Secret
- Generate strong random secret
- Store in Workers secrets
- Validate on every webhook request

### Data Privacy
- Only fetch data needed for scoring
- Don't store sensitive candidate PII unless required
- Follow GDPR/data protection guidelines

---

## Future Enhancements

### Potential Improvements
1. **Real-time updates**: Use Supabase Realtime to push updates to frontend
2. **Selective sync**: Only sync jobs meeting certain criteria
3. **Bidirectional sync**: Push rank changes back to RF custom fields
4. **Analytics**: Track sync performance, API usage, error rates
5. **Bulk operations**: Batch API calls for efficiency

### API Endpoints We Might Use Later
- `/api/external/candidate/add-to-job` - Add candidates programmatically
- `/api/external/job/custom-field/update` - Update custom fields
- `/api/external/candidate/activity/list` - Track engagement

---

## Troubleshooting

### Common Issues

**Jobs not syncing**
- Check API key is valid
- Verify network connectivity to `api.recruiterflow.com`
- Check sync_log table for errors
- Manually trigger sync

**Webhooks not received**
- Verify webhook URL is correct in RF settings
- Check signature validation logic
- Test with webhook testing tools
- Check Workers logs for rejected requests

**Pipeline data incorrect**
- Verify stage name mapping
- Check date calculations
- Re-sync pipeline data for affected jobs

---

## References

- **Full API Spec**: [@recruiterflow_docs/rf_api_docs.yaml](../recruiterflow_docs/rf_api_docs.yaml)
- **Recruiterflow Support**: Contact RF support for API assistance
- **Our Implementation**: [backend/src/index.ts](../backend/src/index.ts) (webhook handlers)

---

**Last Updated**: 2025-10-08
**Status**: Planning phase - awaiting environment setup to begin implementation
