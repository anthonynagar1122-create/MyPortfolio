import Link from "next/link";
import { Navigation, Hero } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "People and Leadership",
  description: "Learn about the founder-led approach behind RouteMaster Intelligent System Pvt. Ltd..",
};

export default function TeamPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />
      <main>
        <Hero
          headline="Focused on building useful products."
          subheadline="People and leadership"
          description="RouteMaster is a founder-led product and engineering company. We keep teams close to the problems each product is designed to solve."
          primaryCTA={{ label: "Explore our work", href: "/products" }}
          variant="dark"
        />
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Our approach</p>
            <h2 className="mt-4 font-display text-4xl font-bold text-neutral-950">Small, accountable product teams.</h2>
            <p className="mt-6 text-lg leading-8 text-neutral-600">
              We prioritise clear ownership, direct feedback and engineering decisions that serve
              the product. Individual team profiles will be published when they are ready to be
              shared publicly.
            </p>
            <Link href="/contact" className="btn btn-primary mt-8">Connect with our team</Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
