import { describe, expect, it } from "vitest";
import { findHashed, hashPatterns, parseHashedPatterns } from "./personal-hashes";

describe("hashed personal values", () => {
  const secret = hashPatterns(["Owner-Name", "鈴木", "100.101.102.103"], "0123456789abcdef0123456789abcdef");

  it("keeps no personal value in the text that goes to CI", () => {
    expect(secret).not.toMatch(/owner|鈴木|100\.101/iu);
  });

  it("finds the values in any case and reports only the line numbers", () => {
    const patterns = parseHashedPatterns(secret);
    if (!patterns) throw new Error("The hashes did not parse.");
    const text = ["const a = 1;", "// by OWNER-NAME", "host = 100.101.102.103", "名前は鈴木です", "nothing here"].join(
      "\n",
    );
    expect(findHashed(text, patterns)).toEqual([2, 3, 4]);
  });

  it("refuses a value that is not salt and hashes", () => {
    expect(parseHashedPatterns("owner-name\n3 abc")).toBeNull();
  });
});
