import Link from "next/link";

interface HeroProps {
  headline?: string;
  subheadline?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
}

export function Hero({
  headline = "Building Technology That Moves Businesses and People Forward",
  subheadline,
  description = "We build intelligent digital products that solve real-world challenges in mobility, local commerce, and community finance.",
  primaryCTA = { text: "Explore Our Products", href: "#products" },
  secondaryCTA = { text: "Discover Our Vision", href: "#vision" },
}: HeroProps) {
  return (
    <section className="min-h-screen pt-32 pb-24 md:pb-32 lg:pb-48 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-cyan/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            {subheadline && (
              <div className="inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-cyan rounded-full" />
                <span className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
                  {subheadline}
                </span>
              </div>
            )}

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-700 text-white leading-tight">
                {headline}
              </h1>
              <p className="text-lg md:text-xl text-neutral-300 leading-relaxed max-w-lg">
                {description}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={primaryCTA.href} className="btn btn-primary">
                {primaryCTA.text}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
              <Link href={secondaryCTA.href} className="btn btn-secondary">
                {secondaryCTA.text}
              </Link>
            </div>
          </div>

          {/* Right: Visual (Placeholder) */}
          <div className="relative h-96 md:h-full min-h-96 hidden lg:flex items-center justify-center">
            <div className="relative w-full h-full max-w-md">
              {/* Three product symbols */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-accent-cyan to-accent-cyan/50 rounded-2xl opacity-80 blur-xl" />
              <div className="absolute top-20 right-0 w-32 h-32 bg-gradient-to-br from-accent-emerald to-accent-emerald/50 rounded-3xl opacity-70 blur-2xl" />
              <div className="absolute bottom-0 left-1/2 w-28 h-28 bg-gradient-to-br from-accent-violet to-accent-violet/50 rounded-2xl opacity-75 blur-xl" />

              {/* Foreground card */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 w-4/5">
                  <div className="text-center space-y-4">
                    <div className="text-5xl font-bold text-white">3</div>
                    <p className="text-white/80">Independent Products</p>
                    <p className="text-sm text-white/60">One unified ecosystem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
