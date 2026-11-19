import Link from "next/link";

interface HeroProps {
  headline: string;
  subheadline: string;
  description?: string;
  primaryCTA?: {
    label: string;
    href: string;
  };
  secondaryCTA?: {
    label: string;
    href: string;
  };
  visualElement?: React.ReactNode;
  variant?: "dark" | "light";
}

export function Hero({
  headline,
  subheadline,
  description,
  primaryCTA = { label: "Explore", href: "#" },
  secondaryCTA,
  visualElement,
  variant = "dark",
}: HeroProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={`min-h-screen flex items-center py-24 md:py-32 lg:py-48 ${
        isDark ? "bg-gradient-to-br from-neutral-900 to-neutral-800" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {visualElement ? (
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <span
                  className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest ${
                    isDark ? "text-primary-400" : "text-primary-600"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-current" />
                  {subheadline}
                </span>
                <h1
                  className={`text-5xl md:text-6xl font-display font-700 leading-tight ${
                    isDark ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {headline}
                </h1>
              </div>

              {description && (
                <p
                  className={`text-lg leading-relaxed max-w-lg ${
                    isDark ? "text-neutral-300" : "text-neutral-600"
                  }`}
                >
                  {description}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={primaryCTA.href}
                  className="px-8 py-4 bg-primary-500 text-white rounded-lg font-600 hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-center"
                >
                  {primaryCTA.label}
                </Link>
                {secondaryCTA && (
                  <Link
                    href={secondaryCTA.href}
                    className={`px-8 py-4 rounded-lg font-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-center ${
                      isDark
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
                    }`}
                  >
                    {secondaryCTA.label}
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:block">{visualElement}</div>
          </div>
        ) : (
          /* Centered variant */
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <span
                className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest ${
                  isDark ? "text-primary-400" : "text-primary-600"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-current" />
                {subheadline}
              </span>
              <h1
                className={`text-5xl md:text-6xl font-display font-700 leading-tight ${
                  isDark ? "text-white" : "text-neutral-900"
                }`}
              >
                {headline}
              </h1>
            </div>

            {description && (
              <p
                className={`text-lg leading-relaxed ${
                  isDark ? "text-neutral-300" : "text-neutral-600"
                }`}
              >
                {description}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={primaryCTA.href}
                className="px-8 py-4 bg-primary-500 text-white rounded-lg font-600 hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {primaryCTA.label}
              </Link>
              {secondaryCTA && (
                <Link
                  href={secondaryCTA.href}
                  className={`px-8 py-4 rounded-lg font-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    isDark
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
                  }`}
                >
                  {secondaryCTA.label}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
