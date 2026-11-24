"use client";

import { useActionState } from "react";
import { sendLaunchAction } from "@/app/admin/actions";
import { SubmitButton } from "./SubmitButton";

export function LaunchForm({ id }: { id: string }) {
  const [state, action] = useActionState(sendLaunchAction, { ok: false });
  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <SubmitButton>Send launch email</SubmitButton>
      {state.message ? (
        <span role="status" className={`text-xs ${state.failed ? "text-[color:var(--danger)]" : "text-[color:var(--live)]"}`}>
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
