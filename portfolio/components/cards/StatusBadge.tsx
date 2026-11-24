type Props = { status: string; type: "project" | "idea" };

// Fixed icon set (inline SVG, 12px). Unknown statuses fall back to "dot".
const ICONS: Record<string, string> = {
  live: "check",
  shipped: "check",
  "in progress": "clock",
  building: "clock",
  exploring: "search",
  idea: "spark",
  paused: "pause",
  archived: "box",
};

function Icon({ name }: { name: string }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "check":
      return (
        <svg {...common}>
          <path d="M3 8.5l3.2 3L13 4.5" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.5" />
          <path d="M8 5v3.2l2 1.3" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="4.2" />
          <path d="M10.2 10.2L13.5 13.5" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M8 2.5v3M8 10.5v3M2.5 8h3M10.5 8h3" />
        </svg>
      );
    case "pause":
      return (
        <svg {...common}>
          <path d="M6 4v8M10 4v8" />
        </svg>
      );
    case "box":
      return (
        <svg {...common}>
          <path d="M2.5 5h11v8h-11zM2.5 5l1.5-2.5h8L13.5 5M6.5 8h3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2.5" />
        </svg>
      );
  }
}

export function StatusBadge({ status, type }: Props) {
  const icon = ICONS[status.toLowerCase()] ?? "dot";
  return (
    <span
      data-type={type}
      className="inline-flex items-center gap-1 rounded-full border border-[color:var(--border)] px-2 py-0.5 text-xs font-medium text-[color:var(--text)]"
    >
      <Icon name={icon} />
      {status}
    </span>
  );
}
