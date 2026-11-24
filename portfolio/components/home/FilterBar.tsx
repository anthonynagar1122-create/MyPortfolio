"use client";

import { useRouter } from "next/navigation";

export type FilterValues = { type: string; category: string; status: string; sort: string };

type Props = {
  values: FilterValues;
  categories: string[];
  statuses: string[];
};

const selectClass =
  "rounded-md border border-[#E5E5E0] bg-white px-2 py-1.5 text-sm text-[#1A1A1A]";

export function FilterBar({ values, categories, statuses }: Props) {
  const router = useRouter();

  function update(key: keyof FilterValues, value: string) {
    const next = { ...values, [key]: value };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) {
      if (v && !(k === "sort" && v === "newest")) params.set(k, v);
    }
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }

  const field = (
    key: keyof FilterValues,
    label: string,
    options: { value: string; label: string }[],
  ) => (
    <label className="flex flex-col gap-1 text-xs text-[#5C5C5C]">
      {label}
      <select
        data-focus-target="filter"
        className={selectClass}
        value={values[key]}
        onChange={(e) => update(key, e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <form
      role="search"
      aria-label="Filter items"
      className="flex flex-wrap gap-3"
      onSubmit={(e) => e.preventDefault()}
    >
      {field("type", "Type", [
        { value: "", label: "All" },
        { value: "project", label: "Projects" },
        { value: "idea", label: "Ideas" },
      ])}
      {field("category", "Category", [
        { value: "", label: "All" },
        ...categories.map((c) => ({ value: c, label: c })),
      ])}
      {field("status", "Status", [
        { value: "", label: "All" },
        ...statuses.map((s) => ({ value: s, label: s })),
      ])}
      {field("sort", "Sort", [
        { value: "newest", label: "Newest" },
        { value: "most_wanted", label: "Most wanted" },
        { value: "most_commented", label: "Most commented" },
      ])}
    </form>
  );
}
