import { describe, expect, it } from "vitest";
import { contrastRatio } from "../lib/contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for identical colours", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
    expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
  });
  it("parses rgb() strings and is symmetric", () => {
    expect(contrastRatio("rgb(163, 163, 163)", "rgb(15, 17, 21)")).toBeCloseTo(
      contrastRatio("#0F1115", "#A3A3A3"),
      5,
    );
  });
});
