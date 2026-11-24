import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "../lib/csv";

describe("csv", () => {
  it("quotes and escapes", () => expect(csvCell('a"b,c')).toBe('"a""b,c"'));
  it("defuses formula injection", () => {
    for (const v of ["=1+1", "+1", "-1", "@x"]) expect(csvCell(v)).toBe(`"'${v}"`);
  });
  it("joins rows with CRLF", () => expect(toCsv([["a", "b"], ["c", "d"]])).toBe('"a","b"\r\n"c","d"\r\n'));
});
