# RouteMaster Company Workspace — Security Model v2

**Version**: 2026-11-19-v2  
**Authority For**: RLS policies, RBAC matrix, secrets management, audit controls  
**Referenced By**: API authorization, database constraints  

---

## 1. Security Principles

- **Defense in depth**: Multiple layers of protection (authentication, authorization, data isolation)
- **Least privilege**: Users have minimum permissions needed for their role
- **Workspace isolation**: One workspace cannot access another's data
- **Project isolation**: Project access is explicit and scoped
- **Audit everything**: Every meaningful action is logged
- **Encrypt sensitive data**: Passwords, keys, tokens are hashed or encrypted
- **No plaintext secrets**: API keys and credentials reference external secure storage only

---

## 2. Authentication

### 2.1 Workspace User Authentication

Workspace uses **Clerk** for user authentication:

- **Identity source**: Clerk owns `email`, `name`, `phone`, `MFA`, `SSO`, `sessions`
- **Verification**: Every API request validates Clerk JWT signature
- **Session management**: Clerk handles login/logout and session refresh
- **MFA support**: Users can enable MFA through Clerk dashboard

### 2.2 Workspace Authorization

Workspace-level permissions are stored in PostgreSQL:

- **Roles**: Define named permission sets (admin, project_owner, member)
- **User roles**: Map users to roles at workspace and project scope
- **Permissions**: Atomic permissions (create_project, manage_teams, etc.)
- **Inheritance**: Project roles may inherit workspace role permissions

### 2.3 Product Authentication

Products use **project-scoped credentials**:

```
Product sends API request with:
  Authorization: Bearer <project-scoped-token>
  
Workspace validates:
  1. Token is valid JWT
  2. Token is not expired
  3. Token is scoped to specified project
  4. Issuing project still exists
```

---

## 3. Authorization & Access Control

### 3.1 Role-Based Access Control (RBAC) Matrix

| Action | Admin | Project Owner | Project Lead | Developer | Analyst | Viewer | 
|--------|-------|---|---|---|---|---|
| **Workspace Admin** | | | | | | |
| Create project | ✓ | — | — | — | — | — |
| Delete project | ✓ | — | — | — | — | — |
| Manage workspace users | ✓ | — | — | — | — | — |
| Manage teams | ✓ | — | — | — | — | — |
| Manage roles | ✓ | — | — | — | — | — |
| View audit logs | ✓ | ✓ | — | — | — | — |
| Manage integrations | ✓ | ✓ | — | — | — | — |
| **Project Admin** | | | | | | |
| Update project metadata | ✓ | ✓ | ✓ | — | — | — |
| Archive project | ✓ | ✓ | — | — | — | — |
| Add/remove members | ✓ | ✓ | ✓ | — | — | — |
| Change member roles | ✓ | ✓ | — | — | — | — |
| Delete tasks | ✓ | ✓ | ✓ | — | — | — |
| **Tasks** | | | | | | |
| Create task | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Update own task | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Update any task | ✓ | ✓ | ✓ | — | — | — |
| Close task | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| View all tasks | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Documentation** | | | | | | |
| Create doc | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Edit doc | ✓ | ✓ | ✓ | ✓ (own) | ✓ (own) | — |
| Publish doc | ✓ | ✓ | ✓ | — | — | — |
| Delete doc | ✓ | ✓ | ✓ | — | — | — |
| View doc | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Support** | | | | | | |
| Create ticket | ✓ | ✓ | ✓ | ✓ | — | — |
| Assign ticket | ✓ | ✓ | ✓ | — | — | — |
| Close ticket | ✓ | ✓ | ✓ | ✓ (own) | — | — |
| View tickets | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **Finance** | | | | | | |
| View budget | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Update budget | ✓ | ✓ | — | — | — | — |
| View costs | ✓ | ✓ | ✓ | — | ✓ | — |
| **Integrations** | | | | | | |
| Connect integration | ✓ | ✓ | — | — | — | — |
| Test integration | ✓ | ✓ | ✓ | — | — | — |
| Sync integration | ✓ | ✓ | ✓ | — | — | — |

---

## 4. Row-Level Security (RLS) Policies

### 4.1 Workspace Isolation

Every table with `workspace_id` has RLS policy:

```sql
-- Users can only see workspace data for workspaces they're members of
CREATE POLICY "users_see_own_workspace"
  ON projects
  USING (workspace_id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  ));

-- Administrative view: authenticated users can see workspace they belong to
CREATE POLICY "users_can_read_own_workspace"
  ON workspaces
  USING (id IN (
    SELECT workspace_id
    FROM workspace_users
    WHERE clerk_id = auth.jwt() ->> 'sub'
  ));
```

### 4.2 Project Isolation

```sql
-- Users can only see projects they're members of
CREATE POLICY "users_see_own_projects"
  ON projects
  USING (id IN (
    SELECT project_id
    FROM project_members
    WHERE user_id = (
      SELECT id
      FROM workspace_users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));

-- Users cannot see tasks in projects they don't have access to
CREATE POLICY "users_see_project_tasks"
  ON tasks
  USING (project_id IS NULL OR project_id IN (
    SELECT project_id
    FROM project_members
    WHERE user_id = (
      SELECT id
      FROM workspace_users
      WHERE clerk_id = auth.jwt() ->> 'sub'
    )
  ));
```

### 4.3 Sensitive Data Protection

```sql
-- Integration config values are never returned, only metadata
-- (Actual values are stored in Vercel environment variables, not in DB)
CREATE POLICY "config_values_hidden"
  ON integration_config
  SELECT (
    -- Only return if user is workspace admin
    auth.jwt() ->> 'sub' IN (
      SELECT w.clerk_id
      FROM workspace_users w
      WHERE w.workspace_id = integrations.workspace_id
      AND w.id IN (
        SELECT user_id FROM user_roles
        WHERE role_id IN (
          SELECT id FROM roles
          WHERE workspace_id = integrations.workspace_id
          AND name IN ('admin', 'workspace_admin')
        )
      )
    )
  );
```

### 4.4 Audit Log Immutability

```sql
-- Audit logs can never be updated or deleted
CREATE POLICY "audit_logs_immutable"
  ON audit_logs
  FOR DELETE USING (FALSE);

CREATE POLICY "audit_logs_no_update"
  ON audit_logs
  FOR UPDATE USING (FALSE);
```

---

## 5. Secrets Management

### 5.1 Credential Storage Architecture

**Workspace Database** stores:
- Integration name and type
- Configuration keys (not values)
- Last tested timestamp
- Rotation schedule
- Environment scope (dev/staging/prod)

**Vercel Environment Variables** store:
- Actual API keys and credentials
- Encrypted at rest by Vercel
- Never returned through API
- Only accessible at deploy time

**Example**:
```sql
-- In workspace database
INSERT INTO integrations (workspace_id, integration_type, name)
VALUES (uuid, 'stripe', 'Production Stripe');

INSERT INTO integration_config (integration_id, config_key, is_sensitive)
VALUES (integration_id, 'merchant_id', FALSE);  -- Safe to return

-- In Vercel environment variables
STRIPE_PRODUCTION_API_KEY=sk_live_...  -- Never in database
STRIPE_PRODUCTION_WEBHOOK_SECRET=...   -- Never in database
```

### 5.2 Credential Rotation Policy

- **API keys**: Rotate every 90 days
- **Database passwords**: Rotate every 180 days
- **Webhook secrets**: Rotate on each integration update
- **Rotation process**:
  1. Generate new credential in external system
  2. Store new credential in Vercel env var (new name)
  3. Update integration config to point to new var
  4. Wait 24 hours
  5. Revoke old credential in external system

### 5.3 Secrets Access Control

Only workspace admins can:
- View integration configuration
- Change credential references
- Update environment variable mapping
- Rotate credentials

Access is logged to audit trail:
```sql
INSERT INTO audit_logs (workspace_id, user_id, action, resource_type)
VALUES (workspace_id, user_id, 'credential_accessed', 'integration');
```

---

## 6. Audit & Compliance

### 6.1 Audit Logging

Every action is logged:

```sql
INSERT INTO audit_logs (
  workspace_id, user_id, action, 
  resource_type, resource_id, 
  old_values, new_values,
  ip_address, user_agent
) VALUES (...);
```

**Logged actions**:
- User login/logout
- Project creation/update/deletion
- Task creation/update/assignment
- Permission changes
- Integration connections
- Credential access
- Document publication
- Ticket resolution
- Incident creation/resolution

**Retention**:
- Keep logs for 7 years (compliance)
- Archive to cold storage after 1 year
- Never delete live logs

### 6.2 Approval Records

Sensitive operations require audit trail:

```sql
INSERT INTO approval_records (
  workspace_id, request_type, request_id,
  requested_by, approved_by, status,
  requested_at, decided_at
) VALUES (
  workspace_id, 'delete_project', project_id,
  user_id, approver_id, 'approved',
  NOW(), NOW()
);
```

**Approval-requiring actions**:
- Delete project (requires workspace admin)
- Disconnect integration (requires workspace admin)
- Rotate credentials (requires workspace admin)
- Archive project (requires project owner)

### 6.3 Security Events

Anomalies are logged separately:

```sql
INSERT INTO security_events (
  workspace_id, event_type, severity,
  description, user_id, details
) VALUES (
  workspace_id,
  'failed_auth_multiple',
  'high',
  'User failed login 5 times in 10 minutes',
  user_id,
  '{"attempts": 5, "window_minutes": 10}'
);
```

**Monitored events**:
- Failed authentication attempts (>3 in 10 min = alert)
- Suspicious login (new IP, new device)
- Permission escalation attempts
- Bulk data access attempts
- API abuse (rate limit exceeded)
- Credential access from unusual location

---

## 7. Data Encryption

### 7.1 Encryption at Rest

- **Database**: Supabase-managed encryption with AWS KMS
- **Backups**: Encrypted in Vercel Blob storage
- **Sensitive fields**: JSON fields encrypted with AES-256
  - API keys (reference strings, actual values in env vars)
  - Webhook signing secrets

### 7.2 Encryption in Transit

- **API communication**: HTTPS only (TLS 1.3)
- **Database connections**: SSL/TLS required
- **Webhook delivery**: HTTPS + signature verification
- **Certificate pinning**: Not required (trust public CAs)

### 7.3 Hashing

- **User passwords**: Not stored (delegated to Clerk)
- **API tokens**: Hashed before storage
- **Webhook secrets**: Hashed for verification

---

## 8. API Security

### 8.1 Input Validation

Every API endpoint validates:
- Required fields present
- Field types match schema
- String length limits enforced
- Numeric ranges enforced
- Slug format (lowercase alphanumeric)
- Email format valid

### 8.2 Output Filtering

Never return:
- API keys or credentials
- Password hashes
- Internal IDs (use external IDs)
- Personal data to unauthorized users
- Sensitive error details to clients

### 8.3 CORS & CSRF Protection

- **CORS**: Only allow requests from `routemaster.vercel.app` and product domains
- **CSRF tokens**: Use SameSite cookies + idempotency keys
- **Headers**: Include security headers
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=31536000`

---

## 9. Compliance & Standards

### 9.1 GDPR Compliance

- **Data retention**: Users can request data deletion
- **Data export**: Users can export their data
- **Privacy policy**: Available at `routemaster.vercel.app/privacy`
- **Consent tracking**: Recorded in audit logs
- **Third-party data**: Only used as specified

### 9.2 PCI DSS Compliance

- **Payment data**: NEVER stored in workspace database
- **Stripe integration**: Uses Stripe's tokenization
- **Webhook validation**: Signed with rotating secrets
- **Audit logs**: Track all payment-related actions

### 9.3 SOC 2 Compliance

- **Access control**: RBAC with audit trails
- **Encryption**: In transit and at rest
- **Monitoring**: Security events and anomalies detected
- **Incident response**: Documented procedures
- **Backup & recovery**: Tested monthly

---

**Authority**: This document defines security policies and RLS rules. See database schema for SQL implementation.
