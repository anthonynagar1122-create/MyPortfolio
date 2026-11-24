import { Navigation, Hero, CTASection } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Founder",
  description: "Learn about our founder's vision.",
};

export default function FounderPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <Hero
        headline="Our Leadership"
        subheadline="Coming Soon"
        description="Detailed founder information will be shared soon. Contact us to learn more about our vision."
        primaryCTA={{ label: "Contact", href: "/contact" }}
        variant="dark"
      />

      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="hidden lg:block bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-8xl">👤</div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-2">
                  Leadership Information
                </h2>
                <p className="text-xl text-primary-600 font-600">Coming Soon</p>
              </div>

              <div className="space-y-6 text-lg text-neutral-600 leading-relaxed">
                <p>We are preparing a verified founder and leadership profile. Until it is published, contact our team for company and product enquiries.</p>
              </div>

              <div className="pt-6 space-y-4">
                <h3 className="text-xl font-display font-700 text-neutral-900">Get in Touch</h3>
                <div className="flex gap-4">
                  <a href="/contact" className="text-primary-600 hover:text-primary-700 font-600">
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTASection
        headline="Let's Build Something Great Together"
        description="Got an idea? Want to collaborate? Let's talk."
        primaryButtonText="Get in Touch"
        primaryButtonHref="/contact"
        variant="dark"
      />

      <Footer />
    </div>
  );
}
