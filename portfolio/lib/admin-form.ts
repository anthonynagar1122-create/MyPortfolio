export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  sent?: number;
  failed?: number;
  id?: string;
};

function s(f: FormData, k: string): string {
  const v = f.get(k);
  return typeof v === "string" ? v : "";
}

/**
 * Raw form -> candidate for validateItemInput (the only validator). `published`
 * is always an explicit boolean: only a ticked checkbox means true.
 */
export function parseItemForm(f: FormData): { input: Record<string, unknown>; published: boolean; coverUrl: string } {
  return {
    input: {
      type: s(f, "type"),
      title: s(f, "title"),
      short_description: s(f, "short_description"),
      description: s(f, "description"),
      status: s(f, "status"),
      category: s(f, "category"),
      tags: s(f, "tags")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      live_url: s(f, "live_url"),
      demo_url: s(f, "demo_url"),
      android_url: s(f, "android_url"),
      ios_url: s(f, "ios_url"),
    },
    published: f.get("published") === "on",
    coverUrl: s(f, "cover_url").trim(),
  };
}
