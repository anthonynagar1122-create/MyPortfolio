# Portfolio security audit — 27-point checklist

Date: 2026-11-24
Repository: anthonynagar1122-create/MyPortfolio
Application root: portfolio/
Base branch: claude/sweet-cannon-0l8ly8
Audit branch: security/portfolio-27-point-audit

## Scope and current architecture
- Next.js App Router, React 19, TypeScript
- Clerk authentication integration
- Supabase JS client (project association not verified)
- Resend for transactional email
- Vercel deployment project: myportfolio-portfolio
- Custom domain / portfolio production alias requires owner confirmation

## Findings from source review
1. Authentication: ClerkProvider and sign-in/sign-up routes exist. proxy.ts currently allows all page routes and contains a false placeholder instead of protection. This is acceptable only while all routes are intentionally public; all admin/data mutations must independently authenticate and authorize.
2. Secrets: .gitignore ignores .env*. SUPABASE_SERVICE_ROLE_KEY is read by a general module lib/supabase.ts. Move privileged client to a server-only module and prohibit imports from client components. Verify actual Vercel env values and exposure with the deployment owner; no secrets were read.
3. Database access: service-role client bypasses RLS. Public client uses anon key. Actual Supabase project for portfolio not identified. Verify policies and ownership before any SQL change.
4. HTTPS: Vercel deployment is HTTPS. HSTS not currently configured in next.config.ts.
5. Password hashing: delegate to Clerk; do not implement custom password storage or Argon2id in this app unless auth ownership changes. Verify Clerk policy in dashboard.
6. Validation: contact endpoint validates some fields but trusts JSON types, accepts arbitrary product, has no explicit body-size cap, and can throw on malformed JSON. Use schema validation.
7. XSS: contact email HTML escapes dynamic values. CSP is permissive and needs a framework-compatible nonce strategy before tightening.
8. Logging: raw email and forwarded IP are logged; reduce personal data and use structured redaction. Avoid logging user-supplied error content.
9. Authorization: no explicit admin implementation was confirmed from reviewed files. Audit every mutation route and enforce server-side owner/role checks.
10. SQL: reviewed contact insert uses Supabase query builder. Inspect all remaining data access and RPCs; parameterization cannot be inferred from a partial review.
11. Secret exposure: .gitignore covers .env*. Full Git-history secret scan still required using Gitleaks in CI/local environment. Never print secret values.
12. Rate limiting: contact endpoint uses process-local Map, which is ineffective across serverless instances and restarts. Replace with shared atomic rate limiter (e.g. Upstash) or database-backed limiter.
13. CORS: global API headers allow wildcard in non-production and static production origin; use exact allowlist with dynamic Origin validation and Vary: Origin, or avoid CORS when same-origin only.
14. Headers: X-Content-Type-Options, X-Frame-Options and Referrer-Policy are configured. Add HSTS for production; CSP needs Clerk/Supabase/Resend-compatible nonce/host policy. Remove obsolete X-XSS-Protection.
15. Cookies: Clerk manages auth cookies. Do not hand-roll or override; verify production Secure/HttpOnly/SameSite behavior.
16. CSRF: inspect mutation routes. SameSite alone is not a complete CSRF strategy for all cases; add Origin/Host validation and CSRF token where cookie-authenticated cross-site mutation is possible.
17. Password reset: owned by Clerk; verify expiry and one-time token semantics in Clerk configuration.
18. File uploads: no upload route discovered in initial source tree. If later added, restrict content types, sizes, filenames, and scan content.
19. Payments: no payment integration confirmed in the portfolio. If added, verify amount/currency server-side and trust verified webhooks only.
20. Debug: inspect Vercel env and build output; source review did not establish production debug setting. Ensure no sensitive client console output.
21. Dependencies: current package scripts lack audit script. Run npm audit / Dependabot and review advisories in CI.
22. Unused packages: package.json and package-lock show dependency mismatch (Three/GSAP/Framer packages appear in lock root but not package manifest). Confirm install state and usage before removal.
23. Public files: .gitignore protects env files; test deployment paths for /.env, /.git/config, backups and dumps. Do not infer absence from source tree alone.
24. Git history: not scanned through GitHub connector. Run gitleaks over full history in a trusted environment.
25. Key rotation: no exposed key confirmed, so no credentials rotated. If a real secret leak is found, revoke and replace it through provider dashboards immediately.
26. Security tests: existing contact-security.test.ts imports Jest globals, but package.json does not configure Jest or a test script. Current tests may not run. Add a supported test runner or rewrite using existing Playwright.
27. Report: this audit records source evidence and outstanding verification; it is not a penetration test or production security certification.

## Current priority actions
- P0: isolate service-role Supabase client with server-only guard; identify actual portfolio Supabase project; confirm all write endpoints have auth/authorization.
- P1: shared rate limiting, strict request schema and body size, CORS/Origin checks, HSTS and CSP strategy, sensitive-log redaction.
- P1: make security tests executable in CI and run build/lint/type checks.
- P2: dependency reconciliation and full-history secret scan; externally test public exposure paths.
- P2: verify Clerk cookie/password reset configuration, upload/payment surfaces, Vercel production environment and Sentry monitoring.

## Explicit non-actions
- No production branch changes.
- No production deployment or alias changes.
- No database schema or RLS mutations.
- No secret values retrieved, copied, or changed.
- No merge performed.
