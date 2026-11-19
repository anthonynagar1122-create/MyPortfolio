import { Navigation, Hero, FeatureGrid, CTASection } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "About Us",
  description: "Learn about our company mission, vision, and values.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <Hero
        headline="Building Technology for Real People"
        subheadline="Our Story"
        description="We're a team of passionate innovators dedicated to solving real-world problems through thoughtful technology."
        primaryCTA={{ label: "Learn More", href: "#mission" }}
        variant="dark"
      />

      {/* Mission */}
      <section id="mission" className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
                  <div className="w-2 h-2 bg-primary-500 rounded-full" />
                  Our Mission
                </span>
                <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
                  Create Impact Through Technology
                </h2>
              </div>

              <p className="text-lg text-neutral-600 leading-relaxed">
                We believe technology should solve real problems, not create new ones. Our mission is to build products that make a meaningful difference in how people work, live, and connect.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-700 text-neutral-900 mb-2">Our Vision</h3>
                  <p className="text-neutral-600">
                    A world where intelligent technology serves real human needs, enabling people to focus on what matters most.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-display font-700 text-neutral-900 mb-2">Our Values</h3>
                  <ul className="space-y-2">
                    {["Integrity", "Innovation", "Impact", "Inclusivity"].map((value) => (
                      <li key={value} className="flex items-center gap-3 text-neutral-600">
                        <span className="w-2 h-2 bg-primary-500 rounded-full" />
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="hidden lg:block bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-8xl">🎯</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Highlights */}
      <section className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
              What Drives Us
            </h2>
          </div>

          <FeatureGrid
            columns={3}
            variant="light"
            features={[
              {
                icon: "💡",
                title: "Innovation",
                description: "Constantly pushing boundaries to find better solutions.",
              },
              {
                icon: "👥",
                title: "People First",
                description: "Every decision starts with understanding user needs.",
              },
              {
                icon: "🎯",
                title: "Impact Focused",
                description: "We measure success by the impact we create.",
              },
              {
                icon: "🚀",
                title: "Fast Execution",
                description: "Moving quickly while maintaining quality and integrity.",
              },
              {
                icon: "🌍",
                title: "Global Mindset",
                description: "Building products for people around the world.",
              },
              {
                icon: "📈",
                title: "Growth Mindset",
                description: "Continuous learning and improvement in everything we do.",
              },
            ]}
          />
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
              Our Journey
            </h2>
          </div>

          <div className="space-y-8">
            {[
              { year: "2024", event: "Founded with a mission to solve real problems" },
              { year: "2024", event: "Launched first product to beta users" },
              { year: "2024", event: "Expanded team and product lineup" },
              { year: "2024", event: "Reached thousands of users globally" },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-8 items-start">
                <div className="w-32 flex-shrink-0">
                  <span className="text-2xl font-display font-700 text-primary-500">{item.year}</span>
                </div>
                <div className="flex-1 pb-8 border-l border-neutral-200 pl-8">
                  <p className="text-lg text-neutral-900">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        headline="Join Our Mission"
        description="Help us build technology that makes a real difference."
        primaryButtonText="Explore Careers"
        primaryButtonHref="/careers"
        secondaryButtonText="Contact Us"
        secondaryButtonHref="/contact"
        variant="dark"
      />

      <Footer />
    </div>
  );
}
