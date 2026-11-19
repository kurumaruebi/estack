import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDynamicRecord, isNumber, isString } from "@estack/contracts/runtime-values";

export const PR_CATEGORIES = ["docs", "tests", "code"] as const;
export type PrCategory = (typeof PR_CATEGORIES)[number];

export interface MergeLine {
  autoMerge: PrCategory[];
  minMerges: number;
  maxRevertRate: number;
  windowDays: number;
  countSince: Date;
}

export interface MainCommit {
  subject: string;
  time: Date;
}

export interface RevertStats {
  merges: number;
  reverts: number;
  rate: number;
}

const policyPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "estack", "checks", "merge-line.json");

export function parseMergeLine(value: unknown): MergeLine {
  if (
    !isDynamicRecord(value) ||
    !Array.isArray(value.autoMerge) ||
    !isNumber(value.minMerges) ||
    !isNumber(value.maxRevertRate) ||
    !isNumber(value.windowDays) ||
    !isString(value.countSince) ||
    Number.isNaN(Date.parse(value.countSince))
  )
    throw new Error("estack/checks/merge-line.json is not valid.");
  const autoMerge = value.autoMerge.map((category: unknown) => {
    const found = PR_CATEGORIES.find((name) => name === category);
    if (!found || found === "code")
      throw new Error(`A category that agents may merge must be docs or tests: ${String(category)}`);
    return found;
  });
  return {
    autoMerge,
    minMerges: value.minMerges,
    maxRevertRate: value.maxRevertRate,
    windowDays: value.windowDays,
    countSince: new Date(value.countSince),
  };
}

export function readMergeLine(path = process.env.ESTACK_MERGE_LINE_FILE ?? policyPath): MergeLine {
  return parseMergeLine(JSON.parse(readFileSync(path, "utf8")));
}

export function prCategory(paths: readonly string[]): PrCategory {
  if (paths.length === 0) return "code";
  if (paths.every((path) => /\.test\.tsx?$/u.test(path))) return "tests";
  if (paths.every((path) => path.endsWith(".md") && !path.startsWith(".agents/") && !path.startsWith(".github/")))
    return "docs";
  return "code";
}

export function revertStats(
  commits: readonly MainCommit[],
  now: Date,
  windowDays: number,
  countSince = new Date(0),
): RevertStats {
  const since = Math.max(now.getTime() - windowDays * 86_400_000, countSince.getTime());
  const recent = commits.filter((commit) => commit.time.getTime() >= since);
  const reverts = recent.filter((commit) => /^Revert\b/u.test(commit.subject)).length;
  const merges = recent.filter((commit) => /\(#\d+\)$/u.test(commit.subject)).length;
  return { merges, reverts, rate: merges === 0 ? 0 : reverts / merges };
}

export function mayAutoMerge(line: MergeLine, category: PrCategory, stats: RevertStats): boolean {
  return line.autoMerge.includes(category) && stats.merges >= line.minMerges && stats.rate <= line.maxRevertRate;
}

export function mainCommits(repository: string, ref = "origin/main"): MainCommit[] {
  return execFileSync("git", ["log", "--format=%cI%x09%s", "-n", "2000", ref], { cwd: repository, encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      const [time = "", ...subject] = line.split("\t");
      const parsed = new Date(time);
      return Number.isNaN(parsed.getTime()) ? [] : [{ subject: subject.join("\t"), time: parsed }];
    });
}

if (import.meta.main) {
  const line = readMergeLine();
  const ref = isString(process.argv[2]) ? process.argv[2] : "origin/main";
  const stats = revertStats(mainCommits(process.cwd(), ref), new Date(), line.windowDays, line.countSince);
  process.stdout.write(
    `${JSON.stringify({ line, stats, agentsMayMerge: PR_CATEGORIES.filter((category) => mayAutoMerge(line, category, stats)) }, null, 2)}\n`,
  );
}
