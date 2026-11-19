# Loop Spec: Deploy RouteMaster Ecosystem

## Problem / Goal
Deploy RouteMaster portfolio website and three independent product applications to production. Establish domain routing, shared infrastructure, and prepare for public launch.

## Scope
- **IN**: Configure Cloudflare DNS for routemaster.online + 3 subdomains
- **IN**: Deploy portfolio website (Next.js) to routemaster.online
- **IN**: Audit and deploy RouteMaster, Fufaji, Funds-for-Family to subdomains
- **IN**: Configure shared infrastructure (email, monitoring, analytics)
- **IN**: Update content, metadata, SEO
- **OUT**: Actual product application code changes (preserve existing deployments)
- **OUT**: Marketing/PR campaign (documented in separate spec)

## Exit Criteria
1. ✅ routemaster.online loads successfully over HTTPS
2. ✅ Navigation links work and responsive design verified on mobile/desktop
3. ✅ route.routemaster.online, fufaji.routemaster.online, family.routemaster.online all resolve to valid destinations
4. ✅ Cloudflare SSL/TLS configured for all subdomains
5. ✅ Resend email configured and test email sent successfully
6. ✅ Sentry and PostHog initialized and capturing data from portfolio
7. ✅ All pages have meta tags and SEO-friendly metadata

## Verification Plan
- **Browser verification**: Visit routemaster.online and subdomains, check console for errors, test all navigation
- **DNS verification**: nslookup/dig confirmation of all records
- **Service health**: Test email send, verify Sentry/PostHog integration
- **Performance**: Lighthouse score > 90, Core Web Vitals green
- **Metadata**: SEO checker confirms all pages have proper tags

## Success Handoff
PR merged to `claude/sweet-cannon-0l8ly8` with all evidence collected in `.loop/deploy-routemaster/evidence/`

---

**Approval**: Waiting for user confirmation to proceed.
