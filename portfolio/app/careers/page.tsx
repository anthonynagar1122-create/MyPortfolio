import { Navigation, Hero } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Careers at RouteMaster",
  description: "Connect with RouteMaster Intelligent Systems about future opportunities.",
};

export default function CareersPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />
      <main>
        <Hero
          headline="Build practical technology with us."
          subheadline="Careers"
          description="We value thoughtful problem-solving, clear ownership and a willingness to learn. Public vacancies will be listed here when roles are formally open."
          primaryCTA={{ label: "Register your interest", href: "#interest" }}
          variant="dark"
        />
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-neutral-200 p-8 md:p-12">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Current status</p>
              <h2 className="mt-4 font-display text-3xl font-bold text-neutral-950">No public vacancies are listed right now.</h2>
              <p className="mt-5 leading-8 text-neutral-600">
                We are not advertising unapproved openings. If you work in product engineering,
                design, mobility, local commerce or a related field, you can send a short
                introduction and profile for future consideration.
              </p>
              <a id="interest" href="mailto:hello@routemaster.online?subject=Future%20opportunities%20at%20RouteMaster" className="btn btn-primary mt-8">
                Email your profile
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
