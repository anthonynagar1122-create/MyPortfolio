"use client";

import { useFormStatus } from "react-dom";

export const btn =
  "rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-sm font-medium text-[color:var(--text)] hover:bg-[color:var(--bg)] disabled:opacity-60";
export const btnPrimary =
  "rounded-md bg-[color:var(--primary)] px-3 py-1.5 text-sm font-medium text-[color:var(--on-primary)] hover:brightness-110 disabled:opacity-60";

export function SubmitButton({ children, primary = false }: { children: React.ReactNode; primary?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primary ? btnPrimary : btn}>
      {children}
    </button>
  );
}
