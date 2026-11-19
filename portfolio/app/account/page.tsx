"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Navigation } from "@/components/core";
import { Footer } from "@/components/layout/Footer";

export default function AccountPage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {!isSignedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-8"
            >
              <div>
                <h1 className="text-5xl font-bold text-neutral-900 mb-4">
                  Your Ecosystem Account
                </h1>
                <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
                  One account. Access to all RouteMaster products. Secure, private, and always in your control.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Create Account
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-neutral-300 text-neutral-900 font-semibold rounded-lg hover:border-neutral-400 transition"
                >
                  Sign In
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="pt-16 grid md:grid-cols-3 gap-8"
              >
                {[
                  {
                    icon: "🔐",
                    title: "Secure",
                    description: "Modern authentication with passkeys and two-factor authentication",
                  },
                  {
                    icon: "🛡️",
                    title: "Private",
                    description: "Your data belongs to you. We never sell personal information.",
                  },
                  {
                    icon: "⚡",
                    title: "Connected",
                    description: "One account works across all RouteMaster products seamlessly",
                  },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1, duration: 0.6 }}
                    className="bg-neutral-50 rounded-lg p-6 text-center"
                  >
                    <div className="text-5xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="pt-16 bg-blue-50 rounded-2xl p-8 text-left">
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  What You Get
                </h2>
                <ul className="space-y-4 text-neutral-700">
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>Access to RouteMaster, Fufaji's, Funds-for-Family</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>Device and session management from one place</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>Control what data each product can access</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>Export or delete your data anytime</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                    <span>Security alerts and login activity history</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-8"
            >
              <h1 className="text-4xl font-bold text-neutral-900">
                Account Dashboard
              </h1>
              <p className="text-neutral-600">
                Detailed account management coming soon.
              </p>
              <div className="bg-neutral-50 rounded-lg p-8">
                <p className="text-neutral-700 mb-6">
                  You're signed in and ready to explore our ecosystem.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Explore Products
                  <span>→</span>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
