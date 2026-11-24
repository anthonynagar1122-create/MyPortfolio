import Link from "next/link";
import { Navigation } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

/**
 * Accessible, lightweight fallback for the earlier experimental 3D HQ route.
 * The public product navigation is now the canonical portfolio experience.
 */
export function ExperienceCanvas({ initialWorld }: { initialWorld: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-white">
      <Navigation />
      <main className="flex flex-1 items-center">
        <section className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            {initialWorld} · RouteMaster Intelligent Systems
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-5xl font-bold tracking-tight md:text-7xl">
            Explore the product ecosystem.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-300">
            Discover independent digital products for mobility, local commerce and family finance.
          </p>
          <Link href="/products" className="btn btn-primary mt-10">
            Explore products <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
