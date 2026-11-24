"use client";

import { useActionState, useState } from "react";
import { createCoverUploadAction, saveItemAction } from "@/app/admin/actions";
import { COVER_MAX_BYTES } from "@/lib/cover-rules";
import { categories, statuses } from "@/lib/config";
import type { ItemRow } from "@/lib/db/types";
import { Field, inputClass } from "@/components/forms/Field";
import { SubmitButton } from "./SubmitButton";

const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ItemForm({ item }: { item: ItemRow | null }) {
  const [state, action] = useActionState(saveItemAction, { ok: false });
  const [type, setType] = useState<"project" | "idea">(item?.type ?? "project");
  const [coverUrl, setCoverUrl] = useState(item?.cover_url ?? "");
  const [coverMsg, setCoverMsg] = useState<string | null>(null);
  const e = state.errors ?? {};

  async function onCover(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    setCoverMsg(null);
    if (!file) return;
    if (!COVER_TYPES.includes(file.type) || file.size > COVER_MAX_BYTES) {
      setCoverMsg("Cover must be a JPEG, PNG or WebP image up to 2 MB");
      ev.target.value = "";
      return;
    }
    const res = await createCoverUploadAction({ type: file.type, size: file.size });
    if (!res.ok) return setCoverMsg(res.error);
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);
    const put = await fetch(res.signedUrl, { method: "PUT", body, headers: { "x-upsert": "false" } });
    if (!put.ok) return setCoverMsg("Upload failed");
    setCoverUrl(res.publicUrl);
    setCoverMsg("Cover uploaded");
  }

  const text = (name: string, label: string, required = false, hint?: string) => (
    <Field id={name} label={label} required={required} error={e[name]} hint={hint}>
      {(a) => <input {...a} name={name} type="text" defaultValue={String((item as Record<string, unknown> | null)?.[name] ?? "")} className={inputClass} />}
    </Field>
  );

  return (
    <form action={action} noValidate aria-label="Item" className="flex max-w-2xl flex-col gap-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <input type="hidden" name="cover_url" value={coverUrl} />
      {state.message ? (
        <p role="status" className={`text-sm ${state.ok ? "text-[#166534]" : "text-[#B91C1C]"}`}>
          {state.message}
        </p>
      ) : null}
      <Field id="type" label="Type" required error={e.type}>
        {(a) => (
          <select {...a} name="type" value={type} onChange={(ev) => setType(ev.target.value as "project" | "idea")} className={inputClass}>
            <option value="project">Project</option>
            <option value="idea">Idea</option>
          </select>
        )}
      </Field>
      {text("title", "Title", true)}
      {text("short_description", "Short description", true, "Up to 160 characters.")}
      <Field id="description" label="Description" error={e.description}>
        {(a) => <textarea {...a} name="description" rows={6} defaultValue={item?.description ?? ""} className={inputClass} />}
      </Field>
      <Field id="status" label="Status" required error={e.status}>
        {(a) => (
          <select {...a} name="status" defaultValue={item?.status ?? ""} className={inputClass}>
            {statuses[type].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id="category" label="Category" required error={e.category}>
        {(a) => (
          <select {...a} name="category" defaultValue={item?.category ?? categories[0]} className={inputClass}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id="tags" label="Tags" error={e.tags} hint="Comma separated, up to 5.">
        {(a) => <input {...a} name="tags" type="text" defaultValue={item?.tags.join(", ") ?? ""} className={inputClass} />}
      </Field>
      {text("live_url", "Live URL", type === "project", "https:// only.")}
      {text("demo_url", "Demo URL")}
      {text("android_url", "Android URL")}
      {text("ios_url", "iOS URL")}
      <Field id="cover" label="Cover image" error={e.cover_url} hint="JPEG, PNG or WebP, up to 2 MB.">
        {(a) => <input {...a} type="file" accept={COVER_TYPES.join(",")} onChange={onCover} className="text-sm" />}
      </Field>
      {coverMsg ? <p role="status" className="text-sm text-[#5C5C5C]">{coverMsg}</p> : null}
      {coverUrl ? <p className="break-all text-xs text-[#5C5C5C]">Cover: {coverUrl}</p> : null}
      <label className="flex items-center gap-2 text-sm font-medium text-[#1A1A1A]">
        <input type="checkbox" name="published" defaultChecked={item?.published ?? false} />
        Published (visible on the public site)
      </label>
      <div>
        <SubmitButton primary>Save</SubmitButton>
      </div>
    </form>
  );
}
