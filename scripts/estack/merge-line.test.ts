import { describe, expect, it } from "vitest";
import { mayAutoMerge, parseMergeLine, prCategory, readMergeLine, revertStats } from "./merge-line";

const now = new Date("2026-12-19T00:00:00Z");
const day = (n: number) => new Date(now.getTime() - n * 86_400_000);

describe("merge line", () => {
  it("lets agents merge nothing by themselves, so every merge needs the owner's approval", () => {
    expect(readMergeLine().autoMerge).toEqual([]);
  });

  it("sorts pull requests by what they change", () => {
    expect(prCategory(["estack/機能の一覧.md", "docs/a.md"])).toBe("docs");
    expect(prCategory(["src/a.test.ts", "scripts/b.test.tsx"])).toBe("tests");
    expect(prCategory(["estack/機能の一覧.md", "src/a.ts"])).toBe("code");
    expect(prCategory([".agents/skills/x/SKILL.md"])).toBe("code");
    expect(prCategory([])).toBe("code");
  });

  it("sorts Markdown under .github/ as code", () => {
    expect(prCategory([".github/PULL_REQUEST_TEMPLATE.md"])).toBe("code");
    expect(prCategory(["docs/a.md", ".github/PULL_REQUEST_TEMPLATE.md"])).toBe("code");
  });

  it("sorts a mix of tests and Markdown as code", () => {
    expect(prCategory(["src/a.test.ts", "docs/a.md"])).toBe("code");
  });

  it("counts merges and reverts in the window", () => {
    const commits = [
      { subject: "Fix the onboarding (#9)", time: day(1) },
      { subject: "Docs (#10)", time: day(2) },
      { subject: 'Revert "Docs (#10)"', time: day(2) },
      { subject: "Old (#1)", time: day(40) },
    ];
    expect(revertStats(commits, now, 30)).toEqual({ merges: 2, reverts: 1, rate: 0.5 });
    expect(revertStats(commits, now, 30, day(1))).toEqual({ merges: 1, reverts: 0, rate: 0 });
  });

  it("lets agents merge only an allowed category with enough merges and few reverts", () => {
    const line = parseMergeLine({
      autoMerge: ["docs"],
      minMerges: 10,
      maxRevertRate: 0.05,
      windowDays: 30,
      countSince: "2026-11-18T00:00:00Z",
    });
    expect(mayAutoMerge(line, "docs", { merges: 20, reverts: 0, rate: 0 })).toBe(true);
    expect(mayAutoMerge(line, "docs", { merges: 5, reverts: 0, rate: 0 })).toBe(false);
    expect(mayAutoMerge(line, "docs", { merges: 20, reverts: 2, rate: 0.1 })).toBe(false);
    expect(mayAutoMerge(line, "tests", { merges: 20, reverts: 0, rate: 0 })).toBe(false);
  });

  it("never lets agents merge code by themselves", () => {
    expect(() =>
      parseMergeLine({
        autoMerge: ["code"],
        minMerges: 1,
        maxRevertRate: 1,
        windowDays: 30,
        countSince: "2026-11-18T00:00:00Z",
      }),
    ).toThrow();
  });
});
