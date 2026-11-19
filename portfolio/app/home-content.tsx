import Link from "next/link";
import { Navigation } from "@/components/core";
import { Footer } from "@/components/layout/Footer";
import { products } from "@/config/products";
import { principles } from "@/config/principles";

export default function HomeContent() {
  const productList = Object.values(products);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-24 md:py-32 lg:py-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            One Ecosystem. Many Solutions.
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-blue-400">
            A Shared Purpose.
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
            A technology company building useful, secure and accessible experiences that solve real-world problems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Explore Products
            </Link>
            <Link
              href="#principles"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-slate-900 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              Three Products, One Vision
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Each product is independently designed and operated, yet part of one unified technology company.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {productList.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-8 hover:shadow-lg hover:border-gray-300 transition"
              >
                <div className="text-5xl mb-4">{product.icon}</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-blue-600 font-medium mb-4">
                  {product.tagline}
                </p>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
                <ul className="space-y-2 mb-6 text-sm text-neutral-700">
                  {product.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={product.landingPage}
                  className="inline-block text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Learn More →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section id="principles" className="py-24 md:py-32 lg:py-48 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
              How We Build
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Three principles guide every decision we make.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {principles.map((principle) => (
              <div
                key={principle.id}
                className="bg-white rounded-lg p-8 border border-gray-200 hover:border-gray-300 transition"
              >
                <div className="text-5xl mb-4">{principle.icon}</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                  {principle.name}
                </h3>
                <p className="text-sm font-medium text-blue-600 mb-4">
                  {principle.tagline}
                </p>
                <p className="text-neutral-700 mb-6 leading-relaxed">
                  {principle.description}
                </p>
                <ul className="space-y-2 text-sm text-neutral-700">
                  {principle.commitments.slice(0, 3).map((commitment, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-600 font-bold">✓</span>
                      <span>{commitment}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900">
              Technology Should Solve Real Problems
            </h2>

            <div className="space-y-6 text-lg text-neutral-700 leading-relaxed">
              <p>
                We believe the most valuable technology is not the most complex—it's the one that solves genuine problems for real people. Every product we build starts with a deep understanding of user needs.
              </p>
              <p>
                Our mission is to create intelligent digital products that make life easier, businesses more efficient, and communities more connected. We focus on outcomes, not features.
              </p>
              <p>
                Each product in our ecosystem operates independently, with its own team, database, and business logic. Yet they share a unified identity, common security standards, and a commitment to solving real-world challenges with integrity.
              </p>
            </div>

            <div className="pt-8">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Learn More About Us
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Active Users", value: "50,000+" },
              { label: "Products", value: "3" },
              { label: "Countries", value: "15+" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <p className="text-neutral-600 text-lg">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 lg:py-48 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Explore Our Ecosystem?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Discover RouteMaster, Fufaji's, and Funds-for-Family. See how we're solving real-world challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Explore Products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-slate-900 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
