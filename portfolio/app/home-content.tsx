"use client";

import Link from "next/link";
import { Navigation, ProductCard, CTASection } from "@/components/core";
import { Footer } from "@/components/layout/Footer";
import { products } from "@/config/products";

export default function HomeContent() {
  const productList = Object.values(products);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navigation />
      <main>
        <section className="relative overflow-hidden bg-neutral-950 py-28 text-white md:py-40">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(53,99,246,0.34),_transparent_55%)]" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
                RouteMaster Intelligent Systems
              </span>
              <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
                Independent products.
                <span className="block text-blue-300">One technology vision.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-300 md:text-xl">
                We build practical digital products for mobility, local commerce and family finance.
                Each product has its own infrastructure, roadmap and experience.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/products" className="btn btn-primary inline-flex items-center text-sm">
                  Explore our products <span className="ml-2" aria-hidden="true">→</span>
                </Link>
                <Link href="/about" className="btn inline-flex items-center border border-white/25 text-white hover:bg-white/10">
                  About the company
                </Link>
              </div>
            </div>
            <div className="mt-20 grid gap-4 border-t border-white/15 pt-8 sm:grid-cols-3">
              {[
                ["01", "Mobility", "Journey planning and connected transport"],
                ["02", "Commerce", "Trust-led tools for local retail"],
                ["03", "Family finance", "Clearer records and shared decisions"],
              ].map(([number, title, detail]) => (
                <div key={number} className="flex gap-4">
                  <span className="font-mono text-sm text-blue-300">{number}</span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-neutral-400">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="products" className="py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Our portfolio</p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
                Three products, built around real needs.
              </h2>
              <p className="mt-5 text-lg leading-8 text-neutral-600">
                Explore what each product is designed to do. Product launches and application access
                will be announced separately as they become available.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
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

        <section className="bg-neutral-50 py-24 md:py-32">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">How we build</p>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-neutral-950 md:text-5xl">
                Shared standards. Independent systems.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-neutral-600">
              <p>
                A common company identity does not mean every product shares the same database,
                authentication system or payment infrastructure.
              </p>
              <p>
                We keep product systems isolated and evolve them independently, while applying
                consistent standards for reliability, security and user experience.
              </p>
              <Link href="/technology" className="inline-flex font-semibold text-primary-700 hover:text-primary-900">
                Explore our technology approach <span className="ml-2" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <CTASection
          headline="Have a problem worth solving?"
          description="Talk to us about product, technology or partnership opportunities."
          primaryButtonText="Start a conversation"
          primaryButtonHref="/contact"
          secondaryButtonText="Meet the team"
          secondaryButtonHref="/team"
          variant="dark"
        />
      </main>
      <Footer />
    </div>
  );
}
