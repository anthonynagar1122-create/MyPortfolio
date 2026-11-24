import { beforeEach, describe, expect, it, vi } from "vitest";

const denied = new Response("Forbidden", { status: 403 });
const { requireOwner, gateOwner, data } = vi.hoisted(() => ({
  requireOwner: vi.fn(),
  gateOwner: vi.fn(),
  data: {
    listAllComments: vi.fn(),
    listAllItems: vi.fn(),
    listSuggestions: vi.fn(),
    getPublicStats: vi.fn(),
    countConfirmed: vi.fn(),
    getItemById: vi.fn(),
  },
}));
vi.mock("../lib/admin", () => ({ requireOwner: () => requireOwner() }));
// The layout gate is deliberately a no-op here: each page must enforce the check itself.
vi.mock("../lib/admin-gate", () => ({ gateOwner: () => gateOwner() }));
vi.mock("../lib/db/comments", () => ({ listAllComments: data.listAllComments }));
vi.mock("../lib/db/items", () => ({ listAllItems: data.listAllItems, getItemById: data.getItemById }));
vi.mock("../lib/db/suggestions", () => ({ listSuggestions: data.listSuggestions }));
vi.mock("../lib/db/stats", () => ({ getPublicStats: data.getPublicStats }));
vi.mock("../lib/db/subscribers", () => ({ countConfirmed: data.countConfirmed }));
vi.mock("../app/admin/actions", () => ({}));
vi.mock("../components/admin/SubmitButton", () => ({ SubmitButton: () => null }));
vi.mock("../components/admin/SuggestionActions", () => ({ SuggestionActions: () => null }));
vi.mock("../components/admin/LaunchForm", () => ({ LaunchForm: () => null }));
vi.mock("../components/admin/ItemForm", () => ({ ItemForm: () => null }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));
vi.mock("next/link", () => ({ default: () => null }));

import AdminDashboard from "../app/admin/page";
import AdminComments from "../app/admin/comments/page";
import AdminSuggestions from "../app/admin/suggestions/page";
import AdminItems from "../app/admin/items/page";
import AdminItem from "../app/admin/items/[id]/page";

const ID = "123e4567-e89b-42d3-a456-426614174000";
const pages: [string, () => Promise<unknown>][] = [
  ["admin dashboard", () => AdminDashboard()],
  ["admin comments", () => AdminComments()],
  ["admin suggestions", () => AdminSuggestions()],
  ["admin items", () => AdminItems()],
  ["admin item (existing)", () => AdminItem({ params: Promise.resolve({ id: ID }) })],
  ["admin item (new)", () => AdminItem({ params: Promise.resolve({ id: "new" }) })],
];

beforeEach(() => {
  vi.clearAllMocks();
  gateOwner.mockResolvedValue("ok");
  requireOwner.mockRejectedValue(denied);
});

describe("every admin page enforces requireOwner itself, before any data read", () => {
  it.each(pages)("%s throws and reads nothing for a non-owner", async (_name, render) => {
    await expect(render()).rejects.toBe(denied);
    expect(requireOwner).toHaveBeenCalled();
    for (const fn of Object.values(data)) expect(fn).not.toHaveBeenCalled();
  });
});
