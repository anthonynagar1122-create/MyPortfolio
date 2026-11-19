export const colorMap = {
  cyan: {
    border: "border-cyan-400",
    hover: "hover:border-cyan-500 hover:shadow-lg",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    light: "bg-cyan-100",
    dark: "text-cyan-900",
  },
  emerald: {
    border: "border-emerald-400",
    hover: "hover:border-emerald-500 hover:shadow-lg",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    light: "bg-emerald-100",
    dark: "text-emerald-900",
  },
  violet: {
    border: "border-violet-400",
    hover: "hover:border-violet-500 hover:shadow-lg",
    bg: "bg-violet-50",
    text: "text-violet-600",
    light: "bg-violet-100",
    dark: "text-violet-900",
  },
} as const;

export function getColorClasses(color: keyof typeof colorMap) {
  return colorMap[color];
}

export type ColorKey = keyof typeof colorMap;
