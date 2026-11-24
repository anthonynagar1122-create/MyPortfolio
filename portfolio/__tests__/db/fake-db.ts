import type { SupabaseClient } from "@supabase/supabase-js";

type Row = Record<string, unknown>;

/**
 * Minimal in-memory stand-in for the Supabase client. Supports only what the
 * tested db modules call: upsert (with onConflict/ignoreDuplicates), insert,
 * select (incl. head count), eq, in, delete. Unique constraints are declared
 * per table via `unique`.
 */
export function createFakeDb(unique: Record<string, string[]> = {}) {
  const tables = new Map<string, Row[]>();
  const rows = (t: string) => {
    if (!tables.has(t)) tables.set(t, []);
    return tables.get(t)!;
  };

  function from(table: string) {
    let op: "select" | "upsert" | "insert" | "delete" = "select";
    let payload: Row[] = [];
    let opts: { onConflict?: string; ignoreDuplicates?: boolean } = {};
    let wantCount = false;
    let head = false;
    const filters: Array<(r: Row) => boolean> = [];
    let returning = false;

    const run = () => {
      const t = rows(table);
      const match = (r: Row) => filters.every((f) => f(r));
      if (op === "upsert" || op === "insert") {
        const cols = opts.onConflict?.split(",").map((c) => c.trim()) ?? unique[table] ?? [];
        const out: Row[] = [];
        for (const p of payload) {
          const dup =
            cols.length > 0 && t.find((r) => cols.every((c) => r[c] === p[c]));
          if (dup) {
            if (op === "insert") return { data: null, error: { message: "duplicate key", code: "23505" }, count: null };
            if (opts.ignoreDuplicates) continue;
            Object.assign(dup, p);
            out.push(dup);
          } else {
            const row = { id: crypto.randomUUID(), ...p };
            t.push(row);
            out.push(row);
          }
        }
        return { data: returning ? out : null, error: null, count: null };
      }
      if (op === "delete") {
        const removed = t.filter(match);
        tables.set(table, t.filter((r) => !match(r)));
        return { data: returning ? removed : null, error: null, count: null };
      }
      const found = t.filter(match);
      return {
        data: head ? null : found,
        error: null,
        count: wantCount ? found.length : null,
      };
    };

    const b: Record<string, unknown> = {
      upsert(v: Row | Row[], o: typeof opts = {}) {
        op = "upsert";
        payload = Array.isArray(v) ? v : [v];
        opts = o;
        return b;
      },
      insert(v: Row | Row[]) {
        op = "insert";
        payload = Array.isArray(v) ? v : [v];
        return b;
      },
      delete() {
        op = "delete";
        return b;
      },
      select(_cols?: string, o?: { count?: string; head?: boolean }) {
        if (op === "select") {
          wantCount = !!o?.count;
          head = !!o?.head;
        } else returning = true;
        return b;
      },
      eq(col: string, val: unknown) {
        filters.push((r) => r[col] === val);
        return b;
      },
      in(col: string, vals: unknown[]) {
        filters.push((r) => vals.includes(r[col]));
        return b;
      },
      then(resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) {
        return Promise.resolve(run()).then(resolve, reject);
      },
    };
    return b;
  }

  return { client: { from } as unknown as SupabaseClient, tables };
}
