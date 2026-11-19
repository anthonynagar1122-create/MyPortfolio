# RouteMaster Company Workspace — Master Architecture Specification v3

**Version**: 2026-11-19-v3  
**Status**: Architecture Review (Revised)  
**Changes from v2**: Nine critical clarifications addressing identity mapping, tenant boundaries, event durability, integration contract, and deployment model  
**Next Step**: Database v3 (source of truth)  

---

## Document Structure

This specification is delivered as five integrated documents:

| Document | Scope | Authority |
|----------|-------|-----------|
| **This document** | Architecture vision, decisions, components, roadmap | Master approval gate |
| `2026-11-19-company-workspace-v3-database.md` | Executable PostgreSQL schema, migrations, ER diagram | Database design authority |
| `2026-11-19-company-workspace-v3-api.md` | REST API contracts, webhook specifications, event processing | API contract authority |
| `2026-11-19-company-workspace-v3-security.md` | RLS policies, RBAC matrix, secrets management, audit controls | Security authority |
| `2026-11-19-company-workspace-v3-operations.md` | Deployment, backups, recovery, monitoring, runbooks | Operations authority |

**Cross-references**: This document references specific tables, API endpoints, security decisions and operational procedures defined in supporting artifacts. All five must be reviewed before approval.

---

## 1. Vision and Intent

RouteMaster is a company operating multiple products (RouteMaster, Fufaji's, FamilyFinanceOS) and planning future ventures. The company needs **one unified internal workspace** that manages projects, teams, permissions, support, infrastructure, integrations, tasks, documentation, finance and operations.

**Key principle**: The workspace is the company's operational control plane. It does NOT own product business data. Each product maintains independent databases and release cycles.

**Success criterion**: The workspace should support registering and managing unlimited projects without schema changes or code modifications to the core platform.

---

## 2. Architecture Principles (Non-Negotiable)

1. **Single company entry point**: `https://routemaster.vercel.app` is the permanent public gateway.
2. **Workspace is the control plane**: Manages projects, teams, tasks, documentation, support, infrastructure and finance.
3. **Product data isolation**: Each product owns its own business database; workspace has read-only references only.
4. **Multi-workspace readiness**: Designed for one workspace initially; must support multiple independent workspaces without code changes.
5. **Clear permission boundaries**: Project access does not grant cross-project visibility; workspace permissions are distinct from project permissions.
6. **Audit-first operations**: Every action logged, traceable, and reversible where possible.
7. **Secrets never in plaintext**: API keys, credentials and tokens reference external secure storage; workspace holds references only.
8. **AI-agent ready**: Authorized agents can discover projects, read permitted docs, create tasks, execute workflows with full audit trails.

---

## 3. Core Components

### 3.1 Workspace Foundation
- **Company and workspace configuration** — branding, settings, feature flags
- **User management** — workspace users, invitations, status tracking
- **Team organization** — teams, memberships, hierarchies
- **Role-based access** — workspace and project-scoped roles and permissions

**Authority**: See `2026-11-19-company-workspace-v3-database.md` for schema

### 3.2 Project Operations
- **Project registry** — unlimited projects with metadata and lifecycle
- **Repository management** — GitHub org/repo references, branch tracking
- **Environment management** — development, staging, production references
- **Service catalog** — deployed services, their status and health

**Authority**: See `2026-11-19-company-workspace-v3-database.md` for schema

### 3.3 Work Management
- **Task tracking** — creation, assignment, workflow, dependencies
- **Documentation system** — specifications, architecture, runbooks, decisions
- **Support system** — tickets, incidents, postmortems, knowledge base
- **Activity streams** — who did what, when, and why

**Authority**: See `2026-11-19-company-workspace-v3-database.md` for schema

### 3.4 Platform Services
- **Integration management** — GitHub, hosting, databases, monitoring, payment processors
- **Workflow engine** — event-driven automation with approval gates
- **Notification system** — email, in-app, SMS with delivery guarantees
- **Event processing** — durable transactional outbox, webhooks, retries, deduplication

**Authority**: See `2026-11-19-company-workspace-v3-api.md` for event contracts

### 3.5 Governance
- **Financial tracking** — budgets, costs, subscriptions, allocations
- **Audit logs** — immutable operation history, security events, approvals
- **Analytics** — company metrics, project metrics, usage trends
- **Compliance** — data retention, deletion, GDPR, security policies

**Authority**: See `2026-11-19-company-workspace-v3-security.md` for audit controls

---

## 4. Architectural Decisions

### 4.1 Tenant Boundary Rule (REVISED)

**Decision**: Every row is owned by exactly one workspace. Explicit tenant-boundary rule applies to all tables.

**Tenant-boundary classification**:
- **Workspace-owned**: `workspace_users`, `teams`, `projects`, `tasks`, `documentation`, `support_tickets`, `incidents`, `integrations`, `workflows`, `audit_logs`, `notifications`, `budgets`, `costs`, `metrics`, `events`, `product_events`
  - These tables MUST have a composite primary key: `(workspace_id, id)`
  - Every query MUST filter by `workspace_id`
  - Foreign keys MUST be composite: `(workspace_id, column_id)`
  - `workspace_id` is NEVER nullable and NEVER SET NULL on deletion
  
- **Global reference tables** (exception): `global_roles`, `global_permissions`
  - These tables are shared across all workspaces
  - They define the permission vocabulary and system roles used by all workspaces
  - No `workspace_id` required; referenced by `role_id` or `permission_id`
  - Examples: "owner", "lead", "developer" (role names); "create_project", "edit_task" (permissions)

- **Global system tables** (exception): `workspaces` (the root), `workspace_features`
  - Workspace is the root; belongs to no workspace
  - Feature flags are workspace configuration

**Rationale**:
- Multi-workspace design requires explicit, testable isolation
- RLS policies require consistent workspace ownership
- Cross-workspace access is a security defect, not a feature

**Authority**: See Database v3 for complete tenant-safe schema

---

### 4.2 Deployment and Hosting Model (REVISED - NEW)

**Decision**: Separate concerns between application hosting, database hosting, and event processing. Explicit trust boundaries.

**Hosting topology**:

```
┌─────────────────────────────────────────────────────────┐
│          PUBLIC BOUNDARY (untrusted client)             │
│        https://routemaster.vercel.app (CDN)             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
        ┌──────────────▼──────────────┐
        │  PRIVATE BOUNDARY (trusted) │
        │   Vercel Edge / Functions   │
        │  (workspace dashboard APIs) │
        └──────────────┬──────────────┘
                       │ Internal network
        ┌──────────────▼──────────────┐
        │  INTERNAL BOUNDARY          │
        │  Supabase PostgreSQL        │
        │  + RLS policies             │
        │  + Audit logs               │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │Upstash  │    │Vercel   │   │External  │
   │Redis    │    │Blob     │   │Services  │
   │(queue)  │    │(files)  │   │(email,   │
   │         │    │         │   │monitoring)
   └─────────┘    └─────────┘   └──────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │ Project-scoped credentials
        ┌──────────────▼──────────────┐
        │  PRODUCT BOUNDARY (untrusted)
        │  Product APIs & Webhooks    │
        │  (RouteMaster, Fufaji, etc) │
        └──────────────────────────────┘
```

**Trust boundaries**:
- **Public boundary**: Browsers and untrusted clients (apply CSRF, rate limiting, input validation)
- **Private boundary**: Workspace application logic (Vercel serverless; Clerk JWT validates users)
- **Internal boundary**: PostgreSQL; RLS enforces authorization; audit logs record all access
- **Product boundary**: Product integrations (not trusted; must validate webhook signatures; project-scoped credentials only)

**Rationale**:
- Clear separation prevents logic sprawl and misplaced trust
- Each boundary has explicit validation responsibility
- Auditability requires centralized logging in PostgreSQL

**Authority**: See Security v3 for RLS enforcement, Operations v3 for deployment procedure

---

### 4.3 Authentication and Authorization (REVISED)

**Decision**: Clerk owns identity. PostgreSQL owns workspace authorization. Explicit identity mapping and lifecycle.

**Identity lifecycle**:

1. **Clerk creates user** (via signup, SSO, admin invite)
   - Clerk stores: `id` (clerk_id), `email`, `name`, `phone`, `MFA`, `SSO`, `sessions`
   - Event: `user.created` webhook delivered to workspace

2. **Workspace creates workspace_user** (on first workspace login OR admin invitation)
   - PostgreSQL: Insert into `workspace_users(workspace_id, clerk_id, email, name, status)`
   - Initial status: `invited` (if admin-created) or `active` (if self-signup)
   - Webhook handler creates row; no manual row insertion

3. **Workspace assigns roles** (admin or workflow)
   - PostgreSQL: Insert into `user_roles(user_id, role_id, scope, scope_id)`
   - Scope: `workspace` (workspace-level) or `project` (project-level)
   - Scope_id: NULL (workspace) or project UUID (project)

4. **Clerk suspends or deletes user**
   - Event: `user.deleted` or `user.updated(suspended)` webhook
   - Workspace: Set `workspace_users.status = suspended` or NULL (soft-delete)
   - Consequence: RLS policies deny access; user cannot authenticate
   - Action: Preserve audit logs; audit_logs rows remain linked to `user_id` for history

5. **Multi-workspace membership**
   - User can have multiple `workspace_users` rows (one per workspace)
   - User can have different roles in each workspace
   - Request header or session specifies active `workspace_id`
   - Each request validates: Clerk JWT + workspace membership in `workspace_users`

**Implementation**:
- Clerk stores: `email`, `name`, `phone`, `MFA`, `SSO`, `sessions`, `created_at`, `updated_at`
- PostgreSQL stores: `workspace_users`, `roles`, `user_roles`, `permissions`, `approvals`
- API: Every request validates (1) Clerk JWT signature, (2) user is `active` in target workspace
- RLS: Policies check `workspace_users` membership; inactive users denied

**Authority**: See Security v3 for RLS policies, Database v3 for schema

---

### 4.4 Secrets Management (REVISED)

**Decision**: Secrets stored in Vercel environment variables. Database stores secret metadata only. Per-project and per-environment isolation.

**Secret isolation model**:

```
Database (PostgreSQL)
├── integration (integration_id, provider, project_id, is_enabled)
│   └── Reference to external service
├── integration_config (integration_id, config_key, is_sensitive, environment)
│   └── Metadata only (never values)
│       Examples:
│       - stripe_merchant_id: "acct_xxx" (NOT secret; can read from DB)
│       - stripe_api_key_ref: "STRIPE_PROD_API_KEY" (reference to env var; value never in DB)
│       - environment: "production" or "staging"

Environment Variables (Vercel)
├── STRIPE_PROD_API_KEY=sk_live_xxx
├── STRIPE_PROD_WEBHOOK_SECRET=whsec_xxx
├── STRIPE_STAGING_API_KEY=sk_test_xxx
└── GITHUB_TOKEN=ghp_xxx
   
API (Never returns)
├── GET /integrations returns: { id, provider, merchant_id, is_enabled, environment }
├── GET /integrations/{id}/config returns: { config_key, is_sensitive, environment }
└── Actual secret values are never returned; only references
```

**Secret rotation policy**:
- **API keys**: Rotate every 90 days
- **Database passwords**: Rotate every 180 days
- **Webhook secrets**: Rotate on each integration update
- **Process**:
  1. Generate new credential in external system
  2. Store new secret in Vercel env var (new name): `STRIPE_PROD_API_KEY_V2`
  3. Update integration_config to reference new env var name
  4. Verify new credential works (test endpoint)
  5. Wait 24 hours
  6. Revoke old credential in external system
  7. Remove old env var from Vercel

**Per-project isolation**:
- Each project can have distinct credentials (separate Stripe merchant, GitHub org, etc.)
- Database stores which project owns which integration
- API enforces: User can only access integrations for projects they're a member of
- Environment variables are workspace-global but filtered by project membership

**Per-environment isolation**:
- Production and staging credentials are separate env vars
- Database tracks which environment each credential is for
- Deployment automation uses correct env var per target environment

**Rationale**:
- Secrets never enter the database (violation of principle 7)
- Rotation is auditable and automated
- Accidental log exposure risks only env var names, not values
- Per-project isolation prevents one project from using another's credentials

**Authority**: See Security v3 for access control, Operations v3 for rotation procedure

---

### 4.5 Event Architecture (REVISED)

**Decision**: PostgreSQL transactional outbox is source of truth. Redis transports work. Acknowledgment-based consumption.

**Event flow**:

```
Workspace Operation (e.g., create task)
    │
    ├─ Database transaction begins
    ├─ INSERT into tasks
    ├─ INSERT into events (outbox) {id, event_type, source, timestamp, payload, delivered}
    ├─ Commit (all-or-nothing)
    │
Event Worker (runs every 100ms)
    ├─ SELECT * FROM events WHERE NOT delivered LIMIT 100
    ├─ For each event:
    │  ├─ Enqueue to Redis with lease/claim semantics
    │  ├─ Update events SET delivered=true WHERE id=event_id
    │
Redis Queue (Upstash)
    ├─ LPUSH events:pending {event_id, retry_count}
    ├─ Webhook delivery worker consumes with timeout
    │
Webhook Delivery Worker
    ├─ BRPOPLPUSH events:pending events:processing 30s
    ├─ POST to webhook URL with signature and retry headers
    ├─ If 2xx response: LREM events:processing
    ├─ If timeout or non-2xx: exponential backoff to events:dead-letter after 5 retries
    │
Dead-Letter Handler (manual or scheduled)
    ├─ Inspect events:dead-letter
    ├─ Update events SET status='dead_letter', reason='webhook timeout'
    ├─ Alert operator; require manual replay decision
```

**Guarantees**:
- **At-least-once delivery**: Event persists in database until webhook succeeds; retries are automatic
- **Idempotent consumption**: Webhook endpoints must accept duplicate payloads (use idempotency keys)
- **Observable failure**: Dead-lettered events are queryable; not silently lost
- **Source of truth**: PostgreSQL events table is the system of record; Redis is a work queue only

**Retry semantics**:
- Attempt 1: Immediate (0s)
- Attempt 2: 2 seconds
- Attempt 3: 5 seconds
- Attempt 4: 30 minutes
- Attempt 5: 1 hour
- After attempt 5: Move to dead-letter; alert required for manual decision

**Transactional guarantee**:
- An operation (task creation) and its event (task.created) are committed together
- No case where operation succeeds but event is lost
- If database transaction rolls back, event is not inserted

**Rationale**:
- PostgreSQL as source of truth is durable and auditable
- Redis queue prevents database from becoming a bottleneck
- Acknowledgment semantics prevent message loss
- Dead-letter queue surfaces failures instead of silently dropping events

**Authority**: See API v3 for event contracts, Database v3 for outbox schema, Operations v3 for queue recovery

---

### 4.6 Product Integration Contract (REVISED - NEW)

**Decision**: Explicit bidirectional API contract. Products send events; workspace sends notifications. No product-to-workspace data queries (read-only operational APIs only).

**Integration contract**:

```
Product → Workspace (Inbound)
│
├─ POST /api/v1/integrations/{projectId}/events
│  ├─ Authorization: Bearer {project_scoped_token}
│  ├─ Signature: X-Signature-Timestamp, X-Signature-Sha256
│  ├─ Idempotency-Key: {idempotency_key}
│  ├─ Body:
│  │  {
│  │    "event_type": "deployment.succeeded",
│  │    "timestamp": "2026-11-19T10:30:00Z",
│  │    "payload": { "version": "1.0.5", "url": "https://app.com", "duration_seconds": 240 }
│  │  }
│  └─ Returns: 202 Accepted {event_id}
│
├─ GET /api/v1/integrations/{projectId}/metadata (read-only)
│  ├─ Returns: { project_id, project_name, workspace_id, integrations: [...] }
│  └─ No business data; operational metadata only
│
└─ Events allowed from product:
   ├─ deployment.started, deployment.succeeded, deployment.failed
   ├─ incident.created, incident.resolved
   ├─ metric.reported
   ├─ health.updated
   └─ All events signed; all carry project_id in URL path

Workspace → Product (Outbound - Defined but Optional)
│
├─ POST {webhook_url} (registered by product)
│  ├─ Signature: X-Signature-Timestamp, X-Signature-Sha256
│  ├─ Body:
│  │  {
│  │    "event_type": "task.created.for_product",
│  │    "timestamp": "2026-11-19T10:30:00Z",
│  │    "project_id": "{project_uuid}",
│  │    "payload": { "task_id": "...", "title": "...", "created_by": "..." }
│  │  }
│  └─ Returns: 2xx if processed; workspace retries on failure
│
└─ Events sent to product (if webhook registered):
   ├─ task.created.for_product (optional; product declares if it wants this)
   ├─ incident.created.for_product
   └─ All events signed with workspace secret

Product ← Workspace (Never Allowed)
│
├─ ✗ Product cannot query workspace tasks
├─ ✗ Product cannot query workspace users
├─ ✗ Product cannot fetch product customer data from workspace
├─ ✗ Workspace never reads product customer data
└─ Rationale: Workspace manages operations; products own business logic
```

**Project-scoped credentials**:
- Product authenticates as: `Authorization: Bearer {project_scoped_jwt}`
- JWT contains: `{project_id, workspace_id, issued_at, expires_at, scope: "product_integration"}`
- JWT is signed by workspace; product can only use it to send events for its own project
- Credential lifetime: 30 days; workspace rotates automatically

**Rationale**:
- Clear request/response boundaries prevent business-logic drift
- Project-scoped credentials prevent one product accessing another's events
- Workspace publishes notifications to products; products don't query back

**Authority**: See API v3 for complete endpoint specifications

---

### 4.7 Data Consistency Model (REVISED)

**Decision**: Workspace strong consistency. Products eventual consistency. No data replication; workspace maintains only references.

**Consistency boundary**:

**Workspace (strong consistency)**:
- Operations (create project, assign task, approve integration) are ACID transactions
- Foreign-key constraints are enforced
- RLS policies prevent unauthorized access
- Audit logs are synchronous
- Multiple operations on same workspace data serialize

**Products (eventual consistency)**:
- Product reads workspace read-only APIs: `/integrations/{projectId}/metadata`
- Product receives workspace webhooks: `task.created.for_product`
- Product reconciles if divergent: Workspace is source of truth
- If workspace task is updated, webhook is delivered; product updates its state
- No shared database; no polling for consistency

**Data replication rule (clear boundary)**:
- Workspace never stores product customer data
- Workspace stores only: project metadata (name, slug, owner), operational events (deployments, incidents)
- Product stores its own: customer profiles, orders, transactions, usage metrics
- If product business data appears in workspace tables, it's a schema defect

**Conflict resolution**:
- Workspace is authoritative for: tasks, documentation, integrations, audit logs
- Products are authoritative for: customer data, business transactions
- If conflicts occur (e.g., stale product event), workspace data wins; product reconciles on next webhook

**Rationale**:
- Workspace needs strong consistency to prevent authorization bypasses
- Products can tolerate eventual consistency for operational visibility
- No data replication prevents dual-write complexity

**Authority**: See Database v3 for complete tenant model

---

## 5. Data and Integration Boundaries

### 5.1 What Lives in the Workspace

| Category | What is stored | Rationale |
|----------|---|---|
| **Company metadata** | Workspace name, branding, settings | Shared operational context |
| **User and team** | Users, roles, permissions, memberships | Authorization source of truth |
| **Project registry** | Project names, slugs, owners, metadata | Unlimited project discovery |
| **Tasks** | Tasks, subtasks, assignments, deadlines | Work coordination |
| **Documentation** | Specs, architecture, runbooks, decisions | Institutional knowledge |
| **Support** | Tickets, incidents, postmortems, FAQs | Support operations |
| **Integrations** | References to external services, health, sync history | Integration lifecycle |
| **Finance** | Budgets, costs, subscriptions, allocations | Cost tracking |
| **Notifications** | Templates, delivery history, preferences | Alert management |
| **Audit** | Immutable logs, approvals, security events | Compliance and investigation |
| **Analytics** | Operational metrics snapshots, aggregations | Reporting on workspace health |
| **Operational events** | Deployments, incidents, metrics from products | Product integration log |

### 5.2 What Lives in Products

| Category | What is stored | Rationale |
|----------|---|---|
| **Customer data** | Customer profiles, accounts, contacts | Product-specific business data |
| **Transactions** | Orders, payments, journeys, usage | Product revenue and analytics |
| **Custom content** | Product-specific documents, artifacts | Product intellectual property |
| **Product metrics** | Product-specific usage, performance, errors | Product observability |
| **Business intelligence** | Product-specific analysis, reports | Product decision-making |

**Workspace NEVER owns**: Customer names, order details, payment information, product-specific usage patterns. If workspace needs visibility, product sends via webhook event.

### 5.3 Integration Points

```
Workspace ←→ Product
├── Workspace registers project (name, slug, owner, url reference)
├── Product authenticates with workspace-scoped JWT
├── Product sends operational events (deployment.*, incident.*)
├── Workspace reads project metadata (read-only API)
├── Workspace creates tasks from product incidents (via webhook)
├── Workspace publishes notifications to product (via webhook)
└── Product never queries workspace tasks or users
```

---

## 6. Required Supporting Documents

Before this specification can be approved, the following artifacts must be reviewed:

### **Document 1: Database & ERD** (`2026-11-19-company-workspace-v3-database.md`)
**Contains**:
- Complete executable PostgreSQL schema
- Table definitions with types, constraints, indexes
- Tenant-safe composite foreign keys
- Transactional outbox for events
- RLS policy enforcement points
- Migration strategy and rollback procedures

**Acceptance criteria**:
- All SQL is syntactically valid PostgreSQL
- Every workspace-owned table has workspace_id in composite key
- Foreign keys include workspace_id (composite tenant-safe relationships)
- Event table has delivery tracking and dead-letter semantics
- ER diagram generated from schema (not separately maintained)

### **Document 2: API & Events** (`2026-11-19-company-workspace-v3-api.md`)
**Contains**:
- Complete REST API specification for all endpoints
- Durable event delivery with idempotency
- Webhook signature validation (timestamp + HMAC)
- Product integration inbound and outbound contracts
- Request/response schemas with field-level validation
- Error responses with request IDs and no sensitive leaks

**Acceptance criteria**:
- Every endpoint specifies method, path, auth, input, output, errors
- Event contracts signed with canonical request (timestamp, event_id, body)
- Webhook replay protection (timestamp freshness, event_id deduplication)
- Retry and dead-letter semantics fully specified
- Product-scoped JWT issuance and rotation documented

### **Document 3: Security Model** (`2026-11-19-company-workspace-v3-security.md`)
**Contains**:
- Row-level security (RLS) policies for every tenant-owned table
- Role-based access control (RBAC) matrix
- Workspace membership validation
- Secret metadata access control
- Audit logging scope and retention
- Data encryption (at rest and in transit)

**Acceptance criteria**:
- RLS policies use valid PostgreSQL syntax
- Cross-workspace and cross-project access is explicitly denied
- RBAC matrix matches API permissions and database roles
- Secrets never appear in logs, errors, or responses
- Audit logs capture user, action, timestamp, IP, approval

### **Document 4: Operations** (`2026-11-19-company-workspace-v3-operations.md`)
**Contains**:
- Deployment procedures with migration approval gates
- Database backup, recovery and disaster recovery
- Monitoring, alerting and health checks
- Runbooks for common incidents (tested)
- Capacity planning and scaling strategy
- Event queue recovery and dead-letter handling

**Acceptance criteria**:
- Deployment is automated and repeatable (separated from migrations)
- Backups are tested monthly; RTO/RPO demonstrated
- Monitoring covers all critical systems; alert ownership defined
- Runbooks use documented, provider-supported commands
- Recovery procedures are tested; not theoretical

---

## 7. Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│          PUBLIC BOUNDARY (Vercel CDN)               │
│        https://routemaster.vercel.app               │
│  (Static pages: homepage, about, marketing)         │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
        ┌──────────────▼──────────────┐
        │  PRIVATE BOUNDARY            │
        │   Workspace Dashboard & APIs │
        │   (Vercel Serverless)        │
        │  Projects·Teams·Tasks·Docs   │
        │  Support·Infra·Finance       │
        └──────────────┬───────────────┘
                       │ Internal network
        ┌──────────────▼──────────────┐
        │  AUTHORIZATION LAYER         │
        │  Clerk JWT (identity)        │
        │  PostgreSQL RLS (authz)      │
        │  Workspace membership check  │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼──────────────┐
        │  INTERNAL BOUNDARY           │
        │  Supabase PostgreSQL         │
        │  RLS policies · Audit logs   │
        │  Outbox · Events table       │
        └──────────────┬────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │Upstash  │    │Vercel   │   │External  │
   │Redis    │    │Blob     │   │Services  │
   │(queue)  │    │(files)  │   │(email,   │
   │+worker  │    │         │   │monitoring)
   └─────────┘    └─────────┘   └──────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │ HTTPS
        ┌──────────────▼──────────────┐
        │  PRODUCT BOUNDARY (untrusted)
        │  Product integrations       │
        │  Webhook ingress            │
        │  Event API (inbound)        │
        │  Metadata API (read-only)   │
        └──────────────┬───────────────┘
                       │ Project-scoped JWT
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
   │RouteMaster│ │ Fufaji's │  │FamilyFin  │
   │ Database  │ │ Database │  │ Database  │
   │(Supabase) │ │(Supabase)│  │(Supabase) │
   └───────────┘ └──────────┘  └───────────┘
```

**Trust boundaries**:
- **PUBLIC**: Browsers, search engines (apply CSRF, rate limit, input validation)
- **PRIVATE**: Workspace application (Vercel; Clerk JWT validates users)
- **INTERNAL**: PostgreSQL (RLS enforces authorization; audit logs record all)
- **PRODUCT**: Product integrations (not trusted; validate signatures; project-scoped credentials)

---

## 8. Implementation Timeline

| Phase | Deliverable | Duration | Prerequisite |
|-------|---|---|---|
| 1 | Master architecture v3 + Database v3 approved | 0 weeks | Now |
| 2 | Database migrations, RLS policies, event outbox | 2 weeks | Phase 1 |
| 3 | Security v3, API v3, event processing | 2 weeks | Phase 2 |
| 4 | Dashboard UI (project, team, task modules) | 2 weeks | Phase 3 |
| 5 | Support and documentation systems | 1 week | Phase 4 |
| 6 | Integrations and product event processing | 1 week | Phase 5 |
| 7 | Analytics, finance, audit modules | 1 week | Phase 6 |
| 8 | Testing, security audit, production deployment | 2 weeks | Phase 7 |

**Total**: ~11 weeks to production-ready workspace

**Critical milestone**: Phase 1 must include approval of both Master Architecture v3 AND Database v3 before Phase 2 begins. Database is source of truth for all subsequent decisions.

---

## 9. What's Changed from v2

| Section | v2 | v3 | Reason |
|---------|---|---|--------|
| **4.1** | "Every table includes workspace_id" | Explicit tenant-boundary rule; exceptions defined | Prevents ambiguous ownership |
| **4.2** | Implicit hosting model | Explicit trust boundaries and enforcement points | Clarifies deployment responsibility |
| **4.3** | Clerk/PostgreSQL separation only | Complete identity lifecycle and multi-workspace handling | Prevents identity mapping defects |
| **4.4** | Vercel env vars mentioned | Per-project, per-environment isolation specified | Prevents cross-project secret access |
| **4.5** | "Upstash Redis: Durable event queue" | PostgreSQL outbox → Redis queue → webhook worker | Prevents message loss |
| **4.6** | "Products send events and workspace publishes" | Explicit bidirectional API contracts | Prevents scope creep and business logic drift |
| **4.7** | "Products reconcile if divergent" | No data replication; references only | Prevents dual-write complexity |
| **5.1-5.2** | Product metrics listing | Workspace stores operational metrics only; products own business metrics | Prevents workspace data bloat |
| **7** | Architecture diagram | Added trust boundaries, enforcement points, webhook ingress | Enables correct deployment |

---

## 10. Approval Gate

**This specification becomes approved when:**

1. ✅ Master architecture v3 document approved (this document)
2. ✅ Database v3 document approved and schema validated
3. ✅ Security Model v3 document approved and policies verified
4. ✅ API & Events v3 document approved and contracts tested
5. ✅ Operations v3 document approved and procedures tested
6. ✅ No blocking issues remain across all five documents
7. ✅ Explicit approval to proceed with implementation planning

**Once all five are approved**, we invoke `superpowers:writing-plans` to create the step-by-step implementation plan.

---

## 11. What Happens Next

### If Approved
- Database v3 becomes the source of truth for all API and security contracts
- Security v3 generates RLS policies directly from Database v3 schema
- API v3 endpoint contracts map to Database v3 tables and operations
- Operations v3 defines deployment, migration, and recovery procedures
- Invoke `superpowers:writing-plans` with all five v3 specifications
- Begin Phase 2: Database migrations and RLS policies

### If Revisions Needed
- Address feedback in the specific supporting document
- Re-submit revised document for approval
- Other approved documents remain valid; only revised one needs re-review

---

## 12. Document Version Control

- **Master spec v2 created**: 2026-11-19
- **Master spec v3 revised**: 2026-11-19 (addressed 9 findings)
- **Status**: Awaiting Database v3 and supporting document revisions
- **Supporting documents**: All dated 2026-11-19-v3 for consistency

**Cross-reference all documents as:**
- Ref: DB:Table `projects` → `2026-11-19-company-workspace-v3-database.md`
- Ref: API: `POST /api/projects` → `2026-11-19-company-workspace-v3-api.md`
- Ref: Security: RLS policy for `projects` → `2026-11-19-company-workspace-v3-security.md`
- Ref: Operations: Deployment procedure → `2026-11-19-company-workspace-v3-operations.md`

---

**Next step**: Create Database v3 (source of truth for schema, event outbox, tenant-safe relationships).
