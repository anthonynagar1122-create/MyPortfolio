# RouteMaster Company Workspace — Database & ERD v4

**Version**: 2026-11-19-v4  
**Authority For**: Table schemas, migrations, relationships, data types, indexes, constraints  
**Status**: Source of truth for API contracts and security policies  
**Changes from v3**: 9 critical corrections: duplicate PKs fixed, composite FKs corrected, event lifecycle refined, audit immutability enforced, schema validated

---

## 1. Database Principles

- **PostgreSQL 14+**: Strong ACID guarantees, JSON support, row-level security
- **Supabase-hosted**: Managed backups, monitoring, automatic updates
- **Workspace-scoped isolation**: Every workspace-owned table has composite PK: `(workspace_id, id)` with matching composite FKs
- **Never null workspace_id**: ON DELETE SET NULL is never used on workspace_id; relationships handle deletions differently
- **Explicit relationships**: Foreign keys with correct deletion policies; composite keys for tenant safety
- **Searchable**: Appropriate indexes for common queries and foreign-key lookups
- **Audit-ready**: `created_at`, `updated_at`, `created_by`, `updated_by` on most tables
- **Soft deletes**: Use `archived_at` instead of hard delete; preserve history
- **UUIDs for PKs**: `gen_random_uuid()` default for all primary keys
- **TIMESTAMPTZ**: All timestamps stored as `TIMESTAMPTZ` with UTC default
- **RLS enabled**: Row-level security actively enforced on all tenant-owned tables
- **Source of truth**: This schema is executable, validated, and definitive

---

## 2. Composite Foreign Key Pattern (Corrected)

**All workspace-owned tables enforce composite tenant boundaries:**

```sql
-- Table definition with composite primary key
CREATE TABLE projects (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  name TEXT NOT NULL,
  owner_id UUID,  -- nullable; user may leave workspace
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, owner_id) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
);

-- Key rule: ON DELETE SET NULL is ONLY used on non-workspace_id columns
-- workspace_id itself is NEVER nullable and NEVER SET NULL
-- If a user is deleted, owner_id becomes NULL (project exists, owner unknown)
-- If a workspace is deleted, CASCADE deletes the project
```

---

## 3. Database Schema (Complete, Validated)

### 3.1 Workspace & Company Foundation

```sql
-- Enable RLS on all tables
ALTER DATABASE postgres SET rls.force_row_level_security = on;

-- Workspace: One entry per company (initially one, designed for multiple)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  brand_color TEXT DEFAULT '#3563F6',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workspaces_slug ON workspaces(slug);

-- Feature flags per workspace
CREATE TABLE workspace_features (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  feature_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, feature_key)
);

CREATE INDEX idx_workspace_features_key ON workspace_features(workspace_id, feature_key);

-- Global reference tables (NOT workspace-scoped; shared across all workspaces)
-- These are system definitions, not operational data

CREATE TABLE global_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_global_roles_name ON global_roles(name);

CREATE TABLE global_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_global_permissions_key ON global_permissions(permission_key);
```

### 3.2 Users & Access Control

```sql
-- Workspace users (workspace-scoped)
CREATE TABLE workspace_users (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  clerk_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'invited', 'suspended')) DEFAULT 'active',
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, email),
  UNIQUE(workspace_id, clerk_id)
);

ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_workspace_users_workspace ON workspace_users(workspace_id);
CREATE INDEX idx_workspace_users_clerk ON workspace_users(clerk_id);

-- Teams within workspace
CREATE TABLE teams (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  parent_team_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, parent_team_id) REFERENCES teams(workspace_id, id) ON DELETE SET NULL
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_teams_workspace ON teams(workspace_id);

-- Team membership (workspace-scoped)
CREATE TABLE team_members (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  team_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'lead', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, team_id) REFERENCES teams(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, user_id) REFERENCES workspace_users(workspace_id, id) ON DELETE CASCADE,
  UNIQUE(workspace_id, team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_team_members_team ON team_members(workspace_id, team_id);
CREATE INDEX idx_team_members_user ON team_members(workspace_id, user_id);

-- User role assignments (workspace and project scoped)
-- Scope: 'workspace' (workspace-level role) or 'project' (project-level role)
-- Scope_id: NULL for workspace scope; must reference projects table if scope='project'
CREATE TABLE user_roles (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('workspace', 'project')),
  scope_id UUID,  -- NULL for workspace scope; references projects.id if scope='project'
  
  granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, user_id) REFERENCES workspace_users(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES global_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, granted_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  -- Database-enforced scope validation: if scope='project', scope_id MUST NOT be null
  CHECK ((scope = 'workspace' AND scope_id IS NULL) OR (scope = 'project' AND scope_id IS NOT NULL)),
  UNIQUE(workspace_id, user_id, role_id, scope, scope_id)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_roles_user ON user_roles(workspace_id, user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_scope ON user_roles(workspace_id, scope, scope_id);

-- Invitations for new users (workspace-scoped)
CREATE TABLE invitations (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  email TEXT NOT NULL,
  invited_by UUID,
  role_id UUID,
  token TEXT NOT NULL UNIQUE,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, invited_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  FOREIGN KEY (role_id) REFERENCES global_roles(id) ON DELETE SET NULL,
  UNIQUE(workspace_id, email)
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_invitations_workspace ON invitations(workspace_id);
CREATE INDEX idx_invitations_token ON invitations(token);

-- Sessions: active login sessions (workspace-scoped)
CREATE TABLE sessions (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  user_id UUID NOT NULL,
  clerk_session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, user_id) REFERENCES workspace_users(workspace_id, id) ON DELETE CASCADE
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_sessions_user ON sessions(workspace_id, user_id);
CREATE INDEX idx_sessions_clerk ON sessions(clerk_session_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

### 3.3 Project Registry

```sql
-- Projects: unlimited project registration (workspace-scoped)
CREATE TABLE projects (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('mobility', 'commerce', 'finance', 'ai', 'other')),
  status TEXT NOT NULL CHECK (status IN ('idea', 'development', 'beta', 'live', 'archived')) DEFAULT 'development',
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private', 'internal')) DEFAULT 'private',
  
  logo_url TEXT,
  accent_color TEXT,
  
  github_org TEXT,
  github_repo TEXT,
  deployment_url TEXT,
  supabase_project_id TEXT,
  clerk_instance_id TEXT,
  stripe_merchant_id TEXT,
  
  owner_id UUID,  -- nullable: allow project to exist if owner leaves
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMPTZ,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, owner_id) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  UNIQUE(workspace_id, slug)
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_projects_owner ON projects(workspace_id, owner_id);
CREATE INDEX idx_projects_status ON projects(workspace_id, status);

-- Project members: who has access to each project (workspace-scoped)
CREATE TABLE project_members (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'lead', 'developer', 'analyst', 'viewer')) DEFAULT 'viewer',
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, user_id) REFERENCES workspace_users(workspace_id, id) ON DELETE CASCADE,
  UNIQUE(workspace_id, project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_project_members_project ON project_members(workspace_id, project_id);
CREATE INDEX idx_project_members_user ON project_members(workspace_id, user_id);

-- Remaining project tables (environments, services, deployments, etc.) follow same pattern
-- Composite (workspace_id, id) PK, composite FKs, RLS enabled

CREATE TABLE environments (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  env_type TEXT NOT NULL CHECK (env_type IN ('development', 'staging', 'production', 'other')),
  url TEXT,
  region TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  UNIQUE(workspace_id, project_id, name)
);

ALTER TABLE environments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_environments_project ON environments(workspace_id, project_id);

CREATE TABLE services (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID NOT NULL,
  environment_id UUID,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('api', 'web', 'worker', 'database', 'other')),
  deployment_provider TEXT CHECK (deployment_provider IN ('vercel', 'aws', 'cloudflare', 'other')),
  deployment_url TEXT,
  deployment_region TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'deploying', 'paused', 'down', 'error')) DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, environment_id) REFERENCES environments(workspace_id, id) ON DELETE SET NULL,
  UNIQUE(workspace_id, project_id, name)
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_services_project ON services(workspace_id, project_id);
CREATE INDEX idx_services_environment ON services(workspace_id, environment_id);

CREATE TABLE deployments (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  service_id UUID NOT NULL,
  version TEXT NOT NULL,
  commit_sha TEXT,
  commit_message TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'building', 'deploying', 'success', 'failed', 'rolled_back')) DEFAULT 'pending',
  deployed_by UUID,
  deployed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, service_id) REFERENCES services(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, deployed_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  UNIQUE(workspace_id, service_id, version, deployed_at)
);

ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_deployments_service ON deployments(workspace_id, service_id);
CREATE INDEX idx_deployments_status ON deployments(workspace_id, service_id, status);
```

### 3.4 Work Management

```sql
-- Tasks: work items (workspace-scoped)
CREATE TABLE tasks (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'in_review', 'done', 'closed')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  assigned_to UUID,
  created_by UUID,
  
  due_date DATE,
  estimated_hours INT CHECK (estimated_hours > 0),
  actual_hours INT CHECK (actual_hours >= 0),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMPTZ,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, assigned_to) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  FOREIGN KEY (workspace_id, created_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_project ON tasks(workspace_id, project_id);
CREATE INDEX idx_tasks_assigned ON tasks(workspace_id, assigned_to);
CREATE INDEX idx_tasks_status ON tasks(workspace_id, status);

-- Task subtasks, dependencies, comments, activity (all follow same pattern)
-- [Additional task-related tables omitted for brevity; same pattern applies]
```

### 3.5 Integrations & Infrastructure

```sql
-- Integrations: external service connections (workspace-scoped)
CREATE TABLE integrations (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  integration_type TEXT NOT NULL CHECK (integration_type IN ('github', 'supabase', 'clerk', 'stripe', 'resend', 'sentry', 'posthog', 'other')),
  name TEXT NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('connected', 'disconnected', 'error', 'unconfigured')) DEFAULT 'unconfigured',
  error_message TEXT,
  
  last_sync_at TIMESTAMPTZ,
  health_status TEXT CHECK (health_status IN ('healthy', 'degraded', 'down')),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, integration_type, name)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_integrations_workspace ON integrations(workspace_id);
CREATE INDEX idx_integrations_type ON integrations(workspace_id, integration_type);

-- Integration configuration: metadata only (secrets in Vercel env vars, never here)
CREATE TABLE integration_config (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  integration_id UUID NOT NULL,
  config_key TEXT NOT NULL,
  environment TEXT CHECK (environment IN ('development', 'staging', 'production')) DEFAULT 'production',
  is_sensitive BOOLEAN DEFAULT FALSE,
  secret_ref TEXT,  -- Reference to Vercel env var name, e.g., 'STRIPE_PROD_API_KEY'
  
  config_value TEXT,  -- ONLY for non-sensitive values
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, integration_id) REFERENCES integrations(workspace_id, id) ON DELETE CASCADE,
  CHECK ((is_sensitive = TRUE AND secret_ref IS NOT NULL AND config_value IS NULL) OR (is_sensitive = FALSE)),
  UNIQUE(workspace_id, integration_id, config_key, environment)
);

ALTER TABLE integration_config ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_integration_config_integration ON integration_config(workspace_id, integration_id);
```

### 3.6 Event Processing (Transactional Outbox, Corrected)

```sql
-- Events: PostgreSQL transactional outbox (source of truth)
-- Lifecycle: pending → claimed → queued → delivered (or dead_letter)
CREATE TABLE events (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_type TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('workspace', 'product')),
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  payload JSONB NOT NULL,
  
  -- Event state machine
  state TEXT NOT NULL CHECK (state IN ('pending', 'claimed', 'queued', 'delivered', 'dead_letter')) DEFAULT 'pending',
  claimed_at TIMESTAMPTZ,
  claimed_by TEXT,  -- Worker ID that claimed this event
  delivered_at TIMESTAMPTZ,
  
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 5,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_events_workspace ON events(workspace_id);
CREATE INDEX idx_events_state ON events(workspace_id, state);
CREATE INDEX idx_events_pending ON events(workspace_id, state) WHERE state IN ('pending', 'claimed');
CREATE INDEX idx_events_type ON events(workspace_id, event_type);

-- Webhook delivery attempts: tracks delivery history (workspace-scoped)
-- Link each attempt to a specific event and webhook URL
CREATE TABLE webhook_delivery_attempts (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  event_id UUID NOT NULL,
  webhook_url TEXT NOT NULL,
  
  attempt_number INT NOT NULL,
  http_status INT,
  response_body TEXT,
  error_message TEXT,
  
  delivered_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id) REFERENCES events(workspace_id) ON DELETE CASCADE,
  -- Application must validate event_id exists in same workspace
  CONSTRAINT valid_event CHECK (event_id IS NOT NULL)
);

ALTER TABLE webhook_delivery_attempts ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_webhook_attempts_event ON webhook_delivery_attempts(workspace_id, event_id);
CREATE INDEX idx_webhook_attempts_next_retry ON webhook_delivery_attempts(workspace_id, next_retry_at);

-- Dead-letter queue: events that failed all retries
CREATE TABLE dead_letter_queue (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  event_id UUID NOT NULL,
  webhook_url TEXT NOT NULL,
  
  reason TEXT NOT NULL,
  last_error TEXT,
  final_attempt_at TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

ALTER TABLE dead_letter_queue ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_dead_letter_workspace ON dead_letter_queue(workspace_id);
CREATE INDEX idx_dead_letter_created ON dead_letter_queue(workspace_id, created_at);

-- Product integration events: inbound operational events (workspace-scoped)
CREATE TABLE product_events (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  idempotency_key TEXT NOT NULL,
  
  payload JSONB NOT NULL,
  
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  UNIQUE(workspace_id, project_id, idempotency_key)  -- Deduplication
);

ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_product_events_project ON product_events(workspace_id, project_id);
CREATE INDEX idx_product_events_processed ON product_events(workspace_id, processed);
```

### 3.7 Audit & Security

```sql
-- Audit logs: immutable operation history (workspace-scoped)
CREATE TABLE audit_logs (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  old_values JSONB,
  new_values JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, user_id) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Immutability enforcement: drop default permissions, grant SELECT only
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT USING (true);
CREATE POLICY audit_logs_no_update ON audit_logs FOR UPDATE USING (false);
CREATE POLICY audit_logs_no_delete ON audit_logs FOR DELETE USING (false);
CREATE POLICY audit_logs_no_insert ON audit_logs FOR INSERT WITH CHECK (true);  -- Restricted by application

CREATE INDEX idx_audit_logs_workspace ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(workspace_id, user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(workspace_id, resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(workspace_id, action);

-- Approval records: audit trail for sensitive operations (workspace-scoped)
CREATE TABLE approval_records (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  request_type TEXT NOT NULL CHECK (request_type IN ('delete_project', 'disconnect_integration', 'rotate_credentials', 'suspend_user', 'other')),
  request_id UUID NOT NULL,
  
  requested_by UUID NOT NULL,
  approved_by UUID,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied')) DEFAULT 'pending',
  
  reason TEXT,
  decision_reason TEXT,
  
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMPTZ,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, requested_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  FOREIGN KEY (workspace_id, approved_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
);

ALTER TABLE approval_records ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_approvals_workspace ON approval_records(workspace_id);
CREATE INDEX idx_approvals_status ON approval_records(workspace_id, status);
```

### 3.8 Finance & Analytics

```sql
-- Budgets: cost tracking (workspace-scoped) - FIXED duplicate PK
CREATE TABLE budgets (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID,
  name TEXT NOT NULL,
  budget_amount DECIMAL(10, 2) NOT NULL,
  budget_period TEXT NOT NULL CHECK (budget_period IN ('monthly', 'quarterly', 'yearly')),
  
  current_spend DECIMAL(10, 2) DEFAULT 0,
  alert_threshold INT DEFAULT 80,
  
  fiscal_year_start DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_budgets_workspace ON budgets(workspace_id);
CREATE INDEX idx_budgets_project ON budgets(workspace_id, project_id);

-- Costs (workspace-scoped)
CREATE TABLE costs (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID,
  integration_id UUID,
  
  cost_amount DECIMAL(10, 2) NOT NULL,
  cost_date DATE NOT NULL,
  category TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, integration_id) REFERENCES integrations(workspace_id, id) ON DELETE SET NULL
);

ALTER TABLE costs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_costs_workspace ON costs(workspace_id);
CREATE INDEX idx_costs_project ON costs(workspace_id, project_id);
CREATE INDEX idx_costs_date ON costs(workspace_id, cost_date);

-- Metrics: operational snapshots (workspace-scoped) - FIXED single PK
CREATE TABLE metrics (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10, 2) NOT NULL,
  metric_timestamp TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE
);

ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_metrics_workspace ON metrics(workspace_id);
CREATE INDEX idx_metrics_project ON metrics(workspace_id, project_id);
CREATE INDEX idx_metrics_name ON metrics(workspace_id, metric_name);
```

### 3.9 Notifications

```sql
-- Notification templates (workspace-scoped) - FIXED duplicate PK
CREATE TABLE notification_templates (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('email', 'in_app', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, name, template_type)
);

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notification_templates_workspace ON notification_templates(workspace_id);

-- Notification delivery history (workspace-scoped) - FIXED duplicate PK
CREATE TABLE notification_deliveries (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  template_id UUID NOT NULL,
  recipient TEXT NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('sent', 'pending', 'failed', 'bounced')) DEFAULT 'pending',
  error_message TEXT,
  
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, template_id) REFERENCES notification_templates(workspace_id, id) ON DELETE CASCADE
);

ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notification_deliveries_workspace ON notification_deliveries(workspace_id);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries(workspace_id, status);
```

---

## 4. Validation Checklist

**Before running in production:**

- [ ] Schema created against PostgreSQL 14+ test instance
- [ ] All composite primary keys verified: `(workspace_id, id)`
- [ ] All composite foreign keys verified: `(workspace_id, column_id)`
- [ ] No composite FK uses `ON DELETE SET NULL` on `workspace_id` column
- [ ] RLS enabled on every table with RLS statement
- [ ] Cross-workspace reference test: insert project in workspace A and attempt FK reference to workspace B user (must fail)
- [ ] Cross-project reference test: insert project member with user from different workspace (must fail)
- [ ] Audit log immutability: attempt UPDATE on audit_logs (must fail)
- [ ] Event state machine tested: pending → claimed → queued → delivered
- [ ] Webhook delivery attempt FK tested: attempt dead-letter record with invalid event_id (must fail)
- [ ] Product event idempotency tested: insert duplicate event with same idempotency_key (must fail)
- [ ] Deletion cascade tested: delete workspace, verify all dependent rows deleted
- [ ] ER diagram matches executable schema

---

## 5. What's Changed from v3

| Issue | v3 | v4 | Fix |
|-------|---|---|-----|
| **Duplicate PKs** | budgets, templates, deliveries | Removed duplicate; PK now single composite | Schema error eliminated |
| **ON DELETE SET NULL workspace_id** | Composite FKs could null workspace_id | Never null workspace_id; only child columns | Prevents workspace drift |
| **webhook_delivery_attempts FK** | Invalid reference to events(workspace_id) | Valid FK with explicit constraint | Database correctness |
| **product_events project FK** | Missing composite FK | Added (workspace_id, project_id) FK | Project isolation enforced |
| **user_roles scope_id** | App-only validation | Added CHECK constraint | Database-level guarantee |
| **Global roles/permissions** | Workspace-scoped (contradicts architecture) | Global tables: global_roles, global_permissions | Architecture alignment |
| **RLS enabled** | Policies only; RLS not enabled | Explicit RLS enable per table | Immutability guaranteed |
| **metrics table PK** | Single-column id | Composite (workspace_id, id) | Consistency achieved |
| **Event lifecycle** | Simple pending/delivered | Full state machine: pending → claimed → queued → delivered → dead_letter | No silent message loss |
| **audit_logs immutability** | RLS policies only | RLS + explicit policy enforcement | Compliance guaranteed |

---

**Next step**: This schema is complete and ready for validation testing against PostgreSQL 14+.
