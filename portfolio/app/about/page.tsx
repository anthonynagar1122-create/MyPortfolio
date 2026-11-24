import Link from "next/link";
import { Navigation, Hero, FeatureGrid, CTASection } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "About RouteMaster",
  description: "Learn about RouteMaster Intelligent Systems and the principles behind its independent digital products.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />
      <main>
        <Hero
          headline="Technology should make real life easier."
          subheadline="About RouteMaster Intelligent Systems"
          description="We build focused digital products around practical problems in mobility, local commerce and family finance."
          primaryCTA={{ label: "Explore our products", href: "/products" }}
          secondaryCTA={{ label: "Contact us", href: "/contact" }}
          variant="dark"
        />

        <section className="py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Our mission</p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-neutral-950">
                Solve the problem before adding the technology.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-neutral-600">
              <p>
                We start with the people, workflows and constraints behind a problem. Then we shape
                technology around what is genuinely useful—not around features for their own sake.
              </p>
              <p>
                Our portfolio brings together distinct products, each with its own users, operating
                model and roadmap.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-neutral-50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Our principles</p>
              <h2 className="mt-4 font-display text-4xl font-bold text-neutral-950">How we build</h2>
            </div>
            <FeatureGrid
              columns={3}
              variant="light"
              features={[
                { icon: "🎯", title: "Problem first", description: "Understand the real workflow and user need before choosing a technical solution." },
                { icon: "🧩", title: "Independent products", description: "Keep product data, authentication, payments and release cycles separated where needed." },
                { icon: "🔐", title: "Security by design", description: "Use least-privilege access, server-side controls and explicit data boundaries." },
                { icon: "🛠️", title: "Practical engineering", description: "Choose maintainable architecture that fits the product's current stage." },
                { icon: "🤝", title: "Trust and clarity", description: "Make product behaviour, pricing and important decisions understandable." },
                { icon: "📈", title: "Continuous improvement", description: "Validate changes, learn from real usage and improve in measured steps." },
              ]}
            />
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Our portfolio</p>
              <h2 className="mt-4 font-display text-4xl font-bold text-neutral-950">Three distinct problem spaces</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { title: "Mobility", description: "RouteMaster explores multi-modal journey planning and route choices.", href: "/apps/routemaster" },
                { title: "Local commerce", description: "Fufaji focuses on simple neighbourhood shopping and transparent prices.", href: "/apps/fufaji" },
                { title: "Family finance", description: "Funds for Family focuses on clearer records and accountable coordination.", href: "/apps/funds-for-family" },
              ].map((item) => (
                <Link key={item.title} href={item.href} className="rounded-2xl border border-neutral-200 p-7 transition-colors hover:border-primary-300 hover:bg-primary-50/40">
                  <h3 className="text-xl font-semibold text-neutral-950">{item.title}</h3>
                  <p className="mt-3 leading-7 text-neutral-600">{item.description}</p>
                  <span className="mt-6 inline-flex font-semibold text-primary-700">Explore product <span className="ml-2" aria-hidden="true">→</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CTASection
          headline="Have a problem worth solving?"
          description="Start a conversation about a product idea, a technology requirement or a partnership."
          primaryButtonText="Contact RouteMaster"
          primaryButtonHref="/contact"
          variant="dark"
        />
      </main>
      <Footer />
    </div>
  );
}
