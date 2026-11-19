# RouteMaster Company Workspace — Master Architecture Specification v2

**Version**: 2026-11-19-v2  
**Status**: Design Review  
**Approval Milestone**: Master specification + all supporting artifacts  
**Next Step**: Implementation-ready technical specification  

---

## Document Structure

This specification is delivered as five integrated documents:

| Document | Scope | Authority |
|----------|-------|-----------|
| **This document** | Architecture vision, decisions, components, roadmap | Master approval gate |
| `2026-11-19-company-workspace-v2-database.md` | Executable PostgreSQL schema, migrations, ER diagram | Database design authority |
| `2026-11-19-company-workspace-v2-api.md` | REST API contracts, webhook specifications, event processing | API contract authority |
| `2026-11-19-company-workspace-v2-security.md` | RLS policies, RBAC matrix, secrets management, audit controls | Security authority |
| `2026-11-19-company-workspace-v2-operations.md` | Deployment, backups, recovery, monitoring, runbooks | Operations authority |

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

**Authority**: See `2026-11-19-company-workspace-v2-database.md` for schema

### 3.2 Project Operations
- **Project registry** — unlimited projects with metadata and lifecycle
- **Repository management** — GitHub org/repo references, branch tracking
- **Environment management** — development, staging, production references
- **Service catalog** — deployed services, their status and health

**Authority**: See `2026-11-19-company-workspace-v2-database.md` for schema

### 3.3 Work Management
- **Task tracking** — creation, assignment, workflow, dependencies
- **Documentation system** — specifications, architecture, runbooks, decisions
- **Support system** — tickets, incidents, postmortems, knowledge base
- **Activity streams** — who did what, when, and why

**Authority**: See `2026-11-19-company-workspace-v2-database.md` for schema

### 3.4 Platform Services
- **Integration management** — GitHub, hosting, databases, monitoring, payment processors
- **Workflow engine** — event-driven automation with approval gates
- **Notification system** — email, in-app, SMS with delivery guarantees
- **Event processing** — durable event store, webhooks, retries, deduplication

**Authority**: See `2026-11-19-company-workspace-v2-api.md` for event contracts

### 3.5 Governance
- **Financial tracking** — budgets, costs, subscriptions, allocations
- **Audit logs** — immutable operation history, security events, approvals
- **Analytics** — company metrics, project metrics, usage trends
- **Compliance** — data retention, deletion, GDPR, security policies

**Authority**: See `2026-11-19-company-workspace-v2-security.md` for audit controls

---

## 4. Architectural Decisions

### 4.1 Single Workspace vs. Multi-Workspace
**Decision**: Design for multiple workspaces from the start, even though RouteMaster initially operates one.

**Rationale**: 
- Future business units, subsidiaries, or separate organizations may require distinct workspaces
- Multi-workspace design is not more complex than single-workspace initially
- Early design prevents costly migration later

**Implementation**: Every table includes `workspace_id` as the primary isolation boundary. Users can belong to multiple workspaces with different roles in each.

### 4.2 Product Data Location
**Decision**: Workspace is PostgreSQL. Product files and large attachments are Vercel Blob. Product business data is in independent Supabase projects.

**Rationale**:
- Workspace metadata is relational, transactional, and needs strong consistency
- Product data is high-volume and can be independently scaled
- Large attachments don't need transactional semantics

**Implementation**: 
- Workspace tables: `documentation`, `support_tickets`, `audit_logs`, etc.
- Vercel Blob: Document attachments, ticket attachments, project media
- Product databases: Customer records, orders, transactions (separate Supabase projects)

### 4.3 Authentication and Authorization
**Decision**: Clerk owns authentication. PostgreSQL owns workspace authorization.

**Rationale**:
- Clerk provides SSO, MFA, session management and user identity
- Workspace needs fine-grained permission control scoped to projects and workspaces
- Separation prevents authentication logic from embedding authorization rules

**Implementation**:
- Clerk stores: `email`, `name`, `phone`, `MFA`, `SSO`, `sessions`
- PostgreSQL stores: `workspace_users`, `roles`, `user_roles`, `permissions`, `approvals`
- Every API validates both Clerk authentication + PostgreSQL authorization

**Authority**: See `2026-11-19-company-workspace-v2-security.md` for RBAC matrix

### 4.4 Secrets Management
**Decision**: Credentials are stored in Vercel environment variables and reference-managed in PostgreSQL.

**Rationale**:
- API keys, database connection strings and passwords must never appear in the workspace database
- PostgreSQL stores credential metadata (which provider, which project, rotation status)
- Actual values are accessed only at deployment time via environment variables

**Implementation**:
- PostgreSQL: `integration_config` stores `provider`, `type`, `scope`, `environment`, `last_tested`, `rotation_schedule`
- Vercel: Environment variables hold actual `STRIPE_API_KEY`, `GITHUB_TOKEN`, `SUPABASE_URL`, etc.
- API: Returns credential references, never actual values

**Authority**: See `2026-11-19-company-workspace-v2-security.md` for secrets architecture

### 4.5 Workflow and Automation
**Decision**: Event-driven workflow engine with approval gates, idempotency, and dead-letter handling.

**Rationale**:
- Many operational tasks (escalate overdue tickets, alert on cost overruns, deploy on merge) are deterministic and repeatable
- Approval gates prevent accidental operations (delete project, disable integration)
- Idempotency prevents duplicate actions if events are delivered multiple times
- Dead-letter queues capture failed events for investigation

**Implementation**:
- PostgreSQL: `workflows`, `workflow_runs`, `events`, `workflow_approvals`
- Upstash Redis: Durable event queue with acknowledgment tracking
- API: Webhook endpoints accept events, validate signatures, enqueue for processing
- Automation: Run tasks asynchronously, record history, support retries and rollbacks

**Authority**: See `2026-11-19-company-workspace-v2-api.md` for event contracts

### 4.6 Product Integration Contract
**Decision**: Products communicate with workspace via signed webhook events and read-only APIs.

**Rationale**:
- Products should send operational telemetry (deployment, incident, metric events), not raw customer data
- Workspace authorizes product integrations using project-scoped credentials
- Products cannot query workspace data; workspace publishes events to products

**Implementation**:
- Product integration API: Endpoints for registering events, querying authorized metadata
- Signed webhooks: Products send events signed with project-scoped credentials
- Project-scoped permissions: Product can only access its own project record and authorized integrations
- Event types: `deployment.succeeded`, `incident.created`, `metric.reported`, `ticket.escalated`

**Authority**: See `2026-11-19-company-workspace-v2-api.md` for integration contract

### 4.7 Data Consistency Model
**Decision**: Workspace uses PostgreSQL transactions for strong consistency. Products use eventual consistency via event polling.

**Rationale**:
- Workspace operations (create project, assign task, approve integration) must be atomic
- Products can tolerate eventual consistency for workspace visibility
- Separation prevents product failures from affecting workspace data

**Implementation**:
- Workspace: Transactions enforce foreign-key constraints and consistency rules
- Products: Poll workspace read-only APIs at regular intervals or receive webhooks
- Conflicts: Workspace is source of truth; products reconcile if divergent

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
| **Analytics** | Metrics snapshots, aggregations | Reporting |

### 5.2 What Lives in Products

| Category | What is stored | Rationale |
|----------|---|---|
| **Customer data** | Customer profiles, accounts, contacts | Product-specific business data |
| **Transactions** | Orders, payments, journeys, usage | Product revenue and analytics |
| **Custom content** | Product-specific documents, artifacts | Product intellectual property |
| **Product metrics** | Product-specific usage, performance, errors | Product observability |

### 5.3 Integration Points

```
Workspace ←→ Product
├── Workspace registers project
├── Product authenticates with workspace-scoped credentials
├── Product sends operational events (signed)
├── Workspace reads project metrics (read-only API)
├── Workspace creates tasks from product incidents
└── Workspace publishes notifications to product events
```

---

## 6. Required Supporting Documents

Before this specification can be approved, the following artifacts must be reviewed:

### **Document 1: Database & ERD** (`2026-11-19-company-workspace-v2-database.md`)
**Contains**:
- Complete executable PostgreSQL schema
- Table definitions with types, constraints, indexes
- Foreign-key relationships and deletion policies
- Entity relationship diagram
- Data dictionary for every column
- Migration strategy and rollback procedures

**Acceptance criteria**:
- All SQL is syntactically valid PostgreSQL
- Every table has primary key and appropriate indexes
- Foreign keys specify `ON DELETE` and `ON UPDATE` behavior
- Unique constraints are workspace or project-scoped (not global)
- ER diagram shows all entities and relationships

### **Document 2: API & Events** (`2026-11-19-company-workspace-v2-api.md`)
**Contains**:
- Complete REST API specification for all endpoints
- Request/response schemas
- Error responses and status codes
- Authentication and authorization requirements
- Webhook event contracts and signatures
- Event processing and retry semantics
- Idempotency keys and deduplication

**Acceptance criteria**:
- Every endpoint specifies method, path, auth, input, output, errors
- Event contracts include timestamp, source, project, payload schema
- Webhooks are signed and can be validated
- Retries and dead-letter handling are defined
- All examples are executable

### **Document 3: Security Model** (`2026-11-19-company-workspace-v2-security.md`)
**Contains**:
- Row-level security (RLS) policies for every table
- Role-based access control (RBAC) matrix
- Permission inheritance rules
- Secrets management and rotation policies
- Audit logging scope and retention
- Data encryption (at rest and in transit)
- Security event detection and response

**Acceptance criteria**:
- RLS policies prevent cross-workspace and cross-project access
- RBAC matrix shows every role and its permissions
- Permission inheritance is explicit and predictable
- Secrets never appear in logs, errors, or responses
- Audit logs capture user, action, timestamp, IP, approval

### **Document 4: Operations** (`2026-11-19-company-workspace-v2-operations.md`)
**Contains**:
- Deployment procedures and CI/CD strategy
- Database backup, recovery and disaster recovery
- Monitoring, alerting and health checks
- Runbooks for common incidents
- Capacity planning and scaling strategy
- Security patching and dependency updates
- Load testing results and performance targets

**Acceptance criteria**:
- Deployment is automated and repeatable
- Backups are tested and can be recovered in < 1 hour
- Monitoring covers all critical systems
- Runbooks exist for common failures
- Recovery time objective (RTO) is defined and tested

---

## 7. Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│          Public Entry Point (Vercel Pages)          │
│        https://routemaster.vercel.app               │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│          Workspace Dashboard & APIs (Next.js)       │
│  Projects · Teams · Tasks · Docs · Support · Infra  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│       Authorization & Authentication Layer          │
│  Clerk (identity) · PostgreSQL (permissions)        │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│     Workspace Database & Services (Supabase)        │
│  PostgreSQL · RLS · Audit · Analytics               │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
   │Upstash  │    │Vercel   │   │External  │
   │Redis    │    │Blob     │   │Services  │
   │(events) │    │(files)  │   │(email,   │
   │         │    │         │   │monitoring)
   └─────────┘    └─────────┘   └──────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │    Product Integrations      │
        │ (Read-only APIs, Webhooks)   │
        └──────────────┬───────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
   │RouteMaster│ │ Fufaji's │  │FamilyFin  │
   │ Database  │ │ Database │  │ Database  │
   │(Supabase) │ │(Supabase)│  │(Supabase) │
   └───────────┘ └──────────┘  └───────────┘
```

---

## 8. Implementation Timeline

| Phase | Deliverable | Duration | Prerequisite |
|-------|---|---|---|
| 1 | Master architecture + supporting specs approved | 0 weeks | Now |
| 2 | Database migrations and RLS policies | 2 weeks | Phase 1 |
| 3 | API endpoints and authentication | 2 weeks | Phase 2 |
| 4 | Dashboard UI (project, team, task modules) | 2 weeks | Phase 3 |
| 5 | Support and documentation systems | 1 week | Phase 4 |
| 6 | Integrations and event processing | 1 week | Phase 5 |
| 7 | Analytics, finance, audit modules | 1 week | Phase 6 |
| 8 | Testing, security audit, production deployment | 2 weeks | Phase 7 |

**Total**: ~11 weeks to production-ready workspace

**Key milestone**: Phase 2 (database) must be approved before Phase 3 (API) begins, as API contracts depend on table schemas.

---

## 9. Approval Gate

**This specification becomes approved when:**

1. ✅ Master architecture document approved (this document)
2. ✅ Database & ERD document approved and schema validated
3. ✅ API & Events document approved and contracts tested
4. ✅ Security Model document approved and policies verified
5. ✅ Operations document approved and procedures documented
6. ✅ No blocking issues remain across all five documents
7. ✅ Explicit approval to proceed with implementation planning

**Once all five are approved**, we invoke `superpowers:writing-plans` to create the step-by-step implementation plan.

---

## 10. What Happens Next

### If Approved
- Invoke `superpowers:writing-plans` with all five specification documents as reference
- Generate task-by-task implementation roadmap
- Begin Phase 1: Database migrations and RLS policies
- Implement, test, and review each phase before proceeding to next

### If Revisions Needed
- Address feedback in the specific supporting document
- Re-submit revised document for approval
- Other approved documents remain valid; only revised one needs re-review

---

## Document Version Control

- **Master spec created**: 2026-11-19
- **Version**: v2
- **Status**: Awaiting supporting document review
- **Supporting documents**: All dated 2026-11-19-v2 for consistency
- **Next milestone**: All five documents approved

**Cross-reference all documents as:**
- Ref: DB:Table `projects` → `2026-11-19-company-workspace-v2-database.md`
- Ref: API: `POST /api/projects` → `2026-11-19-company-workspace-v2-api.md`
- Ref: Security: RLS policy for `projects` → `2026-11-19-company-workspace-v2-security.md`
- Ref: Operations: Deployment procedure → `2026-11-19-company-workspace-v2-operations.md`

---

**Next step**: Review and approve supporting documents sequentially.
