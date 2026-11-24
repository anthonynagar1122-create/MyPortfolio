import Link from "next/link";

export function Footer() {
  // Use a fixed year to avoid prerendering issues
  const currentYear = 2026;

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 md:py-24 grid md:grid-cols-4 gap-12 mb-12 border-b border-neutral-800">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold font-display text-lg">RM</span>
              </div>
              <span className="font-display font-700">RouteMaster</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Building intelligent digital products that solve real-world challenges in mobility,
              local commerce, and community finance.
            </p>
          </div>

          {/* Column 2: Products */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Products</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/apps/routemaster"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  RouteMaster
                </Link>
              </li>
              <li>
                <Link
                  href="/apps/fufaji"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  Fufaji's
                </Link>
              </li>
              <li>
                <Link
                  href="/apps/funds-for-family"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  Funds-for-Family
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="/technology"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Connect</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/contact"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@routemaster.online"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  Email Us
                </a>
              </li>
              <li>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 hover:text-primary-400 transition-colors"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-400">
          <div>
            <p>&copy; {currentYear} RouteMaster. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
