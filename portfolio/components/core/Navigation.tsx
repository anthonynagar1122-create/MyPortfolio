"use client";

import Link from "next/link";
import { useState } from "react";

interface NavLink {
  label: string;
  href: string;
}

interface NavigationProps {
  productName?: string;
  links?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

const defaultLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "About", href: "/about" },
  { label: "Technology", href: "/technology" },
  { label: "Contact", href: "/contact" },
];

export function Navigation({
  productName = "RouteMaster",
  links = defaultLinks,
  ctaLabel = "Start a conversation",
  ctaHref = "/contact",
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 h-[72px] border-b border-neutral-200 bg-white">
      <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-neutral-950" aria-label="RouteMaster home">
            {productName}
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950">
                {link.label}
              </Link>
            ))}
          </div>

          <Link href={ctaHref} className="btn btn-primary hidden text-sm md:inline-flex">
            {ctaLabel}
          </Link>

          <button
            type="button"
            className="rounded-lg p-2 transition-colors hover:bg-neutral-100 md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div id="mobile-navigation" className="absolute left-0 right-0 top-[72px] border-b border-neutral-200 bg-white p-4 shadow-lg md:hidden">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-neutral-700 hover:text-neutral-950" onClick={() => setIsMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <Link href={ctaHref} className="btn btn-primary w-full text-sm" onClick={() => setIsMobileMenuOpen(false)}>
                {ctaLabel}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
