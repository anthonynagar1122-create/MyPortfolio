"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-sm border-b border-neutral-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold font-display text-lg">RM</span>
            </div>
            <span className="font-display font-700 text-lg hidden sm:inline">
              RouteMaster
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-neutral-700 hover:text-primary-500 transition-colors font-medium">
              Home
            </Link>
            <Link href="#products" className="text-neutral-700 hover:text-primary-500 transition-colors font-medium">
              Products
            </Link>
            <Link href="/about" className="text-neutral-700 hover:text-primary-500 transition-colors font-medium">
              About
            </Link>
            <Link href="/team" className="text-neutral-700 hover:text-primary-500 transition-colors font-medium">
              Team
            </Link>
            <Link href="/technology" className="text-neutral-700 hover:text-primary-500 transition-colors font-medium">
              Technology
            </Link>
          </div>

          {/* Right side buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/contact" className="text-neutral-700 hover:text-primary-500 transition-colors font-medium">
              Contact Us
            </Link>
            <Link href="#products" className="btn btn-primary text-sm">
              Explore Products
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-3 border-t border-neutral-200">
            <Link href="/" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg">
              Home
            </Link>
            <Link href="#products" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg">
              Products
            </Link>
            <Link href="/about" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg">
              About
            </Link>
            <Link href="/team" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg">
              Team
            </Link>
            <Link href="/technology" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg">
              Technology
            </Link>
            <Link href="/contact" className="block px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg">
              Contact Us
            </Link>
            <Link href="#products" className="block w-full btn btn-primary text-sm mt-2">
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
