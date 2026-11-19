import Link from "next/link";

interface CTASectionProps {
  headline: string;
  description?: string;
  primaryButtonText: string;
  primaryButtonHref: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  variant?: "dark" | "light";
}

export function CTASection({
  headline,
  description,
  primaryButtonText,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonHref,
  variant = "dark",
}: CTASectionProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={`py-24 md:py-32 ${
        isDark
          ? "bg-gradient-to-r from-neutral-900 to-neutral-800"
          : "bg-neutral-50"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-4">
          <h2
            className={`text-4xl md:text-5xl font-display font-700 leading-tight ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            {headline}
          </h2>
          {description && (
            <p
              className={`text-lg leading-relaxed ${
                isDark ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              {description}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={primaryButtonHref}
            className="px-8 py-4 bg-primary-500 text-white rounded-lg font-600 hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {primaryButtonText}
          </Link>
          {secondaryButtonText && secondaryButtonHref && (
            <Link
              href={secondaryButtonHref}
              className={`px-8 py-4 rounded-lg font-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isDark
                  ? "bg-white text-neutral-900 hover:bg-neutral-100"
                  : "bg-neutral-200 text-neutral-900 hover:bg-neutral-300"
              }`}
            >
              {secondaryButtonText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
