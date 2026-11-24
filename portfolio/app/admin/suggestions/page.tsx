import { SuggestionActions } from "@/components/admin/SuggestionActions";
import { requireOwner } from "@/lib/admin";
import { listSuggestions } from "@/lib/db/suggestions";

// contact_email is shown here, to the owner only, and never on a public page.
export default async function AdminSuggestions() {
  // Enforced here too, not only in the layout: a non-owner throws before any data read.
  await requireOwner();
  const rows = await listSuggestions();
  return (
    <section aria-labelledby="sugg-h" className="flex flex-col gap-4">
      <h1 id="sugg-h" className="text-2xl font-semibold text-[color:var(--text)]">
        Suggestions
      </h1>
      {rows.length === 0 ? <p className="text-sm text-[color:var(--muted)]">No suggestions yet.</p> : null}
      <ul className="flex flex-col gap-3">
        {rows.map((s) => (
          <li key={s.id} className="flex flex-col gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="font-medium text-[color:var(--text)]">{s.title}</p>
            <p className="whitespace-pre-wrap text-sm text-[color:var(--text)]">{s.description}</p>
            <p className="text-xs text-[color:var(--muted)]">
              {s.status}
              {s.submitter_name ? ` · ${s.submitter_name}` : ""}
              {s.contact_email ? ` · ${s.contact_email}` : ""}
              {s.audience ? ` · for: ${s.audience}` : ""}
              {s.budget_range ? ` · budget: ${s.budget_range}` : ""}
            </p>
            {s.status === "new" ? <SuggestionActions id={s.id} /> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
