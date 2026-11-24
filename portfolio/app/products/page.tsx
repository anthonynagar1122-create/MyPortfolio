import { Navigation, Hero, ProductCard, CTASection } from "@/components/core";
import { Footer } from "@/components/layout/Footer";
import { products } from "@/config/products";

export const metadata = {
  title: "Our Products",
  description: "Explore RouteMaster, Fufaji and Funds for Family: three independent products with separate infrastructure and roadmaps.",
};

const productList = Object.values(products);

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />
      <main>
        <Hero
          headline="Products built around real needs."
          subheadline="The RouteMaster portfolio"
          description="Explore three independent digital products. Each has its own purpose, infrastructure and release roadmap."
          primaryCTA={{ label: "Discuss an idea", href: "/contact" }}
          variant="dark"
        />

        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Our products</p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
                One company. Distinct product experiences.
              </h2>
              <p className="mt-5 text-lg leading-8 text-neutral-600">
                We share engineering standards while keeping product data, authentication, payments and releases isolated where each product requires it.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        <section className="bg-neutral-50 py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Independent by design</p>
              <h2 className="mt-4 font-display text-3xl font-bold text-neutral-950 md:text-4xl">
                Separate systems. Consistent standards.
              </h2>
            </div>
            <p className="text-lg leading-8 text-neutral-600">
              The corporate portfolio gives every product a shared discovery point without combining customer records, financial data or operational systems. Product infrastructure and release decisions remain independent.
            </p>
          </div>
        </section>

        <CTASection
          headline="Have a product or partnership question?"
          description="Tell us what you are working on and where RouteMaster can help."
          primaryButtonText="Contact our team"
          primaryButtonHref="/contact"
          secondaryButtonText="About RouteMaster"
          secondaryButtonHref="/about"
          variant="dark"
        />
      </main>
      <Footer />
    </div>
  );
}
