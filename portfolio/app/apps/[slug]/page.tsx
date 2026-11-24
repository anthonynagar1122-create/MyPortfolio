import Link from "next/link";
import { notFound } from "next/navigation";
import { Navigation, CTASection } from "@/components/core";
import { Footer } from "@/components/layout/Footer";
import { products, type Product } from "@/config/products";

const productBySlug = Object.values(products).reduce<Record<string, Product>>((index, product) => {
  index[product.slug] = product;
  return index;
}, {});

export function generateStaticParams() {
  return Object.values(products).map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug[slug];
  if (!product) return { title: "Product not found" };
  return { title: product.seoTitle, description: product.seoDescription, keywords: product.seoKeywords };
}

export default async function AppProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug[slug];
  if (!product) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />
      <main>
        <section className="bg-neutral-950 py-24 text-white md:py-36">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link href="/products" className="text-sm text-blue-200 hover:text-white">← All products</Link>
            <div className="mt-12 max-w-4xl">
              <span className="text-5xl" aria-hidden="true">{product.icon}</span>
              <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">{product.category}</p>
              <h1 className="mt-4 font-display text-5xl font-bold tracking-tight md:text-7xl">{product.name}</h1>
              <p className="mt-5 text-xl text-blue-200">{product.tagline}</p>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-neutral-300">{product.description}</p>
              <div className="mt-10 flex flex-wrap gap-4">
                {product.applicationUrl ? (
                  <a className="btn btn-primary" href={product.applicationUrl}>Open application</a>
                ) : (
                  <Link className="btn btn-primary" href="/contact">Request product information</Link>
                )}
                <Link className="btn border border-white/25 text-white hover:bg-white/10" href="/contact">Discuss a partnership</Link>
              </div>
            </div>
          </div>
        </section>
        <section className="py-24 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">What it is designed for</p>
              <h2 className="mt-4 font-display text-4xl font-bold text-neutral-950">Purpose-built capabilities</h2>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {product.features.map((feature, index) => (
                <div key={feature} className="rounded-2xl border border-neutral-200 p-7">
                  <span className="font-mono text-sm text-primary-600">0{index + 1}</span>
                  <h3 className="mt-4 text-xl font-semibold text-neutral-950">{feature}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-neutral-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl font-bold text-neutral-950">Who it serves</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {product.targetAudience.map((audience) => (
                <span key={audience} className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700">{audience}</span>
              ))}
            </div>
            <h3 className="mt-14 text-xl font-semibold text-neutral-950">Example use cases</h3>
            <ul className="mt-5 grid gap-4 md:grid-cols-3">
              {product.useCases.map((useCase) => (
                <li key={useCase} className="rounded-xl bg-white p-5 leading-7 text-neutral-700">{useCase}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-neutral-500">Each product operates with independent infrastructure and release cycles within the RouteMaster portfolio.</p>
          </div>
        </section>
        <CTASection
          headline={`Let's talk about ${product.name}`}
          description="Ask a question, discuss a use case or explore a partnership."
          primaryButtonText="Contact RouteMaster"
          primaryButtonHref="/contact"
          secondaryButtonText="Explore other products"
          secondaryButtonHref="/products"
          variant="dark"
        />
      </main>
      <Footer />
    </div>
  );
}
