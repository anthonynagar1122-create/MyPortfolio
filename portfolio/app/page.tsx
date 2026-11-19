import Link from "next/link";
import { Navigation, Hero, ProductCard, FeatureGrid, CTASection, EnquiryForm } from "@/components/core";
import { Footer } from "@/components/layout/Footer";
import { products } from "@/config/products";

export const metadata = {
  title: "Welcome to Our Portfolio",
  description: "Discover innovative products solving real-world challenges.",
};

export default function Home() {
  const productList = Object.values(products);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <Hero
        headline="Building Technology That Moves Businesses Forward"
        subheadline="Welcome"
        description="Three independent products, one unified mission. We're solving real-world challenges in innovative ways."
        primaryCTA={{ label: "Explore Products", href: "/products" }}
        secondaryCTA={{ label: "Learn More", href: "#about" }}
        variant="dark"
      />

      {/* Product Ecosystem */}
      <section id="products" className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              Our Ecosystem
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-6">
              Three Products, One Vision
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Each product is independently designed and operated, yet part of one unified technology company.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {productList.map((product) => (
              <ProductCard
                key={product.id}
                title={product.name}
                category={product.category}
                description={product.description}
                accentColor={product.accentColor}
                href={product.landingPage}
                icon={product.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Company Vision */}
      <section id="about" className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
                  <div className="w-2 h-2 bg-primary-500 rounded-full" />
                  Our Philosophy
                </span>
                <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
                  Technology Should Solve Real Problems
                </h2>
              </div>

              <div className="space-y-6 text-lg text-neutral-700 leading-relaxed">
                <p>
                  We believe the most valuable technology is not the most complex—it's the one that solves genuine problems for real people. Every product we build starts with a deep understanding of user needs.
                </p>
                <p>
                  Our mission is to create intelligent digital products that make life easier, businesses more efficient, and communities more connected. We focus on outcomes, not features.
                </p>
              </div>

              <Link href="/about" className="inline-flex btn btn-primary text-sm">
                Learn More About Us
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="hidden lg:block bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-6xl">🚀</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Capabilities */}
      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              What We Do
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-6">
              Built for Excellence
            </h2>
          </div>

          <FeatureGrid
            columns={3}
            features={[
              {
                icon: "⚡",
                title: "Intelligent Design",
                description: "Every pixel serves a purpose. User-centric design that solves real problems.",
              },
              {
                icon: "🏗️",
                title: "Modern Architecture",
                description: "Built on cutting-edge technology stack for reliability and performance.",
              },
              {
                icon: "📊",
                title: "Data-Driven",
                description: "Decisions backed by data and insights. Measure what matters.",
              },
              {
                icon: "🔒",
                title: "Security First",
                description: "Your data is precious. We protect it with industry-leading security.",
              },
              {
                icon: "🌍",
                title: "Global Ready",
                description: "Designed to scale globally. Ready for the world.",
              },
              {
                icon: "💚",
                title: "Sustainable",
                description: "Building technology that lasts. Responsible innovation.",
              },
            ]}
          />
        </div>
      </section>

      {/* Team Highlight */}
      <section className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              People
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-6">
              Built by Passionate Innovators
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              A team dedicated to solving real problems and building products people love.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-4xl">👤</span>
                </div>
                <h3 className="text-xl font-display font-700 text-neutral-900 mb-2">Team Member {i}</h3>
                <p className="text-neutral-600 mb-4">Role and responsibility</p>
                <a href="#" className="text-primary-600 hover:text-primary-700 font-600 text-sm">
                  LinkedIn →
                </a>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/team" className="inline-flex btn btn-primary text-sm">
              See Full Team
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        headline="Ready to Discover Our Products?"
        description="Explore our ecosystem and see how we're solving real-world challenges."
        primaryButtonText="Explore Now"
        primaryButtonHref="/products"
        secondaryButtonText="Contact Us"
        secondaryButtonHref="/contact"
        variant="dark"
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
