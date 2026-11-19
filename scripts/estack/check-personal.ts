import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const PRIVATE_PATHS = ["estack/非公開"];

export function readPatterns(environment: NodeJS.ProcessEnv = process.env): string[] {
  const inline = environment.ESTACK_PERSONAL_PATTERNS;
  const file =
    environment.ESTACK_PERSONAL_PATTERNS_FILE ?? join(homedir(), ".config", "estack", "personal-patterns.txt");
  const text = inline ?? (existsSync(file) ? readFileSync(file, "utf8") : "");
  return text
    .split("\n")
    .map((pattern) => pattern.trim())
    .filter((pattern) => pattern !== "" && !pattern.startsWith("#"));
}

export function grepArguments(patterns: readonly string[], staged: boolean): string[] {
  return [
    "grep",
    "-n",
    "-I",
    "-i",
    "-F",
    ...(staged ? ["--cached"] : []),
    ...patterns.flatMap((pattern) => ["-e", pattern]),
    "--",
    ".",
    ...PRIVATE_PATHS.map((path) => `:(exclude)${path}`),
  ];
}

export function personalLines(text: string, patterns: readonly string[]): number[] {
  const needles = patterns.map((pattern) => pattern.toLowerCase());
  return text
    .split("\n")
    .flatMap((line, index) => (needles.some((needle) => line.toLowerCase().includes(needle)) ? [index + 1] : []));
}

export function addedLines(diff: string): string {
  return diff
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++ "))
    .map((line) => line.slice(1))
    .join("\n");
}

async function checkStdin(patterns: readonly string[]): Promise<0 | 1> {
  const lines = personalLines(await Bun.stdin.text(), patterns);
  if (lines.length === 0) return 0;
  process.stderr.write(
    `個人の値（名前・アドレス・番号など）が文に入っています（${lines.length} 行: ${lines.slice(0, 20).join(", ")} 行目）。PR の題・本文・コミットの文から外してください。\n`,
  );
  return 1;
}

async function main(argv: readonly string[]): Promise<0 | 1 | 2> {
  const staged = argv.includes("--staged");
  const stdin = argv.includes("--stdin");
  if (!staged && !stdin && !argv.includes("--all")) {
    process.stderr.write("使い方: bun scripts/estack/check-personal.ts --staged | --all | --stdin\n");
    return 2;
  }
  const patterns = readPatterns();
  if (patterns.length === 0) {
    process.stdout.write(
      "個人の値の一覧が無いので、個人の値の検査は飛ばします（~/.config/estack/personal-patterns.txt）。\n",
    );
    return 0;
  }
  if (stdin) return checkStdin(patterns);
  const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  const result = spawnSync("git", ["-c", "core.quotePath=false", ...grepArguments(patterns, staged)], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status === 1) return 0;
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    return 2;
  }
  const places = result.stdout
    .split("\n")
    .filter(Boolean)
    .map((line) =>
      line
        .split(":")
        .slice(0, staged ? 3 : 2)
        .join(":"),
    );
  process.stderr.write(
    [
      "個人の値（名前・アドレス・番号など）がコードや公開する文書に入っています。",
      "個人の値はリポジトリの外の設定（~/.config/estack）から読む形にしてください。個人の文書は estack/非公開/ に置きます（公開の書き出しから外れます）。",
      "",
      ...places,
      "",
    ].join("\n"),
  );
  return 1;
}

if (import.meta.main) process.exit(await main(process.argv.slice(2)));
