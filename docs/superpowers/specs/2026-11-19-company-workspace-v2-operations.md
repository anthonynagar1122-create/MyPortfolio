# RouteMaster Company Workspace — Operations v2

**Version**: 2026-11-19-v2  
**Authority For**: Deployment procedures, backups, recovery, monitoring, runbooks  
**Referenced By**: Phase 8 (production readiness)  

---

## 1. Deployment Architecture

### 1.1 Deployment Pipeline

```
GitHub Commit
    ↓
Branch → Feature Branch
    ↓
Unit Tests + Linting
    ↓
Create Pull Request
    ↓
Code Review + Security Scan
    ↓
Merge to `main`
    ↓
GitHub Actions Workflow
    ├── Build Docker image
    ├── Run integration tests
    ├── Upload to Vercel
    ├── Run smoke tests
    └── Notify deployment
    ↓
Production Deployment (Vercel)
    ↓
Monitor for errors (Sentry)
    ↓
Rollback if needed
```

### 1.2 Deployment Targets

| Environment | Branch | Auto-Deploy | Manual Approval | Region |
|---|---|---|---|---|
| Development | develop | Yes (after PR merge) | — | us-east-1 |
| Staging | staging | Yes (hourly sync from main) | — | us-east-1 |
| Production | main | No | Required | us-east-1, eu-west-1 |

### 1.3 Deployment Checklist

Before production deployment, verify:

- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review approved by lead
- [ ] Security scan passed (no high-risk issues)
- [ ] Database migrations tested on staging
- [ ] No secrets in code or logs
- [ ] Performance benchmarks acceptable
- [ ] Rollback plan documented
- [ ] On-call rotation notified
- [ ] Change log updated
- [ ] Monitoring dashboards ready

---

## 2. Database Management

### 2.1 Migrations

**Version control**: All migrations in `supabase/migrations/`

```
-- supabase/migrations/001_initial_schema.sql
CREATE TABLE projects (...)
CREATE INDEX idx_projects_workspace ON projects(workspace_id);

-- supabase/migrations/002_add_project_status.sql
ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'development';
```

**Migration strategy**:
1. Write migration SQL
2. Test locally: `supabase db reset && supabase db push`
3. Test on staging: `supabase db push --linked`
4. Create commit with migration
5. Merge to main
6. Auto-deploy to production (Vercel runs migrations)

**Rollback procedure**:
1. Identify last good migration
2. Create new migration that reverts changes (do not use `DROP` without backing up)
3. Test rollback on staging
4. Deploy new migration to production

**Zero-downtime migrations**:
- ADD COLUMN with DEFAULT: Safe
- ADD INDEX: Safe (non-blocking)
- DROP COLUMN: Requires app-code update first
- ALTER TABLE constraints: Plan downtime
- ALTER PRIMARY KEY: Plan downtime

### 2.2 Backups

**Supabase-managed backups**:
- Daily automated backups (retained 7 days)
- Weekly backups (retained 4 weeks)
- Monthly backups (retained 1 year)
- Stored in AWS S3 (encrypted)

**Backup testing**:
- Monthly restore test to separate database
- Verify data integrity post-restore
- Document restore time (target: < 1 hour)

**Manual backup**:
```bash
# Backup production database
pg_dump postgres://user:pass@host/workspace > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
gunzip -c backup-*.sql | head -100

# Restore to staging (with verification)
psql postgres://user:pass@staging-host/workspace < backup-*.sql
```

### 2.3 Disaster Recovery

**Recovery Time Objective (RTO)**: 1 hour
**Recovery Point Objective (RPO)**: 24 hours

**Disaster recovery steps**:

1. **Detect failure** (Sentry alert)
   - Database connection refused
   - Replication lag > 5 minutes
   - Backup not completed in 48 hours

2. **Assess damage** (1-5 minutes)
   - Check backup integrity
   - Determine last good state
   - Notify on-call team

3. **Restore from backup** (5-30 minutes)
   - Spin up temporary database with backup
   - Verify data integrity
   - Run migrations to match current schema
   - Test application against restored DB

4. **Switch traffic** (5-10 minutes)
   - Update connection strings in Vercel
   - Redeploy application
   - Monitor error rates

5. **Post-mortem** (within 24 hours)
   - Root cause analysis
   - Preventive measures
   - Update runbooks

---

## 3. Monitoring & Alerting

### 3.1 Key Metrics

| Metric | Target | Critical |
|--------|--------|----------|
| API response time (p99) | < 500ms | > 5s |
| Database query time (p99) | < 100ms | > 1s |
| Error rate | < 0.1% | > 1% |
| Uptime | > 99.9% | < 99% |
| Deployment success rate | 100% | < 95% |
| Backup completion | Daily | Missed |

### 3.2 Monitoring Tools

| Tool | Purpose |
|------|---------|
| Sentry | Application errors and performance |
| PostHog | User analytics and feature usage |
| Vercel Analytics | Web Vitals and performance |
| Cloudflare Analytics | CDN and WAF statistics |
| PagerDuty | On-call alerting |

### 3.3 Alert Rules

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High error rate | > 1% errors / 5 min | Critical | Page on-call |
| Database down | Connection timeout | Critical | Failover to replica |
| Replication lag | > 5 minutes | High | Alert + investigate |
| Response time spike | p99 > 5s / 10 min | High | Investigate + possibly rollback |
| Deployment failure | Build error | Medium | Investigate + rollback |
| Backup missed | No backup in 48h | High | Manual backup + investigate |
| Rate limit exceeded | > 10 users hitting limit | Medium | Monitor + adjust if needed |
| Unauthorized access | 5+ 401 from same IP | Medium | Log + review audit logs |

### 3.4 Dashboards

**Production Health Dashboard**:
- API request rate and latency (p50, p95, p99)
- Error rate by endpoint
- Database query performance
- Active users and sessions
- Deployment history
- Backup status
- Uptime percentage

**Security Dashboard**:
- Failed auth attempts (by IP, user)
- API rate limit violations
- Unusual data access patterns
- Credential rotation status
- Security event log

---

## 4. Runbooks

### 4.1 High Error Rate

**Trigger**: > 1% errors / 5 minutes

**Diagnosis** (5 minutes):
1. Check Sentry for error pattern
2. Check database connectivity
3. Check external service integrations
4. Check deployment history (recent rollout?)

**Response options**:

**Option A: Rollback**
```bash
# Identify last good commit
git log --oneline | head -5

# Check current deployment
vercel ls --prod

# Rollback to previous version
vercel rollback <project-name>

# Verify error rate dropped
# Monitor Sentry for 10 minutes
```

**Option B: Scale up**
```bash
# If CPU/memory is high
vercel scale <project> --memory=2048
vercel scale <project> --builds=5

# Monitor for 10 minutes
```

**Option C: Database issue**
```bash
# Check slow queries
SELECT query, calls, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

# Check locks
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY query_start;

# Restart connection pool
vercel env set DATABASE_POOL_SIZE=20
vercel deploy --prod
```

### 4.2 Database Connection Failure

**Trigger**: Connection refused, too many connections

**Diagnosis**:
1. Check database uptime (Supabase dashboard)
2. Check connection pool exhaustion (logs)
3. Check for query hangs

**Response**:
```bash
# Option 1: Increase pool size
ALTER SYSTEM SET max_connections = 300;
SELECT pg_reload_conf();

# Option 2: Kill idle connections (if safe)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND now() - query_start > interval '10 minutes'
AND pid <> pg_backend_pid();

# Option 3: Failover to replica (if configured)
# Update REPLICA_CONNECTION_STRING env var
vercel env set DATABASE_URL "postgres://replica-host/workspace"
vercel deploy --prod
```

### 4.3 Replication Lag

**Trigger**: Replica lag > 5 minutes

**Diagnosis**:
1. Check primary database load
2. Check network connectivity
3. Check replica resources

**Response**:
```bash
# Check lag
SELECT EXTRACT(EPOCH FROM (now() - pg_last_wal_receive_lsn())) as lag_seconds;

# If lag > 5 minutes
# Option 1: Promote replica to primary
SELECT pg_promote();

# Option 2: Resync replica
-- Stop replica
-- Rebase from primary
-- Restart replication

# Option 3: Redirect reads
-- Temporarily disable read replicas
-- Route all queries to primary
-- Monitor until lag clears
```

### 4.4 Deployment Failure

**Trigger**: Build error or smoke test failure

**Diagnosis** (3 minutes):
1. Check GitHub Actions logs
2. Check Vercel build log
3. Check deployment preview (if available)

**Response**:
```bash
# Option 1: Fix and retry
git revert <commit-hash>
git push origin main
# GitHub Actions will auto-retry

# Option 2: Rollback immediately
vercel rollback <project-name>

# Option 3: Hotfix
git commit --allow-empty -m "Hotfix: redeploy"
git push origin main
```

### 4.5 Data Corruption Suspected

**Trigger**: Unexpected data changes, missing records

**Diagnosis** (10 minutes):
1. Check audit logs for unauthorized changes
2. Check backup integrity
3. Identify affected data range

**Response**:
1. Take database offline from writes (read-only mode)
   ```sql
   ALTER DATABASE workspace SET default_transaction_read_only = on;
   ```

2. Restore from backup to staging
   ```bash
   pg_restore -d workspace-staging backup-*.dump
   ```

3. Compare staging vs production (data diff)
   ```bash
   diff <(pg_dump workspace) <(pg_dump workspace-staging) | head -100
   ```

4. Decide: rollback or surgical fix
   - If < 1% of data affected: surgical fix (UPDATE specific rows)
   - If > 1% of data affected: restore from backup

5. If restoring from backup:
   ```bash
   # Verify data matches
   SELECT COUNT(*) FROM projects;  -- Compare vs staging
   
   # Return to production
   ALTER DATABASE workspace SET default_transaction_read_only = off;
   ```

---

## 5. Performance Tuning

### 5.1 Database Query Optimization

**Common performance issues**:

| Issue | Symptom | Fix |
|-------|---------|-----|
| Missing index | Query time > 1s, full table scan | CREATE INDEX |
| N+1 queries | Multiple sequential queries | Use JOIN or batch query |
| Slow aggregation | COUNT/GROUP BY slow | Materialize view |
| Bloated table | High disk usage | VACUUM, REINDEX |

**Query optimization checklist**:
```sql
-- 1. Check execution plan
EXPLAIN ANALYZE SELECT ...;

-- 2. Look for sequential scans (should be index scans)
-- 3. Look for high node costs
-- 4. Add index if needed
CREATE INDEX idx_name ON table(column) WHERE condition;

-- 5. Re-run query to verify
EXPLAIN ANALYZE SELECT ...;
```

### 5.2 API Caching

- **Cache project metadata**: 5 minutes (rarely changes)
- **Cache documentation**: 1 hour (versioned)
- **Cache analytics**: 1 hour (batch updated)
- **Don't cache**: User permissions, real-time tasks, audit logs

### 5.3 Load Testing

**Monthly load test**:
```bash
# Simulate 100 concurrent users for 10 minutes
ab -n 1000 -c 100 https://api.routemaster.app/api/v1/projects

# Monitor:
# - Response time (target: < 1s p99)
# - Throughput (target: > 100 req/s)
# - Error rate (target: 0%)
# - CPU / memory usage
```

---

## 6. Security Operations

### 6.1 Credential Rotation

**Quarterly rotation**:
1. API keys (Stripe, GitHub, etc.)
2. Database passwords
3. Webhook signing secrets

**Process**:
```bash
# 1. Generate new credential in external system
# 2. Store in Vercel env var (new name)
STRIPE_API_KEY_NEW=sk_live_...

# 3. Update application code to read new var
# 4. Deploy and test on staging
# 5. Deploy to production
# 6. Verify new credential works
# 7. Revoke old credential in external system
# 8. Remove old env var
```

### 6.2 Dependency Updates

**Weekly dependency scan**:
```bash
npm audit
npm audit fix  # Apply non-breaking updates

git commit -m "deps: security updates"
git push origin main
```

**Monthly manual review**:
- Check for major version updates
- Read changelog for breaking changes
- Plan update if needed
- Test on staging first

### 6.3 Access Control Review

**Monthly review**:
1. List all workspace members
2. Verify role assignment is current
3. Remove inactive users
4. Update team memberships
5. Audit recent permission changes

---

## 7. Incident Response

### 7.1 Incident Classification

| Severity | Definition | Response Time |
|----------|-----------|---|
| **Critical** | Service unavailable, data corruption, security breach | Immediate (< 5 min) |
| **High** | Degraded service, partial outage | < 30 minutes |
| **Medium** | Non-critical features affected | < 2 hours |
| **Low** | Minor issues, cosmetic | Next business day |

### 7.2 Incident Response Steps

1. **Detect** (Sentry, monitoring alert)
2. **Page on-call** (PagerDuty)
3. **Assess** (determine severity and impact)
4. **Communicate** (notify stakeholders, post status)
5. **Mitigate** (apply fix or workaround)
6. **Resolve** (verify issue is fixed)
7. **Post-mortem** (within 24 hours, within 1 week)
8. **Follow-up** (implement preventive measures)

### 7.3 Communication During Incidents

- **Status page**: Update every 30 minutes
- **Slack**: #incidents channel with real-time updates
- **Email**: Notify affected users once
- **Post-mortem**: Share findings and fixes

---

## 8. Maintenance Windows

**Planned maintenance**:
- **Frequency**: Monthly, on first Tuesday 2-4 AM UTC
- **Window**: 2 hours
- **Notification**: 7 days advance notice
- **Scope**: Database maintenance, security updates, non-breaking changes

**Maintenance tasks**:
- VACUUM and ANALYZE databases
- Update system packages
- Rotate certificates
- Update dependencies (non-breaking)
- Optimize slow queries
- Audit log cleanup

---

## 9. Scaling Strategy

**When to scale**:
- CPU > 70% for > 10 minutes
- Memory > 80% for > 10 minutes
- Error rate > 0.1%
- Database connections > 80% of limit

**Horizontal scaling**:
```bash
# Increase concurrent builds
vercel scale <project> --builds=10

# Add read replicas (if needed)
-- Configure replica in Supabase
-- Update read-only connection string
```

**Vertical scaling**:
```bash
# Increase memory per instance
vercel scale <project> --memory=4096

# Increase database resources
-- Upgrade Supabase plan
-- Monitor for performance improvement
```

---

**Authority**: This document defines operational procedures. See security model for incident response policies.
