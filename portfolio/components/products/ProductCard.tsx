import Link from "next/link";

interface ProductCardProps {
  title: string;
  category: string;
  description: string;
  accentColor: "cyan" | "emerald" | "violet";
  href: string;
  icon?: React.ReactNode;
}

const accentColors = {
  cyan: {
    bg: "from-accent-cyan/10 to-transparent",
    border: "border-accent-cyan/20",
    accent: "text-accent-cyan",
    link: "text-accent-cyan hover:text-accent-cyan",
  },
  emerald: {
    bg: "from-accent-emerald/10 to-transparent",
    border: "border-accent-emerald/20",
    accent: "text-accent-emerald",
    link: "text-accent-emerald hover:text-accent-emerald",
  },
  violet: {
    bg: "from-accent-violet/10 to-transparent",
    border: "border-accent-violet/20",
    accent: "text-accent-violet",
    link: "text-accent-violet hover:text-accent-violet",
  },
};

export function ProductCard({
  title,
  category,
  description,
  accentColor,
  href,
  icon,
}: ProductCardProps) {
  const colors = accentColors[accentColor];

  return (
    <div
      className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-8 h-full flex flex-col hover:shadow-lg transition-shadow duration-300`}
    >
      {/* Icon/Visual */}
      {icon && (
        <div className={`w-12 h-12 ${colors.accent} mb-6 flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      )}

      {/* Category */}
      <span className={`text-sm font-semibold uppercase tracking-widest ${colors.accent} mb-3`}>
        {category}
      </span>

      {/* Title */}
      <h3 className="text-2xl font-semibold text-neutral-900 mb-3">{title}</h3>

      {/* Description */}
      <p className="text-neutral-600 mb-6 flex-grow">{description}</p>

      {/* CTA Link */}
      <Link
        href={href}
        className={`inline-flex items-center gap-2 font-medium ${colors.link} transition-colors duration-200`}
      >
        Explore {title.split(" ")[0]}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </Link>
    </div>
  );
}
