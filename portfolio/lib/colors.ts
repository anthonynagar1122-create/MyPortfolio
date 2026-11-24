export type ColorKey = "cyan" | "emerald" | "violet";

const colorClasses: Record<ColorKey, { border: string; hover: string }> = {
  cyan: {
    border: "border-cyan-200",
    hover: "hover:border-cyan-400 hover:bg-cyan-50/50",
  },
  emerald: {
    border: "border-emerald-200",
    hover: "hover:border-emerald-400 hover:bg-emerald-50/50",
  },
  violet: {
    border: "border-violet-200",
    hover: "hover:border-violet-400 hover:bg-violet-50/50",
  },
};

export function getColorClasses(color: ColorKey) {
  return colorClasses[color];
}
