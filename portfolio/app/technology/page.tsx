import { Navigation } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Technology and Architecture",
  description: "How RouteMaster approaches product architecture, infrastructure and security.",
};

export default function TechnologyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />
      <main>
        <section className="bg-neutral-950 py-24 text-white md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Engineering</p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold tracking-tight md:text-6xl">
              Architecture that respects product boundaries.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-300">
              We choose infrastructure around each product's needs, with a consistent focus on
              maintainability, security and clear ownership.
            </p>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              <article className="rounded-2xl border border-neutral-200 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Corporate portfolio</p>
                <h2 className="mt-3 text-2xl font-bold text-neutral-950">Next.js + Vercel + Supabase</h2>
                <p className="mt-4 leading-7 text-neutral-600">
                  This public website is built with Next.js and deployed through Vercel. Its contact
                  submissions are stored in a dedicated Supabase project with row-level security.
                </p>
              </article>
              <article className="rounded-2xl border border-neutral-200 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Product boundaries</p>
                <h2 className="mt-3 text-2xl font-bold text-neutral-950">Independent infrastructure</h2>
                <p className="mt-4 leading-7 text-neutral-600">
                  RouteMaster, Fufaji and Funds for Family are treated as separate products. Their
                  databases, authentication, payment configuration and release cycles are not
                  combined by this corporate website.
                </p>
              </article>
              <article className="rounded-2xl border border-neutral-200 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Security principles</p>
                <h2 className="mt-3 text-2xl font-bold text-neutral-950">Least privilege by default</h2>
                <p className="mt-4 leading-7 text-neutral-600">
                  Public pages use public-safe configuration. Contact submissions are validated
                  server-side, and the portfolio database applies row-level access policies.
                </p>
              </article>
              <article className="rounded-2xl border border-neutral-200 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Release process</p>
                <h2 className="mt-3 text-2xl font-bold text-neutral-950">Test before promotion</h2>
                <p className="mt-4 leading-7 text-neutral-600">
                  Source changes are tracked in GitHub. Preview builds and functional checks are
                  intended to pass before changes are promoted to the existing production domain.
                </p>
              </article>
            </div>
            <p className="mt-8 text-sm leading-6 text-neutral-500">
              We publish implementation details as they are verified. This page does not claim
              external security certifications or integrations that have not been completed.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
