import Link from "next/link";
import { getColorClasses, type ColorKey } from "@/lib/colors";

type AccentColor = ColorKey;

interface ProductCardProps {
  title: string;
  category: string;
  description: string;
  accentColor: AccentColor;
  href: string;
  icon?: string;
}

export function ProductCard({
  title,
  category,
  description,
  accentColor,
  href,
  icon,
}: ProductCardProps) {
  const colors = getColorClasses(accentColor);

  return (
    <Link href={href}>
      <div
        className={`group p-6 md:p-8 rounded-lg border-2 ${colors.border} ${colors.hover} transition-all duration-250 cursor-pointer`}
      >
        {icon && (
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-250">
            {icon}
          </div>
        )}

        <div className="space-y-3">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-neutral-600">
            {category}
          </span>
          <h3 className="text-2xl font-display font-700 text-neutral-900">
            {title}
          </h3>
          <p className="text-neutral-600 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 flex items-center text-primary-600 font-600 group-hover:translate-x-2 transition-transform duration-250">
          Explore
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
