import { describe, expect, it } from "vitest";
import {
  EXPORT_EXCLUDES,
  isExcluded,
  noticeProblems,
  parseAllowlist,
  parseAuthor,
  parseGitleaksReport,
  unexpectedFindings,
} from "./export-public";

describe("estack public export", () => {
  it("leaves out the private folder and everything inside it", () => {
    expect(EXPORT_EXCLUDES).toContain("estack/非公開");
    expect(isExcluded("estack/非公開")).toBe(true);
    expect(isExcluded("estack/非公開/計画.md")).toBe(true);
    expect(isExcluded("./estack/非公開/資料/a.md")).toBe(true);
    expect(isExcluded("estack/計画.md")).toBe(false);
    expect(isExcluded("estack/非公開2/a.md")).toBe(false);
  });

  it("needs LICENSE, NOTICE, and a Required Notice line", () => {
    expect(noticeProblems({ license: "Required Notice: Copyright x\n", notice: "NOTICE\n" })).toEqual([]);
    expect(noticeProblems({ license: null, notice: "Required Notice: x" })).toHaveLength(1);
    expect(noticeProblems({ license: "terms", notice: "notice" })).toHaveLength(1);
    expect(noticeProblems({ license: null, notice: null })).toHaveLength(3);
  });

  it("reads the author only in the name and address form", () => {
    expect(parseAuthor("owner <1+owner@users.noreply.github.com>")).toEqual({
      name: "owner",
      email: "1+owner@users.noreply.github.com",
    });
    expect(parseAuthor("owner")).toBeNull();
    expect(parseAuthor(undefined)).toBeNull();
  });

  it("fails only on findings that are not in the allowlist", () => {
    const findings = parseGitleaksReport(
      JSON.stringify([
        { File: "./src/a.test.ts", RuleID: "generic-api-key", StartLine: 3 },
        { File: "src/b.ts", RuleID: "private-key", StartLine: 9 },
      ]),
    );
    const allowlist = parseAllowlist("# test dummies\nsrc/a.test.ts   generic-api-key\n\n");
    expect(unexpectedFindings(findings, allowlist)).toEqual([{ file: "src/b.ts", ruleId: "private-key", line: 9 }]);
    expect(parseGitleaksReport("")).toEqual([]);
  });
});
