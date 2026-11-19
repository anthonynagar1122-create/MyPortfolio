# RouteMaster Company Workspace — Architecture Design

**Date**: November 19, 2026  
**Status**: Design Review  
**Approval Required**: Yes  
**Replaces**: 2026-11-19-universal-platform-design.md

---

## 1. Intent and Why

RouteMaster operates as a company with multiple products (RouteMaster, Fufaji's, FamilyFinanceOS) and future ventures. Today, there is no unified internal operating environment. The company needs **one centralized workspace** that manages projects, teams, permissions, support, infrastructure, integrations, tasks, documentation, and company operations—independent of which products exist or how they're built.

This workspace is the company's **internal operating system**. Products connect to it, but do not inherit it. Each product retains independent business databases and release cycles.

---

## 2. Goals and Non-Goals

### Goals
- One unified workspace database for all company operations
- Support unlimited projects without schema changes
- Complete transparency: who does what, when, and why (audit trail)
- Centralized access control and permissions
- Support infrastructure (helpdesk, tickets, incidents, documentation)
- Integration and infrastructure management
- Task automation and workflow engine
- Financial tracking and cost allocation
- Real-time notifications and alerting
- Company-wide and project-wise analytics
- Clear separation: workspace operations ≠ product data

### Non-Goals
- Do not build product-specific features in the workspace
- Do not store customer data, orders, transactions, or journeys in the workspace
- Do not force products to use the same technology stack
- Do not create a shared customer database across products

---

## 3. Constraints

- **Host**: Vercel (workspace API and dashboard)
- **Database**: Supabase (workspace database, separate from product databases)
- **Authentication**: Clerk (workspace users and permissions; products may use separate instances)
- **Email**: Resend (workspace notifications and alerts)
- **Storage**: Vercel Blob (documentation, attachments)
- **Monitoring**: Sentry, PostHog (workspace events and usage)
- **Secrets**: Environment-scoped (no shared plaintext credentials)
- **Compliance**: Audit logs for every operation, encrypted sensitive data

---

## 4. Core Principle: Clear Boundaries

```
┌─────────────────────────────────────────────┐
│   RouteMaster Company Workspace             │
│                                             │
│  • Projects and company metadata            │
│  • Teams and permissions                    │
│  • Tasks and workflows                      │
│  • Documentation and knowledge              │
│  • Support tickets and incidents            │
│  • Integrations and infrastructure          │
│  • Notifications                            │
│  • Audit and analytics                      │
└─────────────────────────────────────────────┘
            ↓         ↓         ↓
     ┌──────────┐ ┌──────────┐ ┌──────────┐
     │RouteMaster│ │ Fufaji's │ │FamilyFin │
     │  Backend  │ │ Backend  │ │  Backend │
     │ Database  │ │ Database │ │ Database │
     └──────────┘ └──────────┘ └──────────┘
     
Workspace knows these projects exist.
Workspace does NOT own their business data.
```

---

## 5. Architecture Overview

### 5.1 Workspace Database

The workspace maintains operational metadata for the entire company:

**Company & Workspace**
- Company profile, branding, settings
- Workspace name, description, created_at
- Company features and feature flags

**People & Access**
- Users (email, name, avatar, status)
- Roles and permissions (admin, project_owner, member, guest)
- Team memberships and project assignments
- Invitations and access requests
- Login history and sessions

**Project Registry**
- Project name, slug, description
- Project status (idea, development, beta, live, archived)
- Project owners and teams
- Repository references (GitHub org/repo)
- Deployment references (URL, environment)
- Database references (Supabase project ID, read-only reference)
- Authentication config (Clerk instance reference)
- Payment provider (Stripe merchant, read-only reference)
- Created_at, updated_at

**Tasks & Automation**
- Tasks with title, description, status
- Subtasks and dependencies
- Assignments and due dates
- Project associations
- Comments and activity
- Automated workflows and triggers

**Documentation**
- Docs organized by project and category
- Specifications, architecture decisions, runbooks
- Version history and publishing
- Access control per document

**Support & Incidents**
- Support tickets with status workflow
- Customer contact information (non-sensitive)
- Ticket assignments and resolution tracking
- Incident reports and postmortems
- FAQ and knowledge base articles

**Integrations & Infrastructure**
- GitHub organization and repositories
- Hosting providers and environments (Vercel, etc.)
- Database references (Supabase projects, not connections)
- Email service references (Resend)
- Monitoring services (Sentry, PostHog projects)
- Payment processors (Stripe merchant accounts)
- Integration health status and last sync
- Credential references (secrets stored securely, metadata only)

**Finance & Costs**
- Project budgets
- Monthly costs and cost allocation
- Subscription tracking (per integration, per project)
- Billing contacts and payment methods
- Invoice history

**Notifications**
- Notification templates (email, in-app, SMS)
- Notification settings and preferences
- Delivery history and status
- Alert rules and escalations

**Security & Audit**
- Access logs (who, what, when, where, why)
- Activity history (all changes)
- Approval records (who approved what)
- Secrets metadata (which integrations, no values)
- Security events and incidents

**Analytics**
- Company metrics (projects, users, revenue)
- Project metrics (progress, activity, reliability)
- Usage metrics (API calls, storage, resources)
- Cost trends and allocations
- Team productivity and velocity

### 5.2 Workspace Components

#### **Workspace Dashboard** (Internal Admin Portal)
- Overview: company metrics, active projects, recent activity
- Project management: register, update, monitor projects
- Team management: users, roles, permissions, invitations
- Task management: create, assign, track workflow
- Documentation: write, publish, organize specs and runbooks
- Support: manage tickets, incidents, FAQs
- Integrations: view status, test connections, manage credentials
- Infrastructure: monitor deployments, services, resources
- Finance: view budgets, costs, allocations
- Analytics: metrics, reports, trends
- Audit: access logs, activity history, security events

#### **API Gateway** (Workspace APIs)
- **Projects API**: list, create, get, update, delete
- **Teams API**: list users, roles, permissions
- **Tasks API**: CRUD tasks, assignments, workflows
- **Documentation API**: CRUD docs, versioning, publishing
- **Support API**: CRUD tickets, incidents, resolution tracking
- **Integrations API**: list, test, sync, health check
- **Infrastructure API**: list services, deployments, status
- **Finance API**: budgets, costs, allocations, billing
- **Notifications API**: send, schedule, track delivery
- **Audit API**: list logs, activities, security events
- **Analytics API**: metrics, reports, trends

#### **Shared Services Infrastructure**
- **Email Service** (Resend): send workspace notifications
- **Monitoring** (Sentry, PostHog): workspace events, errors, analytics
- **Storage** (Vercel Blob): documentation, attachments, assets
- **Task Queue** (Upstash/Redis): async workflows, automation
- **Search** (Meilisearch): search projects, documentation, tickets

---

## 6. Complete Database Schema

### 6.1 Company & Workspace

```sql
CREATE TABLE workspace (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  brand_color TEXT,
  settings JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE features (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  feature_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  config JSONB,
  created_at TIMESTAMP
);
```

### 6.2 People & Access

```sql
CREATE TABLE workspace_users (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  clerk_id TEXT UNIQUE,
  status TEXT ('active', 'invited', 'suspended'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE roles (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES workspace_users(id),
  role_id UUID REFERENCES roles(id),
  scope TEXT ('workspace', 'project'),
  scope_id UUID,
  granted_at TIMESTAMP,
  granted_by UUID REFERENCES workspace_users(id)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES workspace_users(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP,
  last_activity TIMESTAMP,
  expires_at TIMESTAMP
);
```

### 6.3 Project Registry

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT ('mobility', 'commerce', 'finance', 'ai', 'other'),
  status TEXT ('idea', 'development', 'beta', 'live', 'archived'),
  visibility TEXT ('public', 'private', 'internal'),
  logo_url TEXT,
  accent_color TEXT,
  
  github_org TEXT,
  github_repo TEXT,
  deployment_url TEXT,
  
  supabase_project_id TEXT,
  clerk_instance_id TEXT,
  stripe_merchant_id TEXT,
  
  owner_id UUID REFERENCES workspace_users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  archived_at TIMESTAMP
);

CREATE TABLE project_members (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  user_id UUID REFERENCES workspace_users(id),
  role TEXT ('owner', 'lead', 'developer', 'analyst'),
  joined_at TIMESTAMP
);

CREATE TABLE project_versions (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  version_number TEXT,
  release_date TIMESTAMP,
  changelog TEXT,
  created_by UUID REFERENCES workspace_users(id),
  created_at TIMESTAMP
);
```

### 6.4 Tasks & Automation

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  project_id UUID REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT ('open', 'in_progress', 'review', 'done', 'closed'),
  priority TEXT ('low', 'medium', 'high', 'critical'),
  
  assigned_to UUID REFERENCES workspace_users(id),
  created_by UUID REFERENCES workspace_users(id),
  
  due_date DATE,
  estimated_hours INT,
  actual_hours INT,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  closed_at TIMESTAMP
);

CREATE TABLE task_subtasks (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  title TEXT NOT NULL,
  status TEXT ('open', 'done'),
  created_at TIMESTAMP
);

CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  depends_on_task_id UUID REFERENCES tasks(id),
  created_at TIMESTAMP
);

CREATE TABLE task_comments (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  user_id UUID REFERENCES workspace_users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT,
  actions JSONB,
  enabled BOOLEAN DEFAULT true,
  created_by UUID REFERENCES workspace_users(id),
  created_at TIMESTAMP
);
```

### 6.5 Documentation

```sql
CREATE TABLE documentation (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  project_id UUID REFERENCES projects(id),
  
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT ('spec', 'architecture', 'api', 'runbook', 'decision'),
  
  content TEXT,
  status TEXT ('draft', 'published', 'archived'),
  
  owner_id UUID REFERENCES workspace_users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  published_at TIMESTAMP
);

CREATE TABLE doc_versions (
  id UUID PRIMARY KEY,
  doc_id UUID REFERENCES documentation(id),
  version_number INT,
  content TEXT,
  author_id UUID REFERENCES workspace_users(id),
  created_at TIMESTAMP,
  change_summary TEXT
);

CREATE TABLE doc_access (
  id UUID PRIMARY KEY,
  doc_id UUID REFERENCES documentation(id),
  user_id UUID REFERENCES workspace_users(id),
  permission TEXT ('view', 'edit', 'admin'),
  granted_at TIMESTAMP
);
```

### 6.6 Support & Incidents

```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  project_id UUID REFERENCES projects(id),
  
  ticket_number TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  
  status TEXT ('open', 'assigned', 'in_progress', 'resolved', 'closed'),
  priority TEXT ('low', 'medium', 'high', 'critical'),
  
  reporter_name TEXT,
  reporter_email TEXT,
  
  assigned_to UUID REFERENCES workspace_users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id),
  user_id UUID REFERENCES workspace_users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

CREATE TABLE incidents (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  project_id UUID REFERENCES projects(id),
  
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT ('low', 'medium', 'high', 'critical'),
  status TEXT ('detected', 'investigating', 'resolved', 'postmortem'),
  
  started_at TIMESTAMP,
  resolved_at TIMESTAMP,
  
  commander_id UUID REFERENCES workspace_users(id),
  created_at TIMESTAMP
);

CREATE TABLE incident_timeline (
  id UUID PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id),
  event TEXT,
  created_by UUID REFERENCES workspace_users(id),
  created_at TIMESTAMP
);

CREATE TABLE incident_postmortems (
  id UUID PRIMARY KEY,
  incident_id UUID REFERENCES incidents(id),
  content TEXT,
  lessons_learned JSONB,
  action_items JSONB,
  created_by UUID REFERENCES workspace_users(id),
  created_at TIMESTAMP
);

CREATE TABLE faq (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  project_id UUID REFERENCES projects(id),
  
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  
  helpful_count INT DEFAULT 0,
  created_by UUID REFERENCES workspace_users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 6.7 Integrations & Infrastructure

```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  
  integration_type TEXT ('github', 'supabase', 'clerk', 'stripe', 'resend', 'sentry', 'posthog'),
  name TEXT NOT NULL,
  
  status TEXT ('connected', 'disconnected', 'error'),
  error_message TEXT,
  
  last_sync_at TIMESTAMP,
  health_status TEXT ('healthy', 'degraded', 'down'),
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE integration_config (
  id UUID PRIMARY KEY,
  integration_id UUID REFERENCES integrations(id),
  
  config_key TEXT,
  config_value TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  
  updated_at TIMESTAMP
);

CREATE TABLE services (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  project_id UUID REFERENCES projects(id),
  
  name TEXT NOT NULL,
  service_type TEXT ('api', 'web', 'worker', 'database'),
  
  deployment_provider TEXT ('vercel', 'aws', 'cloudflare'),
  deployment_url TEXT,
  deployment_region TEXT,
  
  status TEXT ('running', 'deploying', 'down', 'error'),
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE deployments (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  
  version TEXT,
  commit_sha TEXT,
  commit_message TEXT,
  
  status TEXT ('pending', 'building', 'deploying', 'success', 'failed'),
  
  deployed_by UUID REFERENCES workspace_users(id),
  deployed_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### 6.8 Finance & Costs

```sql
CREATE TABLE project_budgets (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  
  monthly_budget NUMERIC,
  fiscal_year INT,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE cost_entries (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  project_id UUID REFERENCES projects(id),
  
  cost_type TEXT ('infrastructure', 'subscription', 'service', 'other'),
  description TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  
  date_incurred DATE,
  integration_id UUID REFERENCES integrations(id),
  
  created_at TIMESTAMP
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  integration_id UUID REFERENCES integrations(id),
  
  provider TEXT,
  plan TEXT,
  monthly_cost NUMERIC,
  
  starts_at TIMESTAMP,
  renews_at TIMESTAMP,
  
  status TEXT ('active', 'cancelled', 'suspended'),
  
  created_at TIMESTAMP
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  
  invoice_number TEXT UNIQUE,
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  
  issued_at DATE,
  due_at DATE,
  paid_at DATE,
  
  status TEXT ('draft', 'sent', 'paid', 'overdue'),
  
  created_at TIMESTAMP
);
```

### 6.9 Notifications

```sql
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  
  name TEXT NOT NULL,
  channel TEXT ('email', 'in_app', 'sms'),
  subject TEXT,
  body TEXT,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  
  recipient_id UUID REFERENCES workspace_users(id),
  template_id UUID REFERENCES notification_templates(id),
  
  channel TEXT ('email', 'in_app', 'sms'),
  subject TEXT,
  body TEXT,
  
  status TEXT ('pending', 'sent', 'delivered', 'failed'),
  error_message TEXT,
  
  sent_at TIMESTAMP,
  created_at TIMESTAMP
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES workspace_users(id),
  
  notification_type TEXT,
  channel TEXT,
  enabled BOOLEAN DEFAULT true,
  
  updated_at TIMESTAMP
);

CREATE TABLE alert_rules (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  project_id UUID REFERENCES projects(id),
  
  name TEXT NOT NULL,
  condition TEXT,
  actions JSONB,
  
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP
);
```

### 6.10 Security & Audit

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  
  user_id UUID REFERENCES workspace_users(id),
  action TEXT,
  
  resource_type TEXT,
  resource_id UUID,
  
  changes JSONB,
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMP
);

CREATE TABLE approval_records (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  
  request_type TEXT,
  request_id UUID,
  request_data JSONB,
  
  requested_by UUID REFERENCES workspace_users(id),
  approved_by UUID REFERENCES workspace_users(id),
  rejected_by UUID REFERENCES workspace_users(id),
  
  status TEXT ('pending', 'approved', 'rejected'),
  
  requested_at TIMESTAMP,
  decided_at TIMESTAMP
);

CREATE TABLE secrets_metadata (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  integration_id UUID REFERENCES integrations(id),
  
  secret_name TEXT,
  secret_type TEXT ('api_key', 'token', 'password', 'connection_string'),
  
  created_at TIMESTAMP,
  last_rotated_at TIMESTAMP
);

CREATE TABLE security_events (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  
  event_type TEXT ('suspicious_login', 'permission_change', 'secret_exposure', 'failed_auth'),
  severity TEXT ('low', 'medium', 'high', 'critical'),
  
  description TEXT,
  user_id UUID REFERENCES workspace_users(id),
  
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP,
  
  created_at TIMESTAMP
);
```

### 6.11 Analytics

```sql
CREATE TABLE metrics (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspace(id),
  project_id UUID REFERENCES projects(id),
  
  metric_type TEXT ('users', 'projects', 'tasks', 'incidents', 'revenue', 'costs'),
  metric_name TEXT,
  metric_value NUMERIC,
  
  period TEXT ('daily', 'weekly', 'monthly'),
  period_start DATE,
  period_end DATE,
  
  created_at TIMESTAMP
);

CREATE TABLE project_metrics (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  
  total_users INT,
  total_tasks INT,
  completed_tasks INT,
  
  total_incidents INT,
  resolved_incidents INT,
  
  total_revenue NUMERIC,
  total_costs NUMERIC,
  
  reliability_percentage NUMERIC,
  
  period_start DATE,
  period_end DATE,
  
  created_at TIMESTAMP
);
```

---

## 7. API Endpoints Structure

### 7.1 Projects API

```
GET    /api/projects
POST   /api/projects
GET    /api/projects/{projectId}
PUT    /api/projects/{projectId}
DELETE /api/projects/{projectId}

GET    /api/projects/{projectId}/members
POST   /api/projects/{projectId}/members
DELETE /api/projects/{projectId}/members/{userId}

GET    /api/projects/{projectId}/versions
```

### 7.2 Teams & Access API

```
GET    /api/users
POST   /api/users/invite
GET    /api/users/{userId}
PUT    /api/users/{userId}
DELETE /api/users/{userId}

GET    /api/roles
POST   /api/roles
PUT    /api/roles/{roleId}
DELETE /api/roles/{roleId}

POST   /api/permissions/assign
DELETE /api/permissions/{permissionId}
```

### 7.3 Tasks API

```
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/{taskId}
PUT    /api/tasks/{taskId}
DELETE /api/tasks/{taskId}

POST   /api/tasks/{taskId}/comments
GET    /api/tasks/{taskId}/activity

POST   /api/workflows
PUT    /api/workflows/{workflowId}
DELETE /api/workflows/{workflowId}
```

### 7.4 Documentation API

```
GET    /api/docs
POST   /api/docs
GET    /api/docs/{docId}
PUT    /api/docs/{docId}
DELETE /api/docs/{docId}

GET    /api/docs/{docId}/versions
POST   /api/docs/{docId}/publish
```

### 7.5 Support API

```
GET    /api/tickets
POST   /api/tickets
GET    /api/tickets/{ticketId}
PUT    /api/tickets/{ticketId}
POST   /api/tickets/{ticketId}/comments

GET    /api/incidents
POST   /api/incidents
GET    /api/incidents/{incidentId}
PUT    /api/incidents/{incidentId}
POST   /api/incidents/{incidentId}/postmortem

GET    /api/faq
POST   /api/faq
PUT    /api/faq/{faqId}
DELETE /api/faq/{faqId}
```

### 7.6 Integrations API

```
GET    /api/integrations
POST   /api/integrations
GET    /api/integrations/{integrationId}
PUT    /api/integrations/{integrationId}
DELETE /api/integrations/{integrationId}

POST   /api/integrations/{integrationId}/test
GET    /api/integrations/{integrationId}/health
POST   /api/integrations/{integrationId}/sync
```

### 7.7 Infrastructure API

```
GET    /api/services
POST   /api/services
GET    /api/services/{serviceId}
PUT    /api/services/{serviceId}

GET    /api/deployments
POST   /api/deployments
GET    /api/deployments/{deploymentId}
```

### 7.8 Finance API

```
GET    /api/budgets
POST   /api/budgets
PUT    /api/budgets/{budgetId}

GET    /api/costs
POST   /api/costs

GET    /api/subscriptions
POST   /api/subscriptions

GET    /api/invoices
```

### 7.9 Notifications API

```
GET    /api/notifications
POST   /api/notifications/send
PUT    /api/notifications/{notificationId}

GET    /api/notification-preferences
PUT    /api/notification-preferences

POST   /api/alert-rules
PUT    /api/alert-rules/{ruleId}
DELETE /api/alert-rules/{ruleId}
```

### 7.10 Audit & Analytics API

```
GET    /api/audit-logs
GET    /api/audit-logs/search

GET    /api/approvals
POST   /api/approvals/{approvalId}/approve
POST   /api/approvals/{approvalId}/reject

GET    /api/security-events
POST   /api/security-events/{eventId}/resolve

GET    /api/metrics
GET    /api/projects/{projectId}/metrics
```

---

## 8. Security and Isolation

### 8.1 Workspace Data Protection
- All sensitive data encrypted at rest (Supabase encryption)
- All API traffic encrypted in transit (HTTPS)
- Audit logs immutable and tamper-proof
- Secrets never stored as plaintext (reference IDs only)

### 8.2 Access Control
- Role-based access control (RBAC) with granular permissions
- Project-level and workspace-level scopes
- Row-level security (RLS) policies in Supabase
- Clerk integration for authentication and SSO

### 8.3 Product Data Isolation
- Workspace database contains NO product business data
- Product databases are separate Supabase projects
- Workspace has read-only references to product metadata
- Products can be replaced, archived, or migrated without affecting workspace

### 8.4 Audit and Compliance
- Every action logged with user, timestamp, IP, user agent
- Approval records for sensitive operations
- Security event detection and alerting
- GDPR-compliant data retention and deletion policies

---

## 9. How Products Connect Later

When a product (RouteMaster, Fufaji's, FamilyFinanceOS) is built:

1. **Register in Project Registry**: Create project record with metadata
2. **Connect Backend Reference**: Add Supabase project ID, Clerk instance, Stripe merchant
3. **Link Integrations**: Enable project-specific integration configurations
4. **Enable Notifications**: Link product events to workspace notification system
5. **Configure Cost Tracking**: Allocate product costs in workspace finance module
6. **Set Up Documentation**: Add product specs, runbooks, architecture to workspace docs
7. **Create Support Workflow**: Link product incidents and tickets to workspace support system

**Products do NOT share workspace data. They reference it but own their own databases.**

---

## 10. Deployment Readiness Checklist

Before the workspace can operate:

- [ ] Supabase database created and configured
- [ ] All tables migrated and RLS policies enabled
- [ ] Authentication (Clerk) configured for workspace users
- [ ] API routes tested and documented
- [ ] Dashboard UI functional for all modules
- [ ] Email notifications working (Resend integration)
- [ ] Monitoring configured (Sentry, PostHog)
- [ ] Audit logging functional
- [ ] Permission system tested
- [ ] Backup and recovery procedures documented
- [ ] Security audit completed
- [ ] Load testing passed (target: 100 concurrent users)

---

## 11. What Remains to the Builder

After this design is approved, Claude will:

1. Create Supabase migrations for all tables
2. Build Next.js API routes for all endpoints
3. Implement RLS policies for data isolation
4. Create dashboard UI for all eight modules
5. Implement authentication and permission checks
6. Integrate email notifications (Resend)
7. Set up monitoring and logging (Sentry, PostHog)
8. Write comprehensive tests
9. Configure CI/CD pipeline
10. Create API documentation

---

## 12. Success Criteria

This architecture is complete when:

1. ✅ All workspace tables created and migrated
2. ✅ All API endpoints functional and tested
3. ✅ Dashboard fully operational for all modules
4. ✅ Authentication and permissions enforced
5. ✅ Audit logs capture all operations
6. ✅ Email notifications working
7. ✅ Monitoring and alerting configured
8. ✅ Disaster recovery procedures documented
9. ✅ Security audit passed
10. ✅ Ready to register first project (Fufaji's backend)

---

## 13. Timeline and Phasing

| Phase | Work                                    | Duration |
| ----- | --------------------------------------- | -------- |
| 1     | Database schema and migrations          | 1 week   |
| 2     | API endpoints and authentication        | 2 weeks  |
| 3     | Dashboard UI for all eight modules      | 2 weeks  |
| 4     | Integrations (email, monitoring, etc.)  | 1 week   |
| 5     | Testing and security audit             | 1 week   |
| 6     | Documentation and deployment            | 1 week   |

**Total**: ~8 weeks to production-ready workspace

---

## 14. Important Notes

### Workspace is NOT Product Data
- Workspace manages projects, teams, tasks, documentation, support
- Workspace does NOT own customer records, orders, transactions, journeys
- Each product has its own database

### Security First
- Never commit secrets to repositories
- All credentials in environment variables
- Database backups before any production schema change
- Audit trail for every operation

### Reusability
- Workspace patterns become the foundation for all future projects
- Templates and APIs are product-agnostic
- Each new project connects to workspace without code changes

---

**Next Step**: Upon approval, create a step-by-step implementation plan to build the complete workspace.
