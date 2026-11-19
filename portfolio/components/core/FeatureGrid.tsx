interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 2 | 3 | 4;
  variant?: "light" | "dark";
}

export function FeatureGrid({
  features,
  columns = 3,
  variant = "light",
}: FeatureGridProps) {
  const colMap = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <div
      className={`grid grid-cols-1 ${colMap[columns]} gap-8 md:gap-12 ${
        variant === "dark" ? "bg-neutral-900 text-white py-24" : "py-16"
      }`}
    >
      {features.map((feature, idx) => (
        <div key={idx} className="space-y-4">
          <div className="text-5xl">{feature.icon}</div>
          <div>
            <h3
              className={`text-xl font-display font-700 mb-2 ${
                variant === "dark" ? "text-white" : "text-neutral-900"
              }`}
            >
              {feature.title}
            </h3>
            <p
              className={`leading-relaxed ${
                variant === "dark" ? "text-neutral-300" : "text-neutral-600"
              }`}
            >
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
