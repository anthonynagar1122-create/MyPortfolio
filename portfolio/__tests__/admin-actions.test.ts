import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireOwner, items, comments, suggestions, subscribers, sendLaunch, createSignedUpload } = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  items: { saveItem: vi.fn(), deleteItem: vi.fn(), getItemById: vi.fn() },
  comments: { setCommentHidden: vi.fn(), deleteCommentById: vi.fn() },
  suggestions: { getSuggestion: vi.fn(), setSuggestionStatus: vi.fn() },
  subscribers: { listConfirmedEmails: vi.fn() },
  sendLaunch: vi.fn(),
  createSignedUpload: vi.fn(),
}));
vi.mock("../lib/admin", () => ({ requireOwner: () => requireOwner() }));
vi.mock("../lib/db/items", () => items);
vi.mock("../lib/db/comments", () => comments);
vi.mock("../lib/db/suggestions", () => suggestions);
vi.mock("../lib/db/subscribers", () => subscribers);
vi.mock("../lib/email", () => ({ sendLaunch: (...a: unknown[]) => sendLaunch(...a) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("../lib/cover-storage", () => ({ createSignedCoverUpload: (...a: unknown[]) => createSignedUpload(...a) }));

import * as actions from "../app/admin/actions";

const ID = "123e4567-e89b-42d3-a456-426614174000";

const empty = { ok: false } as const;
function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}
const validItem = {
  type: "project",
  title: "T",
  short_description: "short",
  description: "",
  status: "Live",
  category: "Web",
  tags: "a, b",
  live_url: "https://example.com",
};

beforeEach(() => {
  vi.clearAllMocks();
  requireOwner.mockResolvedValue({ userId: "owner" });
});

describe("every admin action calls requireOwner first and writes nothing when it throws", () => {
  const denied = new Response("Forbidden", { status: 403 });
  const calls: [string, () => Promise<unknown>][] = [
    ["saveItemAction", () => actions.saveItemAction(empty, fd(validItem))],
    ["deleteItemAction", () => actions.deleteItemAction(fd({ id: "1" }))],
    ["setCommentHiddenAction", () => actions.setCommentHiddenAction(fd({ id: "1", hidden: "true" }))],
    ["deleteCommentAction", () => actions.deleteCommentAction(fd({ id: "1" }))],
    ["publishSuggestionAction", () => actions.publishSuggestionAction(fd({ id: "1" }))],
    ["dismissSuggestionAction", () => actions.dismissSuggestionAction(fd({ id: "1" }))],
    ["sendLaunchAction", () => actions.sendLaunchAction(empty, fd({ id: "1" }))],
    ["createCoverUploadAction", () => actions.createCoverUploadAction({ type: "image/png", size: 10 })],
  ];
  it.each(calls)("%s", async (_name, run) => {
    requireOwner.mockRejectedValue(denied);
    await expect(run()).rejects.toBe(denied);
    for (const group of [items, comments, suggestions, subscribers]) {
      for (const fn of Object.values(group)) expect(fn).not.toHaveBeenCalled();
    }
    expect(sendLaunch).not.toHaveBeenCalled();
    expect(createSignedUpload).not.toHaveBeenCalled();
  });
});

describe("saveItemAction", () => {
  it("rejects a javascript: live URL with field errors and saves nothing", async () => {
    const res = await actions.saveItemAction(empty, fd({ ...validItem, live_url: "javascript:alert(1)" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.live_url).toBeTruthy();
    expect(items.saveItem).not.toHaveBeenCalled();
  });

  it("creates new items as unpublished when the checkbox is unticked", async () => {
    items.saveItem.mockResolvedValue({ id: "n1", slug: "t" });
    const res = await actions.saveItemAction(empty, fd(validItem));
    expect(res.ok).toBe(true);
    expect(items.saveItem).toHaveBeenCalledTimes(1);
    const [input, id, extra] = items.saveItem.mock.calls[0];
    expect(input.tags).toEqual(["a", "b"]);
    expect(id).toBeUndefined();
    expect(extra.published).toBe(false);
  });

  it("publishes only when the checkbox is ticked", async () => {
    items.saveItem.mockResolvedValue({ id: "n1", slug: "t" });
    await actions.saveItemAction(empty, fd({ ...validItem, published: "on" }));
    expect(items.saveItem.mock.calls[0][2].published).toBe(true);
  });

  it("ignores a cover_url that is not on our covers bucket", async () => {
    items.saveItem.mockResolvedValue({ id: "n1", slug: "t" });
    const res = await actions.saveItemAction(empty, fd({ ...validItem, cover_url: "https://evil.example/x.png" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.cover_url).toBeTruthy();
    expect(items.saveItem).not.toHaveBeenCalled();
  });
});

describe("suggestions", () => {
  const suggestion = {
    id: ID,
    title: "Cool idea",
    description: "Do the thing",
    status: "new",
    contact_email: "x@y.z",
  };
  it("publish creates an unpublished idea item by default and marks the suggestion published", async () => {
    suggestions.getSuggestion.mockResolvedValue(suggestion);
    items.saveItem.mockResolvedValue({ id: "i1", slug: "cool-idea" });
    const res = await actions.publishSuggestionAction(fd({ id: ID }));
    expect(res.ok).toBe(true);
    const [input, id, extra] = items.saveItem.mock.calls[0];
    expect(input.type).toBe("idea");
    expect(input.title).toBe("Cool idea");
    expect(id).toBeUndefined();
    expect(extra.published).toBe(false);
    expect(JSON.stringify(items.saveItem.mock.calls[0])).not.toContain("x@y.z");
    expect(suggestions.setSuggestionStatus).toHaveBeenCalledWith(ID, "published");
  });
  it("publish with the box ticked makes it public", async () => {
    suggestions.getSuggestion.mockResolvedValue(suggestion);
    items.saveItem.mockResolvedValue({ id: "i1", slug: "cool-idea" });
    await actions.publishSuggestionAction(fd({ id: ID, published: "on" }));
    expect(items.saveItem.mock.calls[0][2].published).toBe(true);
  });
  it("does not publish an already handled suggestion", async () => {
    suggestions.getSuggestion.mockResolvedValue({ ...suggestion, status: "dismissed" });
    const res = await actions.publishSuggestionAction(fd({ id: ID }));
    expect(res.ok).toBe(false);
    expect(items.saveItem).not.toHaveBeenCalled();
  });
  it("dismiss sets status dismissed", async () => {
    await actions.dismissSuggestionAction(fd({ id: ID }));
    expect(suggestions.setSuggestionStatus).toHaveBeenCalledWith(ID, "dismissed");
  });
});

describe("comments", () => {
  it("hide / unhide", async () => {
    await actions.setCommentHiddenAction(fd({ id: ID, hidden: "true" }));
    expect(comments.setCommentHidden).toHaveBeenCalledWith(ID, true);
    await actions.setCommentHiddenAction(fd({ id: ID, hidden: "false" }));
    expect(comments.setCommentHidden).toHaveBeenLastCalledWith(ID, false);
  });
});

describe("sendLaunchAction", () => {
  it("emails only confirmed subscribers and reports sent and failed", async () => {
    items.getItemById.mockResolvedValue({ id: ID, title: "T", slug: "t", published: true });
    subscribers.listConfirmedEmails.mockResolvedValue(["a@b.c", "d@e.f", "g@h.i"]);
    sendLaunch.mockResolvedValue({ sent: 2, failed: 1 });
    const res = await actions.sendLaunchAction(empty, fd({ id: ID }));
    expect(sendLaunch).toHaveBeenCalledWith(["a@b.c", "d@e.f", "g@h.i"], { title: "T", slug: "t" });
    expect(res.ok).toBe(false);
    expect(res.sent).toBe(2);
    expect(res.failed).toBe(1);
    expect(res.message).toMatch(/2 sent/);
    expect(res.message).toMatch(/1 failed/);
  });
  it("refuses an unpublished item", async () => {
    items.getItemById.mockResolvedValue({ id: ID, title: "T", slug: "t", published: false });
    const res = await actions.sendLaunchAction(empty, fd({ id: ID }));
    expect(res.ok).toBe(false);
    expect(sendLaunch).not.toHaveBeenCalled();
  });
  it("sends nothing when there are no confirmed subscribers", async () => {
    items.getItemById.mockResolvedValue({ id: ID, title: "T", slug: "t", published: true });
    subscribers.listConfirmedEmails.mockResolvedValue([]);
    const res = await actions.sendLaunchAction(empty, fd({ id: ID }));
    expect(sendLaunch).not.toHaveBeenCalled();
    expect(res.sent).toBe(0);
  });
});

describe("createCoverUploadAction", () => {
  it("rejects a disallowed type or size before touching storage", async () => {
    const a = await actions.createCoverUploadAction({ type: "image/svg+xml", size: 10 });
    const b = await actions.createCoverUploadAction({ type: "image/png", size: 2 * 1024 * 1024 + 1 });
    expect(a.ok).toBe(false);
    expect(b.ok).toBe(false);
    expect(createSignedUpload).not.toHaveBeenCalled();
  });
  it("returns a signed upload for a valid file", async () => {
    createSignedUpload.mockResolvedValue({ signedUrl: "https://s/u", publicUrl: "https://s/p.png" });
    const res = await actions.createCoverUploadAction({ type: "image/png", size: 1000 });
    expect(res).toMatchObject({ ok: true, signedUrl: "https://s/u", publicUrl: "https://s/p.png" });
    expect(createSignedUpload).toHaveBeenCalledWith("image/png");
  });
});

describe("id validation: non-UUID ids are rejected before any db call", () => {
  const bad = "1; drop table items";
  const allGroups = () => [items, comments, suggestions, subscribers];
  function expectNoDb() {
    for (const group of allGroups()) for (const fn of Object.values(group)) expect(fn).not.toHaveBeenCalled();
    expect(sendLaunch).not.toHaveBeenCalled();
  }
  it("sendLaunchAction returns a field error", async () => {
    const res = await actions.sendLaunchAction(empty, fd({ id: bad }));
    expect(res.ok).toBe(false);
    expect(res.errors?.id).toBeTruthy();
    expectNoDb();
  });
  it("publishSuggestionAction returns a field error", async () => {
    const res = await actions.publishSuggestionAction(fd({ id: bad }));
    expect(res.ok).toBe(false);
    expect(res.errors?.id).toBeTruthy();
    expectNoDb();
  });
  it("saveItemAction rejects a non-UUID id", async () => {
    const res = await actions.saveItemAction(empty, fd({ ...validItem, id: bad }));
    expect(res.ok).toBe(false);
    expect(res.errors?.id).toBeTruthy();
    expectNoDb();
  });
  it("void actions do nothing", async () => {
    await actions.deleteItemAction(fd({ id: bad }));
    await actions.setCommentHiddenAction(fd({ id: bad, hidden: "true" }));
    await actions.deleteCommentAction(fd({ id: bad }));
    await actions.dismissSuggestionAction(fd({ id: bad }));
    expectNoDb();
  });
  it("requireOwner still runs first", async () => {
    requireOwner.mockRejectedValue(new Response("Forbidden", { status: 403 }));
    await expect(actions.sendLaunchAction(empty, fd({ id: bad }))).rejects.toBeInstanceOf(Response);
  });
});
