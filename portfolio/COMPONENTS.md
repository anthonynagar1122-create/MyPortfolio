# Portfolio Framework — Component Library

Premium B2B SaaS design system with reusable components. Customer journey optimized: **Discover → Understand → Trust → Action**

---

## Quick Start

```tsx
import { Navigation, Hero, ProductCard, FeatureGrid, EnquiryForm, FAQSection, CTASection } from "@/components/core";

export default function HomePage() {
  return (
    <>
      <Navigation />
      <Hero headline="Your headline" subheadline="Your subheadline" />
      <ProductCard title="Product" category="Category" description="Description" accentColor="cyan" href="/" />
      <EnquiryForm />
    </>
  );
}
```

---

## Modules

### 1. Navigation
Sticky header with responsive mobile menu.

```tsx
<Navigation
  productName="Company"
  links={[
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
  ]}
  ctaLabel="Get Started"
  ctaHref="/contact"
/>
```

**Features:**
- Sticky positioning
- Mobile hamburger menu
- Product name/logo
- Navigation links
- CTA button

---

### 2. Hero
Large introduction section for pages or products.

```tsx
<Hero
  headline="Build Something Great"
  subheadline="Our Mission"
  description="Solve real problems with great design."
  primaryCTA={{ label: "Explore", href: "/products" }}
  secondaryCTA={{ label: "Learn More", href: "/about" }}
  variant="dark"
/>
```

**Variants:**
- `dark`: Dark background with white text
- `light`: Light background with dark text
- With/without visual element
- Centered or 2-column layout

---

### 3. ProductCard
Card for showcasing individual products.

```tsx
<ProductCard
  title="Product Name"
  category="Category"
  description="Short description of product value."
  accentColor="cyan"
  href="/products/product1"
  icon="🚀"
/>
```

**Accent Colors:**
- `cyan` (#61D5E8)
- `emerald` (#10B981)
- `violet` (#A855F7)

---

### 4. FeatureGrid
Display product features in a responsive grid.

```tsx
<FeatureGrid
  columns={3}
  variant="light"
  features={[
    { icon: "✨", title: "Feature 1", description: "Description" },
    { icon: "⚡", title: "Feature 2", description: "Description" },
  ]}
/>
```

**Props:**
- `columns`: 2, 3, or 4
- `variant`: "light" or "dark"
- `features`: Array of features

---

### 5. EnquiryForm
Full-featured contact form with validation.

```tsx
<EnquiryForm
  title="Get in Touch"
  description="Tell us about your needs."
  productOptions={[
    { label: "Select interest", value: "" },
    { label: "Demo Request", value: "demo" },
    { label: "Partnership", value: "partnership" },
  ]}
/>
```

**Features:**
- Name, email, company, product, message fields
- Real-time validation
- Success/error states
- Loading state
- Keyboard accessible
- TODO: Backend integration

---

### 6. FAQSection
Keyboard-navigable accordion for FAQs.

```tsx
<FAQSection
  title="Frequently Asked Questions"
  items={[
    { question: "What is this?", answer: "It's a product." },
    { question: "How does it work?", answer: "It solves problems." },
  ]}
/>
```

**Features:**
- Click to expand/collapse
- Keyboard navigation (Enter/Space)
- Smooth animations
- Semantic HTML

---

### 7. CTASection
High-impact call-to-action section.

```tsx
<CTASection
  headline="Ready to get started?"
  description="Join us on this journey."
  primaryButtonText="Start Free"
  primaryButtonHref="/signup"
  variant="dark"
/>
```

**Variants:**
- `dark`: Dark background
- `light`: Light background

---

## Design Tokens

Access design system values in your components:

```tsx
import { tokens } from "@/config/design-tokens";

// Colors
tokens.colors.primary[500]; // #3563F6
tokens.colors.accent.cyan;  // #61D5E8
tokens.colors.neutral[900]; // #0F172A

// Typography
tokens.typography.displayLg;   // 56px bold
tokens.typography.bodyMd;      // 16px regular

// Spacing
tokens.spacing.md;             // 16px
tokens.spacing.xl;             // 32px

// Shadows
tokens.shadows.lg;             // Large elevation

// Transitions
tokens.transitions.normal;     // 250ms ease-in-out
```

---

## Product Configuration

Centralized product management:

```tsx
import { products, getProduct, getProductCtaLabel } from "@/config/products";

// Get specific product
const product = getProduct("product1");

// Get all products
const all = getAllProducts();

// Filter by status
const showcases = getProductsByStatus("showcase");

// Get CTA label based on status
const label = getProductCtaLabel(product); // "Learn More" | "Try Demo" | "Launch App"
```

**Product Status:**
- `showcase`: Marketing page only
- `preview`: Demo available
- `live`: Full application available

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|-----------|-------|-------|
| Mobile | 375px | Small phones |
| Tablet | 768px | Tablets, large phones |
| Laptop | 1024px | Small laptops |
| Desktop | 1440px | Standard desktop |
| Wide | 1920px+ | Large displays |

---

## Accessibility

All components follow WCAG AA standards:

- ✅ Semantic HTML (`<button>`, `<nav>`, `<main>`)
- ✅ Keyboard navigation (Tab, Enter, Arrow keys)
- ✅ Focus visible (3px blue ring)
- ✅ Color + text indicators (not color-only)
- ✅ Touch targets ≥44px (mobile)
- ✅ Respects `prefers-reduced-motion`
- ✅ Proper form labels and ARIA attributes
- ✅ Contrast ratios ≥4.5:1 (text), ≥3:1 (graphics)

---

## Color System

### Primary (Trust/Tech)
```
primary-50:  #F0F4FF (lightest)
primary-500: #3563F6 (main)
primary-900: #0F1B4F (darkest)
```

### Neutral (Text/Surfaces)
```
neutral-50:  #FAFAFA (almost white)
neutral-200: #E5E7EB (light gray)
neutral-600: #4B5563 (medium gray)
neutral-900: #0F172A (almost black)
```

### Product Accents
```
cyan:    #61D5E8 (Product 1)
emerald: #10B981 (Product 2)
violet:  #A855F7 (Product 3)
```

### Semantic
```
success: #10B981 (green)
warning: #F59E0B (amber)
error:   #EF4444 (red)
info:    #3563F6 (blue)
```

---

## Tips & Best Practices

✅ **DO:**
- Use semantic HTML elements
- Include proper ARIA labels
- Test keyboard navigation
- Support mobile viewport
- Follow the design tokens
- Use consistent spacing (8px grid)

❌ **DON'T:**
- Use fancy decorative animations
- Rely on color alone for status
- Hardcode pixel values
- Skip alt text on images
- Use emoji as interface icons
- Create hover-only CTAs

---

## Next Steps

1. Build product showcase pages using these components
2. Create page templates (Homepage, Product Detail, etc.)
3. Integrate enquiry form with backend
4. Add SEO metadata and structured data
5. Test responsive design across devices
6. Set up analytics tracking
7. Deploy to Cloudflare Pages

---

**Updated**: November 19, 2026  
**Status**: Framework complete, ready for page templates
