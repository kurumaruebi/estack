import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BUDGET_PATH, CONTEXT_FILE, contextProblems, parseBudget } from "./check-agent-context";

const budget = parseBudget({ newFileMax: 4096, files: { "AGENTS.md": 24024, "src/main/AGENTS.md": 8243 } });

describe("agent context budget", () => {
  it("passes when every file is at its budget", () => {
    expect(contextProblems({ "AGENTS.md": 24024, "src/main/AGENTS.md": 8000 }, budget, budget)).toEqual([]);
  });

  it("stops AGENTS.md from growing past its budget and says how to cut it", () => {
    const problems = contextProblems({ "AGENTS.md": 24500, "src/main/AGENTS.md": 8243 }, budget, budget);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("AGENTS.md が 24500 バイト");
    expect(problems[0]).toContain(".agents/skills/");
  });

  it("stops a raised budget against the base", () => {
    const raised = parseBudget({ newFileMax: 4096, files: { "AGENTS.md": 30000, "src/main/AGENTS.md": 8243 } });
    expect(contextProblems({ "AGENTS.md": 29000, "src/main/AGENTS.md": 8243 }, raised, budget)).toEqual([
      expect.stringContaining("24024 から 30000 に上がりました"),
    ]);
  });

  it("asks to lower the budget after a file got much smaller, so the cut stays", () => {
    expect(contextProblems({ "AGENTS.md": 20000, "src/main/AGENTS.md": 8243 }, budget, budget)).toEqual([
      expect.stringContaining("24024 を 20000 に下げて"),
    ]);
  });

  it("needs a small budget for a new agent context file", () => {
    expect(
      contextProblems({ "AGENTS.md": 24024, "src/main/AGENTS.md": 8243, "apps/x/CLAUDE.md": 100 }, budget, budget),
    ).toEqual([expect.stringContaining("apps/x/CLAUDE.md（100 バイト）")]);
    const big = parseBudget({ ...budget, files: { ...budget.files, "apps/x/CLAUDE.md": 9000 } });
    expect(
      contextProblems({ "AGENTS.md": 24024, "src/main/AGENTS.md": 8243, "apps/x/CLAUDE.md": 9000 }, big, budget),
    ).toEqual([expect.stringContaining("4096 バイト以下")]);
  });

  it("matches only the files that agents read every time", () => {
    expect(CONTEXT_FILE.test("AGENTS.md")).toBe(true);
    expect(CONTEXT_FILE.test("src/main/CLAUDE.md")).toBe(true);
    expect(CONTEXT_FILE.test("docs/architecture/agents.md")).toBe(false);
  });

  it("reads the budget of this repository", () => {
    expect(parseBudget(JSON.parse(readFileSync(BUDGET_PATH, "utf8"))).files["AGENTS.md"]).toBeGreaterThan(0);
  });
});
