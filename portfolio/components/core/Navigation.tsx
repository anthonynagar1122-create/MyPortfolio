"use client";

import Link from "next/link";
import { useState } from "react";
import { SignInButton, UserButton } from "@clerk/nextjs";

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
  { label: "Contact", href: "/contact" },
];

export function Navigation({
  productName = "Company",
  links = defaultLinks,
  ctaLabel = "Get Started",
  ctaHref = "/contact",
}: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 bg-white border-b border-neutral-200"
      style={{ height: "72px" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo / Brand */}
          <Link href="/" className="font-display font-700 text-2xl text-neutral-900">
            {productName}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-neutral-600 hover:text-neutral-900 transition-colors font-500 text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-4">
            <SignInButton mode="modal">
              <button className="text-neutral-600 hover:text-neutral-900 transition-colors font-500 text-sm">
                Sign In
              </button>
            </SignInButton>
            <UserButton />
            <Link
              href={ctaHref}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg font-600 text-sm hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {ctaLabel}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white border-b border-neutral-200 p-4">
            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-neutral-600 hover:text-neutral-900 transition-colors font-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <SignInButton mode="modal">
                <button className="w-full px-6 py-3 bg-neutral-100 text-neutral-900 rounded-lg font-600 text-center hover:bg-neutral-200 transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <Link
                href={ctaHref}
                className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg font-600 text-center hover:bg-primary-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
