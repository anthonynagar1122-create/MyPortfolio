import type { ReactNode } from "react";

export const inputClass =
  "rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-2 text-sm text-[color:var(--text)] aria-[invalid=true]:border-[color:var(--danger)]";

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
      <label htmlFor={id} className="text-sm font-medium text-[color:var(--text)]">
        {label}
        {required ? null : <span className="font-normal text-[color:var(--muted)]"> (optional)</span>}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-[color:var(--muted)]">
          {hint}
        </p>
      ) : null}
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": ids || undefined, required })}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-[color:var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
