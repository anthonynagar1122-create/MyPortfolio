# Portfolio & Ideas Hub: Design

Status: Draft, awaiting owner approval
Date: 2026-11-24
Location: `portfolio/` (Next.js app in this repo)

## 1. Intent and why

The owner builds software projects and has many ideas not yet built. This site has three jobs:

1. **Showcase** finished projects, each with a direct link to the live product.
2. **Test ideas** before building them, by measuring who wants what (demand) and what they need (requirements, feedback).
3. **Grow an email subscriber list**, so the owner can reach interested people when something launches.

It is a personal portfolio, not a company site. The existing RouteMaster company pages (Team, Careers, Partners, Technology, Ecosystem, Founder, Products demo pages) are out of scope and will be removed.

## 2. Goals

- A visitor can open any project in one click.
- A visitor can see every project and idea on one page, filter them, and understand each in seconds.
- A visitor can comment on any card and read other comments.
- A visitor can say "I want this" on an idea, and the owner can see the totals.
- A visitor can suggest a new idea for the owner to build.
- A visitor can subscribe by email.
- Public counters show comments per card, active users now, and visitors per day and per week.
- The owner can add, edit, and publish cards and moderate comments without touching code.

## 3. Non-goals (version 1)

- Sending newsletters or campaigns from the site (version 2). Version 1 stores subscribers and sends a confirmation email and launch emails only by manual action.
- Payments, invoicing, or a client-contract workflow.
- Multi-author or team accounts. There is one owner.
- Native mobile apps.
- Languages other than English.
- Threaded replies, likes on comments, and rich-text comments (version 2).

## 4. Anti-goals (what would make this a failure even if it works)

- Spam or bot floods that bury real feedback.
- Showing raw personal data (emails, IP addresses) publicly.
- Visitor counts that look inflated or fake.
- A slow homepage. The list of cards must load fast on mobile.
- Making the owner edit code every time an idea is added.

## 5. Constraints

- Stack already in the repo: Next.js (App Router), React, Tailwind CSS, TypeScript, Supabase (Postgres), Clerk (sign-in), Resend (email). These stay. Everything else is replaced or removed as described below.
- Hosting: Vercel is assumed (the repo is a Next.js app). **To confirm with the owner before launch:** the owner needs their own Supabase and Clerk projects. Setup steps will be written in the README.
- Privacy: the site must have a privacy page and a consent note at subscribe time. Visitor identity is stored as a salted hash, not as a raw IP address.
- The owner is not a developer who wants to read code. Content changes happen in an admin page.

## 6. Approaches considered

Only one approach was discussed with the owner in depth: extend the existing Next.js app. The alternatives were:

| Approach | Trade-off | Decision |
|---|---|---|
| A. Keep the existing app, strip the RouteMaster content, and rebuild the pages on the existing Supabase and Clerk setup | Fastest. Reuses the working stack, the rate limiting, the contact API and the security headers. Some config files need rewriting. | **Chosen** |
| B. Use a no-code site builder (Framer, Webflow) with a comments plugin | Quick to look nice. Weak control over comments, demand counts and live stats. Monthly cost. Hard to own the data. | Rejected |
| C. Start a new project from scratch | Clean, but throws away the security work and the Supabase and Clerk setup already in the repo. | Rejected |

## 7. Pages and navigation

Navigation: logo/name, **Projects**, **Ideas**, **Suggest an idea**, **Stats** (a small block, not a full page), **Subscribe** button, **Sign in**.

### 7.1 Home (`/`)
- Hero: owner name, one-line tagline (placeholder until the owner provides it), two buttons: "See projects" and "Suggest an idea".
- Live stats strip: active users now, visitors today, visitors this week, total comments, total subscribers.
- Tabs or filter: **All · Projects · Ideas**. Filter by category and status. Sort: Newest, Most commented, Most wanted (ideas only).
- Grid of cards.
- Subscribe block near the bottom.

### 7.2 Card detail (`/item/[slug]`)
- Full description, screenshots, tags, status.
- Projects: primary button "Open project" linking to the live URL (opens in a new tab).
- Ideas: "I want this" button with count, and a short "what would you pay for it?" optional field.
- Comment box and comment list (see section 9).
- Share link.

### 7.3 Suggest an idea (`/suggest`)
Form described in section 10.

### 7.4 Admin (`/admin`)
Only the owner can open it (Clerk, checked against the owner's user ID). Sections:
- Cards: create, edit, publish or hide, delete, reorder, set status.
- Comments: list of all comments, hide or delete, filter by card.
- Ideas inbox: suggestions from visitors, with "accept as idea" to create a card.
- Subscribers: count and CSV export.
- Stats: visitors per day and week, plus a chart.

### 7.5 Other pages
- `/privacy` (required before subscribe goes live).
- `/terms` (short).
- Existing `sign-in` and `sign-up` pages stay, restyled.
- Existing `/contact` page stays and is simplified to a single "message the owner" form.

Pages removed: `about`, `team`, `careers`, `partners`, `technology`, `ecosystem`, `founder`, `routemaster`, `products` (old demo pages). Their content is deleted, not hidden.

## 8. Cards: content and data

Two card types share one table: **project** and **idea**.

Fields:

| Field | Project | Idea | Notes |
|---|---|---|---|
| title | yes | yes | |
| slug | yes | yes | Generated from title, editable |
| short description | yes | yes | One line, max 160 characters |
| long description | yes | yes | Markdown-lite, plain text is fine |
| type | project | idea | |
| status | Live · In progress · Paused · Archived | Idea · Exploring · Building · Shipped | Different lists per type |
| category | yes | yes | Single choice from a fixed list the owner edits in admin |
| tags | yes | yes | Free text, up to 5 |
| cover image | yes | yes | Uploaded to Supabase Storage, max 2 MB |
| live URL | yes | no | "Open project" button. Must be `https://` |
| demo URL | optional | no | |
| android / iOS links | optional | no | |
| created / updated | auto | auto | |
| published | yes | yes | Draft or published |

Counters (computed, not typed by the owner): comment count, "I want this" count (ideas), and view count.

## 9. Comments

- Anyone can read comments. Posting requires sign-in with Clerk (Google or email).
- A signed-in commenter who posts is added as a subscriber only if they tick a box that says "email me about this". Default: unticked.
- Comments post immediately. The owner can hide or delete any comment in admin.
- Owner's own comments show a "Creator" badge.
- Each comment shows name, avatar (Clerk), time, and text (max 1000 characters, plain text, links auto-linked with `rel="nofollow ugc"`).
- A user can delete their own comment.
- No replies, likes, or edits in version 1.
- Rate limit: 5 comments per user per minute, and 20 per user per hour, using the existing rate-limit middleware.
- Basic spam check: links count (more than 3 holds the comment for review), and a banned-word list the owner can edit.

## 10. Demand and suggestions

**"I want this" (ideas only)**
- One click, one vote per signed-in user per idea. Can be undone.
- Optional short note: "What would you pay?" with a choice: Free / under $10 / $10–50 / over $50 / not sure. Stored, shown to the owner only, aggregated on the admin page.
- Anonymous visitors cannot vote; they see the count and are asked to sign in.
- Sorting by "Most wanted" uses this count.

**Suggest an idea (`/suggest`)**
Fields:
- Title (required)
- What it should do (required, max 1000 characters)
- Who it is for (optional)
- Budget range (optional): Free / under $500 / $500–2000 / over $2000 / not sure
- Contact email (optional, used only to reply about this idea)
- Name (optional)

Behaviour:
- Submitted suggestions go to the admin Ideas inbox. They are **private by default** (only the owner sees them).
- The owner can "publish as idea" to create a public card. The submitter's name is shown only if they agreed to be credited (checkbox, default unticked).
- Anonymous submission is allowed, but rate limited: 3 per hour per hashed IP.
- Contact emails are never shown publicly.

## 11. Subscribers

- The subscribe form asks for an email and a consent checkbox linked to `/privacy`.
- **Double opt-in:** a confirmation email via Resend. The subscriber is active only after they click the link.
- Unsubscribe link in every email. Unsubscribed addresses are kept as suppressed so they are not re-added.
- Version 1 emails: confirmation, and manual "new project launched" or "new idea published" emails the owner triggers from admin (a template plus a list of recipients). Scheduled newsletters are version 2.
- Subscriber count is shown publicly. Email addresses are never shown publicly.

## 12. Stats

Public counters, all shown on the home page:

| Counter | Definition |
|---|---|
| Active users now | Distinct visitors with a heartbeat in the last 5 minutes |
| Visitors today | Distinct visitors since midnight (site timezone: owner's local, to confirm) |
| Visitors this week | Distinct visitors in the last 7 days |
| Total comments | All visible comments |
| Subscribers | Confirmed, not unsubscribed |

How visitors are counted:
- Each visit records a daily identifier: `hash(IP + user-agent + daily salt)`. The salt rotates every day, so the same person cannot be tracked across days. Raw IP addresses are never stored.
- The browser sends a heartbeat every 60 seconds while the tab is open. A user is "active now" if their last heartbeat was within 5 minutes.
- Bots are excluded with a basic user-agent check. Counts are approximate. The admin page notes this.
- Weekly counts are "distinct visitors in 7 days", so a daily visitor counted in several days appears once in the weekly figure. Daily counts can add up to more than weekly counts only if the owner reads them as separate numbers; the UI labels them clearly.

Admin stats page adds: visitors per day for the last 30 days, page views per card, and ideas "I want this" totals.

## 13. Data model (Supabase)

Tables, all with `id uuid`, `created_at`, `updated_at`:

- `items`: cards. Columns: type (project | idea), slug (unique), title, short_description, description, status, category, tags (text[]), cover_url, live_url, demo_url, android_url, ios_url, published (bool), sort_order.
- `comments`: item_id, author_id (Clerk user ID), author_name, author_avatar, body, is_owner (bool), hidden (bool).
- `idea_votes`: item_id, user_id, note_budget (nullable). Unique on (item_id, user_id).
- `idea_suggestions`: title, description, audience, budget_range, contact_email (nullable), submitter_name (nullable), credit_ok (bool), status (new | published | dismissed), created_at.
- `subscribers`: email (unique), status (pending | confirmed | unsubscribed), confirm_token, consent_at, source.
- `visits`: day (date), visitor_hash, last_seen (timestamp). Unique on (day, visitor_hash). Used for daily, weekly and active-now counts. Old rows are deleted after 90 days.
- `page_views`: item_id (nullable), day, count. Optional, for per-card views.

Row-level security: anyone can read published items, visible comments and aggregate counts. Only the owner's server actions write to admin tables. Public writes (comments, votes, suggestions, subscribe, visits) go through server routes with rate limiting, not directly from the browser.

## 14. Security and privacy

- Owner-only admin: checked on the server for every admin request, not only in the UI.
- Input validation on every route (length limits, URL scheme checks, email format).
- Comment and suggestion text is escaped on output. No HTML is allowed.
- Keep the existing security headers and CSP. Add Supabase Storage and Clerk image hosts to the allow list only as needed.
- No secrets in the repo. Keys live in environment variables (`.env.local` locally, Vercel settings in production). The `.env*` files stay ignored.
- Privacy page explains: what is stored, why, how to unsubscribe, how to request deletion (email the owner).
- Delete request: the owner deletes a user's comments and subscriber record from admin.

## 15. Visual direction

Not decided yet. Default proposal: clean, light theme with a dark-mode toggle, one accent colour, cards with a clear status badge (Live / Idea). No animations beyond simple hover states, since the earlier "remove animations, simplify" direction in the git history suggests the owner prefers simplicity. The owner will choose the colour and name before the design is built.

## 16. Open items the owner must provide (not blocking the design)

- Display name and one-line tagline.
- Colour and logo, if any.
- The first list of projects (names, live URLs, screenshots) and ideas.
- Supabase and Clerk project setup (or permission to create them).
- Domain name, if you have one.

## 17. What's left to the builder

- Exact Tailwind layout and spacing, following the existing design tokens where they still make sense.
- Choice of Markdown-lite library, if any. Plain text is acceptable.
- How the heartbeat and daily salt are scheduled (for example, a daily cron or on-the-fly salt derived from the date and a server secret).
- Test plan: unit tests for validation and counter logic, and an end-to-end run for comment, vote, suggest and subscribe.
- Migration plan from the existing Supabase schema (if any tables exist). Remove unused tables only after the owner confirms.

## 18. Calls made without asking (owner can override)

- Comments are posted immediately, with no approval queue.
- Sign-in required to comment and vote, but not to read or subscribe.
- Double opt-in for subscribers.
- Suggestions are private by default; the owner chooses to publish each one.
- Visitor counting uses a daily rotating salted hash, not raw IPs.
- Version 1 has no newsletter scheduler and no comment replies.

## 19. Approaches (summary, for approval)

Chosen: **A. Extend the existing Next.js + Supabase + Clerk app, rebuild its pages around cards, comments, demand and subscribers.** Reason: it reuses the working auth, email, rate limiting and security headers, and gives the owner full control of the data.
