"use client";

import { useActionState } from "react";
import { dismissSuggestionAction, publishSuggestionAction } from "@/app/admin/actions";
import type { ActionState } from "@/lib/admin-form";
import { SubmitButton } from "./SubmitButton";

export function SuggestionActions({ id }: { id: string }) {
  const [state, action] = useActionState(
    (_prev: ActionState, fd: FormData) => publishSuggestionAction(fd),
    { ok: false } as ActionState,
  );
  return (
    <div className="flex flex-col gap-2">
      <form action={action} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="id" value={id} />
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" name="published" /> Publish immediately
        </label>
        <SubmitButton primary>Publish as idea</SubmitButton>
      </form>
      <form action={dismissSuggestionAction}>
        <input type="hidden" name="id" value={id} />
        <SubmitButton>Dismiss</SubmitButton>
      </form>
      {state.message ? <p role="status" className="text-sm text-[color:var(--muted)]">{state.message}</p> : null}
    </div>
  );
}
