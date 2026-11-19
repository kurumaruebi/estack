import { describe, expect, it } from "vitest";
import {
  autoMergeCategory,
  isProtectedPath,
  mayAutoMerge,
  parseMergeLine,
  prCategory,
  readMergeLine,
  revertStats,
} from "./merge-line";

const now = new Date("2026-12-19T00:00:00Z");
const day = (n: number) => new Date(now.getTime() - n * 86_400_000);

describe("merge line", () => {
  const base = {
    maxChangedLines: 200,
    maxFiles: 5,
    minMerges: 10,
    maxRevertRate: 0.05,
    windowDays: 30,
    countSince: "2026-11-18T00:00:00Z",
  };

  it("lets agents merge only small docs and tests changes by themselves, never code", () => {
    const line = readMergeLine();
    expect(line.autoMerge).toEqual(["docs", "tests"]);
    expect(line.maxChangedLines).toBeLessThanOrEqual(200);
    expect(line.maxFiles).toBeLessThanOrEqual(5);
    expect(line.minMerges).toBeGreaterThanOrEqual(10);
  });

  it("refuses a merge line that loosens the hard limits", () => {
    expect(() => parseMergeLine({ ...base, autoMerge: ["docs"], maxChangedLines: 5000 })).toThrow();
    expect(() => parseMergeLine({ ...base, autoMerge: ["docs"], maxFiles: 50 })).toThrow();
    expect(() => parseMergeLine({ ...base, autoMerge: ["docs"], minMerges: 1 })).toThrow();
    expect(() => parseMergeLine({ ...base, autoMerge: ["docs"], maxRevertRate: 0.5 })).toThrow();
  });

  it("treats a change to the guards, the worker, the rules or the agent files as code", () => {
    const file = (filename: string) => ({ filename, additions: 1, deletions: 0 });
    const line = parseMergeLine({ ...base, autoMerge: ["docs", "tests"] });
    for (const path of [
      "estack/checks/merge-line.json",
      "estack/bin/deploy-vps",
      "scripts/estack/mac-worker.ts",
      "scripts/estack/merge-line.test.ts",
      "estack/決まりと止める仕組み.md",
      "estack/agents/不具合係.md",
      "AGENTS.md",
      "src/main/AGENTS.md",
      ".github/workflows/estack-ci.yml",
      ".agents/skills/correct/SKILL.md",
      "estack/models/MergeLoop.tla",
    ]) {
      expect(isProtectedPath(path)).toBe(true);
      expect(autoMergeCategory([file(path)], line)).toBe("code");
    }
    expect(autoMergeCategory([file("docs/guide.md")], line)).toBe("docs");
    expect(autoMergeCategory([file("src/renderer/a.test.ts")], line)).toBe("tests");
  });

  it("treats a large docs or tests change as code", () => {
    const line = parseMergeLine({ ...base, autoMerge: ["docs"] });
    expect(autoMergeCategory([{ filename: "docs/a.md", additions: 150, deletions: 60 }], line)).toBe("code");
    const many = Array.from({ length: 6 }, (_, index) => ({
      filename: `docs/${index}.md`,
      additions: 1,
      deletions: 0,
    }));
    expect(autoMergeCategory(many, line)).toBe("code");
    expect(autoMergeCategory([], line)).toBe("code");
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
    const line = parseMergeLine({ ...base, autoMerge: ["docs"] });
    expect(mayAutoMerge(line, "docs", { merges: 20, reverts: 0, rate: 0 })).toBe(true);
    expect(mayAutoMerge(line, "docs", { merges: 5, reverts: 0, rate: 0 })).toBe(false);
    expect(mayAutoMerge(line, "docs", { merges: 20, reverts: 2, rate: 0.1 })).toBe(false);
    expect(mayAutoMerge(line, "tests", { merges: 20, reverts: 0, rate: 0 })).toBe(false);
  });

  it("never lets agents merge code by themselves", () => {
    expect(() => parseMergeLine({ ...base, autoMerge: ["code"] })).toThrow();
  });
});
