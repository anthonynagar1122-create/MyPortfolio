export type ColorKey = "cyan" | "emerald" | "violet";

type ColorClasses = {
  border: string;
  hover: string;
  bg: string;
  dark: string;
};

const colorClasses: Record<ColorKey, ColorClasses> = {
  cyan: {
    border: "border-cyan-200",
    hover: "hover:border-cyan-400 hover:bg-cyan-50/50",
    bg: "bg-cyan-50",
    dark: "text-cyan-800",
  },
  emerald: {
    border: "border-emerald-200",
    hover: "hover:border-emerald-400 hover:bg-emerald-50/50",
    bg: "bg-emerald-50",
    dark: "text-emerald-800",
  },
  violet: {
    border: "border-violet-200",
    hover: "hover:border-violet-400 hover:bg-violet-50/50",
    bg: "bg-violet-50",
    dark: "text-violet-800",
  },
};

export function getColorClasses(color: ColorKey): ColorClasses {
  return colorClasses[color];
}
