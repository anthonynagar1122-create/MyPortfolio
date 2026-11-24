import { SuggestionActions } from "@/components/admin/SuggestionActions";
import { gateOwner } from "@/lib/admin-gate";
import { listSuggestions } from "@/lib/db/suggestions";

// contact_email is shown here, to the owner only, and never on a public page.
export default async function AdminSuggestions() {
  await gateOwner();
  const rows = await listSuggestions();
  return (
    <section aria-labelledby="sugg-h" className="flex flex-col gap-4">
      <h1 id="sugg-h" className="text-2xl font-semibold text-[#1A1A1A]">
        Suggestions
      </h1>
      {rows.length === 0 ? <p className="text-sm text-[#5C5C5C]">No suggestions yet.</p> : null}
      <ul className="flex flex-col gap-3">
        {rows.map((s) => (
          <li key={s.id} className="flex flex-col gap-2 rounded-md border border-[#E5E5E0] bg-white p-4">
            <p className="font-medium text-[#1A1A1A]">{s.title}</p>
            <p className="whitespace-pre-wrap text-sm text-[#1A1A1A]">{s.description}</p>
            <p className="text-xs text-[#5C5C5C]">
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
