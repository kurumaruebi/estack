import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { isDynamicRecord, isNumber } from "@estack/contracts/runtime-values";

export const CONTEXT_FILE = /(^|\/)(AGENTS|CLAUDE|GEMINI)\.md$/u;
export const BUDGET_PATH = "estack/checks/agent-context.json";
export const SLACK_BYTES = 1024;

export interface ContextBudget {
  newFileMax: number;
  files: Record<string, number>;
}

export function parseBudget(value: unknown): ContextBudget {
  if (!isDynamicRecord(value) || !isNumber(value.newFileMax) || !isDynamicRecord(value.files))
    throw new Error(`${BUDGET_PATH} is not valid.`);
  const files: Record<string, number> = {};
  for (const [path, bytes] of Object.entries(value.files)) {
    if (!isNumber(bytes) || !CONTEXT_FILE.test(path)) throw new Error(`${BUDGET_PATH} has a bad entry: ${path}`);
    files[path] = bytes;
  }
  return { newFileMax: value.newFileMax, files };
}

export function contextProblems(
  sizes: Readonly<Record<string, number>>,
  budget: ContextBudget,
  base: ContextBudget | null,
): string[] {
  const problems: string[] = [];
  for (const [path, size] of Object.entries(sizes)) {
    const limit = budget.files[path];
    if (limit === undefined) {
      problems.push(
        `${path}（${size} バイト）は、毎回読まれる新しい文書なのに ${BUDGET_PATH} に上限がありません。${budget.newFileMax} バイト以下にして、上限を足してください。`,
      );
      continue;
    }
    if (size > limit)
      problems.push(
        `${path} が ${size} バイトで、上限 ${limit} バイトを超えています。上限は上げずに、細かい手順は .agents/skills/ のスキルへ、守らせたい決まりは検査（scripts/estack/）へ移して、文を削ってください。`,
      );
    else if (limit - size > SLACK_BYTES)
      problems.push(
        `${path} は ${size} バイトに減りました。${BUDGET_PATH} の上限 ${limit} を ${size} に下げて、減った分を固定してください。`,
      );
  }
  for (const path of Object.keys(budget.files))
    if (sizes[path] === undefined)
      problems.push(`${path} はもうありません。${BUDGET_PATH} からその行を消してください。`);
  if (base) {
    if (budget.newFileMax > base.newFileMax)
      problems.push(
        `newFileMax が ${base.newFileMax} から ${budget.newFileMax} に上がりました。上限は下げるだけです。`,
      );
    for (const [path, limit] of Object.entries(budget.files)) {
      const before = base.files[path];
      if (before !== undefined && limit > before)
        problems.push(
          `${path} の上限が ${before} から ${limit} に上がりました。上限は下げるだけです。上げずに文を削ってください。`,
        );
      if (before === undefined && limit > budget.newFileMax)
        problems.push(`${path} は新しい文書なので、上限は ${budget.newFileMax} バイト以下にしてください。`);
    }
  }
  return problems;
}

function trackedSizes(): Record<string, number> {
  return Object.fromEntries(
    execFileSync("git", ["-c", "core.quotePath=false", "ls-files"], { encoding: "utf8" })
      .split("\n")
      .filter((path) => CONTEXT_FILE.test(path))
      .flatMap((path) => {
        try {
          return [[path, statSync(path).size] as const];
        } catch {
          return [];
        }
      }),
  );
}

function budgetAt(ref: string): ContextBudget | null {
  try {
    return parseBudget(JSON.parse(execFileSync("git", ["show", `${ref}:${BUDGET_PATH}`], { encoding: "utf8" })));
  } catch {
    return null;
  }
}

function main(argv: readonly string[]): 0 | 1 {
  const baseIndex = argv.indexOf("--base");
  const baseRef = baseIndex >= 0 ? argv[baseIndex + 1] : undefined;
  const budget = parseBudget(JSON.parse(readFileSync(BUDGET_PATH, "utf8")));
  const problems = contextProblems(trackedSizes(), budget, baseRef ? budgetAt(baseRef) : null);
  if (problems.length === 0) return 0;
  process.stderr.write(["エージェントが毎回読む文書（AGENTS.md など）の大きさの検査:", ...problems, ""].join("\n"));
  return 1;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
