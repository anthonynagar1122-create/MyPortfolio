"use client";

import Link from "next/link";
import { useState } from "react";
import { checkSubscribeForm, type FieldErrors } from "@/lib/form-validation";
import { Field, inputClass } from "./Field";

const FALLBACK = "Thanks! If this address can be subscribed, a confirmation email is on its way.";

export function SubscribeForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const found = checkSubscribeForm({ email, consent: f.get("consent") === "on" });
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; message?: string; fields?: FieldErrors };
      if (!res.ok) {
        if (json.fields) setErrors(json.fields);
        setFormError(json.error ?? "Could not subscribe. Please try again.");
        return;
      }
      // Same server message for new, pending and confirmed addresses.
      setMessage(json.message ?? FALLBACK);
    } catch {
      setFormError("Could not subscribe. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Subscribe to updates" className="flex flex-col gap-4">
      {message ? (
        <p role="status" className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-sm text-[color:var(--text)]">
          {message}
        </p>
      ) : (
        <>
          <Field id="subscribe-email" label="Email" required error={errors.email}>
            {(a) => <input {...a} name="email" type="email" autoComplete="email" className={inputClass} />}
          </Field>
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <input
                id="subscribe-consent"
                name="consent"
                type="checkbox"
                required
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={errors.consent ? "subscribe-consent-error" : undefined}
                className="mt-0.5 h-4 w-4"
              />
              <label htmlFor="subscribe-consent" className="text-sm text-[color:var(--text)]">
                I agree to receive email updates and accept the{" "}
                <Link href="/privacy" className="font-medium text-[color:var(--primary)] underline underline-offset-2">
                  privacy policy
                </Link>
              </label>
            </div>
            {errors.consent ? (
              <p id="subscribe-consent-error" className="text-sm text-[color:var(--danger)]">
                {errors.consent}
              </p>
            ) : null}
          </div>
          {formError ? (
            <p role="alert" className="text-sm text-[color:var(--danger)]">
              {formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="self-start rounded-md bg-[color:var(--primary)] px-4 py-2 text-sm font-medium text-[color:var(--on-primary)] disabled:opacity-60"
          >
            {busy ? "Subscribing" : "Subscribe"}
          </button>
        </>
      )}
    </form>
  );
}
