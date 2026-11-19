import { execFileSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { PRIVATE_PATHS, readPatterns } from "./check-personal";

export interface HashedPatterns {
  salt: string;
  hashes: Map<number, Set<string>>;
}

const normalize = (text: string): string => text.toLowerCase();

function digest(salt: string, text: string): string {
  return createHash("sha256").update(`${salt}\u0000${text}`).digest("hex");
}

export function hashPatterns(patterns: readonly string[], salt = randomBytes(16).toString("hex")): string {
  const lines = patterns.map((pattern) => {
    const value = normalize(pattern.trim());
    return `${[...value].length} ${digest(salt, value)}`;
  });
  return [salt, ...[...new Set(lines)].sort()].join("\n");
}

export function parseHashedPatterns(text: string): HashedPatterns | null {
  const [salt, ...rows] = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (!salt || !/^[0-9a-f]{16,}$/u.test(salt)) return null;
  const hashes = new Map<number, Set<string>>();
  for (const row of rows) {
    const match = /^(\d+) ([0-9a-f]{64})$/u.exec(row);
    if (!match) return null;
    const length = Number(match[1]);
    if (!hashes.has(length)) hashes.set(length, new Set());
    hashes.get(length)?.add(match[2] ?? "");
  }
  return { salt, hashes };
}

export function findHashed(text: string, patterns: HashedPatterns): number[] {
  const lines: number[] = [];
  text.split("\n").forEach((line, index) => {
    const characters = [...normalize(line)];
    for (const [length, set] of patterns.hashes) {
      for (let start = 0; start + length <= characters.length; start++) {
        if (set.has(digest(patterns.salt, characters.slice(start, start + length).join("")))) {
          lines.push(index + 1);
          return;
        }
      }
    }
  });
  return lines;
}

function changedFiles(base: string): string[] {
  return execFileSync(
    "git",
    ["-c", "core.quotePath=false", "diff", "--name-only", "--diff-filter=ACMR", `${base}...HEAD`],
    {
      encoding: "utf8",
    },
  )
    .split("\n")
    .filter(
      (path) =>
        path !== "" && !PRIVATE_PATHS.some((privatePath) => path === privatePath || path.startsWith(`${privatePath}/`)),
    );
}

function main(argv: readonly string[]): 0 | 1 | 2 {
  if (argv[0] === "make") {
    const patterns = readPatterns();
    if (patterns.length === 0) {
      process.stderr.write("個人の値の一覧（~/.config/estack/personal-patterns.txt）がありません。\n");
      return 2;
    }
    process.stdout.write(`${hashPatterns(patterns)}\n`);
    return 0;
  }
  const baseIndex = argv.indexOf("--base");
  const base = baseIndex >= 0 ? argv[baseIndex + 1] : undefined;
  const patterns = parseHashedPatterns(process.env.ESTACK_PERSONAL_HASHES ?? "");
  if (!base) {
    process.stderr.write("使い方: bun scripts/estack/personal-hashes.ts make | --base <コミット>\n");
    return 2;
  }
  if (!patterns) {
    process.stdout.write("個人の値のハッシュ（ESTACK_PERSONAL_HASHES）が無いので、検査を飛ばします。\n");
    return 0;
  }
  const found = changedFiles(base).flatMap((path) => {
    let text: string;
    try {
      text = readFileSync(path, "utf8");
    } catch {
      return [];
    }
    if (text.includes("\u0000")) return [];
    return findHashed(text, patterns).map((line) => `${path}:${line}`);
  });
  if (found.length === 0) return 0;
  process.stderr.write(
    [
      "個人の値（名前・アドレス・番号など）が、変えたファイルに入っています（値はハッシュでだけ持っているので、場所だけを出します）。",
      ...found,
      "",
    ].join("\n"),
  );
  return 1;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
