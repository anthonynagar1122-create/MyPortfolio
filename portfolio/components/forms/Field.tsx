import type { ReactNode } from "react";

export const inputClass =
  "rounded-md border border-[#E5E5E0] bg-white p-2 text-sm text-[#1A1A1A] aria-[invalid=true]:border-[#B91C1C]";

type Props = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (a: { id: string; "aria-invalid": boolean; "aria-describedby"?: string; required?: boolean }) => ReactNode;
};

/** A real label, optional hint, and an error linked via aria-describedby. */
export function Field({ id, label, error, hint, required, children }: Props) {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-[#1A1A1A]">
        {label}
        {required ? null : <span className="font-normal text-[#5C5C5C]"> (optional)</span>}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-[#5C5C5C]">
          {hint}
        </p>
      ) : null}
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": ids || undefined, required })}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-[#B91C1C]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
