"use client";

import { useFormStatus } from "react-dom";

export const btn =
  "rounded-md border border-[#E5E5E0] bg-white px-3 py-1.5 text-sm font-medium text-[#1A1A1A] hover:bg-[#F0F0EA] disabled:opacity-60";
export const btnPrimary =
  "rounded-md bg-[#2563EB] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-60";

export function SubmitButton({ children, primary = false }: { children: React.ReactNode; primary?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primary ? btnPrimary : btn}>
      {children}
    </button>
  );
}
