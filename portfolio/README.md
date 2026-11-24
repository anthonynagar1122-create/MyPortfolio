This is a [Next.js](https://nextjs.org) project.

## Setup

```bash
cd portfolio
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Apply the SQL in `supabase/` to your Supabase project before first run.

## Environment variables

`.env.example` lists the names only. Set real values in `.env.local` locally and in the Vercel project settings (Settings > Environment Variables) for production. Never commit values.

| Name | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API > anon public key. Not read by the current code; keep it set for client-side Supabase use. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API > service_role key. Server only; never expose it to the browser. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard > API Keys > Publishable key (use the production instance for production) |
| `CLERK_SECRET_KEY` | Clerk Dashboard > API Keys > Secret key |
| `ADMIN_CLERK_USER_ID` | Clerk Dashboard > Users > the owner's account > User ID (`user_...`). Only this user gets admin access. |
| `RESEND_API_KEY` | Resend > API Keys |
| `EMAIL_FROM` | Sender address on a domain verified in Resend, e.g. `Name <hello@your-domain>` |
| `VISITOR_SALT_SECRET` | You generate it. Must be a long random string, e.g. `openssl rand -hex 32`. It salts visitor hashes and signs unsubscribe links; changing it invalidates existing unsubscribe links. |
| `SITE_URL` | Your public origin, e.g. `https://your-domain`, no trailing slash. Required in production; used for email links and allowed origins. |

Optional: `LOG_LEVEL` (default `info`).

## Deploying to Vercel

1. Import the repository in Vercel and set the root directory to `portfolio`.
2. Add every variable from the table above for the Production environment.
3. Deploy, then check `/`, `/admin` (signed out; it must not show admin content) and `/api/stats`.

### Clerk custom domain caveat

If the production Clerk instance uses a custom frontend API domain (for example `clerk.your-domain`), the Content-Security-Policy in `lib/security-headers.ts` must allow that domain in `script-src`, `connect-src` and `img-src`, otherwise sign-in will be blocked by the browser. Update the policy before switching the instance to the custom domain.

## Checks

```bash
npx tsc --noEmit
npx vitest run
npm run test:e2e -- --trace off
npm run lint
SITE_URL=http://localhost:3000 npm run build
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
