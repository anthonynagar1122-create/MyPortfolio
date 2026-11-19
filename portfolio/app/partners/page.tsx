import { Navigation, Hero, CTASection } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Partners",
  description: "Partnership opportunities and collaborations.",
};

export default function PartnersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <Hero
        headline="Strategic Partnerships"
        subheadline="Partners"
        description="Building meaningful partnerships that drive mutual success and innovation."
        primaryCTA={{ label: "Get in Touch", href: "/contact" }}
        variant="dark"
      />

      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-6">
              Partnership Opportunities
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              We're open to collaborations that create value for all parties and serve our users better.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Technology Partners", description: "Integrate with our platform and reach more customers." },
              { title: "Channel Partners", description: "Resell our products and grow your business." },
              { title: "Strategic Alliances", description: "Joint ventures that create new market opportunities." },
              { title: "Ecosystem Partners", description: "Build complementary solutions on our platform." },
              { title: "Academic Partners", description: "Research collaborations and educational programs." },
              { title: "Community Partners", description: "Organizations working toward shared social impact." },
            ].map((partner, idx) => (
              <div key={idx} className="p-8 bg-neutral-50 rounded-lg hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-display font-700 text-neutral-900 mb-4">
                  {partner.title}
                </h3>
                <p className="text-neutral-600 mb-6">{partner.description}</p>
                <a href="/contact" className="text-primary-600 hover:text-primary-700 font-600">
                  Explore →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-700 text-neutral-900 mb-6">
            Why Partner With Us?
          </h2>
          <ul className="space-y-4 text-lg text-neutral-700 mb-12">
            <li className="flex items-start gap-4">
              <span className="text-primary-500 font-bold mt-1">✓</span>
              <span>Access to innovative technology and growing user base</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-primary-500 font-bold mt-1">✓</span>
              <span>Dedicated partnership support and resources</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-primary-500 font-bold mt-1">✓</span>
              <span>Co-marketing and revenue sharing opportunities</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-primary-500 font-bold mt-1">✓</span>
              <span>Collaborative approach to building great products</span>
            </li>
          </ul>
        </div>
      </section>

      <CTASection
        headline="Ready to Partner?"
        description="Let's discuss how we can work together to achieve great things."
        primaryButtonText="Contact Partnership Team"
        primaryButtonHref="/contact"
        variant="dark"
      />

      <Footer />
    </div>
  );
}
