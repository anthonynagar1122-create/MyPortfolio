"use client";

import { useState } from "react";
import { budgetOptions } from "@/lib/budget";
import { checkSuggestForm, type FieldErrors } from "@/lib/form-validation";
import { Field, inputClass } from "./Field";

const SUCCESS = "Thanks! Your suggestion has been received and will be reviewed.";

export function SuggestForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const s = (k: string) => String(f.get(k) ?? "");
    const found = checkSuggestForm({ title: s("title"), description: s("description"), contactEmail: s("contact_email") });
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: s("title").trim(),
          description: s("description").trim(),
          audience: s("audience").trim(),
          budget_range: s("budget_range") || undefined,
          contact_email: s("contact_email").trim(),
          submitter_name: s("submitter_name").trim(),
          credit_ok: f.get("credit_ok") === "on",
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; fields?: FieldErrors };
      if (!res.ok) {
        if (json.fields) setErrors(json.fields);
        setFormError(json.error ?? "Could not send your suggestion. Please try again.");
        return;
      }
      setDone(true);
      form.reset();
    } catch {
      setFormError("Could not send your suggestion. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p role="status" className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-4 text-sm text-[color:var(--text)]">
        {SUCCESS}
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Suggest an idea" className="flex flex-col gap-4">
      <Field id="title" label="Title" required error={errors.title}>
        {(a) => <input {...a} name="title" type="text" maxLength={100} className={inputClass} />}
      </Field>
      <Field id="description" label="Description" required error={errors.description} hint="Up to 1000 characters.">
        {(a) => <textarea {...a} name="description" rows={5} maxLength={1000} className={inputClass} />}
      </Field>
      <Field id="audience" label="Who is it for?" error={errors.audience}>
        {(a) => <input {...a} name="audience" type="text" maxLength={200} className={inputClass} />}
      </Field>
      <Field id="budget_range" label="Budget range" error={errors.budget_range}>
        {(a) => (
          <select {...a} name="budget_range" defaultValue="" className={inputClass}>
            <option value="">No preference</option>
            {budgetOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id="contact_email" label="Contact email" error={errors.contact_email}>
        {(a) => <input {...a} name="contact_email" type="email" autoComplete="email" className={inputClass} />}
      </Field>
      <Field id="submitter_name" label="Your name" error={errors.submitter_name}>
        {(a) => <input {...a} name="submitter_name" type="text" maxLength={80} autoComplete="name" className={inputClass} />}
      </Field>
      <div className="flex items-center gap-2">
        <input id="credit_ok" name="credit_ok" type="checkbox" className="h-4 w-4" />
        <label htmlFor="credit_ok" className="text-sm text-[color:var(--text)]">
          You may credit me by name if this is built
        </label>
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
        {busy ? "Sending" : "Send suggestion"}
      </button>
    </form>
  );
}
