# RouteMaster Company Workspace — Database & ERD v2

**Version**: 2026-11-19-v2  
**Authority For**: Table schemas, migrations, relationships, data types, indexes, constraints  
**Referenced By**: API contracts, security RLS policies, operations procedures  

---

## 1. Database Principles

- **PostgreSQL 14+**: Strong ACID guarantees, JSON support, row-level security
- **Supabase-hosted**: Managed backups, monitoring, automatic updates
- **Workspace-scoped**: Every table includes `workspace_id` for multi-workspace isolation
- **Explicit relationships**: Foreign keys with defined deletion policies
- **Searchable**: Appropriate indexes for common queries and foreign-key lookups
- **Audit-ready**: `created_at`, `updated_at`, `created_by`, `updated_by` on most tables
- **Soft deletes**: Where needed, use `archived_at` instead of hard delete
- **UUIDs for PKs**: `gen_random_uuid()` default for all primary keys
- **TIMESTAMPTZ**: All timestamps stored as `TIMESTAMPTZ` with UTC default

---

## 2. Database Schema

### 2.1 Workspace & Company Foundation

```sql
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, feature_key)
);

CREATE INDEX idx_workspace_features_key ON workspace_features(workspace_id, feature_key);
```

### 2.2 Users & Access Control

```sql
-- Workspace users (workspace-scoped)
CREATE TABLE workspace_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  clerk_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'invited', 'suspended')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, email),
  UNIQUE(workspace_id, clerk_id)
);

CREATE INDEX idx_workspace_users_workspace ON workspace_users(workspace_id);
CREATE INDEX idx_workspace_users_clerk ON workspace_users(clerk_id);

-- Teams within workspace
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  parent_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_workspace ON teams(workspace_id);

-- Team membership
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES workspace_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'lead', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- Roles: workspace-scoped permissions
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  is_system BOOLEAN DEFAULT FALSE,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, name)
);

CREATE INDEX idx_roles_workspace ON roles(workspace_id);

-- User roles: workspace-scoped and project-scoped
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES workspace_users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  scope TEXT NOT NULL CHECK (scope IN ('workspace', 'project')),
  scope_id UUID,
  granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  UNIQUE(user_id, role_id, scope, scope_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_scope ON user_roles(scope, scope_id);

-- Permissions: atomic permission records
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, permission_key)
);

CREATE INDEX idx_permissions_workspace ON permissions(workspace_id);

-- Invitations for new users
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES workspace_users(id) ON DELETE SET NULL,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, email)
);

CREATE INDEX idx_invitations_workspace ON invitations(workspace_id);
CREATE INDEX idx_invitations_token ON invitations(token);

-- Sessions (tracks active login sessions)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES workspace_users(id) ON DELETE CASCADE,
  clerk_session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_clerk ON sessions(clerk_session_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

### 2.3 Project Registry

```sql
-- Projects: unlimited project registration
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('mobility', 'commerce', 'finance', 'ai', 'other')),
  status TEXT NOT NULL CHECK (status IN ('idea', 'development', 'beta', 'live', 'archived')) DEFAULT 'development',
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private', 'internal')) DEFAULT 'private',
  
  -- Branding
  logo_url TEXT,
  accent_color TEXT,
  
  -- References (read-only, metadata only)
  github_org TEXT,
  github_repo TEXT,
  deployment_url TEXT,
  supabase_project_id TEXT,
  clerk_instance_id TEXT,
  stripe_merchant_id TEXT,
  
  -- Ownership
  owner_id UUID NOT NULL REFERENCES workspace_users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMPTZ,
  
  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(workspace_id, status);

-- Project members: who has access to each project
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES workspace_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'lead', 'developer', 'analyst', 'viewer')) DEFAULT 'viewer',
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- Project versions: release history
CREATE TABLE project_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  release_date TIMESTAMPTZ NOT NULL,
  changelog TEXT,
  created_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, version_number)
);

CREATE INDEX idx_project_versions_project ON project_versions(project_id);

-- Repositories: GitHub or other VCS references
CREATE TABLE repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  vcs_type TEXT NOT NULL CHECK (vcs_type IN ('github', 'gitlab', 'gitea', 'other')) DEFAULT 'github',
  branch TEXT DEFAULT 'main',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, name)
);

CREATE INDEX idx_repositories_project ON repositories(project_id);

-- Environments: dev, staging, production references
CREATE TABLE environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  env_type TEXT NOT NULL CHECK (env_type IN ('development', 'staging', 'production', 'other')),
  url TEXT,
  region TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, name)
);

CREATE INDEX idx_environments_project ON environments(project_id);

-- Services: deployed applications or microservices
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  environment_id UUID REFERENCES environments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('api', 'web', 'worker', 'database', 'other')),
  deployment_provider TEXT CHECK (deployment_provider IN ('vercel', 'aws', 'cloudflare', 'other')),
  deployment_url TEXT,
  deployment_region TEXT,
  status TEXT NOT NULL CHECK (status IN ('running', 'deploying', 'paused', 'down', 'error')) DEFAULT 'running',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, name)
);

CREATE INDEX idx_services_project ON services(project_id);
CREATE INDEX idx_services_environment ON services(environment_id);

-- Deployments: deployment history per service
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  commit_sha TEXT,
  commit_message TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'building', 'deploying', 'success', 'failed', 'rolled_back')) DEFAULT 'pending',
  deployed_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  deployed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_id, version, deployed_at)
);

CREATE INDEX idx_deployments_service ON deployments(service_id);
CREATE INDEX idx_deployments_status ON deployments(service_id, status);
```

### 2.4 Work Management

```sql
-- Tasks: work items with dependencies and assignments
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'in_review', 'done', 'closed')) DEFAULT 'open',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  assigned_to UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES workspace_users(id) ON DELETE SET NULL,
  
  due_date DATE,
  estimated_hours INT CHECK (estimated_hours > 0),
  actual_hours INT CHECK (actual_hours >= 0),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(workspace_id, status);

-- Task subtasks
CREATE TABLE task_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'done')) DEFAULT 'open',
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_subtasks_task ON task_subtasks(task_id);

-- Task dependencies
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CHECK (task_id <> depends_on_task_id)
);

CREATE INDEX idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- Task comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES workspace_users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_task_comments_user ON task_comments(user_id);

-- Task activity: immutable change log
CREATE TABLE task_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES workspace_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_activity_task ON task_activity(task_id);

-- Documentation: specs, architecture, runbooks
CREATE TABLE documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('spec', 'architecture', 'api', 'runbook', 'decision', 'other')),
  
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  
  owner_id UUID NOT NULL REFERENCES workspace_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMPTZ,
  
  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_documentation_workspace ON documentation(workspace_id);
CREATE INDEX idx_documentation_project ON documentation(project_id);

-- Document versions: change history
CREATE TABLE doc_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES documentation(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doc_id, version_number)
);

CREATE INDEX idx_doc_versions_doc ON doc_versions(doc_id);

-- Document access control
CREATE TABLE doc_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID NOT NULL REFERENCES documentation(id) ON DELETE CASCADE,
  user_id UUID REFERENCES workspace_users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'comment', 'edit', 'admin')),
  granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  CHECK (user_id IS NOT NULL OR role_id IS NOT NULL)
);

CREATE INDEX idx_doc_access_doc ON doc_access(doc_id);
```

### 2.5 Support & Incidents

```sql
-- Support tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  ticket_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  
  reporter_name TEXT,
  reporter_email TEXT,
  
  assigned_to UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_tickets_workspace ON support_tickets(workspace_id);
CREATE INDEX idx_tickets_project ON support_tickets(project_id);
CREATE INDEX idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX idx_tickets_status ON support_tickets(workspace_id, status);

-- Ticket comments
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES workspace_users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(ticket_id);

-- Incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'high',
  status TEXT NOT NULL CHECK (status IN ('detected', 'investigating', 'mitigating', 'resolved', 'postmortem_pending', 'closed')) DEFAULT 'detected',
  
  started_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  
  commander_id UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidents_workspace ON incidents(workspace_id);
CREATE INDEX idx_incidents_project ON incidents(project_id);
CREATE INDEX idx_incidents_status ON incidents(workspace_id, status);

-- Incident timeline
CREATE TABLE incident_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  created_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incident_timeline_incident ON incident_timeline(incident_id);

-- Incident postmortems
CREATE TABLE incident_postmortems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  lessons_learned JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  
  created_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(incident_id)
);

CREATE INDEX idx_incident_postmortems_incident ON incident_postmortems(incident_id);

-- FAQ and knowledge base
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  
  created_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_knowledge_base_workspace ON knowledge_base(workspace_id);
CREATE INDEX idx_knowledge_base_project ON knowledge_base(project_id);
```

### 2.6 Integrations & Infrastructure

```sql
-- Integrations: external service connections
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  integration_type TEXT NOT NULL CHECK (integration_type IN ('github', 'supabase', 'clerk', 'stripe', 'resend', 'sentry', 'posthog', 'other')),
  name TEXT NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('connected', 'disconnected', 'error', 'unconfigured')) DEFAULT 'unconfigured',
  error_message TEXT,
  
  last_sync_at TIMESTAMPTZ,
  health_status TEXT CHECK (health_status IN ('healthy', 'degraded', 'down')),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, integration_type, name)
);

CREATE INDEX idx_integrations_workspace ON integrations(workspace_id);
CREATE INDEX idx_integrations_type ON integrations(integration_type);

-- Integration configuration (secrets reference only, not values)
CREATE TABLE integration_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  
  config_key TEXT NOT NULL,
  config_value TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  environment TEXT CHECK (environment IN ('development', 'staging', 'production', 'all')) DEFAULT 'all',
  
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(integration_id, config_key, environment)
);

CREATE INDEX idx_integration_config_integration ON integration_config(integration_id);

-- Project integrations: which integrations each project uses
CREATE TABLE project_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, integration_id)
);

CREATE INDEX idx_project_integrations_project ON project_integrations(project_id);
CREATE INDEX idx_project_integrations_integration ON project_integrations(integration_id);

-- Webhook events: inbound webhooks from external services
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL,
  webhook_id TEXT,
  signature TEXT,
  payload JSONB NOT NULL,
  
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_webhook_events_integration ON webhook_events(integration_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(workspace_id, processed);
```

### 2.7 Finance & Costs

```sql
-- Project budgets
CREATE TABLE project_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  monthly_budget NUMERIC(12, 2),
  fiscal_year INT,
  currency TEXT DEFAULT 'USD',
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, fiscal_year)
);

CREATE INDEX idx_project_budgets_project ON project_budgets(project_id);

-- Cost entries: individual costs
CREATE TABLE cost_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  cost_type TEXT NOT NULL CHECK (cost_type IN ('infrastructure', 'subscription', 'service', 'other')),
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  
  date_incurred DATE NOT NULL,
  integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cost_entries_workspace ON cost_entries(workspace_id);
CREATE INDEX idx_cost_entries_project ON cost_entries(project_id);
CREATE INDEX idx_cost_entries_date ON cost_entries(date_incurred);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  
  provider TEXT NOT NULL,
  plan TEXT,
  monthly_cost NUMERIC(12, 2) NOT NULL CHECK (monthly_cost >= 0),
  currency TEXT DEFAULT 'USD',
  
  starts_at DATE NOT NULL,
  renews_at DATE NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('active', 'suspended', 'cancelled')) DEFAULT 'active',
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, provider, plan)
);

CREATE INDEX idx_subscriptions_workspace ON subscriptions(workspace_id);
CREATE INDEX idx_subscriptions_renews ON subscriptions(renews_at);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'USD',
  
  issued_at DATE NOT NULL,
  due_at DATE NOT NULL,
  paid_at DATE,
  
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue')) DEFAULT 'draft',
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_workspace ON invoices(workspace_id);
CREATE INDEX idx_invoices_status ON invoices(workspace_id, status);
```

### 2.8 Notifications

```sql
-- Notification templates
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, name, channel)
);

CREATE INDEX idx_notification_templates_workspace ON notification_templates(workspace_id);

-- Notifications: sent notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  recipient_id UUID REFERENCES workspace_users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
  
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  
  provider_message_id TEXT,
  
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_workspace ON notifications(workspace_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_status ON notifications(workspace_id, status);

-- Notification delivery attempts
CREATE TABLE notification_delivery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  
  attempt_number INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'retrying')) DEFAULT 'sent',
  error_code TEXT,
  error_message TEXT,
  
  next_retry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_attempts_notification ON notification_delivery_attempts(notification_id);

-- Notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES workspace_users(id) ON DELETE CASCADE,
  
  notification_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app', 'sms')),
  enabled BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, notification_type, channel)
);

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

-- Alert rules: automated alerts
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  condition TEXT NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]',
  
  enabled BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alert_rules_workspace ON alert_rules(workspace_id);
CREATE INDEX idx_alert_rules_project ON alert_rules(project_id);
```

### 2.9 Workflows & Events

```sql
-- Workflows: automated sequences
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL,
  trigger_condition TEXT,
  actions JSONB NOT NULL DEFAULT '[]',
  
  enabled BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_workspace ON workflows(workspace_id);
CREATE INDEX idx_workflows_project ON workflows(project_id);

-- Workflow runs: execution history
CREATE TABLE workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'succeeded', 'failed')) DEFAULT 'pending',
  trigger_data JSONB,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_runs_workflow ON workflow_runs(workflow_id);
CREATE INDEX idx_workflow_runs_status ON workflow_runs(workflow_id, status);

-- Workflow approvals
CREATE TABLE workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  
  requested_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMPTZ,
  UNIQUE(workflow_run_id)
);

CREATE INDEX idx_workflow_approvals_run ON workflow_approvals(workflow_run_id);

-- Events: durable event log for event-driven processing
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  payload JSONB NOT NULL,
  
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_events_workspace ON events(workspace_id);
CREATE INDEX idx_events_type ON events(workspace_id, event_type);
CREATE INDEX idx_events_processed ON events(workspace_id, processed);
CREATE INDEX idx_events_expires ON events(expires_at);
```

### 2.10 Audit & Security

```sql
-- Audit logs: immutable operation history
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  user_id UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  old_values JSONB,
  new_values JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_workspace ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Approval records: who approved what and when
CREATE TABLE approval_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  request_type TEXT NOT NULL,
  request_id UUID,
  request_data JSONB,
  
  requested_by UUID NOT NULL REFERENCES workspace_users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  rejected_by UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMPTZ
);

CREATE INDEX idx_approval_records_workspace ON approval_records(workspace_id);
CREATE INDEX idx_approval_records_status ON approval_records(workspace_id, status);

-- Secrets metadata: credential references only
CREATE TABLE secrets_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  
  secret_name TEXT NOT NULL,
  secret_type TEXT NOT NULL CHECK (secret_type IN ('api_key', 'token', 'password', 'connection_string', 'other')),
  
  environment TEXT DEFAULT 'all',
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  last_rotated_at TIMESTAMPTZ,
  rotation_schedule TEXT,
  UNIQUE(workspace_id, secret_name, environment)
);

CREATE INDEX idx_secrets_metadata_workspace ON secrets_metadata(workspace_id);
CREATE INDEX idx_secrets_metadata_integration ON secrets_metadata(integration_id);

-- Security events: anomalies and threats
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL CHECK (event_type IN ('suspicious_login', 'failed_auth', 'permission_change', 'secret_access', 'api_abuse')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  description TEXT NOT NULL,
  user_id UUID REFERENCES workspace_users(id) ON DELETE SET NULL,
  
  details JSONB,
  
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_events_workspace ON security_events(workspace_id);
CREATE INDEX idx_security_events_severity ON security_events(workspace_id, severity);
CREATE INDEX idx_security_events_resolved ON security_events(workspace_id, resolved);
```

### 2.11 Analytics

```sql
-- Metric definitions: what metrics the workspace tracks
CREATE TABLE metric_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  
  metric_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram')),
  unit TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, metric_key)
);

-- Metric snapshots: aggregated metrics at specific times
CREATE TABLE metric_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  metric_definition_id UUID REFERENCES metric_definitions(id) ON DELETE CASCADE,
  
  metric_value NUMERIC(12, 2),
  
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  period_type TEXT CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metric_snapshots_workspace ON metric_snapshots(workspace_id);
CREATE INDEX idx_metric_snapshots_project ON metric_snapshots(project_id);
CREATE INDEX idx_metric_snapshots_definition ON metric_snapshots(metric_definition_id);
CREATE INDEX idx_metric_snapshots_period ON metric_snapshots(period_start, period_end);
```

---

## 3. Entity Relationship Diagram

```
[workspaces]
    ├── [workspace_features]
    ├── [workspace_users] ──┬──> [teams]
    │                       ├──> [roles]
    │                       ├──> [projects]
    │                       └──> [teams]
    ├── [teams] ──────────> [team_members] ──> [workspace_users]
    ├── [projects] ────┬──> [project_members] ──> [workspace_users]
    │                  ├──> [repositories]
    │                  ├──> [environments]
    │                  ├──> [services] ──> [deployments]
    │                  └──> [project_integrations]
    ├── [integrations] ─┬──> [integration_config]
    │                   ├──> [webhook_events]
    │                   └──> [project_integrations]
    ├── [tasks] ────┬──> [task_subtasks]
    │               ├──> [task_dependencies]
    │               ├──> [task_comments]
    │               └──> [task_activity]
    ├── [documentation] ─┬──> [doc_versions]
    │                    └──> [doc_access]
    ├── [support_tickets] ──> [ticket_comments]
    ├── [incidents] ────┬──> [incident_timeline]
    │                   └──> [incident_postmortems]
    ├── [knowledge_base]
    ├── [workflows] ────┬──> [workflow_runs]
    │                   └──> [events]
    ├── [notifications] ─┬──> [notification_templates]
    │                    └──> [notification_delivery_attempts]
    ├── [alert_rules]
    ├── [project_budgets]
    ├── [cost_entries]
    ├── [subscriptions]
    ├── [invoices]
    ├── [audit_logs]
    ├── [approval_records]
    ├── [secrets_metadata]
    ├── [security_events]
    └── [metric_snapshots]
```

---

## 4. Data Dictionary

| Table | Purpose | Workspace-scoped | Project-scoped | Key Indexes |
|-------|---------|---|---|---|
| workspaces | Company/workspace records | ROOT | — | slug |
| workspace_features | Feature flags | ✓ | — | workspace_id, feature_key |
| workspace_users | Users in workspace | ✓ | — | email, clerk_id |
| teams | Team organization | ✓ | — | workspace_id |
| team_members | Team membership | ✓ | — | team_id, user_id |
| roles | Permissions groupings | ✓ | — | workspace_id, name |
| user_roles | User → role assignments | ✓ | ✓ | user_id, scope |
| permissions | Atomic permissions | ✓ | — | workspace_id, permission_key |
| invitations | User invites | ✓ | — | workspace_id, email, token |
| sessions | Active login sessions | ✓ | — | user_id, expires_at |
| projects | Registered projects | ✓ | — | workspace_id, slug, status |
| project_members | Project access | ✓ | ✓ | project_id, user_id |
| project_versions | Release history | ✓ | ✓ | project_id, version_number |
| repositories | VCS references | — | ✓ | project_id |
| environments | Deployment targets | — | ✓ | project_id, name |
| services | Deployed apps | — | ✓ | project_id, environment_id |
| deployments | Deployment history | — | ✓ | service_id, status |
| tasks | Work items | ✓ | ✓ | workspace_id, project_id, status |
| task_subtasks | Task breakdown | — | — | task_id |
| task_dependencies | Task relationships | — | — | task_id |
| task_comments | Comments on tasks | — | — | task_id, user_id |
| task_activity | Task change log | — | — | task_id |
| documentation | Specs/runbooks | ✓ | ✓ | workspace_id, slug |
| doc_versions | Doc versions | — | — | doc_id, version_number |
| doc_access | Doc permissions | — | — | doc_id, user_id |
| support_tickets | Help desk tickets | ✓ | ✓ | workspace_id, ticket_number |
| ticket_comments | Comments on tickets | — | — | ticket_id |
| incidents | Operational incidents | ✓ | ✓ | workspace_id, status |
| incident_timeline | Incident log | — | — | incident_id |
| incident_postmortems | Post-mortem reports | — | — | incident_id |
| knowledge_base | FAQs | ✓ | ✓ | workspace_id, category |
| integrations | Service connections | ✓ | — | workspace_id, integration_type |
| integration_config | Integration settings | — | — | integration_id |
| project_integrations | Project uses integration | — | ✓ | project_id |
| webhook_events | Incoming webhooks | — | — | integration_id, processed |
| project_budgets | Project budgets | — | ✓ | project_id, fiscal_year |
| cost_entries | Individual costs | ✓ | ✓ | workspace_id, date_incurred |
| subscriptions | Service subscriptions | ✓ | — | workspace_id, provider |
| invoices | Billing invoices | ✓ | — | workspace_id, status |
| notification_templates | Alert templates | ✓ | — | workspace_id, name |
| notifications | Sent notifications | ✓ | — | workspace_id, recipient_id |
| notification_delivery_attempts | Delivery history | — | — | notification_id |
| notification_preferences | User alert settings | — | — | user_id |
| alert_rules | Automated alerts | ✓ | ✓ | workspace_id, enabled |
| workflows | Automation sequences | ✓ | ✓ | workspace_id |
| workflow_runs | Automation history | — | — | workflow_id, status |
| workflow_approvals | Approval tracking | — | — | workflow_run_id |
| events | Event log | ✓ | ✓ | workspace_id, event_type |
| audit_logs | Action history | ✓ | — | workspace_id, resource_type |
| approval_records | Decision tracking | ✓ | — | workspace_id, status |
| secrets_metadata | Credential references | ✓ | — | workspace_id, integration_id |
| security_events | Security incidents | ✓ | — | workspace_id, severity |
| metric_definitions | Metrics catalog | ✓ | — | workspace_id, metric_key |
| metric_snapshots | Metric values | ✓ | ✓ | workspace_id, period_start |

---

## 5. Migration Strategy

**Phase 1: Foundation** (1 week)
- Create all workspace, user, role, permission, and team tables
- Create all indexes
- Apply RLS policies (see `2026-11-19-company-workspace-v2-security.md`)
- Test isolation with parallel queries

**Phase 2: Projects & Operations** (1 week)
- Create projects, repositories, environments, services, deployments
- Create workflows, events, notifications
- Create tasks, documentation, support tables

**Phase 3: Governance & Analytics** (1 week)
- Create integrations, finance, audit tables
- Create metrics, analytics tables
- Implement retention policies and archival

**Rollback**: Each migration includes `DOWN` procedure to revert.

---

## 6. Constraints & Validation

### Uniqueness Constraints
- `workspaces.slug` — Global unique
- `workspace_users.(workspace_id, email)` — Per-workspace unique
- `projects.(workspace_id, slug)` — Per-workspace unique
- `documentation.(workspace_id, slug)` — Per-workspace unique
- `support_tickets.ticket_number` — Global unique (auto-generated)
- `invitations.(workspace_id, email)` — Per-workspace unique

### Foreign Key Policies
- User deletion: Cascade through tasks, comments, audit logs (preserve history with NULL user_id where appropriate)
- Project deletion: Cascade through project_members, tasks, documentation (not soft-delete, hard delete non-essential data)
- Integration deletion: Cascade through project_integrations, webhook_events (preserve audit_logs)

### Check Constraints
- All `status` and `state` columns use `CHECK` to enforce valid values
- All monetary amounts must be `> 0`
- Timestamps: `created_at` ≤ `updated_at`

---

**Authority**: This document is the definitive schema reference. See `2026-11-19-company-workspace-v2-security.md` for RLS policies that enforce access control.
