import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Terms of Service",
  description: "RouteMaster terms of service",
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow pt-32">
        <section className="py-24 md:py-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-display font-700 text-neutral-900 mb-8">Terms of Service</h1>
          <p className="text-neutral-600 italic mb-6">Last updated: November 2026</p>

          <div className="space-y-8 text-neutral-700">
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Terms</h2>
              <p>
                [Terms of service content goes here. This is a placeholder that should be filled with actual legal content.]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Use License</h2>
              <p>
                [Information about permitted use of the services.]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. Disclaimer</h2>
              <p>
                [Disclaimer information.]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Limitations</h2>
              <p>
                [Limitations of liability.]
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
