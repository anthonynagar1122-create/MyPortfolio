# Build Phase Implementation Guide

**Status**: API Backend ✅ | Deployment Ready ✅ | Next: Email Integration

---

## What's Been Built

### ✅ Phase 1: Deployment Infrastructure
- [x] Fixed Cloudflare Pages build configuration
- [x] Portfolio live at `routemaster-portfolio.pages.dev`
- [x] Automatic deployments enabled
- [x] Ready for custom domain `routemaster.online`

### ✅ Phase 2: Form Backend
- [x] Created `/api/contact` endpoint (POST)
- [x] Implemented validation (email, required fields)
- [x] Wired EnquiryForm component to actual backend
- [x] Returns proper HTTP status codes (201 success, 400 validation, 500 error)
- [x] Form submissions logged to console (development)

**Current State:**
- Forms are fully functional ✅
- Submissions are accepted ✅
- Error handling works ✅
- Email sending not yet configured ⏳

---

## 🔴 CRITICAL: Next Steps (Do First)

### Step 1: Verify Live Deployment
1. Go to https://routemaster-portfolio.pages.dev
2. Click "Contact" in navigation
3. Fill out and submit the form
4. You should see: "Thank you for your message. We'll be in touch soon!"
5. Check Cloudflare Pages logs to verify submission was received

### Step 2: Setup Email Service (Resend)

**What you need:**
- Resend account (free tier available at https://resend.com)
- API key from Resend dashboard

**Implementation steps:**

1. **Create Resend Account**
   ```bash
   # Visit https://resend.com
   # Sign up and get API key from dashboard
   ```

2. **Add to Environment Variables**
   - Cloudflare Pages → Settings → Environment variables
   - Add: `RESEND_API_KEY` = `your_resend_key_here`

3. **Update API Route**
   - File: `portfolio/app/api/contact/route.ts`
   - Uncomment the Resend section (lines 56-62)
   - Install Resend library:
     ```bash
     cd portfolio
     npm install resend
     ```

4. **Full API Code (after updates)**
   ```typescript
   import { Resend } from "resend";
   
   export async function POST(request: NextRequest) {
     // ... validation code ...
     
     // Send confirmation email to user
     const resend = new Resend(process.env.RESEND_API_KEY);
     await resend.emails.send({
       from: "contact@routemaster.online",
       to: formData.email,
       subject: "We received your message",
       html: `
         <h2>Hi ${formData.name},</h2>
         <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
         <p><strong>Your message:</strong></p>
         <p>${formData.message}</p>
       `,
     });
     
     // Send notification to company
     await resend.emails.send({
       from: "contact@routemaster.online",
       to: "team@routemaster.online",
       subject: `New enquiry from ${formData.name}`,
       html: `
         <p><strong>Name:</strong> ${formData.name}</p>
         <p><strong>Email:</strong> ${formData.email}</p>
         <p><strong>Company:</strong> ${formData.company || "N/A"}</p>
         <p><strong>Interest:</strong> ${formData.product || "N/A"}</p>
         <p><strong>Message:</strong></p>
         <p>${formData.message}</p>
       `,
     });
     
     return NextResponse.json({ success: true, message: "..." });
   }
   ```

5. **Test Locally**
   ```bash
   cd portfolio
   npm run dev
   # Visit http://localhost:3000/contact
   # Submit form and verify email is sent
   ```

6. **Deploy**
   ```bash
   git add -A
   git commit -m "Add Resend email integration to contact form"
   git push origin claude/sweet-cannon-0l8ly8
   # Cloudflare Pages auto-deploys
   ```

---

## 🟡 Phase 3: Analytics & Monitoring

### Setup PostHog (Product Analytics)

```bash
# 1. Create account at https://posthog.com
# 2. Get API key from project settings
# 3. Add to Cloudflare environment variables:
#    NEXT_PUBLIC_POSTHOG_KEY = your_key
#    NEXT_PUBLIC_POSTHOG_HOST = https://app.posthog.com

# 4. Create lib/posthog.ts:
```

```typescript
// lib/posthog.ts
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  })
}

export default PostHogProvider
```

```typescript
// app/layout.tsx - wrap with provider
import PostHogProvider from '@/lib/posthog'

export default function RootLayout({ children }) {
  return (
    <PostHogProvider>
      <html>
        <body>{children}</body>
      </html>
    </PostHogProvider>
  )
}
```

### Setup Sentry (Error Tracking)

```bash
# 1. Create account at https://sentry.io
# 2. Create Next.js project
# 3. Run: npm install @sentry/nextjs
# 4. Run: npx @sentry/wizard@latest -i nextjs

# This creates sentry.client.config.ts and sentry.server.config.ts
# Then deploy normally
```

---

## 🟢 Phase 4: Content Management

### Create Updateable Content Structure

Currently all content is hardcoded in React components. To make it easy to update later:

**Option A: Simple JSON Configuration** (easiest)
```typescript
// config/site-content.ts
export const siteContent = {
  founder: {
    name: "Your Name",
    title: "Co-Founder & CEO",
    bio: "Bio text here",
    email: "you@example.com",
    linkedin: "https://linkedin.com/in/yourprofile",
    twitter: "https://twitter.com/yourhandle",
    photoUrl: "/images/founder.jpg",
  },
  company: {
    name: "RouteMaster",
    year_founded: 2024,
    team_size: 10,
    customers: 50,
    mission: "Mission statement",
  },
}
```

Then import and use in components:
```typescript
import { siteContent } from "@/config/site-content"

export default function FounderPage() {
  return (
    <div>
      <h1>{siteContent.founder.name}</h1>
      <p>{siteContent.founder.bio}</p>
    </div>
  )
}
```

**Option B: Database (more scalable)**
- Use Supabase, Firebase, or Vercel KV
- Create simple admin dashboard
- Allows updates without code redeploy

---

## 🔵 Deployment Checklist

- [ ] Email service configured (Resend)
- [ ] API key added to Cloudflare environment variables
- [ ] Email templates tested locally
- [ ] Form tested end-to-end
- [ ] Analytics configured (PostHog)
- [ ] Error tracking configured (Sentry)
- [ ] Custom domain set (routemaster.online)
- [ ] SSL certificate verified
- [ ] All pages load without errors
- [ ] Forms are functional
- [ ] Mobile responsive verified
- [ ] Performance optimized (Lighthouse > 90)

---

## Commands Reference

```bash
# Local development
cd portfolio
npm run dev              # Run at localhost:3000

# Testing
npm run build           # Production build
npm run start           # Run production build locally

# Deployment
git add -A
git commit -m "Your message"
git push origin claude/sweet-cannon-0l8ly8  # Auto-deploys to Cloudflare

# Check logs
# Cloudflare Dashboard → Pages → routemaster-portfolio → Deployments
```

---

## File Structure

```
portfolio/
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts          ← Form submission handler
│   ├── page.tsx                  ← Homepage
│   ├── contact/page.tsx          ← Contact form page
│   └── ...other pages
├── components/
│   └── core/
│       └── EnquiryForm.tsx       ← Updated with API call
├── config/
│   ├── design-tokens.ts
│   ├── products.ts
│   └── site-content.ts           ← Create this for easy updates
└── ...other files
```

---

## Troubleshooting

### Form not submitting?
1. Check browser console for errors (F12)
2. Check Cloudflare Pages logs
3. Verify `/api/contact` is live: `curl https://routemaster-portfolio.pages.dev/api/contact`

### Email not sending?
1. Verify `RESEND_API_KEY` is set in Cloudflare environment
2. Check Resend dashboard for delivery status
3. Verify domain is verified in Resend

### Build failing?
1. Run `npm run build` locally to test
2. Check Cloudflare Pages build logs for specific error
3. Verify Node.js version compatible (18+)

---

## Next Session Tasks

1. **Email Setup** (1-2 hours)
   - Create Resend account
   - Add API key to Cloudflare
   - Implement email sending
   - Test end-to-end

2. **Analytics** (1 hour)
   - Setup PostHog
   - Setup Sentry
   - Add tracking to key events

3. **Content Updates** (ongoing)
   - Replace placeholder content
   - Update founder info, team, company metrics
   - Add customer logos/testimonials

4. **Performance** (1 hour)
   - Run Lighthouse audit
   - Optimize images
   - Monitor Core Web Vitals

---

## Success Metrics

- ✅ Forms submit and send emails
- ✅ Submissions tracked in analytics
- ✅ Errors caught and reported to Sentry
- ✅ Site loads in < 2 seconds
- ✅ Lighthouse score > 90
- ✅ All pages render correctly on mobile
- ✅ Zero form submission errors

---

**Last Updated**: 2026-11-19  
**Current Status**: Build Phase ✅ | Ready for Email Integration
