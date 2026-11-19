# RouteMaster Universal Platform — Architecture Design

**Date**: November 19, 2026  
**Status**: Design Review  
**Approval Required**: Yes

---

## 1. Intent and Why

RouteMaster operates three distinct products: RouteMaster (mobility), Fufaji's (commerce), and FamilyFinanceOS (community finance). Today, the corporate website is static. The company needs an **expandable platform** that can support 3, 10, 50+ independent products under one brand identity, without manual code changes to the homepage each time a new product launches.

This design establishes the architecture that enables unlimited product expansion while keeping each product's backend, database, and authentication completely independent.

---

## 2. Goals and Non-Goals

### Goals
- One unified company identity at `routemaster.vercel.app`
- Unlimited product registration without code changes
- Independent databases per product (no data sharing)
- Independent deployments and release cycles
- Centralized project discovery and administration
- Secure, scalable payment and authentication frameworks
- Path-based routing as the default user experience
- Clear separation between platform infrastructure and product operations

### Non-Goals
- Do not build products for every possible use case
- Do not create a shared database for all products
- Do not force products to use identical technology stacks
- Do not support multi-tenant product architectures initially

---

## 3. Constraints

- **Host**: Vercel (existing infrastructure, `routemaster.vercel.app` locked)
- **Database**: Supabase (already in use; each product gets separate project)
- **Authentication**: Clerk (existing integration; product-specific configurations)
- **Payments**: Stripe (primary; UPI/local methods where needed)
- **Email**: Resend (existing; product-specific senders)
- **Monitoring**: Sentry, PostHog (shared standards; separate product projects)
- **CI/CD**: GitHub Actions (reusable workflows across products)
- **Secrets**: Environment-scoped (no shared plaintext credentials)

---

## 4. Approaches Considered

### Approach 1: Platform-First + Incremental Product Validation
Build platform infrastructure (registry, routing, HQ) first, validate with Fufaji's backend, then generalize for other products.

**Chosen**: Yes

**Rationale**: Establishes reusable patterns and prevents design rework when the second product reveals missing infrastructure.

### Approach 2: One Product at a Time
Build Fufaji's completely, extract patterns, adapt to other products.

**Rejected**: Creates debt because the routing gateway and project registry are designed reactively rather than upfront.

### Approach 3: Monolithic Multi-Tenant Backend
One backend service with tenant isolation per product.

**Rejected**: Conflicts with unlimited scalability goal and complicates database isolation.

---

## 5. Architecture Overview

### 5.1 URL Structure and Routing

```
routemaster.vercel.app                        → Corporate portal
routemaster.vercel.app/apps/routemaster       → RouteMaster application
routemaster.vercel.app/apps/fufaji            → Fufaji's application
routemaster.vercel.app/apps/familyfinance     → FamilyFinanceOS application
routemaster.vercel.app/apps/{project-slug}    → Future projects
routemaster.vercel.app/hq                     → Private administration
```

**Routing Gateway**: Central Next.js rewrites gateway (Vercel rewrites, not Services beta).
- Identifies project slug from URL path
- Routes to appropriate upstream application
- Maintains single browser URL while serving multiple applications
- Handles 404s and authentication redirects

### 5.2 Platform Components

#### **Public Portal** (`routemaster.vercel.app`)
- Corporate homepage and company identity
- Dynamic product directory (powered by Project Registry)
- Product discovery, search, and filtering
- Company pages (about, team, technology, careers, contact)
- Developer ecosystem (APIs, SDKs, documentation)
- Customer support and incident status

#### **Private HQ** (`routemaster.vercel.app/hq`)
- Administrator authentication (Clerk)
- Project registration and lifecycle management
- Integration inventory (Stripe, Supabase, GitHub, etc.)
- Deployment visibility and rollback controls
- Team and permission management
- Monitoring dashboard and incident logs
- Financial tracking (costs, subscriptions)

#### **Platform Control Plane**
- **Project Registry**: Centralized metadata about all products
- **Routing Gateway**: Path-based request forwarding
- **Integration Manager**: Credential scoping and health checks
- **Deployment Metadata**: Build history, versions, environments
- **Permission System**: Team members, roles, product access

#### **Reusable Engineering Foundation**
- Shared GitHub organization and repository patterns
- CI/CD workflows (testing, security scanning, deployment)
- Database and API templates
- Authentication patterns and security standards
- Monitoring conventions (Sentry, PostHog integration)
- Documentation templates and runbooks

### 5.3 Independent Product Infrastructure

Each product owns its own:

| Component          | Ownership       | Isolation                                    |
| ------------------ | --------------- | -------------------------------------------- |
| GitHub Repository  | Product team    | Separate repo, independent CI/CD             |
| Frontend           | Product team    | Deployed to independent service              |
| Backend API        | Product team    | Independent microservice                     |
| Database           | Product team    | Separate Supabase project                    |
| Authentication     | Product team    | Separate Clerk configuration                 |
| Payments           | Product team    | Separate Stripe merchant account             |
| Email              | Product team    | Separate Resend sender/domain                |
| Monitoring         | Product team    | Separate Sentry and PostHog projects         |
| Secrets            | Product team    | Environment-specific variables               |
| Deployment         | Product team    | Independent release cycle                    |

---

## 6. Project Registry Schema

```typescript
interface ProjectRecord {
  projectId: string;                    // Unique identifier
  name: string;                         // Display name
  slug: string;                         // URL slug (routemaster, fufaji, familyfinance)
  category: string;                     // Mobility, commerce, finance, ai, etc.
  status: 'idea' | 'development' | 'beta' | 'live' | 'maintenance' | 'archived';
  visibility: 'public' | 'private' | 'invite-only';
  description: string;                  // Product overview
  logo: string;                         // Brand asset URL
  color: string;                        // Accent color (hex)
  frontendUrl: string;                  // Deployment destination
  backendUrl: string;                   // API gateway URL
  databaseType: 'supabase';             // Database provider
  databaseProject: string;              // Supabase project ID (reference only, no access)
  authProvider: 'clerk';                // Authentication provider
  authConfig: string;                   // Clerk instance reference
  paymentProvider?: 'stripe';           // Payment processor
  paymentMerchant?: string;             // Merchant account reference
  team: string[];                       // GitHub usernames of responsible members
  supportEmail: string;                 // Product-specific support contact
  documentation: string;                // Link to product docs
  launchDate: string;                   // ISO 8601
  version: string;                      // Current release version
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;        // Extensible configuration
}
```

**Storage**: Supabase (central company database, separate from product data)

---

## 7. Fufaji's Backend — Validation Implementation

### 7.1 Scope: Fufaji's Complete Backend

Fufaji's is the first product backend to establish reusable patterns.

**Features to implement:**

1. **Shops and Branch Management**
   - Shop registration and profile
   - Branch location, hours, inventory
   - Shop owner authentication and permissions

2. **Product Catalogue**
   - Product creation, update, delete
   - Categories, tags, pricing
   - Inventory management and stock levels
   - Product images and descriptions

3. **Customer Experience**
   - Customer registration and profiles
   - Browse shops and products
   - Shopping cart and wishlist
   - Order placement and tracking

4. **Orders and Fulfillment**
   - Order creation and management
   - Order status workflow (placed, confirmed, preparing, delivering, completed)
   - Delivery address and contact management
   - Order history and analytics

5. **Payment Processing**
   - UPI intent payments (Stripe integration)
   - QR code generation for offline payments
   - Payment reconciliation and settlement
   - Refund and dispute handling
   - PCI-DSS compliance verification

6. **Notifications**
   - Order confirmations (email and SMS)
   - Delivery updates (email and SMS)
   - Shop announcements
   - Promotional notifications
   - Notification preferences and opt-out

7. **Admin Dashboard**
   - Shop owner dashboard (orders, analytics, inventory)
   - Customer support dashboard
   - Financial reporting and payouts
   - Audit logs and activity tracking

### 7.2 Database Schema (Fufaji's)

**Tables**:
- `shops` — Registered shop accounts
- `branches` — Shop locations
- `products` — Product catalogue
- `inventory` — Stock levels per branch
- `customers` — Customer profiles
- `orders` — Order records
- `order_items` — Line items per order
- `payments` — Payment records
- `refunds` — Refund records
- `addresses` — Delivery addresses
- `notifications` — Notification log
- `analytics` — Order and revenue metrics

**Security**:
- Row-level security (RLS) policies per shop and customer
- No cross-tenant data access
- Encrypted sensitive fields (payment tokens, addresses)

### 7.3 API Endpoints (Fufaji's)

**Shop Management**
```
POST /api/shops/register
GET /api/shops/{shopId}
PUT /api/shops/{shopId}
GET /api/shops/{shopId}/branches
POST /api/branches
GET /api/branches/{branchId}/inventory
```

**Product Catalogue**
```
GET /api/products
GET /api/products/{productId}
POST /api/shops/{shopId}/products (shop-owner only)
PUT /api/products/{productId}
DELETE /api/products/{productId}
```

**Orders**
```
POST /api/orders (create)
GET /api/orders/{orderId}
GET /api/customers/orders (customer's order history)
GET /api/shops/{shopId}/orders (shop owner's orders)
PUT /api/orders/{orderId}/status
```

**Payments**
```
POST /api/payments/upi-intent (initiate UPI)
POST /api/payments/qr-code (generate QR)
POST /api/payments/{paymentId}/verify (webhook from Stripe)
GET /api/payments/{paymentId}
```

**Notifications**
```
POST /api/notifications/email
POST /api/notifications/sms
GET /api/notifications/preferences
PUT /api/notifications/preferences
```

---

## 8. Security and Isolation

### 8.1 Database Isolation
- Each product is a separate Supabase project
- No shared database credentials
- Row-level security (RLS) policies enforce tenant boundaries
- Secrets stored in environment variables (Vercel, GitHub)
- Central registry knows project references but not connection strings

### 8.2 Authentication
- Each product has its own Clerk configuration
- No cross-product authentication tokens
- Product-specific login flows
- Clerk organizations map to shops/businesses within product

### 8.3 API Security
- Product APIs behind authenticated gateways
- API keys scoped to individual products
- Rate limiting per API key
- CORS policies restrict cross-origin access
- Input validation and SQL injection prevention
- OWASP Top 10 mitigation

### 8.4 Secrets Management
- Never commit credentials to repositories
- Environment variables per product
- GitHub Actions secrets for CI/CD
- Vercel environment variables for deployments
- Central secrets audit log

---

## 9. CI/CD and Deployment Strategy

### 9.1 GitHub Organization Structure
```
anthropics (or routemaster-company)
├── routemaster-portfolio (corporate site)
├── routemaster-app-backend (RouteMaster API)
├── fufaji-backend (Fufaji's API)
├── familyfinance-backend (FamilyFinanceOS API)
├── [future products]
└── shared-workflows (reusable GitHub Actions)
```

### 9.2 Deployment Pipeline
1. **Development**: Branches trigger preview deployments (Vercel, Vercel Functions for backend)
2. **Staging**: Merge to `staging` branch deploys to staging environment
3. **Production**: Merge to `main` or tagged release triggers production deployment
4. **Approval**: Manual approval required before production release
5. **Rollback**: Git revert or previous version deployment

### 9.3 Testing Strategy
- Unit tests (backend APIs and database functions)
- Integration tests (API endpoints with real database)
- E2E tests (user workflows with Playwright)
- Security scanning (OWASP, dependency vulnerabilities)
- Performance testing (Lighthouse for frontend, load testing for API)

---

## 10. Integration Connector Framework

### 10.1 Shared Integration Standards

| Integration | Purpose              | Setup                            |
| ----------- | -------------------- | -------------------------------- |
| GitHub      | Repository and CI/CD | Organization-level access       |
| Supabase    | Database             | Separate project per product     |
| Clerk       | Authentication       | Separate instance per product    |
| Stripe      | Payments             | Separate merchant account        |
| Resend      | Email                | Separate sender/domain config    |
| Sentry      | Error monitoring     | Separate project per product     |
| PostHog     | Analytics            | Separate project per product     |
| Redis       | Caching (optional)   | Shared with product namespaces   |

### 10.2 Integration Manager (Private HQ)
- Central dashboard showing all integration connections
- Credential scoping and audit trails
- Health checks and incident notifications
- Usage and cost tracking
- Automated setup guides for new products

---

## 11. Deployment Readiness Checklist

Before Fufaji's backend can ship to production:

- [ ] Database schema designed and migrated
- [ ] API endpoints tested and documented
- [ ] Authentication and RLS policies verified
- [ ] Payment integration tested in Stripe sandbox
- [ ] Email templates configured in Resend
- [ ] Error handling and logging configured in Sentry
- [ ] Analytics events configured in PostHog
- [ ] Rate limiting and security headers in place
- [ ] Database backups configured
- [ ] Monitoring dashboards created
- [ ] Incident runbooks written
- [ ] User documentation complete
- [ ] Admin dashboard functional
- [ ] Load testing completed (target: 1000 req/s per endpoint)
- [ ] Security audit passed
- [ ] Accessibility audit passed
- [ ] Cost estimates reviewed
- [ ] Production approval from Anthony Nagar

---

## 12. What Remains to the Builder

After this design is approved, Claude will:

1. Create separate GitHub repositories for Fufaji's backend
2. Set up Supabase project and schema
3. Build Next.js API routes for all endpoints
4. Implement database functions and RLS policies
5. Integrate Stripe, Resend, Sentry, PostHog
6. Write automated tests
7. Configure CI/CD pipeline
8. Create API documentation (OpenAPI/Swagger)
9. Build admin dashboard
10. Prepare deployment to production

The design does not prescribe implementation details (exact libraries, database migrations, Stripe webhooks) — those belong in the builder's implementation.

---

## 13. Success Criteria

This architecture is complete when:

1. ✅ Project Registry stores all product metadata
2. ✅ Routing gateway successfully forwards requests to applications
3. ✅ Fufaji's backend fully implements all specified endpoints
4. ✅ Database isolation and RLS policies prevent cross-tenant access
5. ✅ Payment integration tested end-to-end
6. ✅ CI/CD pipeline deploys automatically on merge
7. ✅ All tests passing (unit, integration, E2E, security)
8. ✅ Monitoring, logging, and alerting configured
9. ✅ Documentation complete and accessible
10. ✅ Security audit passed
11. ✅ Performance targets met (API response times, database queries)
12. ✅ Ready for second product (RouteMaster) using same patterns

---

## 14. Timeline and Phasing

| Phase | Work                                    | Duration |
| ----- | --------------------------------------- | -------- |
| 1     | Platform infrastructure (registry, HQ) | 1 week   |
| 2     | Fufaji's database and schema            | 1 week   |
| 3     | Fufaji's API endpoints                  | 2 weeks  |
| 4     | Payment integration (Stripe)            | 1 week   |
| 5     | Admin dashboard                         | 1 week   |
| 6     | Testing and security audit             | 1 week   |
| 7     | Documentation and deployment            | 1 week   |

**Total**: ~8 weeks to production-ready Fufaji's backend

---

## 15. Important Notes

### No Fake Data
- Use real schemas and realistic field names
- Do not populate production database with placeholder data
- Provide seeding scripts for development/testing only

### Security First
- Never commit secrets to repositories
- All credentials in environment variables
- Database backups before any production schema change
- Encrypted connections for all external services

### Product Independence
- Fufaji's database changes do not affect RouteMaster or FamilyFinanceOS
- Fufaji's payment processor can be swapped without touching other products
- Each product's deployment is independent

### Reusability
- Patterns proven in Fufaji's should be documented
- Templates created for the next product (RouteMaster)
- GitHub Actions workflows shared across repositories

---

**Next Step**: Upon approval, invoke `superpowers:writing-plans` to create the step-by-step implementation plan for Phase 1 (platform infrastructure).

**Approval Required From**: Anthony Nagar (anthonynagar1122@gmail.com)
