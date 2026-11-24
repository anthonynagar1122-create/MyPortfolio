import { describe, expect, it } from "vitest";
import { readFixtureMode } from "../lib/db/fixture";

describe("readFixtureMode", () => {
  it("is off when unset", () => {
    expect(readFixtureMode({ NODE_ENV: "production" })).toBeNull();
    expect(readFixtureMode({ NODE_ENV: "development" })).toBeNull();
  });
  it("maps 1 and empty outside production", () => {
    expect(readFixtureMode({ E2E_FIXTURE: "1", NODE_ENV: "development" })).toBe("seeded");
    expect(readFixtureMode({ E2E_FIXTURE: "empty", NODE_ENV: "test" })).toBe("empty");
  });
  it("throws when set in production", () => {
    expect(() => readFixtureMode({ E2E_FIXTURE: "1", NODE_ENV: "production" })).toThrow(/production/);
    expect(() => readFixtureMode({ E2E_FIXTURE: "empty", NODE_ENV: "production" })).toThrow(/production/);
  });
  it("rejects unknown values", () => {
    expect(() => readFixtureMode({ E2E_FIXTURE: "yes", NODE_ENV: "development" })).toThrow(/Unknown/);
  });
});
