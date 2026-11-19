import Link from "next/link";
import { Navbar } from "@/components/navigation/Navbar";
import { Hero } from "@/components/hero/Hero";
import { ProductCard } from "@/components/products/ProductCard";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Section 1: Hero */}
      <Hero />

      {/* Section 2: Product Ecosystem */}
      <section id="products" className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              Our Products
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-6">
              Building Tomorrow Today
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Three independent products, one unified mission. We&apos;re solving real-world
              challenges in mobility, local commerce, and community finance.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <ProductCard
              title="RouteMaster"
              category="Intelligent Mobility"
              description="Making complex journeys simpler through intelligent transport planning and connected mobility solutions."
              accentColor="cyan"
              href="/products/routemaster"
              icon="🚆"
            />
            <ProductCard
              title="Fufaji's"
              category="Local Commerce"
              description="Empowering local shops and communities with digital commerce and smarter business operations."
              accentColor="emerald"
              href="/products/fufaji"
              icon="🏪"
            />
            <ProductCard
              title="Funds-for-Family"
              category="Community Finance"
              description="Helping families and trusted communities organize financial support with transparent digital records."
              accentColor="violet"
              href="/products/funds-for-family"
              icon="👨‍👩‍👧‍👦"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Our Vision */}
      <section id="vision" className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
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
                  We believe the most valuable technology is not the most complex—it&apos;s the
                  one that solves genuine problems for real people. Every product we build starts
                  with a deep understanding of user needs.
                </p>
                <p>
                  Our mission is to create intelligent digital products that make life easier,
                  businesses more efficient, and communities more connected. We focus on outcomes,
                  not features.
                </p>
              </div>

              <Link href="/about" className="inline-flex btn btn-primary text-sm">
                Learn More About Us
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            {/* Right: Visual placeholder */}
            <div className="relative h-96 bg-gradient-to-br from-primary-100 to-neutral-100 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🚀</div>
                <p className="text-neutral-600 font-medium">Vision: A world where technology empowers everyone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Innovation & Technology */}
      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              Technical Excellence
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
              Built on Solid Foundations
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Intelligent Algorithms",
                description: "Machine learning and optimization at the core",
                icon: "⚙️",
              },
              {
                title: "Modern Architecture",
                description: "Cloud-native, scalable, secure infrastructure",
                icon: "🏗️",
              },
              {
                title: "Data-Driven Design",
                description: "Every decision backed by user research and analytics",
                icon: "📊",
              },
              {
                title: "Security First",
                description: "Enterprise-grade security from day one",
                icon: "🔒",
              },
            ].map((item, idx) => (
              <div key={idx} className="space-y-4">
                <div className="text-4xl">{item.icon}</div>
                <h4 className="text-xl font-semibold text-neutral-900">{item.title}</h4>
                <p className="text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Founder Introduction */}
      <section className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Image placeholder */}
            <div className="relative h-96 md:h-full min-h-96 bg-gradient-to-br from-primary-200 to-primary-100 rounded-2xl flex items-center justify-center order-2 lg:order-1">
              <div className="text-center space-y-4">
                <div className="text-7xl">👤</div>
                <p className="text-neutral-700 font-medium">Founder Photo</p>
              </div>
            </div>

            {/* Right: Content */}
            <div className="space-y-8 order-1 lg:order-2">
              <div>
                <span className="text-sm font-semibold uppercase tracking-widest text-primary-500 mb-2 block">
                  Founder & Visionary
                </span>
                <h2 className="text-4xl font-display font-700 text-neutral-900">
                  Building for Real Impact
                </h2>
              </div>

              <div className="space-y-6 text-lg text-neutral-700 leading-relaxed">
                <p>
                  [Founder bio placeholder - describes the vision, background, and what drives the
                  mission to build products that matter.]
                </p>
                <p>
                  [Additional context about the journey, lessons learned, and what&apos;s next for
                  the RouteMaster ecosystem.]
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Team */}
      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              Our Team
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
              Built by Talented People
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto mt-6">
              We&apos;re a diverse team of engineers, designers, and product thinkers passionate
              about solving real problems.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="text-center">
                <div className="w-24 h-24 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                  👤
                </div>
                <h4 className="text-lg font-semibold text-neutral-900">Team Member {item}</h4>
                <p className="text-sm text-neutral-600 mt-2">Role & Title</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/team" className="inline-flex btn btn-secondary">
              View Full Team
            </Link>
          </div>
        </div>
      </section>

      {/* Section 7: Final CTA */}
      <section className="py-24 md:py-32 lg:py-48 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-700 mb-6">
            Let&apos;s Build Something Meaningful Together
          </h2>
          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-12">
            Whether you&apos;re a customer, partner, investor, or talented team member,
            we&apos;d love to hear from you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn bg-primary-500 text-white hover:bg-primary-600">
              Contact Us
            </Link>
            <Link href="#products" className="btn btn-secondary border-white text-white hover:bg-white/10">
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
