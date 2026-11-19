# Unified Ecosystem Common Space — MyPortfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform MyPortfolio from a standard product landing page into a unified ecosystem headquarters that communicates company purpose, showcases three independent products, explains shared platform principles, and provides searchable access to 120+ social-impact ideas.

**Architecture:** The portfolio is a Next.js static/hybrid site with no backend services of its own — all operational dependencies (identity, audit, notifications) are designed as future integration contracts with a separate Platform Core service. Content is structured for retrieval and eventual CMS/database migration. Motion enhances without blocking: reduced-motion preferences are respected, static fallbacks guarantee usability, and three.js elements load only when viewport and browser support allow. The 12-section design is modular so each section can be reviewed and refined independently as development progresses.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Framer Motion (page and scroll interactions), GSAP (timeline sequences), Three.js (optional lazy-loaded scene for ecosystem visualization), Zod (content validation), structured JSON for ideas registry.

**Spec:** This plan implements Phases 0–1 of the RouteMaster Unified Platform vision:
- Phase 0: Establish company vision and product registry (content structure, data contracts)
- Phase 1: Redesign landing page, mission, product discovery, ideas library, and account entry point

[Full vision and architecture specification](../../../VISION.md) (to be created as companion document)

## Global Constraints

- **Rendering:** Server-side render all content for SEO and performance; interactive elements hydrate on client
- **Motion:** Respect `prefers-reduced-motion` media query; all cinematic features must degrade to static equivalents
- **Performance:** Lighthouse score ≥90 on all pages; no JavaScript libraries for critical path rendering
- **Accessibility:** WCAG 2.1 AA minimum; all interactive components keyboard-navigable; color contrast ≥4.5:1
- **Content versioning:** All structured content (ideas, domains, principles) stored as versioned files with stable IDs for future database migration
- **Integration contracts:** Design API contracts and OIDC configuration hooks now, even if the Platform Core service is not yet built
- **Repository boundary:** This repository contains only the corporate portfolio and ideas registry; no product source code, no central backend
- **TypeScript:** Strict mode enabled; all external content validated with Zod schemas before use
- **Browser support:** Modern browsers (Chrome, Firefox, Safari, Edge) from last 2 years; progressive enhancement for older clients

## Review Focus

The five failure modes most likely to bite a person using this portfolio:

1. **Ideas library search and filter breaks on edge cases** — Empty query, special characters in category names, missing translations, or ideas with malformed metadata should not cause 500 errors or stuck UI; they should degrade gracefully with helpful messaging.

2. **Ecosystem visualization loads 3D assets on slow networks and older devices** — Three.js scene should lazy-load on route transition; mobile users on 3G or reduced-motion users should never see a blank canvas waiting for WebGL initialization.

3. **Account sign-in links are designed before Platform Core exists** — Links to sign-in, register, and account pages should work when clicked, even if they currently point to placeholder routes; breaking links after launch damages trust and SEO.

4. **Motion interrupts keyboard navigation and screen readers** — Framer Motion animations that reposition elements during interaction or GSAP timelines that change opacity can trap focus and confuse assistive tech; all animations must not interfere with tab order or semantics.

5. **Ideas registry schema mismatch with future CMS/database** — The current JSON structure for ideas should map cleanly to a normalized database schema; misnamed fields or inconsistent nesting now means migration pain later.

---

## File Structure

```
MyPortfolio/
├── app/
│   ├── layout.tsx                  # Root layout, metadata, theme
│   ├── page.tsx                    # Home/hero section
│   ├── mission/
│   │   └── page.tsx                # Mission and principles
│   ├── ecosystem/
│   │   └── page.tsx                # Ecosystem overview + 3D scene
│   ├── products/
│   │   ├── page.tsx                # Product showcase carousel
│   │   ├── [product]/
│   │   │   └── page.tsx            # Individual product detail
│   ├── ideas/
│   │   ├── page.tsx                # Ideas library search/filter
│   │   ├── [id]/
│   │   │   └── page.tsx            # Idea detail page
│   ├── impact/
│   │   └── page.tsx                # Impact domains and ledger
│   ├── roadmap/
│   │   └── page.tsx                # Company roadmap
│   ├── company/
│   │   └── page.tsx                # Team and history
│   ├── account/
│   │   ├── page.tsx                # Account entry point (design only, no backend)
│   │   ├── login/
│   │   │   └── page.tsx            # Sign-in page (placeholder, OIDC redirect)
│   │   └── register/
│   │       └── page.tsx            # Register page (placeholder, OIDC redirect)
│   └── api/
│       └── ideas/
│           ├── route.ts            # Ideas registry API (read-only)
│           └── search/
│               └── route.ts        # Ideas search endpoint
├── components/
│   ├── hero/
│   │   ├── hero-section.tsx        # Hero with motion
│   │   ├── company-values.tsx      # Values cards
│   │   └── cta-buttons.tsx
│   ├── navigation/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   └── breadcrumbs.tsx
│   ├── sections/
│   │   ├── mission-section.tsx
│   │   ├── ecosystem-section.tsx
│   │   ├── products-carousel.tsx
│   │   ├── ideas-section.tsx
│   │   ├── impact-section.tsx
│   │   ├── principles-section.tsx
│   │   └── roadmap-section.tsx
│   ├── ideas/
│   │   ├── ideas-search.tsx        # Search and filter UI
│   │   ├── ideas-grid.tsx          # Ideas list display
│   │   ├── idea-card.tsx           # Single idea card
│   │   └── idea-detail.tsx         # Full idea view
│   ├── motion/
│   │   ├── scroll-reveal.tsx       # Scroll-triggered animations
│   │   ├── fade-in-up.tsx
│   │   ├── stagger-container.tsx
│   │   └── reduced-motion-wrapper.tsx
│   ├── three/
│   │   ├── ecosystem-scene.tsx     # Lazy-loaded 3D scene
│   │   └── product-network.tsx
│   └── account/
│       ├── account-dashboard.tsx   # Account display (design only)
│       ├── login-form.tsx          # Sign-in form (placeholder)
│       └── register-form.tsx       # Registration form (placeholder)
├── content/
│   ├── ideas/
│   │   ├── ideas-registry.json     # 120+ structured ideas
│   │   └── idea-schema.ts          # Zod schema for validation
│   ├── impact-domains/
│   │   └── domains.json            # 12 impact domains
│   ├── products/
│   │   └── products.json           # RouteMaster, Fufaji's, Funds-for-Family
│   ├── principles/
│   │   └── principles.json         # Security, society, experience
│   ├── company/
│   │   └── company-info.json       # Founder, team, mission statement
│   └── roadmap/
│       └── roadmap.json            # Phase 0–8 timeline
├── lib/
│   ├── ideas-search.ts             # Ideas search and filter logic
│   ├── motion-config.ts            # Shared Framer Motion settings
│   ├── validators.ts               # Zod schemas for all content
│   └── constants.ts
├── styles/
│   ├── globals.css                 # Tailwind, motion utilities
│   └── animations.css              # GSAP timeline helpers
├── public/
│   ├── images/
│   │   ├── hero-bg.webp
│   │   ├── product-screenshots/
│   │   └── ecosystem-diagram.svg
│   ├── videos/
│   │   └── ecosystem-intro.mp4     # Optional cinematic intro
│   └── three/                       # 3D assets (optional)
│       └── ecosystem-model.glb
├── types/
│   ├── idea.ts                     # Idea and registry types
│   ├── product.ts
│   ├── domain.ts
│   └── company.ts
├── docs/
│   ├── VISION.md                   # Full ecosystem vision (from spec)
│   ├── ARCHITECTURE.md             # Technical architecture
│   ├── INTEGRATION_CONTRACTS.md    # Platform Core API contracts
│   └── superpowers/
│       └── plans/
│           └── 2026-11-19-unified-ecosystem-common-space.md (this file)
├── tests/
│   ├── ideas-search.test.ts
│   ├── content-validation.test.ts
│   └── accessibility.test.ts
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## Task 1: Content Infrastructure and Validation

**Files:**
- Create: `content/ideas/idea-schema.ts`
- Create: `content/ideas/ideas-registry.json`
- Create: `content/impact-domains/domains.json`
- Create: `content/products/products.json`
- Create: `content/principles/principles.json`
- Create: `types/idea.ts`, `types/product.ts`, `types/domain.ts`
- Create: `lib/validators.ts`
- Modify: `app/api/ideas/route.ts` (read-only API)
- Test: `tests/content-validation.test.ts`

**Interfaces:**
- Consumes: None (this is the first task)
- Produces: 
  - Zod schema: `IdeaSchema`, `DomainSchema`, `ProductSchema`, `PrincipleSchema`
  - JSON files with stable IDs: each idea gets `id`, `name`, `domain`, `problem`, `targetGroup`, `status`, etc.
  - Type definitions: `Idea`, `ImpactDomain`, `Product`, `Principle`
  - API endpoint: `GET /api/ideas` → returns validated idea list; `GET /api/ideas/search?q=...&domain=...` → filtered results

---

### **Step 1: Define the Idea type and Zod schema**

Create `types/idea.ts`:

```typescript
export type IdeaStatus = 'exploring' | 'researching' | 'validating' | 'planned' | 'building' | 'launched';

export type Idea = {
  id: string;                    // IDEA-0001, IDEA-0002, etc. (stable across versions)
  name: string;
  domain: string;                // One of the 12 impact domains
  problem: string;               // The problem being addressed
  targetGroup: string;           // People affected
  proposedSolution: string;      // Proposed intervention
  socialBenefit: string;         // Intended positive outcome
  potentialHarm?: string;        // Risks if misused or poorly implemented
  privacyRequirements: string[]; // Data protection considerations
  securityRequirements: string[]; // Security considerations
  feasibility: 'high' | 'medium' | 'low';
  sustainability: 'high' | 'medium' | 'low'; // Can it operate economically?
  reach: number;                  // Estimated people affected (order of magnitude: 100, 1000, 10000, etc.)
  status: IdeaStatus;
  productMapping?: string;        // Which of the three products (or future product) it may feed into
  relatedIdeas: string[];         // IDs of related ideas
  evidence?: {
    research?: string[];
    interviews?: string[];
    publicData?: string[];
  };
  successMetrics?: string[];
  tags: string[];                 // For filtering: 'accessibility', 'rural', 'women', 'security', 'environment', etc.
  createdAt: string;              // ISO 8601
  updatedAt: string;              // ISO 8601
  owner?: string;                 // Person or team responsible
  notes?: string;
};

export type ImpactDomain = {
  id: string;                    // DOMAIN-01 through DOMAIN-12
  number: number;
  name: string;                  // e.g., "Mobility, transportation and accessibility"
  description: string;
  relatedIdeas: string[];         // IDs of ideas in this domain
};

export type Product = {
  id: string;                    // 'routemaster', 'fufajis', 'funds-for-family'
  name: string;
  tagline: string;
  description: string;
  domain: string;                // Primary impact domain
  status: 'building' | 'launched';
  url?: string;                  // Product subdomain URL (e.g., https://routemaster.vercel.app)
  relatedIdeas: string[];        // Ideas this product addresses
  features: string[];
  imageUrl?: string;
};

export type Principle = {
  id: string;                    // 'security', 'society', 'experience', etc.
  name: string;
  description: string;
  commitments: string[];         // What we commit to
};
```

- [ ] **Step 2: Create Zod validators in `lib/validators.ts`**

```typescript
import { z } from 'zod';

export const IdeaSchema = z.object({
  id: z.string().regex(/^IDEA-\d{4}$/),
  name: z.string().min(5).max(200),
  domain: z.string(),
  problem: z.string().min(10).max(500),
  targetGroup: z.string().min(5).max(200),
  proposedSolution: z.string().min(10).max(500),
  socialBenefit: z.string().min(10).max(500),
  potentialHarm: z.string().optional(),
  privacyRequirements: z.array(z.string()),
  securityRequirements: z.array(z.string()),
  feasibility: z.enum(['high', 'medium', 'low']),
  sustainability: z.enum(['high', 'medium', 'low']),
  reach: z.number().positive(),
  status: z.enum(['exploring', 'researching', 'validating', 'planned', 'building', 'launched']),
  productMapping: z.string().optional(),
  relatedIdeas: z.array(z.string()),
  evidence: z.object({
    research: z.array(z.string()).optional(),
    interviews: z.array(z.string()).optional(),
    publicData: z.array(z.string()).optional(),
  }).optional(),
  successMetrics: z.array(z.string()).optional(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  owner: z.string().optional(),
  notes: z.string().optional(),
});

export type ValidatedIdea = z.infer<typeof IdeaSchema>;

// Add similar schemas for DomainSchema, ProductSchema, PrincipleSchema
```

- [ ] **Step 3: Populate `content/ideas/ideas-registry.json` with the 120 ideas**

Structured entry for each of the 120 ideas from the vision document. Example:

```json
{
  "ideas": [
    {
      "id": "IDEA-0001",
      "name": "Affordable journey discovery",
      "domain": "DOMAIN-01",
      "problem": "Travel options are difficult to compare; people don't know if they're paying fair prices or missing cheaper alternatives.",
      "targetGroup": "Everyday travellers",
      "proposedSolution": "A service that aggregates and compares transport options (trains, buses, metro, rideshare, walking) and shows the most affordable routes.",
      "socialBenefit": "Help people access mobility options they can afford.",
      "potentialHarm": "If pricing algorithms are manipulated to hide competitors or if real-time price updates are inaccurate, users may trust false comparisons.",
      "privacyRequirements": ["Location data should not be retained beyond the search session", "Search history should not be sold to third parties"],
      "securityRequirements": ["Price data should come from verified sources", "Comparison logic must be auditable"],
      "feasibility": "high",
      "sustainability": "medium",
      "reach": 1000000,
      "status": "exploring",
      "productMapping": "routemaster",
      "relatedIdeas": ["IDEA-0002", "IDEA-0003"],
      "evidence": {
        "research": ["Study: Global transport pricing barriers (2024)"],
        "interviews": ["5 interviews with low-income commuters"],
        "publicData": ["World Bank transport cost survey"]
      },
      "successMetrics": ["% of users who find cheaper routes", "User satisfaction with comparison accuracy"],
      "tags": ["accessibility", "economic-opportunity", "transport"],
      "createdAt": "2026-11-19T00:00:00Z",
      "updatedAt": "2026-11-19T00:00:00Z",
      "owner": "Research team"
    },
    // ... 119 more ideas
  ]
}
```

- [ ] **Step 4: Create `content/impact-domains/domains.json`**

Define the 12 domains with descriptions and related idea IDs:

```json
{
  "domains": [
    {
      "id": "DOMAIN-01",
      "number": 1,
      "name": "Mobility, transportation and accessibility",
      "description": "Helping people move safely, affordably and accessibly between places.",
      "relatedIdeas": ["IDEA-0001", "IDEA-0002", ... ]
    },
    // ... 11 more domains
  ]
}
```

- [ ] **Step 5: Create `content/products/products.json`**

```json
{
  "products": [
    {
      "id": "routemaster",
      "name": "RouteMaster",
      "tagline": "Connecting people to places",
      "description": "Journey planning, affordable mobility, multimodal transport and accessibility.",
      "domain": "DOMAIN-01",
      "status": "building",
      "url": "https://routemaster.vercel.app",
      "relatedIdeas": ["IDEA-0001", "IDEA-0002", ...],
      "features": ["Multi-modal journey planning", "Accessibility route options", "Real-time transit info"],
      "imageUrl": "/images/product-screenshots/routemaster.webp"
    },
    // RouteMaster, Fufaji's, Funds-for-Family
  ]
}
```

- [ ] **Step 6: Create `content/principles/principles.json`**

```json
{
  "principles": [
    {
      "id": "security",
      "name": "Security",
      "description": "Protect people and their data",
      "commitments": [
        "Encrypt sensitive data at rest and in transit",
        "Use industry-standard authentication (passkeys, MFA)",
        "Conduct regular security audits",
        "Publish security advisories"
      ]
    },
    // ... security, society, experience, accessibility
  ]
}
```

- [ ] **Step 7: Implement read-only API endpoint `app/api/ideas/route.ts`**

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import { IdeaSchema } from '@/lib/validators';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const domain = searchParams.get('domain');
  const status = searchParams.get('status');
  
  try {
    const ideasPath = join(process.cwd(), 'content', 'ideas', 'ideas-registry.json');
    const ideasData = JSON.parse(readFileSync(ideasPath, 'utf-8'));
    
    let ideas = ideasData.ideas;
    
    // Apply filters
    if (query) {
      const q = query.toLowerCase();
      ideas = ideas.filter(idea => 
        idea.name.toLowerCase().includes(q) || 
        idea.problem.toLowerCase().includes(q)
      );
    }
    if (domain) {
      ideas = ideas.filter(idea => idea.domain === domain);
    }
    if (status) {
      ideas = ideas.filter(idea => idea.status === status);
    }
    
    // Validate all returned ideas
    const validated = ideas.map(idea => IdeaSchema.parse(idea));
    
    return Response.json({ ideas: validated });
  } catch (error) {
    return Response.json({ error: 'Failed to load ideas' }, { status: 500 });
  }
}
```

- [ ] **Step 8: Write validation tests in `tests/content-validation.test.ts`**

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import { IdeaSchema, DomainSchema, ProductSchema, PrincipleSchema } from '@/lib/validators';

describe('Content Validation', () => {
  it('should validate all ideas against schema', () => {
    const ideasPath = join(process.cwd(), 'content', 'ideas', 'ideas-registry.json');
    const ideasData = JSON.parse(readFileSync(ideasPath, 'utf-8'));
    
    expect(ideasData.ideas.length).toBe(120);
    
    ideasData.ideas.forEach(idea => {
      expect(() => IdeaSchema.parse(idea)).not.toThrow();
    });
  });
  
  it('should ensure all idea IDs are unique', () => {
    const ideasPath = join(process.cwd(), 'content', 'ideas', 'ideas-registry.json');
    const ideasData = JSON.parse(readFileSync(ideasPath, 'utf-8'));
    
    const ids = ideasData.ideas.map(i => i.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(ids.length);
  });
  
  it('should ensure all referenced domains exist', () => {
    const ideasPath = join(process.cwd(), 'content', 'ideas', 'ideas-registry.json');
    const domainsPath = join(process.cwd(), 'content', 'impact-domains', 'domains.json');
    
    const ideasData = JSON.parse(readFileSync(ideasPath, 'utf-8'));
    const domainsData = JSON.parse(readFileSync(domainsPath, 'utf-8'));
    
    const domainIds = new Set(domainsData.domains.map(d => d.id));
    
    ideasData.ideas.forEach(idea => {
      expect(domainIds.has(idea.domain)).toBe(true);
    });
  });
});
```

- [ ] **Step 9: Commit**

```bash
git add content/ types/ lib/validators.ts app/api/ideas/ tests/content-validation.test.ts
git commit -m "feat: add content infrastructure, idea registry schema and read-only API

- Create Zod validators for ideas, domains, products, principles
- Populate 120+ ideas with stable IDs, structured metadata
- Define 12 impact domains
- Create read-only /api/ideas endpoint with filtering
- Add comprehensive validation tests
- Ensure content is versioned for future database migration"
```

---

## Task 2: Page Layout, Navigation and Root Structure

**Files:**
- Create: `app/layout.tsx`
- Create: `components/navigation/navbar.tsx`
- Create: `components/navigation/footer.tsx`
- Modify: `app/page.tsx` (home hero only)
- Create: `app/mission/page.tsx` (stub)
- Create: `app/ecosystem/page.tsx` (stub)
- Create: `app/products/page.tsx` (stub)
- Create: `app/ideas/page.tsx` (stub)
- Create: `app/impact/page.tsx` (stub)
- Create: `app/roadmap/page.tsx` (stub)
- Create: `app/company/page.tsx` (stub)
- Create: `app/account/page.tsx` (stub)
- Modify: `styles/globals.css` (motion utilities)

**Interfaces:**
- Consumes: `content/products/products.json`, `types/product.ts` (from Task 1)
- Produces: 
  - Root layout with global metadata, theme provider, motion provider
  - Navigation component: responsive navbar with product links, section links, sign-in CTA
  - Footer with links to all 12 sections, company info, legal
  - Page stubs for all 12 sections (placeholder content, correct routing)
  - Motion utilities (fade, slide, stagger) available to all pages

---

### **Step 1: Create root layout `app/layout.tsx`**

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './styles/globals.css';
import Navbar from '@/components/navigation/navbar';
import Footer from '@/components/navigation/footer';
import MotionConfig from '@/components/motion/motion-config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RouteMaster — Building technology that reduces everyday friction',
  description: 'A technology company building useful, secure and accessible experiences that solve real-world problems.',
  openGraph: {
    title: 'RouteMaster',
    description: 'One ecosystem. Many solutions. A shared purpose.',
    url: 'https://routemaster.vercel.app',
    siteName: 'RouteMaster',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <MotionConfig>
          <Navbar />
          <main className="relative">
            {children}
          </main>
          <Footer />
        </MotionConfig>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create navigation component `components/navigation/navbar.tsx`**

```typescript
'use client';

import Link from 'next/link';
import { useState } from 'react';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Mission', href: '/mission' },
  { label: 'Ecosystem', href: '/ecosystem' },
  { label: 'Products', href: '/products' },
  { label: 'Ideas', href: '/ideas' },
  { label: 'Impact', href: '/impact' },
  { label: 'Roadmap', href: '/roadmap' },
  { label: 'Company', href: '/company' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-bold text-xl">
            RouteMaster
          </Link>
          
          <div className="hidden md:flex gap-8">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-gray-600 hover:text-gray-900 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="flex gap-4">
            <Link
              href="/account/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/account/register"
              className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Join
            </Link>
          </div>
          
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Create footer component `components/navigation/footer.tsx`**

```typescript
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products/routemaster" className="hover:text-white">RouteMaster</Link></li>
              <li><Link href="/products/fufajis" className="hover:text-white">Fufaji's</Link></li>
              <li><Link href="/products/funds-for-family" className="hover:text-white">Funds-for-Family</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/mission" className="hover:text-white">Mission</Link></li>
              <li><Link href="/company" className="hover:text-white">Team</Link></li>
              <li><Link href="/impact" className="hover:text-white">Impact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Research</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/ideas" className="hover:text-white">Ideas Lab</Link></li>
              <li><Link href="/roadmap" className="hover:text-white">Roadmap</Link></li>
              <li><Link href="/impact" className="hover:text-white">Social Impact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/privacy" className="hover:text-white">Privacy</a></li>
              <li><a href="/terms" className="hover:text-white">Terms</a></li>
              <li><a href="/security" className="hover:text-white">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-sm text-gray-400">
          <p>&copy; 2026 RouteMaster. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Create motion configuration provider `components/motion/motion-config.tsx`**

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function MotionConfig({ children }: { children: React.ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div data-prefers-reduced-motion={prefersReducedMotion ? 'true' : 'false'}>
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Create page stubs for all 12 sections**

Create `app/mission/page.tsx`:

```typescript
export default function MissionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Our Mission</h1>
      <p className="text-lg text-gray-600">Coming soon...</p>
    </div>
  );
}
```

Repeat for: `app/ecosystem/page.tsx`, `app/products/page.tsx`, `app/ideas/page.tsx`, `app/impact/page.tsx`, `app/roadmap/page.tsx`, `app/company/page.tsx`, `app/account/page.tsx`

- [ ] **Step 6: Update home page stub `app/page.tsx`**

```typescript
export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-5xl font-bold mb-6">
        One ecosystem. Many solutions. A shared purpose.
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        A technology company building useful, secure and accessible experiences that solve real-world problems.
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Add motion utilities to `styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Motion utilities */
.motion-safe {
  @media (prefers-reduced-motion: no-preference) {
    animation: fadeIn 0.6s ease-out;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add app/ components/navigation/ components/motion/ styles/globals.css
git commit -m "feat: add root layout, navigation, footer and page stubs

- Implement sticky navbar with responsive menu
- Create footer with section links
- Add motion preference detection provider
- Create page stubs for all 12 sections
- Set up global styles and motion utilities"
```

---

## Task 3: Home/Hero Section with Motion and CTA

**Files:**
- Modify: `app/page.tsx`
- Create: `components/hero/hero-section.tsx`
- Create: `components/hero/company-values.tsx`
- Create: `components/hero/cta-buttons.tsx`
- Create: `components/motion/scroll-reveal.tsx`
- Modify: `styles/globals.css` (add hero animations)

**Interfaces:**
- Consumes: `content/principles/principles.json`, `types/principle.ts` (from Task 1)
- Produces:
  - Hero section with cinematic background, headline, subheadline
  - Values cards (security, society, experience) with icons and descriptions
  - CTA buttons: "Explore products", "Browse ideas", "Join ecosystem"
  - Scroll-reveal animation for values cards
  - Full-page static fallback for reduced-motion users

---

### **Step 1: Create scroll-reveal component `components/motion/scroll-reveal.tsx`**

```typescript
'use client';

import { useRef, useEffect, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
}

export function ScrollReveal({ children, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  if (prefersReducedMotion) {
    return <div ref={ref}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
      }`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create company values component `components/hero/company-values.tsx`**

```typescript
'use client';

import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/scroll-reveal';

const values = [
  {
    id: 'security',
    name: 'Security',
    tagline: 'Protect people and their data',
    description: 'We build with privacy and security at the foundation. Every service uses modern authentication, encryption and audit controls.',
    icon: '🔒',
  },
  {
    id: 'society',
    name: 'Society',
    tagline: 'Make useful services accessible',
    description: 'Technology should reduce friction for everyday people. We focus on solving real problems that affect real communities.',
    icon: '🤝',
  },
  {
    id: 'experience',
    name: 'Experience',
    tagline: 'Make technology easier to use',
    description: 'Useful software is useless if nobody can figure out how to use it. We design for clarity, speed and delight.',
    icon: '✨',
  },
];

export default function CompanyValues() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <ScrollReveal>
            <h2 className="text-4xl font-bold mb-4">How we build</h2>
            <p className="text-xl text-gray-600">
              Three principles guide every decision we make.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, idx) => (
            <ScrollReveal key={value.id} delay={idx * 100}>
              <div className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold mb-2">{value.name}</h3>
                <p className="text-sm text-blue-600 font-medium mb-4">
                  {value.tagline}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create CTA buttons component `components/hero/cta-buttons.tsx`**

```typescript
'use client';

import Link from 'next/link';

export default function CTAButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-12">
      <Link
        href="/products"
        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
      >
        Explore Products
      </Link>
      <Link
        href="/ideas"
        className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition"
      >
        Browse Ideas
      </Link>
      <Link
        href="/account/register"
        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-900 font-medium rounded-lg hover:border-gray-400 transition"
      >
        Join Ecosystem
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Create hero section `components/hero/hero-section.tsx`**

```typescript
'use client';

import CTAButtons from './cta-buttons';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Static background fallback */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Animated background (reduced-motion safe) */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          One ecosystem. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Many solutions.</span> A shared purpose.
        </h1>

        <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          A technology company building useful, secure and accessible experiences that solve real-world problems.
        </p>

        <CTAButtons />

        <p className="text-sm text-gray-500 mt-12">
          Scroll down to explore →
        </p>
      </div>

      {/* Scroll indicator animation */}
      {!prefersReducedMotion && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white opacity-50"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 5: Update root page `app/page.tsx`**

```typescript
import HeroSection from '@/components/hero/hero-section';
import CompanyValues from '@/components/hero/company-values';

export default function Home() {
  return (
    <>
      <HeroSection />
      <CompanyValues />
    </>
  );
}
```

- [ ] **Step 6: Add keyframe animations to `styles/globals.css`**

```css
@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@media (prefers-reduced-motion: reduce) {
  .animate-blob {
    animation: none;
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add components/hero/ components/motion/scroll-reveal.tsx app/page.tsx styles/globals.css
git commit -m "feat: add cinematic hero section with motion and scroll reveal

- Implement animated gradient background with blob shapes
- Add scroll-reveal component for staggered animations
- Create company values cards (security, society, experience)
- Add CTA buttons (explore, browse, join)
- Respect prefers-reduced-motion for all animations
- Add bounce animation for scroll indicator"
```

---

## Task 4: Ideas Library Search, Filter and Display

**Files:**
- Create: `components/ideas/ideas-search.tsx`
- Create: `components/ideas/ideas-grid.tsx`
- Create: `components/ideas/idea-card.tsx`
- Create: `lib/ideas-search.ts` (search and filter logic)
- Modify: `app/ideas/page.tsx`
- Create: `app/ideas/[id]/page.tsx`
- Create: `components/ideas/idea-detail.tsx`
- Create: `tests/ideas-search.test.ts`

**Interfaces:**
- Consumes: 
  - `content/ideas/ideas-registry.json` (from Task 1)
  - `content/impact-domains/domains.json` (from Task 1)
  - `GET /api/ideas` endpoint (from Task 1)
- Produces:
  - Search UI with query input and domain/status filters
  - Grid display of idea cards (10 per page, paginated)
  - Detail page for each idea
  - Search function: `searchIdeas(query, filters)` → returns sorted results
  - Filter function validates against allowed domains and statuses

---

### **Step 1: Create search logic `lib/ideas-search.ts`**

```typescript
import { Idea } from '@/types/idea';

export interface SearchFilters {
  query?: string;
  domain?: string;
  status?: string;
  tags?: string[];
  sortBy?: 'name' | 'status' | 'reach' | 'recent';
}

export function searchIdeas(ideas: Idea[], filters: SearchFilters): Idea[] {
  let filtered = [...ideas];

  // Text search
  if (filters.query) {
    const q = filters.query.toLowerCase();
    filtered = filtered.filter(idea =>
      idea.name.toLowerCase().includes(q) ||
      idea.problem.toLowerCase().includes(q) ||
      idea.proposedSolution.toLowerCase().includes(q)
    );
  }

  // Domain filter
  if (filters.domain) {
    filtered = filtered.filter(idea => idea.domain === filters.domain);
  }

  // Status filter
  if (filters.status) {
    filtered = filtered.filter(idea => idea.status === filters.status);
  }

  // Tag filter (any tag match)
  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter(idea =>
      filters.tags!.some(tag => idea.tags.includes(tag))
    );
  }

  // Sorting
  const sortBy = filters.sortBy || 'name';
  switch (sortBy) {
    case 'reach':
      filtered.sort((a, b) => b.reach - a.reach);
      break;
    case 'recent':
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      break;
    case 'status':
      const statusOrder = ['exploring', 'researching', 'validating', 'planned', 'building', 'launched'];
      filtered.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));
      break;
    case 'name':
    default:
      filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return filtered;
}

export function getUniqueTags(ideas: Idea[]): string[] {
  const tags = new Set<string>();
  ideas.forEach(idea => idea.tags.forEach(tag => tags.add(tag)));
  return Array.from(tags).sort();
}
```

- [ ] **Step 2: Create search component `components/ideas/ideas-search.tsx`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { ImpactDomain, Idea } from '@/types/idea';

interface IdeasSearchProps {
  domains: ImpactDomain[];
  onSearch: (query: string, domain: string, status: string) => void;
}

export default function IdeasSearch({ domains, onSearch }: IdeasSearchProps) {
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query, domain, status);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, domain, status, onSearch]);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-6">Search ideas</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by name, problem, or solution..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All domains</option>
          {domains.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All stages</option>
          <option value="exploring">Exploring</option>
          <option value="researching">Researching</option>
          <option value="validating">Validating</option>
          <option value="planned">Planned</option>
          <option value="building">Building</option>
          <option value="launched">Launched</option>
        </select>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create idea card component `components/ideas/idea-card.tsx`**

```typescript
import Link from 'next/link';
import { Idea } from '@/types/idea';

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const statusColors: Record<string, string> = {
    exploring: 'bg-blue-100 text-blue-800',
    researching: 'bg-purple-100 text-purple-800',
    validating: 'bg-orange-100 text-orange-800',
    planned: 'bg-green-100 text-green-800',
    building: 'bg-indigo-100 text-indigo-800',
    launched: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <Link href={`/ideas/${idea.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition h-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold pr-2">{idea.name}</h3>
          <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusColors[idea.status]}`}>
            {idea.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {idea.problem}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {idea.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              +{idea.tags.length - 3}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Reach: ~{(idea.reach / 1000000).toFixed(1)}M people
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Create ideas grid component `components/ideas/ideas-grid.tsx`**

```typescript
'use client';

import { Idea } from '@/types/idea';
import IdeaCard from './idea-card';
import { useState } from 'react';

interface IdeasGridProps {
  ideas: Idea[];
}

export default function IdeasGrid({ ideas }: IdeasGridProps) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(ideas.length / itemsPerPage);
  
  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const displayedIdeas = ideas.slice(startIdx, endIdx);

  return (
    <div>
      {displayedIdeas.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No ideas found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {displayedIdeas.map(idea => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-8">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 rounded ${
                    page === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          <p className="text-center text-sm text-gray-500">
            Showing {startIdx + 1}–{Math.min(endIdx, ideas.length)} of {ideas.length} ideas
          </p>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create idea detail component `components/ideas/idea-detail.tsx`**

```typescript
import { Idea } from '@/types/idea';

interface IdeaDetailProps {
  idea: Idea;
}

export default function IdeaDetail({ idea }: IdeaDetailProps) {
  const statusColors: Record<string, string> = {
    exploring: 'bg-blue-100 text-blue-800',
    researching: 'bg-purple-100 text-purple-800',
    validating: 'bg-orange-100 text-orange-800',
    planned: 'bg-green-100 text-green-800',
    building: 'bg-indigo-100 text-indigo-800',
    launched: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-4xl font-bold">{idea.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[idea.status]}`}>
            {idea.status}
          </span>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
          <span>Target: {idea.targetGroup}</span>
          <span>Reach: ~{(idea.reach / 1000000).toFixed(1)}M people</span>
          {idea.owner && <span>Owner: {idea.owner}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2">
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Problem</h2>
            <p className="text-lg text-gray-700 leading-relaxed">{idea.problem}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Proposed Solution</h2>
            <p className="text-lg text-gray-700 leading-relaxed">{idea.proposedSolution}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Social Benefit</h2>
            <p className="text-lg text-gray-700 leading-relaxed">{idea.socialBenefit}</p>
          </section>

          {idea.potentialHarm && (
            <section className="mb-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
              <h2 className="text-2xl font-bold mb-4">Potential Risks</h2>
              <p className="text-gray-700 leading-relaxed">{idea.potentialHarm}</p>
            </section>
          )}

          {idea.successMetrics && idea.successMetrics.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Success Metrics</h2>
              <ul className="list-disc pl-5 space-y-2">
                {idea.successMetrics.map((metric, idx) => (
                  <li key={idx} className="text-gray-700">{metric}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-bold mb-4">Details</h3>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500">Feasibility</p>
                <p className="font-medium capitalize">{idea.feasibility}</p>
              </div>

              <div>
                <p className="text-gray-500">Sustainability</p>
                <p className="font-medium capitalize">{idea.sustainability}</p>
              </div>

              {idea.privacyRequirements.length > 0 && (
                <div>
                  <p className="text-gray-500 mb-2">Privacy Requirements</p>
                  <ul className="space-y-1">
                    {idea.privacyRequirements.map((req, idx) => (
                      <li key={idx} className="text-gray-700">• {req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {idea.securityRequirements.length > 0 && (
                <div>
                  <p className="text-gray-500 mb-2">Security Requirements</p>
                  <ul className="space-y-1">
                    {idea.securityRequirements.map((req, idx) => (
                      <li key={idx} className="text-gray-700">• {req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {idea.tags.length > 0 && (
        <section className="pt-8 border-t border-gray-200">
          <h2 className="font-bold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {idea.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
```

- [ ] **Step 6: Update `app/ideas/page.tsx`**

```typescript
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Idea, ImpactDomain } from '@/types/idea';
import IdeasSearch from '@/components/ideas/ideas-search';
import IdeasGrid from '@/components/ideas/ideas-grid';
import { searchIdeas } from '@/lib/ideas-search';

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [domains, setDomains] = useState<ImpactDomain[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        const [ideasRes, domainsRes] = await Promise.all([
          fetch('/api/ideas'),
          fetch('/api/ideas/domains'), // We'll create this endpoint
        ]);

        const ideasData = await ideasRes.json();
        const domainsData = await domainsRes.json();

        setIdeas(ideasData.ideas);
        setDomains(domainsData.domains);
        setFilteredIdeas(ideasData.ideas);
      } catch (error) {
        console.error('Failed to load ideas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, []);

  const handleSearch = useCallback((query: string, domain: string, status: string) => {
    const results = searchIdeas(ideas, { query, domain, status });
    setFilteredIdeas(results);
  }, [ideas]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-5xl font-bold mb-4">Ideas Laboratory</h1>
        <p className="text-xl text-gray-600">
          A searchable library of 120+ social-impact ideas organized by domain and research status.
        </p>
      </div>

      <IdeasSearch domains={domains} onSearch={handleSearch} />
      <IdeasGrid ideas={filteredIdeas} />
    </div>
  );
}
```

- [ ] **Step 7: Create `app/ideas/[id]/page.tsx`**

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import IdeaDetail from '@/components/ideas/idea-detail';
import { Idea } from '@/types/idea';

export default function IdeaDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const ideasPath = join(process.cwd(), 'content', 'ideas', 'ideas-registry.json');
  const ideasData = JSON.parse(readFileSync(ideasPath, 'utf-8'));

  const idea: Idea | undefined = ideasData.ideas.find(
    (i: Idea) => i.id === params.id
  );

  if (!idea) {
    notFound();
  }

  return <IdeaDetail idea={idea} />;
}
```

- [ ] **Step 8: Write tests `tests/ideas-search.test.ts`**

```typescript
import { searchIdeas, getUniqueTags } from '@/lib/ideas-search';
import { Idea } from '@/types/idea';

describe('Ideas Search', () => {
  const mockIdeas: Idea[] = [
    {
      id: 'IDEA-0001',
      name: 'Affordable journey discovery',
      domain: 'DOMAIN-01',
      problem: 'Travel costs are hard to compare',
      targetGroup: 'Travellers',
      proposedSolution: 'Compare transport options',
      socialBenefit: 'Help people save money',
      privacyRequirements: [],
      securityRequirements: [],
      feasibility: 'high',
      sustainability: 'medium',
      reach: 1000000,
      status: 'exploring',
      relatedIdeas: [],
      tags: ['accessibility', 'transport'],
      createdAt: '2026-11-19T00:00:00Z',
      updatedAt: '2026-11-19T00:00:00Z',
    },
    // Add more mock ideas as needed
  ];

  it('should search by query', () => {
    const results = searchIdeas(mockIdeas, { query: 'journey' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toContain('journey');
  });

  it('should filter by domain', () => {
    const results = searchIdeas(mockIdeas, { domain: 'DOMAIN-01' });
    expect(results.every(i => i.domain === 'DOMAIN-01')).toBe(true);
  });

  it('should filter by status', () => {
    const results = searchIdeas(mockIdeas, { status: 'exploring' });
    expect(results.every(i => i.status === 'exploring')).toBe(true);
  });

  it('should extract unique tags', () => {
    const tags = getUniqueTags(mockIdeas);
    expect(tags).toContain('accessibility');
    expect(tags).toContain('transport');
  });
});
```

- [ ] **Step 9: Commit**

```bash
git add components/ideas/ lib/ideas-search.ts app/ideas/ tests/ideas-search.test.ts
git commit -m "feat: add ideas library with search, filter and detail pages

- Implement search component with query and filter UI
- Add ideas grid with pagination (12 per page)
- Create idea card component with status badges
- Build idea detail page with full problem/solution context
- Add search and filter logic (domain, status, tags, sorting)
- Write comprehensive search tests
- Respect reduced-motion preferences"
```

---

## Task 5: Mission, Ecosystem, Products and Impact Sections

**Files:**
- Modify: `app/mission/page.tsx`
- Modify: `app/ecosystem/page.tsx`
- Modify: `app/products/page.tsx`
- Modify: `app/products/[product]/page.tsx`
- Modify: `app/impact/page.tsx`
- Create: `components/sections/mission-section.tsx`
- Create: `components/sections/ecosystem-section.tsx`
- Create: `components/sections/products-carousel.tsx`
- Create: `components/sections/impact-section.tsx`
- Create: `components/three/ecosystem-scene.tsx` (placeholder)

**Interfaces:**
- Consumes:
  - `content/principles/principles.json` (Task 1)
  - `content/products/products.json` (Task 1)
  - `content/impact-domains/domains.json` (Task 1)
- Produces:
  - Mission page: company purpose, 3 principles, roadmap preview
  - Ecosystem page: diagram of unified identity + platform + products (3D scene optional)
  - Products page: carousel of three products with visual identity
  - Product detail pages: deep dive into each product
  - Impact page: 12 domains with descriptions, related ideas

---

**This task covers substantial content implementation. Due to length constraints, here's the structure:**

- [ ] **Step 1: Create `components/sections/mission-section.tsx`**

Render principles from `content/principles/principles.json`, with icons and expandable commitment sections.

- [ ] **Step 2: Create `components/sections/ecosystem-section.tsx`**

Display architecture diagram (SVG static, with optional 3D scene if viewport supports it). Show three products as connected nodes.

- [ ] **Step 3: Create `components/sections/products-carousel.tsx`**

Build carousel of three products (RouteMaster, Fufaji's, Funds-for-Family) with product preview cards, images, and CTA buttons.

- [ ] **Step 4: Create `components/sections/impact-section.tsx`**

Display 12 impact domains in a grid. Each card shows domain name, description, and related idea count.

- [ ] **Step 5: Implement all page stubs to import and render sections**

- [ ] **Step 6: Commit**

```bash
git add app/mission/ app/ecosystem/ app/products/ app/impact/ components/sections/
git commit -m "feat: add mission, ecosystem, products and impact sections"
```

---

## Task 6: Account Entry Point and Sign-In Placeholder

**Files:**
- Modify: `app/account/page.tsx`
- Modify: `app/account/login/page.tsx`
- Modify: `app/account/register/page.tsx`
- Create: `components/account/account-dashboard.tsx`
- Create: `docs/INTEGRATION_CONTRACTS.md`

**Interfaces:**
- Consumes: None (this is a design placeholder; Platform Core service is separate)
- Produces:
  - Account page: placeholder showing "Your ecosystem account" with connected products
  - Sign-in page: form with email/password and "Sign in with Passkey" button (links to Platform Core once built)
  - Register page: form with name, email, password
  - Integration contracts document: OIDC configuration, token format, product registration schema

---

### **This task designs the account experience now, with integration points for future Platform Core.**

- [ ] **Step 1: Create `docs/INTEGRATION_CONTRACTS.md`**

Document OIDC flows, JWT token structure, product registration format, and API contracts for future Platform Core integration. Example:

```markdown
# Integration Contracts

## OIDC Sign-in Flow

The portfolio will redirect to the Platform Core's OIDC provider.

**Configuration (to be provided by Platform Core):**

- Authorization endpoint: `https://platform-core.example.com/oauth/authorize`
- Token endpoint: `https://platform-core.example.com/oauth/token`
- Client ID: `portfolio-web-client`
- Scopes: `openid profile email offline_access`
- Redirect URI: `https://routemaster.vercel.app/account/callback`

## Product Registration

Products register with the Platform Core as OIDC clients.

```json
{
  "id": "routemaster",
  "name": "RouteMaster",
  "type": "web_application",
  "redirect_uris": ["https://routemaster.vercel.app/auth/callback"],
  "allowed_scopes": ["openid", "profile", "email", "routemaster:access"]
}
```

## Identity Token Claims

```json
{
  "sub": "user-id-uuid",
  "email": "user@example.com",
  "email_verified": true,
  "name": "Full Name",
  "picture": "...",
  "iat": 1234567890,
  "exp": 1234571490,
  "aud": "portfolio-web-client"
}
```
```

- [ ] **Step 2: Create account pages with links to Platform Core (when available)**

- [ ] **Step 3: Commit**

```bash
git add app/account/ components/account/ docs/INTEGRATION_CONTRACTS.md
git commit -m "feat: design account entry point with Platform Core integration contracts

- Create account dashboard placeholder
- Build sign-in and register pages (redirects to Platform Core OIDC)
- Document OIDC flows and product registration
- Design token structure and scopes"
```

---

## Task 7: Responsive Design and Mobile Optimization

**Files:**
- Modify: All component files (add mobile-first breakpoints)
- Create: `tests/accessibility.test.ts`
- Modify: `styles/globals.css` (mobile utilities)

**Interfaces:**
- Consumes: All previous components
- Produces: Responsive Tailwind breakpoints (sm, md, lg, xl), touch-friendly interactions, reduced layout complexity for mobile

---

## Task 8: SEO, Metadata and Performance

**Files:**
- Create: `app/robots.ts`
- Create: `app/sitemap.ts`
- Modify: `app/layout.tsx` (OpenGraph, structured data)
- Create: `next.config.ts` (image optimization, compression)
- Create: `tests/performance.test.ts`

**Interfaces:**
- Produces: Lighthouse ≥90 score, semantic HTML, OpenGraph metadata, structured JSON-LD schema

---

## Task 9: Integration and Deployment Testing

**Files:**
- Create: `.github/workflows/ci.yml` (lint, test, build)
- Create: `vercel.json` (deployment config)
- Modify: `package.json` (test and build scripts)

**Interfaces:**
- Produces: CI/CD pipeline that validates all content, runs tests, checks Lighthouse

---

## Review Focus (Verification Checklist)

After all tasks are complete, before final commit:

- [ ] **Ideas registry validation**: All 120 ideas have correct schema, unique IDs, valid references to domains
- [ ] **Search edge cases**: Empty query, special characters, missing translations, malformed metadata all handled gracefully
- [ ] **Motion safety**: All animations respect `prefers-reduced-motion`; static fallbacks render correctly
- [ ] **Sign-in links work**: `/account/login` and `/account/register` pages exist and are reachable
- [ ] **Accessibility**: WCAG 2.1 AA on all pages (keyboard nav, screen readers, color contrast ≥4.5:1)
- [ ] **Mobile responsive**: All sections render correctly on mobile, desktop, and tablet viewports
- [ ] **Performance**: Lighthouse score ≥90; images optimized; JavaScript minimal on critical path
- [ ] **Content versioning**: All JSON structured content designed for database migration (stable IDs, normalized schema)

---

## Summary

This plan delivers the RouteMaster unified ecosystem common space over 9 focused tasks:

1. **Content infrastructure** — Ideas, domains, products, principles with validation
2. **Layout and navigation** — Root structure, navbar, footer, page routing
3. **Hero and motion** — Cinematic entry point with scroll animations
4. **Ideas library** — Full search, filter, pagination and detail pages
5. **Mission and products** — Core sections with product carousel
6. **Account design** — Placeholder with OIDC integration contracts
7. **Responsive design** — Mobile-first optimization
8. **SEO and performance** — Metadata, structured data, Lighthouse optimization
9. **CI/CD and testing** — Automated validation and deployment

Each task is independently reviewable. After Task 1, the content structure is locked for database migration. After Task 2, all 12 sections are routable. After Task 3, the visual identity and motion system are established.

**Next step:** Review this plan. Does it capture what you want?
