import Link from "next/link";
import { site } from "@/lib/config";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const items = [
  { href: "/", label: "Projects" },
  { href: "/?type=idea", label: "Ideas" },
  { href: "/suggest", label: "Suggest an idea" },
  { href: "/#stats", label: "Stats" },
  { href: "/suggest#subscribe", label: "Subscribe" },
  { href: "/sign-in", label: "Sign in" },
];

const linkClass =
  "text-sm font-medium text-[color:var(--muted)] hover:text-[color:var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--primary)]";

export function SiteNav() {
  return (
    <nav
      aria-label="Main"
      className="border-b border-[color:var(--border)] bg-[color:var(--bg)] px-4 py-3 sm:px-6"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/" className="mr-2 text-base font-semibold text-[color:var(--text)]">
          {site.name}
        </Link>
        {items.map((i) => (
          <Link key={i.label} href={i.href} className={linkClass}>
            {i.label}
          </Link>
        ))}
        <ThemeToggle />
      </div>
    </nav>
  );
}
