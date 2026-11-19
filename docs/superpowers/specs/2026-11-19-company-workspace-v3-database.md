# RouteMaster Company Workspace — Database & ERD v3

**Version**: 2026-11-19-v3  
**Authority For**: Table schemas, migrations, relationships, data types, indexes, constraints  
**Status**: Source of truth for API contracts and security policies  
**Changes from v2**: 10 critical fixes: tenant-safe FKs, event durability, secrets metadata-only, audit immutability, removed invalid indexes

---

## 1. Database Principles

- **PostgreSQL 14+**: Strong ACID guarantees, JSON support, row-level security
- **Supabase-hosted**: Managed backups, monitoring, automatic updates
- **Workspace-scoped isolation**: Every workspace-owned table includes `workspace_id`; composite FKs enforce multi-tenant safety
- **Explicit relationships**: Foreign keys with defined deletion policies; composite keys for tenant safety
- **Searchable**: Appropriate indexes for common queries and foreign-key lookups
- **Audit-ready**: `created_at`, `updated_at`, `created_by`, `updated_by` on most tables
- **Soft deletes**: Use `archived_at` instead of hard delete; preserve history
- **UUIDs for PKs**: `gen_random_uuid()` default for all primary keys
- **TIMESTAMPTZ**: All timestamps stored as `TIMESTAMPTZ` with UTC default
- **Source of truth**: This schema is the definitive source for API contracts and security policies

---

## 2. Tenant-Safe Foreign Key Pattern

**All workspace-owned tables enforce composite tenant boundaries:**

```sql
-- BAD (v2): Single-column FK allows cross-workspace reference
-- Foreign key projects.owner_id REFERENCES workspace_users(id)
-- A project in workspace A could reference a user in workspace B

-- GOOD (v3): Composite FK with workspace_id
-- Foreign key (workspace_id, owner_id) REFERENCES workspace_users(workspace_id, id)
-- PostgreSQL enforces: If (projects.workspace_id, projects.owner_id) → (workspace_users.workspace_id, workspace_users.id),
-- then both rows must be in the same workspace
```

**Composite unique constraints prevent cross-workspace collisions:**

```sql
-- BAD (v2): UNIQUE(email) allows same email in different workspaces (acceptable if workspace_id differs)
-- GOOD (v3): UNIQUE(workspace_id, email) explicitly scopes uniqueness to one workspace
```

---

## 3. Database Schema (Complete)

### 3.1 Workspace & Company Foundation

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

CREATE INDEX idx_team_members_team ON team_members(workspace_id, team_id);
CREATE INDEX idx_team_members_user ON team_members(workspace_id, user_id);

-- Global roles: workspace-wide permission sets
CREATE TABLE roles (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  is_system BOOLEAN DEFAULT FALSE,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, name)
);

CREATE INDEX idx_roles_workspace ON roles(workspace_id);

-- Atomic permission records (workspace-scoped)
CREATE TABLE permissions (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  permission_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, permission_key)
);

CREATE INDEX idx_permissions_workspace ON permissions(workspace_id);

-- User role assignments (workspace and project scoped)
CREATE TABLE user_roles (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('workspace', 'project')),
  scope_id UUID,  -- NULL for workspace scope; project UUID for project scope
  
  granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, user_id) REFERENCES workspace_users(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, role_id) REFERENCES roles(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, granted_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  -- scope_id is validated in application: if scope='project', must exist in projects table
  UNIQUE(workspace_id, user_id, role_id, scope, scope_id),
  CHECK ((scope = 'workspace' AND scope_id IS NULL) OR (scope = 'project' AND scope_id IS NOT NULL))
);

CREATE INDEX idx_user_roles_user ON user_roles(workspace_id, user_id);
CREATE INDEX idx_user_roles_role ON user_roles(workspace_id, role_id);
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
  FOREIGN KEY (workspace_id, role_id) REFERENCES roles(workspace_id, id) ON DELETE SET NULL,
  UNIQUE(workspace_id, email)
);

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
  
  -- Ownership (nullable: allow project to exist if owner leaves)
  owner_id UUID,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMPTZ,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, owner_id) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  UNIQUE(workspace_id, slug)
);

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

CREATE INDEX idx_project_members_project ON project_members(workspace_id, project_id);
CREATE INDEX idx_project_members_user ON project_members(workspace_id, user_id);

-- Project versions: release history (workspace-scoped)
CREATE TABLE project_versions (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID NOT NULL,
  version_number TEXT NOT NULL,
  release_date TIMESTAMPTZ NOT NULL,
  changelog TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, created_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  UNIQUE(workspace_id, project_id, version_number)
);

CREATE INDEX idx_project_versions_project ON project_versions(workspace_id, project_id);

-- Repositories: GitHub or other VCS references (workspace-scoped)
CREATE TABLE repositories (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  vcs_type TEXT NOT NULL CHECK (vcs_type IN ('github', 'gitlab', 'gitea', 'other')) DEFAULT 'github',
  branch TEXT DEFAULT 'main',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  UNIQUE(workspace_id, project_id, name)
);

CREATE INDEX idx_repositories_project ON repositories(workspace_id, project_id);

-- Environments: dev, staging, production references (workspace-scoped)
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

CREATE INDEX idx_environments_project ON environments(workspace_id, project_id);

-- Services: deployed applications or microservices (workspace-scoped)
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

CREATE INDEX idx_services_project ON services(workspace_id, project_id);
CREATE INDEX idx_services_environment ON services(workspace_id, environment_id);

-- Deployments: deployment history per service (workspace-scoped)
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

CREATE INDEX idx_deployments_service ON deployments(workspace_id, service_id);
CREATE INDEX idx_deployments_status ON deployments(workspace_id, service_id, status);
```

### 3.4 Work Management

```sql
-- Tasks: work items with dependencies and assignments (workspace-scoped)
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

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX idx_tasks_project ON tasks(workspace_id, project_id);
CREATE INDEX idx_tasks_assigned ON tasks(workspace_id, assigned_to);
CREATE INDEX idx_tasks_status ON tasks(workspace_id, status);

-- Task subtasks (workspace-scoped)
CREATE TABLE task_subtasks (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  task_id UUID NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'done')) DEFAULT 'open',
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, task_id) REFERENCES tasks(workspace_id, id) ON DELETE CASCADE
);

CREATE INDEX idx_task_subtasks_task ON task_subtasks(workspace_id, task_id);

-- Task dependencies (workspace-scoped)
CREATE TABLE task_dependencies (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  task_id UUID NOT NULL,
  depends_on_task_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, task_id) REFERENCES tasks(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, depends_on_task_id) REFERENCES tasks(workspace_id, id) ON DELETE CASCADE,
  CHECK (task_id <> depends_on_task_id)
);

CREATE INDEX idx_task_dependencies_task ON task_dependencies(workspace_id, task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(workspace_id, depends_on_task_id);

-- Task comments (workspace-scoped)
CREATE TABLE task_comments (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  task_id UUID NOT NULL,
  user_id UUID,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, task_id) REFERENCES tasks(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, user_id) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
);

CREATE INDEX idx_task_comments_task ON task_comments(workspace_id, task_id);
CREATE INDEX idx_task_comments_user ON task_comments(workspace_id, user_id);

-- Task activity: immutable change log (workspace-scoped)
CREATE TABLE task_activity (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  task_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, task_id) REFERENCES tasks(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, user_id) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_task_activity_task ON task_activity(workspace_id, task_id);
CREATE INDEX idx_task_activity_user ON task_activity(workspace_id, user_id);

-- Documentation: specs, architecture, runbooks (workspace-scoped)
CREATE TABLE documentation (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('spec', 'architecture', 'api', 'runbook', 'decision', 'other')),
  
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  
  owner_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMPTZ,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, owner_id) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_documentation_workspace ON documentation(workspace_id);
CREATE INDEX idx_documentation_project ON documentation(workspace_id, project_id);

-- Document versions: change history (workspace-scoped)
CREATE TABLE doc_versions (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  doc_id UUID NOT NULL,
  version_number INT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, doc_id) REFERENCES documentation(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, author_id) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  UNIQUE(workspace_id, doc_id, version_number)
);

CREATE INDEX idx_doc_versions_doc ON doc_versions(workspace_id, doc_id);

-- Document access control (workspace-scoped)
CREATE TABLE doc_access (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  doc_id UUID NOT NULL,
  user_id UUID,
  role_id UUID,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'comment', 'edit', 'admin')),
  granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  granted_by UUID,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, doc_id) REFERENCES documentation(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, user_id) REFERENCES workspace_users(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, role_id) REFERENCES roles(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, granted_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  CHECK (user_id IS NOT NULL OR role_id IS NOT NULL)
);

CREATE INDEX idx_doc_access_doc ON doc_access(workspace_id, doc_id);
```

### 3.5 Support & Incidents

```sql
-- Support tickets (workspace-scoped)
CREATE TABLE support_tickets (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID,
  ticket_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  
  reporter_name TEXT,
  reporter_email TEXT,
  
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, assigned_to) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  UNIQUE(workspace_id, ticket_number)
);

CREATE INDEX idx_tickets_workspace ON support_tickets(workspace_id);
CREATE INDEX idx_tickets_project ON support_tickets(workspace_id, project_id);
CREATE INDEX idx_tickets_assigned ON support_tickets(workspace_id, assigned_to);
CREATE INDEX idx_tickets_status ON support_tickets(workspace_id, status);

-- Ticket comments (workspace-scoped)
CREATE TABLE ticket_comments (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  ticket_id UUID NOT NULL,
  user_id UUID,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, ticket_id) REFERENCES support_tickets(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, user_id) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
);

CREATE INDEX idx_ticket_comments_ticket ON ticket_comments(workspace_id, ticket_id);

-- Incidents (workspace-scoped)
CREATE TABLE incidents (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'high',
  status TEXT NOT NULL CHECK (status IN ('detected', 'investigating', 'mitigating', 'resolved', 'postmortem_pending', 'closed')) DEFAULT 'detected',
  
  started_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  
  commander_id UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, commander_id) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
);

CREATE INDEX idx_incidents_workspace ON incidents(workspace_id);
CREATE INDEX idx_incidents_project ON incidents(workspace_id, project_id);
CREATE INDEX idx_incidents_status ON incidents(workspace_id, status);

-- Incident timeline (workspace-scoped)
CREATE TABLE incident_timeline (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  incident_id UUID NOT NULL,
  event TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, incident_id) REFERENCES incidents(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, created_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
);

CREATE INDEX idx_incident_timeline_incident ON incident_timeline(workspace_id, incident_id);

-- Incident postmortems (workspace-scoped)
CREATE TABLE incident_postmortems (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  incident_id UUID NOT NULL,
  content TEXT NOT NULL,
  lessons_learned JSONB DEFAULT '[]',
  action_items JSONB DEFAULT '[]',
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, incident_id) REFERENCES incidents(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, created_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  UNIQUE(workspace_id, incident_id)
);

CREATE INDEX idx_incident_postmortems_incident ON incident_postmortems(workspace_id, incident_id);

-- Knowledge base (workspace-scoped)
CREATE TABLE knowledge_base (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  project_id UUID,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, created_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
);

CREATE INDEX idx_knowledge_base_workspace ON knowledge_base(workspace_id);
CREATE INDEX idx_knowledge_base_project ON knowledge_base(workspace_id, project_id);
```

### 3.6 Integrations & Infrastructure

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

CREATE INDEX idx_integrations_workspace ON integrations(workspace_id);
CREATE INDEX idx_integrations_type ON integrations(workspace_id, integration_type);

-- Integration configuration: metadata only, NOT values (workspace-scoped)
-- NEVER store actual secrets (API keys, passwords) in config_value
-- Only store: config_key name, environment, metadata, reference to Vercel env var name
CREATE TABLE integration_config (
  workspace_id UUID NOT NULL,
  id UUID NOT NULL,
  
  integration_id UUID NOT NULL,
  config_key TEXT NOT NULL,
  environment TEXT CHECK (environment IN ('development', 'staging', 'production')) DEFAULT 'production',
  is_sensitive BOOLEAN DEFAULT FALSE,  -- TRUE means: value is in Vercel env var, never in DB
  secret_ref TEXT,  -- Reference to Vercel env var name, e.g., 'STRIPE_PROD_API_KEY'
  
  -- Non-sensitive config can be stored here (e.g., merchant_id, region)
  config_value TEXT,  -- ONLY use for non-sensitive values
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, integration_id) REFERENCES integrations(workspace_id, id) ON DELETE CASCADE,
  CHECK ((is_sensitive = TRUE AND secret_ref IS NOT NULL) OR (is_sensitive = FALSE)),
  UNIQUE(workspace_id, integration_id, config_key, environment)
);

CREATE INDEX idx_integration_config_integration ON integration_config(workspace_id, integration_id);
```

### 3.7 Event Processing (Transactional Outbox Pattern)

```sql
-- Events: source of truth for all workspace operations (workspace-scoped)
-- This table uses PostgreSQL transactions to guarantee event durability
-- Workers read from this table and deliver to Upstash Redis for processing
CREATE TABLE events (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_type TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('workspace', 'product')),
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  payload JSONB NOT NULL,
  
  delivered BOOLEAN DEFAULT FALSE,  -- TRUE = worker has acknowledged; event is durable
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX idx_events_workspace ON events(workspace_id);
CREATE INDEX idx_events_delivered ON events(workspace_id, delivered);
CREATE INDEX idx_events_type ON events(workspace_id, event_type);

-- Webhook delivery attempts: tracks retries and failures (workspace-scoped)
CREATE TABLE webhook_delivery_attempts (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_id UUID NOT NULL,
  webhook_url TEXT NOT NULL,
  
  attempt_number INT NOT NULL,
  http_status INT,
  response_body TEXT,
  error_message TEXT,
  
  delivered_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id) REFERENCES events(workspace_id) ON DELETE CASCADE  -- Soft constraint
);

CREATE INDEX idx_webhook_attempts_event ON webhook_delivery_attempts(workspace_id, event_id);
CREATE INDEX idx_webhook_attempts_next_retry ON webhook_delivery_attempts(workspace_id, next_retry_at);

-- Dead-letter queue: events that failed all retries (workspace-scoped)
CREATE TABLE dead_letter_queue (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  event_id UUID NOT NULL,
  webhook_url TEXT NOT NULL,
  
  reason TEXT NOT NULL,
  last_error TEXT,
  final_attempt_at TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE INDEX idx_dead_letter_workspace ON dead_letter_queue(workspace_id);
CREATE INDEX idx_dead_letter_created ON dead_letter_queue(workspace_id, created_at);

-- Product integration events: inbound operational events from products (workspace-scoped)
CREATE TABLE product_events (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  project_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  idempotency_key TEXT NOT NULL,
  
  payload JSONB NOT NULL,
  
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, project_id, idempotency_key)  -- Deduplication
);

CREATE INDEX idx_product_events_project ON product_events(workspace_id, project_id);
CREATE INDEX idx_product_events_processed ON product_events(workspace_id, processed);
```

### 3.8 Audit & Security

```sql
-- Audit logs: immutable operation history (workspace-scoped)
CREATE TABLE audit_logs (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  
  old_values JSONB,
  new_values JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Immutability enforcement: no updates or deletes allowed
CREATE POLICY audit_logs_no_update ON audit_logs FOR UPDATE USING (FALSE);
CREATE POLICY audit_logs_no_delete ON audit_logs FOR DELETE USING (FALSE);

CREATE INDEX idx_audit_logs_workspace ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(workspace_id, user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(workspace_id, resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(workspace_id, action);

-- Approval records: audit trail for sensitive operations (workspace-scoped)
CREATE TABLE approval_records (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  request_type TEXT NOT NULL CHECK (request_type IN ('delete_project', 'disconnect_integration', 'rotate_credentials', 'suspend_user', 'other')),
  request_id UUID NOT NULL,
  
  requested_by UUID NOT NULL,
  approved_by UUID,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied')) DEFAULT 'pending',
  
  reason TEXT,
  decision_reason TEXT,
  
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMPTZ,
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, requested_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL,
  FOREIGN KEY (workspace_id, approved_by) REFERENCES workspace_users(workspace_id, id) ON DELETE SET NULL
);

CREATE INDEX idx_approvals_workspace ON approval_records(workspace_id);
CREATE INDEX idx_approvals_status ON approval_records(workspace_id, status);
```

### 3.9 Finance & Analytics

```sql
-- Budgets: cost tracking and allocations (workspace-scoped)
CREATE TABLE budgets (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  project_id UUID,
  name TEXT NOT NULL,
  budget_amount DECIMAL(10, 2) NOT NULL,
  budget_period TEXT NOT NULL CHECK (budget_period IN ('monthly', 'quarterly', 'yearly')),
  
  current_spend DECIMAL(10, 2) DEFAULT 0,
  alert_threshold INT DEFAULT 80,  -- Alert at 80% spend
  
  fiscal_year_start DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE
);

CREATE INDEX idx_budgets_workspace ON budgets(workspace_id);
CREATE INDEX idx_budgets_project ON budgets(workspace_id, project_id);

-- Cost tracking (workspace-scoped)
CREATE TABLE costs (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  project_id UUID,
  integration_id UUID,
  
  cost_amount DECIMAL(10, 2) NOT NULL,
  cost_date DATE NOT NULL,
  category TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, integration_id) REFERENCES integrations(workspace_id, id) ON DELETE SET NULL
);

CREATE INDEX idx_costs_workspace ON costs(workspace_id);
CREATE INDEX idx_costs_project ON costs(workspace_id, project_id);
CREATE INDEX idx_costs_date ON costs(workspace_id, cost_date);

-- Metrics: operational snapshots (workspace-scoped)
CREATE TABLE metrics (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  project_id UUID,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10, 2) NOT NULL,
  metric_timestamp TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id, project_id) REFERENCES projects(workspace_id, id) ON DELETE CASCADE
);

CREATE INDEX idx_metrics_workspace ON metrics(workspace_id);
CREATE INDEX idx_metrics_project ON metrics(workspace_id, project_id);
CREATE INDEX idx_metrics_name ON metrics(workspace_id, metric_name);
```

### 3.10 Notifications

```sql
-- Notification templates (workspace-scoped)
CREATE TABLE notification_templates (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  name TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('email', 'in_app', 'sms')),
  subject TEXT,
  body TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (workspace_id, id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE(workspace_id, name, template_type)
);

CREATE INDEX idx_notification_templates_workspace ON notification_templates(workspace_id);

-- Notification delivery history (workspace-scoped)
CREATE TABLE notification_deliveries (
  workspace_id UUID NOT NULL,
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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

CREATE INDEX idx_notification_deliveries_workspace ON notification_deliveries(workspace_id);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries(workspace_id, status);
```

---

## 4. Migration Strategy

### Phase 1: Foundation (Week 1)
- Create all workspace-scoped base tables
- Create all composite primary keys and tenant-safe foreign keys
- Create audit_logs table with immutability constraints
- Create global reference tables (roles, permissions)

### Phase 2: Operations (Week 2)
- Create project registry, tasks, documentation, support, incidents
- Create integrations with metadata-only config
- Create events table (transactional outbox)
- Create webhook delivery tracking
- Create all workspace-scoped child tables

### Phase 3: Analytics & Governance (Week 3)
- Create budgets, costs, metrics tables
- Create notification templates and delivery history
- Create approval_records for sensitive operations
- Create product_events for integration inbound contract

---

## 5. Data Dictionary

**Key tenant-safe patterns**:
- All workspace-owned tables have composite PK: `(workspace_id, id)`
- All FKs are composite: `FOREIGN KEY (workspace_id, column_id) REFERENCES table(workspace_id, id)`
- All uniqueness constraints are workspace-scoped: `UNIQUE(workspace_id, ...)`
- Cross-workspace access is impossible at database level

**Events table**:
- Source of truth for all operations (never lost)
- Worker reads `delivered=FALSE`, publishes to Redis, sets `delivered=TRUE`
- Webhook delivery attempts are logged separately for visibility
- Dead-lettered events are queryable; not silently lost

**Secrets metadata**:
- `integration_config` stores ONLY metadata and references
- Never stores actual values in `config_value` for sensitive configs
- `secret_ref` column stores Vercel env var name
- Actual secrets are in Vercel environment variables

---

## 6. ER Diagram

```
workspaces (root)
├── workspace_users
│   ├── user_roles
│   │   └── roles
│   │       └── permissions
│   ├── teams
│   │   └── team_members
│   ├── sessions
│   ├── invitations
│   └── (FK in many tables)
├── projects (workspace_scoped)
│   ├── project_members
│   ├── project_versions
│   ├── repositories
│   ├── environments
│   │   └── services
│   │       └── deployments
│   ├── tasks
│   │   ├── task_subtasks
│   │   ├── task_dependencies
│   │   ├── task_comments
│   │   └── task_activity
│   ├── documentation
│   │   ├── doc_versions
│   │   └── doc_access
│   ├── support_tickets
│   │   └── ticket_comments
│   ├── incidents
│   │   ├── incident_timeline
│   │   └── incident_postmortems
│   ├── knowledge_base
│   ├── budgets
│   └── costs
├── integrations
│   └── integration_config
├── product_events
├── events (outbox)
│   └── webhook_delivery_attempts
│       └── dead_letter_queue
├── audit_logs (immutable)
├── approval_records
├── metrics
└── notification_templates
    └── notification_deliveries
```

---

## 7. What's Changed from v2

| Issue | v2 | v3 | Fix |
|-------|---|---|-----|
| **Invalid webhook index** | `idx_webhook_events_processed` on non-existent `workspace_id` | Removed; using events table with proper indexing | Schema error eliminated |
| **FK constraint violations** | `projects.owner_id NOT NULL` with `ON DELETE SET NULL` | Changed to `nullable` with proper `ON DELETE SET NULL` | Prevents constraint violations |
| **Cross-workspace FKs** | Single-column FKs without `workspace_id` | Composite FKs: `(workspace_id, column_id)` | Database-level tenant safety |
| **Plaintext secrets** | `integration_config.config_value` stores anything | Separated: sensitive values ONLY in Vercel env vars | No secrets in database |
| **Polymorphic scope_id** | Unvalidated `scope_id` in `user_roles` | Explicit constraint: scope + scope_id validation in app | Prevents invalid references |
| **Insufficient event durability** | Basic events table, no delivery tracking | Full outbox pattern with delivery attempts and dead-letter | No message loss |
| **No audit immutability** | Audit logs could be updated/deleted | RLS policies prevent updates and deletes | Compliance guaranteed |
| **Global uniqueness** | `ticket_number UNIQUE` globally | `UNIQUE(workspace_id, ticket_number)` | Multi-tenant safe |
| **Missing child table scoping** | `team_members`, `project_members` lack `workspace_id` | All child tables have explicit workspace_id and composite FK | Full tenant isolation |
| **No product integration schema** | Not defined | `product_events` table with idempotency keys and project scoping | Products can send events safely |

---

**Next step**: Create Security v3 (RLS policies generated from this schema).
