import { describe, expect, it } from "vitest";
import { addedLines, grepArguments, PRIVATE_PATHS, personalLines, readPatterns } from "./check-personal";

describe("estack personal value check", () => {
  it("reads the patterns from outside the repository and skips blank and note lines", () => {
    const patterns = readPatterns({ ESTACK_PERSONAL_PATTERNS: "owner-name\n\n# a note\n 100.101.102.103 \n" });
    expect(patterns).toEqual(["owner-name", "100.101.102.103"]);
  });

  it("finds nothing to check when no list exists", () => {
    expect(readPatterns({ ESTACK_PERSONAL_PATTERNS_FILE: "/nonexistent/personal-patterns.txt" })).toEqual([]);
  });

  it("searches every tracked file except the private documents", () => {
    const args = grepArguments(["owner-name"], true);
    expect(args).toContain("--cached");
    expect(args).toEqual(expect.arrayContaining(["-F", "-i", "-e", "owner-name"]));
    for (const path of PRIVATE_PATHS) expect(args).toContain(`:(exclude)${path}`);
  });

  it("finds a personal value in a text in any letter case and gives the line numbers", () => {
    const text = "## What changed\nSigned in as Owner-Name.\nNothing else.\nVPS 100.101.102.103";
    expect(personalLines(text, ["owner-name", "100.101.102.103"])).toEqual([2, 4]);
    expect(personalLines("No personal value here.", ["owner-name"])).toEqual([]);
  });

  it("checks only the added lines of a diff, so removing a value is not blocked", () => {
    const diff = [
      "diff --git a/x.ts b/x.ts",
      "--- a/x.ts",
      "+++ b/x.ts",
      "@@ -1 +1 @@",
      '-const host = "owner-name";',
      "+const host = process.env.HOST;",
    ].join("\n");
    expect(addedLines(diff)).toBe("const host = process.env.HOST;");
    expect(personalLines(addedLines(diff), ["owner-name"])).toEqual([]);
  });
});
