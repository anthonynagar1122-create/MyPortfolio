# RouteMaster Company Workspace — API & Events v2

**Version**: 2026-11-19-v2  
**Authority For**: REST API contracts, webhook specifications, event processing  
**Referenced By**: Implementation tasks, integration tests  

---

## 1. API Design Principles

- **REST conventions**: Standard HTTP methods and status codes
- **Authentication**: Clerk JWT in `Authorization: Bearer` header
- **Authorization**: Server-side permission checks on every endpoint
- **Pagination**: Offset-based with `limit` and `offset` parameters (max 100 per page)
- **Errors**: Structured error responses with error code and message
- **Validation**: Input validation at API boundary; return 400 Bad Request with details
- **Idempotency**: Idempotency keys for state-changing operations
- **Versioning**: URL-based versioning (`/api/v1/`) for backwards compatibility
- **Rate limiting**: 1000 requests/hour per API key
- **Logging**: All requests logged to audit trail with user, IP, timestamp

---

## 2. Authentication & Authorization

### 2.1 Request Authentication

All requests must include Clerk JWT token:

```
Authorization: Bearer <clerk_jwt_token>
```

Token validation:
- Issued by Clerk for workspace
- Not expired
- Contains `user_id` and `workspace_id`
- Signature verified with Clerk public key

### 2.2 Request Authorization

After authentication, check permissions:

1. **Workspace scope**: User must be member of workspace
2. **Project scope**: User must have role on project
3. **Resource scope**: User must have permission for specific action
4. **Row scope**: RLS policies enforce data isolation

Example: `GET /api/v1/projects/:projectId/tasks`
- Authenticate: Is user a workspace member?
- Authorize: Does user have `view_tasks` on this project?
- RLS: Can user see this task? (RLS policy enforces)

---

## 3. Standard Endpoints

### 3.1 Projects

```
GET    /api/v1/projects
  Query: workspace_id (required), status, limit, offset
  Returns: 200 OK with array of projects
  Auth: Workspace member with view_projects permission

POST   /api/v1/projects
  Body: { name, slug, description, category, visibility }
  Returns: 201 Created with project object
  Auth: Workspace member with create_project permission

GET    /api/v1/projects/:projectId
  Returns: 200 OK with project details
  Auth: Project member with view_project permission

PUT    /api/v1/projects/:projectId
  Body: { name, description, status, visibility, ... }
  Returns: 200 OK with updated project
  Auth: Project owner

DELETE /api/v1/projects/:projectId
  Returns: 204 No Content
  Auth: Project owner with delete_project permission
  Action: Soft-delete (set archived_at) with audit log

POST   /api/v1/projects/:projectId/members
  Body: { user_id, role }
  Returns: 201 Created with membership object
  Auth: Project owner with manage_members permission

DELETE /api/v1/projects/:projectId/members/:userId
  Returns: 204 No Content
  Auth: Project owner
```

### 3.2 Tasks

```
GET    /api/v1/tasks
  Query: workspace_id, project_id, assigned_to, status, limit, offset
  Returns: 200 OK with array of tasks
  Auth: Workspace member with view_tasks permission

POST   /api/v1/tasks
  Body: { title, description, project_id, assigned_to, priority, due_date, estimated_hours }
  Returns: 201 Created with task object
  Auth: Workspace member with create_task permission

GET    /api/v1/tasks/:taskId
  Returns: 200 OK with task details including comments and activity
  Auth: User with view_task permission

PUT    /api/v1/tasks/:taskId
  Body: { title, status, assigned_to, priority, actual_hours, ... }
  Returns: 200 OK with updated task
  Auth: Task assignee or project owner
  Action: Creates task_activity record

DELETE /api/v1/tasks/:taskId
  Returns: 204 No Content
  Auth: Task owner or project owner
  Action: Soft-delete (set closed_at)

POST   /api/v1/tasks/:taskId/comments
  Body: { content, is_internal }
  Returns: 201 Created with comment object
  Auth: Workspace member with comment_on_task permission

POST   /api/v1/tasks/:taskId/dependencies
  Body: { depends_on_task_id }
  Returns: 201 Created with dependency object
  Auth: Task owner or project owner
```

### 3.3 Documentation

```
GET    /api/v1/docs
  Query: workspace_id, project_id, category, status, limit, offset
  Returns: 200 OK with array of documents

POST   /api/v1/docs
  Body: { title, slug, category, content, status }
  Returns: 201 Created with document object
  Auth: Workspace member with write_docs permission

GET    /api/v1/docs/:docId
  Returns: 200 OK with document content and metadata

PUT    /api/v1/docs/:docId
  Body: { title, content, status, ... }
  Returns: 200 OK with updated document
  Auth: Document owner
  Action: Creates new doc_version record

GET    /api/v1/docs/:docId/versions
  Returns: 200 OK with array of document versions

POST   /api/v1/docs/:docId/publish
  Body: { version_number }
  Returns: 200 OK with published version
  Auth: Document owner with publish_docs permission
```

### 3.4 Support

```
GET    /api/v1/tickets
  Query: workspace_id, status, priority, assigned_to, limit, offset
  Returns: 200 OK with array of tickets

POST   /api/v1/tickets
  Body: { title, description, reporter_name, reporter_email, priority, project_id }
  Returns: 201 Created with ticket object

GET    /api/v1/tickets/:ticketId
  Returns: 200 OK with ticket details

PUT    /api/v1/tickets/:ticketId
  Body: { status, assigned_to, priority, ... }
  Returns: 200 OK with updated ticket
  Auth: Support team

POST   /api/v1/tickets/:ticketId/comments
  Body: { content, is_internal }
  Returns: 201 Created with comment

GET    /api/v1/incidents
  Query: workspace_id, status, severity, limit, offset
  Returns: 200 OK with array of incidents

POST   /api/v1/incidents
  Body: { title, description, severity, commander_id }
  Returns: 201 Created with incident

POST   /api/v1/incidents/:incidentId/postmortem
  Body: { content, lessons_learned, action_items }
  Returns: 201 Created with postmortem
```

### 3.5 Integrations

```
GET    /api/v1/integrations
  Query: workspace_id, integration_type, status
  Returns: 200 OK with array of integrations

POST   /api/v1/integrations
  Body: { integration_type, name, config }
  Returns: 201 Created with integration object
  Auth: Admin with manage_integrations permission

GET    /api/v1/integrations/:integrationId
  Returns: 200 OK with integration details and status

PUT    /api/v1/integrations/:integrationId
  Body: { name, config, enabled, ... }
  Returns: 200 OK with updated integration
  Auth: Admin

DELETE /api/v1/integrations/:integrationId
  Returns: 204 No Content
  Auth: Admin
  Action: Soft-delete with audit log

POST   /api/v1/integrations/:integrationId/test
  Returns: 200 OK if connected, 400 Bad Request if error
  Action: Tests credential and returns status

POST   /api/v1/integrations/:integrationId/sync
  Returns: 202 Accepted with sync job ID
  Action: Enqueues async sync task
```

### 3.6 Workflows

```
GET    /api/v1/workflows
  Query: workspace_id, project_id, enabled
  Returns: 200 OK with array of workflows

POST   /api/v1/workflows
  Body: { name, trigger_event, actions, requires_approval }
  Returns: 201 Created with workflow object
  Auth: Admin

PUT    /api/v1/workflows/:workflowId
  Body: { name, trigger_event, actions, enabled, ... }
  Returns: 200 OK with updated workflow

GET    /api/v1/workflows/:workflowId/runs
  Returns: 200 OK with array of workflow runs

POST   /api/v1/workflows/:workflowId/runs/:runId/approve
  Body: { approved_by }
  Returns: 200 OK with approval record
  Auth: Approver on workflow
```

---

## 4. Event Processing & Webhooks

### 4.1 Event Contract

All events follow this structure:

```json
{
  "id": "uuid",
  "event_type": "incident.created",
  "source": "workspace",
  "timestamp": "2026-11-19T10:30:00Z",
  "workspace_id": "uuid",
  "project_id": "uuid",
  "triggered_by": "uuid",
  "payload": {
    "incident_id": "uuid",
    "severity": "critical",
    "title": "Database connection lost"
  }
}
```

### 4.2 Event Types

**Project Events**:
- `project.created` — New project registered
- `project.updated` — Project metadata changed
- `project.archived` — Project archived
- `project.deleted` — Project permanently deleted

**Task Events**:
- `task.created` — New task created
- `task.updated` — Task status or assignment changed
- `task.completed` — Task marked done
- `task.assigned` — Task reassigned

**Deployment Events**:
- `deployment.started` — Build/deploy started
- `deployment.succeeded` — Deployment successful
- `deployment.failed` — Deployment failed

**Incident Events**:
- `incident.created` — Incident reported
- `incident.updated` — Status changed
- `incident.resolved` — Incident resolved
- `incident.postmortem_created` — Postmortem filed

**Integration Events**:
- `integration.connected` — Integration authenticated
- `integration.disconnected` — Integration disabled
- `integration.sync_completed` — Sync job finished
- `integration.error` — Integration error occurred

**Alert Events**:
- `alert.triggered` — Alert condition met
- `alert.resolved` — Alert condition cleared

### 4.3 Webhook Endpoints (Product Integration)

Products receive notifications via signed webhooks.

**Register a webhook**:
```
POST /api/v1/projects/:projectId/webhooks
Body: {
  "url": "https://product.example.com/webhooks/routemaster",
  "events": ["incident.created", "deployment.failed"],
  "active": true
}
Returns: 201 Created with webhook ID and signing secret
```

**Webhook delivery**:

```
POST https://product.example.com/webhooks/routemaster
Headers:
  X-RouteMaster-Webhook-ID: webhook-id
  X-RouteMaster-Event-Type: incident.created
  X-RouteMaster-Signature: sha256=...
  X-RouteMaster-Timestamp: 1700000000

Body: {
  "id": "event-uuid",
  "event_type": "incident.created",
  "timestamp": "2026-11-19T10:30:00Z",
  "payload": { ... }
}
```

**Signature validation** (HMAC-SHA256):

```python
import hmac
import hashlib

def verify_signature(payload, header_signature, secret):
  expected_sig = "sha256=" + hmac.new(
    secret.encode(),
    payload.encode(),
    hashlib.sha256
  ).hexdigest()
  return hmac.compare_digest(header_signature, expected_sig)
```

**Delivery guarantees**:
- At least once delivery (may retry on failure)
- Exponential backoff: 2s, 5s, 30m, 1h, 24h
- Dead-letter after 5 failed attempts (stored for manual investigation)
- Idempotency key in payload for deduplication

### 4.4 Durable Event Queue

Internal events are processed via Redis queue with acknowledgment:

```python
# Enqueue event
redis.lpush("workspace:events", json.dumps({
  "id": uuid,
  "type": "incident.created",
  "payload": {...},
  "retries": 0
}))

# Process events (async worker)
while True:
  event_json = redis.rpop("workspace:events")
  if not event_json:
    sleep(1)
    continue
  
  event = json.loads(event_json)
  try:
    process_event(event)
    # Event processed successfully
  except RetryableError:
    event["retries"] += 1
    if event["retries"] < 5:
      redis.lpush("workspace:events", json.dumps(event))
    else:
      # Dead-letter
      redis.lpush("workspace:dead-letter", json.dumps(event))
```

---

## 5. Error Responses

### 5.1 Standard Error Format

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Project slug must be lowercase alphanumeric",
    "details": {
      "field": "slug",
      "value": "My-Project"
    }
  }
}
```

### 5.2 Error Codes & HTTP Status

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_REQUEST` | 400 | Bad request (validation failed) |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists or state conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 6. Pagination

Standard pagination with offset-based cursors:

```
GET /api/v1/tasks?workspace_id=...&limit=20&offset=0

Returns:
{
  "data": [ ... ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "has_more": true
  }
}
```

---

## 7. Rate Limiting

- **Global limit**: 1000 requests per hour per API key
- **Per-endpoint limit**: May be lower for expensive operations (e.g., 10/min for sync)
- **Headers**:
  - `X-RateLimit-Limit: 1000`
  - `X-RateLimit-Remaining: 847`
  - `X-RateLimit-Reset: 1700000000` (Unix timestamp)
- **Response**: 429 Too Many Requests with `Retry-After` header

---

## 8. Idempotency

State-changing operations support idempotency keys to prevent duplicate processing:

```
POST /api/v1/tasks
Headers:
  Idempotency-Key: task-creation-20261119-001

Returns:
  200 OK (created on first call) or 200 OK (idempotent replay)
```

Idempotency key must be:
- UUID4 or similar unique identifier
- Included in `Idempotency-Key` header
- Server stores key → response mapping for 24 hours
- Same key returns same response (even if retried)

---

## 9. API Clients

### 9.1 Authentication

```javascript
const token = await getClerkToken(); // From Clerk

const response = await fetch("https://api.routemaster.app/api/v1/projects", {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
```

### 9.2 Error Handling

```javascript
try {
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    const error = await response.json();
    console.error(error.error.code, error.error.message);
  }
} catch (err) {
  console.error("Network error", err);
}
```

---

**Authority**: This document defines the API contract. See `2026-11-19-company-workspace-v2-security.md` for authorization policies and permission matrices.
