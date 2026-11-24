import { validateEmail } from "./validation";

export type FieldErrors = Record<string, string>;

/** Client-side checks that mirror the server; the server stays authoritative. */
export function checkSuggestForm(v: { title: string; description: string; contactEmail: string }): FieldErrors {
  const e: FieldErrors = {};
  const title = v.title.trim();
  const description = v.description.trim();
  const email = v.contactEmail.trim();
  if (title.length < 1) e.title = "Enter a title";
  else if (title.length > 100) e.title = "Title must be 100 characters or fewer";
  if (description.length < 1) e.description = "Enter a description";
  else if (description.length > 1000) e.description = "Description must be 1000 characters or fewer";
  if (email && !validateEmail(email)) e.contact_email = "Enter a valid email address";
  return e;
}

export function checkSubscribeForm(v: { email: string; consent: boolean }): FieldErrors {
  const e: FieldErrors = {};
  if (!validateEmail(v.email.trim())) e.email = "Enter a valid email address";
  if (!v.consent) e.consent = "Tick the box to agree before subscribing";
  return e;
}
