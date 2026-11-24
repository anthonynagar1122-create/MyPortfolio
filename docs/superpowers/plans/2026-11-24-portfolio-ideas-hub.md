# Portfolio & Ideas Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the RouteMaster company site in `portfolio/` with a personal portfolio where visitors browse project and idea cards, comment, vote "I want this" on ideas, suggest ideas, subscribe by email, and see public visitor and comment counters.

**Architecture:** Next.js 16 App Router on Vercel. Supabase Postgres holds all data; all writes go through server route handlers that use the service-role client, with the browser only ever seeing the anon key. Clerk provides sign-in for commenting, voting and the owner-only admin. Resend sends double opt-in and launch emails. Visitor counting uses a daily-rotating salted hash, stored in a `visits` table.

**Tech Stack:** Next.js 16.4.6, React 19.3, TypeScript, Tailwind CSS 4.3, Supabase (`@supabase/supabase-js`), Clerk (`@clerk/nextjs`), Resend, Vitest (new, unit tests), Playwright (already in devDependencies, end-to-end tests).

**Spec:** `docs/superpowers/specs/2026-11-24-portfolio-ideas-hub-design.md` (approved 2026-11-24)

**Path convention:** Paths starting with `portfolio/` are relative to the repo root. Paths without it are relative to `portfolio/`. Unless noted, commands run from `portfolio/`.

## Global Constraints

- Next.js 16 breaks older conventions. Before writing any Next-specific code, read the relevant guide in `portfolio/node_modules/next/dist/docs/` (per `portfolio/AGENTS.md`).
- `proxy.ts` is the Next 16 replacement for `middleware.ts`. Keep that file name.
- Colours and type come only from the design tokens in the spec, section 15: accent `#2563EB`, background `#FAFAF7` (dark `#0F1115`), text `#1A1A1A`, muted `#5C5C5C`, border `#E5E5E0`, Inter for everything, minimum text size 12px.
- Breakpoints: 375, 768, 1024, 1440 CSS px. Cards are 1 column, 2 columns at 768, 3 columns at 1024+, max width 1200px.
- The service-role key is server-only. It must never appear in a `NEXT_PUBLIC_` variable or in any client component.
- No secrets in the repo. `.env*` stays git-ignored.
- English only.
- Do not add an AI model name to commit messages or PR text.

## Review Focus

1. **Comment bodies containing markup or `javascript:` links.** Expected: stored as plain text, escaped on output, links rendered only with `http(s)` schemes and `rel="nofollow ugc"`. Pinned in Task 4 (`sanitizeText`, `isSafeUrl`) and Task 7 (comment API test).
2. **Double votes or double submits from one user under concurrent clicks.** Expected: one vote row per user per idea; second insert returns the existing vote, not an error page. Pinned in Task 7 (vote API test with a unique-violation case).
3. **Subscribing with an email that already unsubscribed.** Expected: no reactivation without a new explicit opt-in; the response does not reveal whether the address exists. Pinned in Task 7 (subscribe API test).
4. **Empty site: no cards, no comments, zero visitors.** Expected: pages render with empty-state messages and zero counters, never a divide-by-zero or a broken grid. Pinned in Task 8 (home page e2e with empty fixture).
5. **Long or malformed input: 500-character titles, `live_url` values like `javascript:alert(1)`, or a title that is only whitespace.** Expected: rejected with a field-level error; values longer than the limit are rejected, not truncated silently. Pinned in Task 3 (`validateItemInput`).

---

### Task 0: Test tooling and baseline

**Files:**
- Modify: `portfolio/package.json` (add scripts and devDependencies)
- Create: `portfolio/vitest.config.ts`
- Delete: `portfolio/__tests__/api/contact-security.test.ts` (it imports `@jest/globals` and runs nothing today)
- Create: `portfolio/__tests__/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `npm test` runs Vitest; `npm run test:e2e` runs Playwright.

- [ ] **Step 1: Write a smoke test**

```ts
// portfolio/__tests__/smoke.test.ts
import { expect, it } from "vitest";
it("runs", () => { expect(1 + 1).toBe(2); });
```

- [ ] **Step 2: Install Vitest and run the smoke test to see it fail**

Run: `npm install -D vitest@^3`, then `npx vitest run`
Expected: FAIL, because `vitest.config.ts` and the `test` script do not exist yet.

- [ ] **Step 3: Add config and scripts**

`vitest.config.ts` sets `environment: "node"` and `include: ["__tests__/**/*.test.ts"]`. In `package.json` add `"test": "vitest run"` and `"test:e2e": "playwright test"`. Delete the old Jest-based test file.

- [ ] **Step 4: Verify the smoke test passes**

Run: `npm test`
Expected: `1 passed`.

- [ ] **Step 5: Commit**

```bash
git add portfolio/package.json portfolio/package-lock.json portfolio/vitest.config.ts portfolio/__tests__
git commit -m "chore: add vitest and drop unrunnable jest test"
```

---

### Task 1: Remove the RouteMaster content

**Files:**
- Delete: `portfolio/app/about/`, `portfolio/app/team/`, `portfolio/app/careers/`, `portfolio/app/partners/`, `portfolio/app/technology/`, `portfolio/app/ecosystem/`, `portfolio/app/founder/`, `portfolio/app/routemaster/`, `portfolio/app/products/`, `portfolio/app/home-content.tsx`, `portfolio/app/contact/`
- Delete: `portfolio/components/core/`, `portfolio/components/hero/`, `portfolio/components/layout/`, `portfolio/components/navigation/`, `portfolio/components/products/`
- Delete: `portfolio/config/products.ts`, `portfolio/config/site-content.ts`, `portfolio/COMPONENTS.md`
- Modify: `portfolio/app/layout.tsx` (metadata, fonts), `portfolio/app/page.tsx` (replaced in Task 8)
- Modify: `portfolio/proxy.ts` (public routes list)

**Interfaces:**
- Consumes: nothing.
- Produces: an app with only `app/layout.tsx`, `app/page.tsx` placeholder, `app/sign-in`, `app/sign-up`, `app/privacy`, `app/terms`, `app/globals.css`, `proxy.ts`, `lib/supabase.ts`. Later tasks build on that.

- [ ] **Step 1: Check the build before deleting anything**

Run: `npm run build`
Expected: builds. This is the baseline to compare against.

- [ ] **Step 2: Delete the listed paths**

Use `git rm -r` on each path above. Keep `app/privacy` and `app/terms` for now; Task 11 rewrites them.

- [ ] **Step 3: Replace the placeholder home page**

`app/page.tsx` renders a single `<h1>` with the site name placeholder "Your Name" and the tagline from the spec. This is a stub to make the build pass, not the final page.

- [ ] **Step 4: Update metadata in `app/layout.tsx`**

Set `title` to "Your Name — Ideas and Projects", `description` to the tagline, and remove the RouteMaster OpenGraph image and keywords. Keep the Inter font; remove Space Grotesk and JetBrains Mono (the spec says Inter throughout).

- [ ] **Step 5: Simplify public routes in `proxy.ts`**

Remove the `/ecosystem`, `/routemaster`, `/fufaji`, `/funds` entries from `isPublicRoute`. The matcher stays as it is.

- [ ] **Step 6: Verify the build passes**

Run: `npm run build && npm run lint`
Expected: build succeeds; lint has no errors from deleted files.

- [ ] **Step 7: Commit**

```bash
git add -A portfolio
git commit -m "refactor: remove RouteMaster company content"
```

---

### Task 2: Database schema and row-level security

**Files:**
- Create: `portfolio/supabase/migrations/0001_portfolio_hub.sql`
- Create: `portfolio/supabase/README.md` (how to apply the migration; short)

**Interfaces:**
- Consumes: nothing.
- Produces: tables `items`, `comments`, `idea_votes`, `idea_suggestions`, `subscribers`, `visits`, `rate_limits`, `page_views`, and the Storage bucket `covers`. Column names are exactly as listed below; later tasks rely on them.

Tables (all have `id uuid primary key default gen_random_uuid()` and `created_at timestamptz not null default now()`):

- `items`: `type text check (type in ('project','idea'))`, `slug text unique not null`, `title text not null`, `short_description text not null`, `description text not null default ''`, `status text not null`, `category text not null`, `tags text[] not null default '{}'`, `cover_url text`, `live_url text`, `demo_url text`, `android_url text`, `ios_url text`, `published boolean not null default false`, `sort_order int not null default 0`, `updated_at timestamptz not null default now()`.
- `comments`: `item_id uuid references items(id) on delete cascade`, `author_id text not null`, `author_name text not null`, `author_avatar text`, `body text not null check (char_length(body) between 1 and 1000)`, `is_owner boolean not null default false`, `hidden boolean not null default false`.
- `idea_votes`: `item_id uuid references items(id) on delete cascade`, `user_id text not null`, `budget_range text check (budget_range in ('free','under_10','10_50','over_50','not_sure'))`, unique `(item_id, user_id)`.
- `idea_suggestions`: `title text not null`, `description text not null`, `audience text`, `budget_range text`, `contact_email text`, `submitter_name text`, `credit_ok boolean not null default false`, `status text not null default 'new' check (status in ('new','published','dismissed'))`.
- `subscribers`: `email text unique not null`, `status text not null check (status in ('pending','confirmed','unsubscribed'))`, `confirm_token text`, `consent_at timestamptz not null`, `source text`.
- `visits`: `day date not null`, `visitor_hash text not null`, `last_seen timestamptz not null default now()`, unique `(day, visitor_hash)`.
- `rate_limits`: `key text primary key`, `window_start timestamptz not null`, `count int not null default 0`.
- `page_views`: `item_id uuid references items(id) on delete cascade`, `day date not null`, `count int not null default 0`, unique `(item_id, day)`.

RLS: enable on every table. Policies: `items` readable when `published = true`; `comments` readable when `hidden = false`; no direct client writes on any table. Public counters read through a `security definer` SQL function `public_stats()` that returns active-now, visitors today, visitors in last 7 days, total comments and confirmed subscribers as one row; the anon role gets execute on that function only.

- [ ] **Step 1: Write a SQL test script that fails before the migration exists**

Create `portfolio/supabase/tests/schema.sql` that inserts one published item, one comment, one vote and calls `public_stats()`, and raises an exception if any of them is missing.

- [ ] **Step 2: Run it against a local or branch database and confirm it fails**

Run: `supabase db reset` (local) then `psql "$DATABASE_URL" -f supabase/tests/schema.sql`
Expected: error, because tables do not exist yet.

- [ ] **Step 3: Write the migration** with the tables, unique constraints, RLS policies, the `public_stats()` function and the `covers` bucket (public read, owner-only write).

- [ ] **Step 4: Apply and rerun the schema test**

Expected: script completes with no exception.

- [ ] **Step 5: Confirm anon cannot write**

Run as the anon role: `insert into items (...)`. Expected: permission or RLS error.

- [ ] **Step 6: Commit**

```bash
git add portfolio/supabase
git commit -m "feat(db): portfolio hub schema with RLS and public_stats()"
```

---

### Task 3: Validation and configuration (pure functions)

**Files:**
- Create: `portfolio/lib/config.ts` (site name, tagline, category list, status lists per type)
- Create: `portfolio/lib/validation.ts`
- Create: `portfolio/__tests__/validation.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `config.ts`: `export const site = { name: "Your Name", tagline: "Ideas, projects, and what people actually want." }`; `export const categories: string[]` (start with `["Web", "Mobile", "AI", "Tools", "Other"]`); `export const statuses: { project: string[]; idea: string[] }` (`project: ["Live","In progress","Paused","Archived"]`, `idea: ["Idea","Exploring","Building","Shipped"]`).
  - `validation.ts`:
    - `slugify(title: string): string` (lowercase, ASCII letters/digits/hyphens, no leading or trailing hyphen, max 60 chars).
    - `isSafeUrl(value: string): boolean` (true only for `https://` URLs; `http://` and `javascript:` false).
    - `sanitizeText(value: string): string` (trims, strips control characters except newline, collapses 3+ newlines to 2).
    - `validateItemInput(input: unknown): { ok: true; value: ItemInput } | { ok: false; errors: Record<string,string> }` where `ItemInput` has `type`, `title` (1–100 chars after trim, not whitespace-only), `short_description` (1–160), `description` (0–5000), `status` (must be in `statuses[type]`), `category` (must be in `categories`), `tags` (max 5, each 1–24 chars), `live_url` (required for projects, `isSafeUrl`), `demo_url`/`android_url`/`ios_url` (optional, `isSafeUrl`).
    - `validateComment(body: unknown): { ok: true; body: string } | { ok: false; error: string }` (after `sanitizeText`, 1–1000 chars).
    - `validateSuggestion(input: unknown)`, `validateEmail(email: string): boolean`.

- [ ] **Step 1: Write failing tests** in `__tests__/validation.test.ts`, one `it` per behaviour:
  - `slugify("Hello, World! 2026")` → `"hello-world-2026"`
  - `isSafeUrl("javascript:alert(1)")` → `false`; `isSafeUrl("http://example.com")` → `false`; `isSafeUrl("https://example.com")` → `true`
  - `sanitizeText("  hi\u0000there  ")` → `"hithere"`
  - `validateItemInput` with a project missing `live_url` → `errors.live_url` set
  - `validateItemInput` with `title: "   "` → `errors.title` set
  - `validateItemInput` with a 101-character title → `errors.title` set (not truncated)
  - `validateComment("<script>x</script>")` → ok, and body still contains the raw text (escaping happens on output, not on storage)

- [ ] **Step 2: Run and confirm they fail**

Run: `npm test -- validation`. Expected: module not found.

- [ ] **Step 3: Implement** `config.ts` and `validation.ts` to satisfy the tests.

- [ ] **Step 4: Run and confirm they pass**

Run: `npm test -- validation`. Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add portfolio/lib portfolio/__tests__/validation.test.ts
git commit -m "feat: input validation and site config"
```

---

### Task 4: Visitor hashing and DB-backed rate limiting

**Files:**
- Create: `portfolio/lib/visitor.ts`
- Create: `portfolio/lib/rate-limit.ts`
- Create: `portfolio/__tests__/visitor.test.ts`
- Create: `portfolio/__tests__/rate-limit.test.ts`

**Interfaces:**
- Consumes: nothing at import time. `rate-limit.ts` takes a Supabase-like client as a parameter so it can be tested without a network.
- Produces:
  - `visitor.ts`: `visitorHash(ip: string, userAgent: string, day: string, secret: string): string` (SHA-256 hex of `ip|ua|day|secret`; same inputs give the same hash, a different day gives a different hash). `isLikelyBot(userAgent: string): boolean`. `today(timezone: string): string` returns `YYYY-MM-DD` in that timezone.
  - `rate-limit.ts`: `checkRateLimit(db: RateLimitStore, key: string, limit: number, windowSeconds: number, now?: Date): Promise<{ allowed: boolean; retryAfterSeconds: number }>`. `RateLimitStore` is an interface with one method, `increment(key, windowStart): Promise<number>`, which the Supabase implementation fulfils by upserting the row and returning the count.

- [ ] **Step 1: Write failing tests**
  - `visitorHash` is stable for the same inputs and changes when `day` changes.
  - `visitorHash` output does not contain the IP string.
  - `isLikelyBot("Googlebot/2.1")` → `true`; a Chrome user agent → `false`; empty string → `true`.
  - `checkRateLimit` with an in-memory `RateLimitStore`: 5 calls with `limit = 5` are allowed, the 6th is not, and `retryAfterSeconds` is between 1 and `windowSeconds`.
  - `checkRateLimit` allows again after the window passes (advance `now`).

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement** using Node's built-in `crypto` (no new dependency).

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Commit**

```bash
git add portfolio/lib portfolio/__tests__
git commit -m "feat: salted daily visitor hash and DB-backed rate limit"
```

---

### Task 5: Server Supabase access and owner-only admin guard

**Files:**
- Modify: `portfolio/lib/supabase.ts` (keep the server client; remove the browser client, which is not used)
- Create: `portfolio/lib/env.ts` (typed read of required env vars; throws a clear error in production if one is missing)
- Create: `portfolio/lib/admin.ts`
- Create: `portfolio/__tests__/admin.test.ts`

**Interfaces:**
- Consumes: Clerk `auth()` from `@clerk/nextjs/server`.
- Produces:
  - `env.ts`: `export function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY" | "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | "CLERK_SECRET_KEY" | "RESEND_API_KEY" | "ADMIN_CLERK_USER_ID" | "VISITOR_SALT_SECRET" | "SITE_URL"): string`.
  - `supabase.ts`: `export function getServerDb(): SupabaseClient` (service role, throws if env missing).
  - `admin.ts`: `export function isOwner(userId: string | null, ownerId: string): boolean`; `export async function requireOwner(): Promise<{ userId: string }>` which throws a `Response` with status 401 or 403 when the caller is not the owner.

- [ ] **Step 1: Write failing tests** for `isOwner`: `null` → false; a different ID → false; the owner's ID → true; an empty `ownerId` → false (never grant access when unset).

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement** `env.ts`, `admin.ts` and the `supabase.ts` change.

- [ ] **Step 4: Run and confirm they pass.** Then `npm run build`; expect no client bundle to include `SUPABASE_SERVICE_ROLE_KEY` (search the `.next/static` output for the variable name).

- [ ] **Step 5: Commit**

```bash
git commit -am "feat: server-only db client and owner guard" -- portfolio/lib
```

---

### Task 6: Data access layer

**Files:**
- Create: `portfolio/lib/db/items.ts`, `portfolio/lib/db/comments.ts`, `portfolio/lib/db/votes.ts`, `portfolio/lib/db/suggestions.ts`, `portfolio/lib/db/subscribers.ts`, `portfolio/lib/db/visits.ts`, `portfolio/lib/db/stats.ts`
- Create: `portfolio/__tests__/db/items.test.ts` (one representative test; the rest follow the same pattern)

**Interfaces:**
- Consumes: `getServerDb()` from Task 5; types from Task 3.
- Produces (exact names later tasks call):
  - `items.ts`: `listPublishedItems(filter: { type?: "project"|"idea"; category?: string; status?: string; sort: "newest"|"most_wanted"|"most_commented" }): Promise<ItemRow[]>`; `getItemBySlug(slug: string): Promise<ItemRow | null>`; `listAllItems(): Promise<ItemRow[]>` (admin); `saveItem(input: ItemInput, id?: string): Promise<ItemRow>`; `deleteItem(id: string): Promise<void>`.
  - `comments.ts`: `listVisibleComments(itemId: string): Promise<CommentRow[]>`; `insertComment(input: { itemId; authorId; authorName; authorAvatar; body; isOwner }): Promise<CommentRow>`; `setCommentHidden(id: string, hidden: boolean): Promise<void>`; `deleteOwnComment(id: string, authorId: string): Promise<boolean>`.
  - `votes.ts`: `addVote(itemId: string, userId: string, budgetRange: string | null): Promise<{ created: boolean; wantCount: number }>` (uses insert with `on conflict do nothing`; `created` is false on a repeat). `removeVote(itemId, userId): Promise<number>`. `wantCounts(itemIds: string[]): Promise<Map<string, number>>`.
  - `suggestions.ts`: `insertSuggestion(input): Promise<void>`; `listSuggestions(status?: string)`; `setSuggestionStatus(id, status)`.
  - `subscribers.ts`: `upsertPending(email, token, source): Promise<{ state: "new" | "already_pending" | "already_confirmed" | "unsubscribed" }>`; `confirmByToken(token): Promise<boolean>`; `unsubscribe(email): Promise<void>` (keeps the row as `unsubscribed`); `countConfirmed(): Promise<number>`.
  - `visits.ts`: `recordVisit(day, visitorHash): Promise<void>` (upsert, updates `last_seen`).
  - `stats.ts`: `getPublicStats(): Promise<{ activeNow: number; visitorsToday: number; visitorsWeek: number; totalComments: number }>`, reading the `public_stats()` function from Task 2.

- [ ] **Step 1: Write one failing test** for `addVote`: first call returns `created: true`, second call for the same user returns `created: false`. Use a fake client that implements the `on conflict` behaviour as a `Map` keyed by `(item_id, user_id)`. Keep the fake in `__tests__/db/fake-db.ts`.

- [ ] **Step 2: Run and confirm it fails.**

- [ ] **Step 3: Implement** the modules. Every function takes its client via `getServerDb()`; none reads env directly.

- [ ] **Step 4: Run and confirm it passes.** Then run `npx tsc --noEmit`; expect no type errors.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: data access layer for items, comments, votes, subscribers, stats"
```

---

### Task 7: Public API route handlers

**Files:**
- Create: `portfolio/app/api/comments/route.ts` (GET list, POST create), `portfolio/app/api/comments/[id]/route.ts` (DELETE own comment)
- Create: `portfolio/app/api/votes/route.ts` (POST add, DELETE remove)
- Create: `portfolio/app/api/suggestions/route.ts` (POST)
- Create: `portfolio/app/api/subscribe/route.ts` (POST), `portfolio/app/api/subscribe/confirm/route.ts` (GET), `portfolio/app/api/subscribe/unsubscribe/route.ts` (GET)
- Create: `portfolio/app/api/heartbeat/route.ts` (POST)
- Create: `portfolio/app/api/stats/route.ts` (GET)
- Create: `portfolio/__tests__/api/comments.test.ts`, `__tests__/api/votes.test.ts`, `__tests__/api/subscribe.test.ts`

**Interfaces:**
- Consumes: Tasks 3–6.
- Produces: JSON responses with `{ ok: true, ... }` or `{ ok: false, error: string, fields?: Record<string,string> }`. HTTP codes: 400 invalid input, 401 not signed in (for comments, votes), 403 not owner, 404 unknown item, 429 rate limited (with `Retry-After`).
- Rules: every write checks the Clerk session via `auth()` where sign-in is required; every write runs `checkRateLimit` with keys `comments:${userId}` (5/min), `votes:${userId}` (30/min), `suggest:${ipHash}` (3/hour), `subscribe:${ipHash}` (5/hour); `subscribe` always returns the same message whether the email is new, pending or confirmed, so it does not reveal membership. The confirm email link is built from `SITE_URL`.

- [ ] **Step 1: Write failing tests** (mock the `db/*` modules with `vi.mock`):
  - POST `/api/comments` with `<img src=x onerror=alert(1)>` as body and a signed-in user → 201, and `insertComment` was called with the body unchanged (escaping is output-side).
  - POST `/api/comments` with no session → 401.
  - POST `/api/comments` with a body of 1001 characters → 400 with `fields.body`.
  - POST `/api/votes` twice for the same user → second response `ok: true, created: false`, status 200.
  - POST `/api/subscribe` for an email already `unsubscribed` → response body identical to the body for a brand-new email; `upsertPending` not reactivating it.
  - POST `/api/suggestions` with a `contact_email` of `not-an-email` → 400.

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement** the handlers. Parse JSON with a try/catch that returns 400 on malformed JSON.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: public API for comments, votes, suggestions, subscribe, stats"
```

---

### Task 8: Home page (cards, filters, stats strip)

**Files:**
- Modify: `portfolio/app/page.tsx` (replace the Task 1 stub)
- Create: `portfolio/components/cards/ItemCard.tsx`, `portfolio/components/cards/StatusBadge.tsx`, `portfolio/components/home/FilterBar.tsx`, `portfolio/components/home/StatsStrip.tsx`, `portfolio/components/home/EmptyState.tsx`
- Create: `portfolio/__tests__/e2e/home.spec.ts` (Playwright)

**Interfaces:**
- Consumes: `listPublishedItems` (Task 6), `getPublicStats` (Task 6), `wantCounts`, `CommentRow` count helpers.
- Produces: `ItemCard` props `{ item: ItemRow; commentCount: number; wantCount: number }`. `StatusBadge` props `{ status: string; type: "project"|"idea" }`, renders text plus an icon from a fixed set (no emoji). `FilterBar` reads and writes URL search params `type`, `category`, `status`, `sort`.
- Behaviour: a project card's footer action is "Open project" with `href = item.live_url` and `target="_blank" rel="noopener noreferrer"`. An idea card's footer shows "I want this (N)"; clicking it calls `/api/votes` and is disabled for signed-out users with a "Sign in to vote" link.

- [ ] **Step 1: Write failing Playwright tests** in `home.spec.ts`:
  - With an empty database: page shows the empty-state text and stats show `0`; no card grid errors.
  - With two seeded items (one project, one idea): both render; the project card has a link whose `href` equals its `live_url`.
  - At 375px wide: exactly one column (assert card bounding boxes share the same `x`).
  - At 1024px wide: three columns.
  - Keyboard: Tab reaches the first filter control and the first card action, and each has a visible focus ring (assert computed `outline` or `box-shadow` is non-empty).

- [ ] **Step 2: Run and confirm they fail:** `npm run test:e2e -- --trace off home`.

- [ ] **Step 3: Implement** the page as a server component that fetches data and passes it to the client filter bar. Use CSS grid with the breakpoints above.

- [ ] **Step 4: Run and confirm they pass.** Then `npm run build`.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: home page with cards, filters and public stats"
```

---

### Task 9: Card detail page with comments and voting

**Files:**
- Create: `portfolio/app/item/[slug]/page.tsx`
- Create: `portfolio/components/detail/CommentList.tsx`, `portfolio/components/detail/CommentForm.tsx`, `portfolio/components/detail/WantButton.tsx`, `portfolio/components/detail/BudgetPicker.tsx`
- Create: `portfolio/__tests__/e2e/detail.spec.ts`

**Interfaces:**
- Consumes: `getItemBySlug`, `listVisibleComments`, `wantCounts` (Task 6); `/api/comments`, `/api/votes` (Task 7); Clerk `useUser` in client components.
- Produces: the detail page at `/item/[slug]`. Unknown or unpublished slugs return `notFound()`. `CommentList` renders `body` as text (React escapes it); links are rendered only when `isSafeUrl` is true.

- [ ] **Step 1: Write failing Playwright tests**:
  - Visiting an unpublished slug → 404.
  - A comment containing `<script>alert(1)</script>` appears as literal text, and no `script` element is created in the DOM.
  - A comment containing `javascript:alert(1)` is not rendered as a link.
  - Signed-out visitor sees "Sign in to comment" instead of the form.
  - Signed-in user posts a comment and it appears at the top without a reload.

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** Use the `items` row for the header; for ideas show the "What would you pay?" picker only after a successful vote.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: card detail page with comments and want votes"
```

---

### Task 10: Suggest an idea and subscribe forms

**Files:**
- Create: `portfolio/app/suggest/page.tsx`, `portfolio/components/forms/SuggestForm.tsx`, `portfolio/components/forms/SubscribeForm.tsx`
- Create: `portfolio/app/subscribe/confirmed/page.tsx` (confirmation message)
- Create: `portfolio/__tests__/e2e/forms.spec.ts`

**Interfaces:**
- Consumes: `/api/suggestions`, `/api/subscribe` (Task 7).
- Produces: `SuggestForm` fields exactly as the spec, section 10: `title` (required), `description` (required, max 1000), `audience` (optional), `budget_range` (optional select), `contact_email` (optional), `submitter_name` (optional), `credit_ok` (checkbox, unticked by default). `SubscribeForm` has an email field and a required consent checkbox linked to `/privacy`.

- [ ] **Step 1: Write failing Playwright tests**:
  - Submitting `/suggest` with only a title → inline error on `description`, no network call.
  - Valid suggestion → success message, and the database row has `status = 'new'`.
  - Subscribe without ticking consent → button disabled or error shown; no request sent.
  - Subscribe with a valid email → same success message as an already-subscribed email (assert identical text).

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement.** Labels are real `<label>` elements; errors are linked with `aria-describedby`.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: suggest-an-idea and subscribe forms"
```

---

### Task 11: Email, privacy and terms

**Files:**
- Create: `portfolio/lib/email.ts` (Resend client and two templates: `confirmationEmail({ confirmUrl, unsubscribeUrl })`, `launchEmail({ title, url, unsubscribeUrl })`)
- Modify: `portfolio/app/privacy/page.tsx`, `portfolio/app/terms/page.tsx` (rewrite for this site)
- Create: `portfolio/__tests__/email.test.ts`

**Interfaces:**
- Consumes: `requireEnv("RESEND_API_KEY")`, `requireEnv("SITE_URL")`.
- Produces: `sendConfirmation(to: string, token: string): Promise<void>`; `sendLaunch(to: string[], item: { title: string; slug: string }): Promise<{ sent: number }>` (called only from the admin, Task 12). Every email contains an unsubscribe URL.

- [ ] **Step 1: Write failing tests**: `confirmationEmail` output contains the confirm URL and an unsubscribe URL; the rendered HTML has the title escaped (`<` → `&lt;`).

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement** the templates as plain HTML strings with the escape helper from Task 3.

- [ ] **Step 4: Run and confirm they pass.** Rewrite the privacy page to list what is stored (email, comments, votes, a daily salted visitor hash), why, how to unsubscribe, and how to request deletion (email the owner).

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: transactional emails, privacy and terms pages"
```

---

### Task 12: Owner admin

**Files:**
- Create: `portfolio/app/admin/layout.tsx` (calls `requireOwner()`), `portfolio/app/admin/page.tsx` (dashboard: stats, subscriber count, CSV link)
- Create: `portfolio/app/admin/items/page.tsx`, `portfolio/app/admin/items/[id]/page.tsx` (create and edit form)
- Create: `portfolio/app/admin/comments/page.tsx` (hide and delete)
- Create: `portfolio/app/admin/suggestions/page.tsx` (publish as idea or dismiss)
- Create: `portfolio/app/admin/subscribers/export/route.ts` (CSV download)
- Create: `portfolio/app/admin/actions.ts` (server actions: `saveItemAction`, `deleteItemAction`, `setCommentHiddenAction`, `publishSuggestionAction`, `sendLaunchAction`)
- Create: `portfolio/__tests__/e2e/admin.spec.ts`

**Interfaces:**
- Consumes: `requireOwner` (Task 5), db functions (Task 6), `validateItemInput` (Task 3), `sendLaunch` (Task 11).
- Produces: every server action calls `requireOwner()` first and then `validateItemInput` where input is involved. Cover image upload goes to the `covers` bucket (Task 2) using a signed upload URL created server-side; file type limited to `image/jpeg`, `image/png`, `image/webp`, max 2 MB.

- [ ] **Step 1: Write failing Playwright tests**:
  - Signed-out visit to `/admin` → redirected to sign-in, no admin content in the HTML.
  - Signed-in as a non-owner → 403 page.
  - Owner creates a project with a `javascript:` live URL → error shown, nothing saved.
  - Owner publishes a suggestion → it appears on the home page.
  - Owner hides a comment → it disappears from the detail page.

- [ ] **Step 2: Run and confirm they fail.**

- [ ] **Step 3: Implement** the pages. Admin pages are `dynamic = "force-dynamic"` so counts are never cached.

- [ ] **Step 4: Run and confirm they pass.**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: owner admin for cards, comments, suggestions, subscribers"
```

---

### Task 13: Theme, security headers and accessibility pass

**Files:**
- Modify: `portfolio/app/globals.css` (design tokens as CSS variables for light and dark; `prefers-reduced-motion` rule)
- Create: `portfolio/components/theme/ThemeToggle.tsx` (stores choice in `localStorage` key `theme`, default follows the OS)
- Modify: `portfolio/next.config.ts` (CSP and origins)

**Interfaces:**
- Consumes: spec section 15 tokens.
- Produces: CSS variables `--bg`, `--surface`, `--text`, `--muted`, `--border`, `--primary`, `--live`, `--idea`, `--building`, `--danger`, with dark values under `[data-theme="dark"]`.

- [ ] **Step 1: Write a failing Playwright test** that loads `/` in dark mode and asserts `getComputedStyle(body).backgroundColor` equals `rgb(15, 17, 21)`, and that a text-on-background contrast check passes for the muted text (compute with a small helper; target ≥ 4.5:1).

- [ ] **Step 2: Run and confirm it fails.**

- [ ] **Step 3: Implement** tokens, the toggle, and the CSP. The CSP must allow Clerk (`*.clerk.accounts.dev`, `img.clerk.com`), Supabase (`*.supabase.co` for API and Storage images), and `fonts.gstatic.com` for Inter if loaded from Google. Remove `cdn.jsdelivr.net` and the RouteMaster origins from `allowedOrigins`; set the list from `SITE_URL`.

- [ ] **Step 4: Run and confirm it passes.** Then check the response headers in a `next start` run with `curl -sI http://localhost:3000/`; expect `Content-Security-Policy` to contain the Clerk and Supabase hosts and not `routemaster`.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: design tokens, dark mode, CSP for Clerk and Supabase"
```

---

### Task 14: Deploy to Vercel

**Files:**
- Create: `portfolio/.env.example` (variable names only, no values)
- Modify: `portfolio/README.md` (replace the template text with setup steps)

**Interfaces:**
- Consumes: all environment variables from Tasks 5, 9, 10 and 11: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `RESEND_API_KEY`, `ADMIN_CLERK_USER_ID`, `VISITOR_SALT_SECRET`, `SITE_URL`.
- Produces: a production deployment on Vercel.

- [ ] **Step 1: Write `.env.example`** with the names above and empty values, and a README section explaining where each key comes from (Supabase → Project Settings → API; Clerk → API Keys; Resend → API Keys).

- [ ] **Step 2: Run the full checks locally:** `npm test`, `npm run test:e2e -- --trace off`, `npm run lint`, `npm run build`. Expected: all pass.

- [ ] **Step 3: Confirm no secret is committed:** `git grep -nE "sk_live|sk_test|service_role|eyJ" -- portfolio` returns nothing.

- [ ] **Step 4: Set the variables in Vercel** (owner does this in the Vercel dashboard), then deploy and check `/`, `/admin` (signed out), and `/api/stats` on the production URL.

- [ ] **Step 5: Commit**

```bash
git commit -m "docs: env example and setup README; deployment checklist"
```

---

## Plan Self-Review

- **Spec coverage:** sections 7 (pages) → Tasks 8–12; 8 (cards) → Tasks 2, 3, 12; 9 (comments) → Tasks 7, 9; 10 (demand and suggestions) → Tasks 7, 9, 10, 12; 11 (subscribers) → Tasks 7, 10, 11; 12 (stats) → Tasks 2, 4, 6, 7, 8; 13 (data model) → Task 2; 14 (security) → Tasks 5, 13; 15 (look) → Tasks 8, 13; 16 (owner-provided items) → Task 14. Removal of RouteMaster pages → Task 1.
- **Type consistency:** `ItemRow`, `CommentRow`, `ItemInput` are referenced in Tasks 3, 6, 8, 9; define them once in `lib/db/types.ts` during Task 6 and import from there. Status and category values come from `lib/config.ts` only.
- **Gaps noted:** the rate limiter and visitor-hash secret rotation are described but the daily salt schedule is left to the builder (spec section 17). Cover-image upload in Task 12 is specified by constraints, not by code.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-11-24-portfolio-ideas-hub.md`. Please review the plan. Which execution approach would you prefer?

- **Subagent-driven**: a fresh subagent implements each task and a fresh reviewer checks it before the next starts, then a whole-branch review at the end. Most thorough; costs a fresh context per task and per review.
- **Native**: I implement every task myself in this session, then one fresh reviewer checks the whole branch. Cheapest and fastest; no independent review until the end.

For this plan I recommend **subagent-driven**, because there are 15 tasks that depend on each other's interfaces (validation, db layer, API, pages), and a mistake that reaches production would expose visitor data. Does the plan capture what you want, and which approach should we use?
