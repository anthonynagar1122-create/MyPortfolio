# Cloudflare Deployment Guide — RouteMaster.online

## Current Status ✅

### Completed (Automated)
- ✅ Cloudflare zone verified: `routemaster.online` (active)
- ✅ SSL/TLS configuration: Full mode (certificate active)
- ✅ Existing DNS records verified (MX, TXT, DKIM for email)
- ✅ Cloudflare Pages project created: `routemaster-portfolio`

### Pending (Manual Steps Required)

---

## Step 1: Connect GitHub Repository to Cloudflare Pages

### In Cloudflare Dashboard:

1. **Navigate to Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Select your account: `Anthonynagar1122@gmail.com's Account`
   - Go to **Pages** in the left sidebar

2. **Connect GitHub to routemaster-portfolio project**
   - Click on **routemaster-portfolio** project
   - Go to **Settings** → **Build & Deployments**
   - Click **Connect to Git**
   - Authorize Cloudflare with GitHub
   - Select repository: `anthonynagar1122-create/MyPortfolio`
   - Configure build settings:
     - **Production branch**: `claude/sweet-cannon-0l8ly8`
     - **Build command**: `npm run build`
     - **Build output directory**: `.next`
     - **Root directory**: `portfolio`

3. **Verify deployment**
   - Cloudflare will trigger a build after connecting
   - Monitor build status in Pages dashboard
   - Once successful, project will be live at `routemaster-portfolio.pages.dev`

**Expected Time**: 2-5 minutes

---

## Step 2: Configure Custom Domain (routemaster.online)

### In Cloudflare Dashboard:

1. **Go to routemaster-portfolio Pages project**
   - Settings → **Custom domains**
   - Click **Add custom domain**

2. **Add routemaster.online**
   - Enter: `routemaster.online`
   - Cloudflare will provide DNS verification
   - Add the verification record if prompted

3. **Verify DNS Configuration**
   - Cloudflare will check nameservers
   - Zone verification should pass automatically (already on Cloudflare DNS)

4. **Enable www subdomain** (optional)
   - Add `www.routemaster.online` as additional custom domain
   - Cloudflare will handle verification

**Expected Time**: 1-2 minutes

---

## Step 3: Configure Subdomain DNS Records

### For Product Applications

Add these CNAME records in Cloudflare DNS dashboard:

| Subdomain | Type | Target | Purpose |
|-----------|------|--------|---------|
| `route.routemaster.online` | CNAME | *(to be deployed)* | RouteMaster app |
| `fufaji.routemaster.online` | CNAME | *(to be deployed)* | Fufaji's app |
| `family.routemaster.online` | CNAME | *(to be deployed)* | Funds-for-Family app |

### In Cloudflare Dashboard:

1. **Go to DNS settings**
   - Zone: `routemaster.online`
   - **DNS Records** section

2. **Add CNAME records** (after apps are deployed)
   - Each subdomain will point to its respective application's deployment URL

---

## Step 4: Enable Cache Rules & Performance Settings

### Recommended Configuration:

**In Zone → Settings:**

1. **Caching**
   - Browser cache TTL: 4 hours
   - Cache level: Aggressive

2. **Performance**
   - Brotli compression: Enabled
   - Minify: Enable all (HTML, CSS, JavaScript)
   - Polish: Lossless
   - WebP: Enabled

3. **Security**
   - DDoS protection: Medium
   - Security level: Medium
   - Rate limiting: Enabled

---

## Verification Checklist

After completing all steps:

- [ ] GitHub is connected and builds are triggered automatically
- [ ] `routemaster.online` resolves to Cloudflare Pages
- [ ] `www.routemaster.online` redirects to main domain
- [ ] SSL/TLS works (green padlock in browser)
- [ ] Homepage loads without 404 errors
- [ ] All navigation links work
- [ ] Responsive design verified on mobile
- [ ] Performance: Lighthouse score > 90
- [ ] Contact form is functional

---

## Deployment Information

**Project Details:**
- Project ID: `0c9dd2fe-d798-45bd-87fa-9d6df143eb62`
- Pages Subdomain: `routemaster-portfolio.pages.dev`
- Production Branch: `claude/sweet-cannon-0l8ly8`
- Zone ID: `e513d7e6bb1084b6813e52c5a63d33a7`
- Account: `1e80a967148b02852d23bab933c93973`

**Repository:**
- Repo: `anthonynagar1122-create/MyPortfolio`
- Portfolio directory: `portfolio/`
- Build command: `npm run build`
- Build output: `.next`

---

## Troubleshooting

### Build Fails
- Check the **Build Logs** in Pages dashboard
- Verify `npm run build` works locally
- Check for missing environment variables

### Domain Not Resolving
- Verify Cloudflare nameservers are set at Namecheap
- Wait up to 48 hours for DNS propagation
- Check DNS records in Cloudflare dashboard

### SSL/TLS Issues
- Cloudflare automatically provisions certificates
- Check **SSL/TLS** in zone settings (should be "Full" mode)
- May take a few minutes to activate

---

## Next Steps After Portfolio Deployment

1. **Phase 3**: Deploy product applications to subdomains
2. **Phase 4**: Configure shared infrastructure (Resend, Sentry, PostHog)
3. **Phase 5**: Add final content and SEO optimization
4. **Phase 6**: Public launch and announcements

---

**Last Updated**: November 19, 2026  
**Status**: Awaiting manual GitHub OAuth configuration
