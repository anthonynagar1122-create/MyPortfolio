import { Navigation, Hero, ProductCard, CTASection, EnquiryForm } from "@/components/core";
import { Footer } from "@/components/layout/Footer";
import { products } from "@/config/products";

export const metadata = {
  title: "Our Products",
  description: "Explore our complete product ecosystem.",
};

const productList = Object.values(products);

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      <Hero
        headline="Discover Our Product Ecosystem"
        subheadline="Products"
        description="Three independent products built to solve real-world challenges. Find the solution that fits your needs."
        primaryCTA={{ label: "Get Started", href: "/contact" }}
        variant="dark"
      />

      {/* Product Grid */}
      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              Solutions
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900 mb-6">
              Choose Your Path
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Each product is independently designed to serve different needs. Explore them all.
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

      {/* Comparison */}
      <section className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
              All at a Glance
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-4 px-6 font-display font-700 text-neutral-900">Feature</th>
                  {productList.map((product) => (
                    <th
                      key={product.id}
                      className="text-left py-4 px-6 font-display font-700 text-neutral-900"
                    >
                      {product.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["Feature 1", "Feature 2", "Feature 3", "Support", "Demo Available"].map((feature) => (
                  <tr key={feature} className="border-b border-neutral-200 hover:bg-white">
                    <td className="py-4 px-6 text-neutral-900 font-600">{feature}</td>
                    {productList.map((product) => (
                      <td key={product.id} className="py-4 px-6 text-center">
                        <span className="text-2xl">✓</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        headline="Not Sure Which Product?"
        description="Let us help you find the right fit."
        primaryButtonText="Schedule Consultation"
        primaryButtonHref="/contact"
        secondaryButtonText="Contact Sales"
        secondaryButtonHref="/contact"
        variant="dark"
      />

      <EnquiryForm />
      <Footer />
    </div>
  );
}
