import { Navigation } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Terms of Use",
  description: "Terms for using the RouteMaster Intelligent System Pvt. Ltd. corporate website.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-neutral-950">Terms of Use</h1>
        <p className="mt-4 text-sm text-neutral-500">Last updated: 24 November 2026</p>
        <div className="mt-10 space-y-8 leading-8 text-neutral-700">
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">1. Website purpose</h2>
            <p className="mt-3">
              This website introduces RouteMaster Intelligent System Pvt. Ltd. and provides general
              information about its products, technology and partnership opportunities. Product
              descriptions are informational and do not by themselves create an offer, service
              commitment or customer agreement.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">2. Product availability</h2>
            <p className="mt-3">
              Product features, availability, pricing, demonstrations and launch plans may change.
              Access to a separate product is governed by the terms presented within that product
              when it becomes available.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">3. Acceptable use</h2>
            <p className="mt-3">
              You must not use this website for unlawful activity, attempt to disrupt its operation,
              probe systems without permission, submit malicious content or interfere with another
              visitor&apos;s use of the website.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">4. Intellectual property</h2>
            <p className="mt-3">
              Website text, design, branding and other materials are owned by RouteMaster
              Intelligent System Pvt. Ltd. or used with permission, unless stated otherwise.
              You may not reproduce or commercially exploit them without prior permission, except
              where applicable law allows.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">5. Third-party services</h2>
            <p className="mt-3">
              Links to third-party websites are provided for convenience. We do not control those
              websites and their own terms and privacy notices apply.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">6. Disclaimers</h2>
            <p className="mt-3">
              This website is provided on an informational basis. To the extent permitted by law,
              we do not guarantee that every page will always be available, error-free or suitable
              for a particular purpose.
            </p>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-neutral-950">7. Contact</h2>
            <p className="mt-3">
              Questions about these terms can be sent to <a className="font-semibold text-primary-700" href="mailto:hello@routemaster.online">hello@routemaster.online</a>.
            </p>
          </section>
          <p className="text-sm text-neutral-500">
            These general website terms do not replace a separate written agreement or product-specific terms.
            Have the final legal terms reviewed for the company&apos;s applicable jurisdiction before production use.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
