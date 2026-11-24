import { fail, guard, limited, ok, readJson, requestVisitorHash } from "@/lib/api";
import { insertSuggestion } from "@/lib/db/suggestions";
import { sanitizeText, validateSuggestion } from "@/lib/validation";

const BUDGETS = ["free", "under_10", "10_50", "over_50", "not_sure"];

function optional(v: unknown, max: number): string | null {
  const s = typeof v === "string" ? sanitizeText(v) : "";
  return s ? s.slice(0, max) : null;
}

export async function POST(request: Request) {
  return guard(async () => {
    const limit = await limited(`suggest:${requestVisitorHash(request)}`, 3, 3600);
    if (limit) return limit;
    const json = await readJson(request);
    if (!json) return fail(400, "Invalid JSON body");

    const checked = validateSuggestion({
      title: json.title,
      description: json.description,
      email: json.contact_email ?? json.email,
    });
    if (!checked.ok) return fail(400, "Please fix the highlighted fields", { fields: checked.errors });

    const budget = json.budget_range;
    if (budget !== undefined && budget !== null && (typeof budget !== "string" || !BUDGETS.includes(budget))) {
      return fail(400, "Invalid budget range", { fields: { budget_range: "Invalid budget range" } });
    }

    await insertSuggestion({
      title: checked.value.title,
      description: checked.value.description,
      audience: optional(json.audience, 200),
      budgetRange: (budget as string | null | undefined) ?? null,
      contactEmail: checked.value.email ?? null,
      submitterName: optional(json.submitter_name, 80),
      creditOk: json.credit_ok === true,
    });
    return ok({}, 201);
  });
}
