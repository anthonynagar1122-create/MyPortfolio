import { Navigation, Hero, FeatureGrid, FAQSection, EnquiryForm, CTASection } from "@/components/core";
import { Footer } from "@/components/layout/Footer";
import { products, getProduct, getProductCtaLabel, getProductCtaHref } from "@/config/products";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return Object.keys(products).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps) {
  const product = getProduct(params.id as keyof typeof products);
  if (!product) return { title: "Not Found" };

  return {
    title: product.seoTitle,
    description: product.seoDescription,
    keywords: product.seoKeywords,
  };
}

export default function ProductPage({ params }: PageProps) {
  const product = getProduct(params.id as keyof typeof products);
  if (!product) return notFound();

  const ctaLabel = getProductCtaLabel(product);
  const ctaHref = getProductCtaHref(product);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navigation />

      {/* Product Hero */}
      <Hero
        headline={product.name}
        subheadline={product.category}
        description={product.description}
        primaryCTA={{ label: ctaLabel, href: ctaHref }}
        secondaryCTA={{ label: "Contact Sales", href: "/contact" }}
        variant="dark"
      />

      {/* Problem Section */}
      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                The Challenge
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
                Built for Real Problems
              </h2>
              <p className="text-lg text-neutral-600 leading-relaxed">
                {product.description}
              </p>
              <ul className="space-y-3">
                {product.targetAudience.map((audience, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-primary-500 font-bold mt-1">✓</span>
                    <span className="text-neutral-700">{audience}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden lg:block bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl h-96 flex items-center justify-center">
              <div className="text-8xl">{product.icon}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
              What You Get
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {product.features.map((feature, idx) => (
              <div key={idx} className="p-8 bg-white rounded-lg border border-neutral-200 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">
                  {["⚡", "🎯", "📊", "🔒", "🚀", "💡"][idx % 6]}
                </div>
                <h3 className="text-xl font-display font-700 text-neutral-900 mb-2">
                  {feature}
                </h3>
                <p className="text-neutral-600">
                  Feature description and benefits for your use case.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 md:py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary-500 mb-4">
              <div className="w-2 h-2 bg-primary-500 rounded-full" />
              Use Cases
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-700 text-neutral-900">
              See It in Action
            </h2>
          </div>

          <div className="space-y-16">
            {product.useCases.map((useCase, idx) => (
              <div key={idx} className={`grid lg:grid-cols-2 gap-12 items-center ${idx % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}>
                <div className={`${idx % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <h3 className="text-3xl font-display font-700 text-neutral-900 mb-4">
                    {useCase}
                  </h3>
                  <p className="text-lg text-neutral-600 leading-relaxed mb-6">
                    See how our product solves this specific challenge and delivers real value.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-primary-500 font-bold">→</span>
                      <span className="text-neutral-700">Key benefit or outcome</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-primary-500 font-bold">→</span>
                      <span className="text-neutral-700">Measurable improvement</span>
                    </li>
                  </ul>
                </div>
                <div className={`bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl h-64 flex items-center justify-center ${idx % 2 === 1 ? "lg:col-start-1" : ""}`}>
                  <div className="text-6xl">📱</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-32 lg:py-48 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection
            title={`${product.name} FAQ`}
            description="Common questions about this product."
            items={[
              {
                question: "How do I get started?",
                answer: "Getting started is easy. Sign up for an account, follow our onboarding guide, and you'll be up and running in minutes.",
              },
              {
                question: "What support is available?",
                answer: "We offer 24/7 customer support via email, chat, and phone. Our team is here to help you succeed.",
              },
              {
                question: "What's the pricing model?",
                answer: "We offer flexible pricing plans to suit different needs. Contact our sales team for a custom quote.",
              },
              {
                question: "Is there a free trial?",
                answer: "Yes! Start with our free trial to explore all features and see if it's right for you.",
              },
              {
                question: "Can I migrate from my current solution?",
                answer: "Absolutely. Our team will help you migrate smoothly with zero data loss.",
              },
              {
                question: "What about security and compliance?",
                answer: "Security is our top priority. We comply with all major standards including GDPR, SOC 2, and ISO 27001.",
              },
            ]}
          />
        </div>
      </section>

      {/* CTA */}
      <CTASection
        headline={`Ready to Explore ${product.name}?`}
        description="Take the next step and discover how this product can help you."
        primaryButtonText={ctaLabel}
        primaryButtonHref={ctaHref}
        secondaryButtonText="Schedule Demo"
        secondaryButtonHref="/contact"
        variant="dark"
      />

      {/* Enquiry Form */}
      <EnquiryForm
        productOptions={[
          { label: "Select interest", value: "" },
          { label: "Demo Request", value: "demo" },
          { label: "Pricing Information", value: "pricing" },
          { label: "Partnership", value: "partnership" },
        ]}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
