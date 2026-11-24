import { describe, it, expect } from "vitest";
import { HEARTBEAT_INTERVAL_MS, shouldSend } from "../lib/heartbeat";

describe("heartbeat scheduling", () => {
  it("sends only while the tab is visible", () => {
    expect(shouldSend("visible")).toBe(true);
    expect(shouldSend("hidden")).toBe(false);
    expect(shouldSend("prerender")).toBe(false);
  });
  it("ticks every 60 seconds, within the 20/min route limit", () => {
    expect(HEARTBEAT_INTERVAL_MS).toBe(60_000);
  });
});
