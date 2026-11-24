import Link from "next/link";
import { Navigation, Hero, EnquiryForm } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Contact RouteMaster",
  description: "Contact RouteMaster Intelligent Systems for product, technology and partnership enquiries.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />
      <main>
        <Hero
          headline="Let's build something useful."
          subheadline="Contact RouteMaster"
          description="Tell us about your product question, technology requirement or partnership idea. Our team will review your message and respond by email."
          primaryCTA={{ label: "Write to our team", href: "#contact-form" }}
          variant="dark"
        />

        <section className="bg-neutral-50 py-16 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
            <div className="rounded-2xl border border-neutral-200 bg-white p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">General enquiries</p>
              <h2 className="mt-3 text-2xl font-bold text-neutral-950">Talk to RouteMaster</h2>
              <p className="mt-3 leading-7 text-neutral-600">
                For product information, collaboration, business enquiries and general questions.
              </p>
              <a className="mt-6 inline-flex font-semibold text-primary-700 hover:text-primary-900" href="mailto:hello@routemaster.online">
                hello@routemaster.online <span className="ml-2" aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">Product enquiries</p>
              <h2 className="mt-3 text-2xl font-bold text-neutral-950">Choose a product</h2>
              <p className="mt-3 leading-7 text-neutral-600">
                Ask about RouteMaster, Fufaji or Funds for Family. Each product is managed independently.
              </p>
              <Link className="mt-6 inline-flex font-semibold text-primary-700 hover:text-primary-900" href="/products">
                Explore the portfolio <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="contact-form" className="scroll-mt-24">
          <EnquiryForm
            title="Send us a message"
            description="Please include enough detail for us to understand your enquiry."
            productOptions={[
              { label: "Select an area", value: "" },
              { label: "RouteMaster", value: "routemaster" },
              { label: "Fufaji", value: "fufaji" },
              { label: "Funds for Family", value: "funds-for-family" },
              { label: "Company / Partnership", value: "partnership" },
              { label: "General enquiry", value: "general" },
            ]}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
