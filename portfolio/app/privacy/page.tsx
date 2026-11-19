import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy",
  description: "RouteMaster privacy policy",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow pt-32">
        <section className="py-24 md:py-32 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-invert">
          <h1 className="text-4xl font-display font-700 text-neutral-900 mb-8">Privacy Policy</h1>
          <p className="text-neutral-600 italic mb-6">Last updated: November 2026</p>

          <div className="space-y-8 text-neutral-700">
            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">1. Introduction</h2>
              <p>
                [Privacy policy content goes here. This is a placeholder that should be filled with actual legal content.]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">2. Information We Collect</h2>
              <p>
                [Details about what information is collected, how it's collected, and why.]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">3. How We Use Your Information</h2>
              <p>
                [Explanation of how collected data is used.]
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-4">4. Your Rights</h2>
              <p>
                [Information about user rights regarding their data.]
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
