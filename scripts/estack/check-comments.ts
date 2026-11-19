import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface AddedLine {
  path: string;
  line: number;
  text: string;
  carried?: boolean;
}

export interface CommentFinding extends AddedLine {
  comment: string;
}

const SLASH_FILES = /\.(ts|tsx|mts|cts|js|jsx|mjs|cjs|css|swift|kt|go|rs)$/u;
const HASH_FILES = /\.(sh|bash|py|rb|toml)$|(^|\/)(Dockerfile|\.githooks\/[^/]+|bin\/[^/.]+)$/u;

const ALLOWED = [
  /^\/\/\/\s*<reference\s/u,
  /^#!/u,
  /\bbiome-ignore(-all|-start|-end)?\b/u,
  /\beslint-disable(-next-line|-line)?\b/u,
  /@ts-expect-error\b/u,
  /\bprettier-ignore\b/u,
  /@vitest-environment\b/u,
  /@jsxImportSource\b/u,
  /\bshellcheck\s+(disable|source)=/u,
  /\bSPDX-License-Identifier:/u,
  /\bCopyright\b/u,
  /\bRequired Notice:/u,
  /^(\/\/|#|\/\*+|\*)\s*https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/(issues|pull)\/\d+\s*(\*\/)?$/u,
];

export function commentIn(path: string, text: string): string | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  if (SLASH_FILES.test(path)) {
    if (/^(\/\/|\/\*|\*\/?|\{\s*\/\*)/u.test(trimmed)) return trimmed;
    const trailing = /(^|[^:"'`\\/])(\/\/\s.*|\/\*.*\*\/)\s*$/u.exec(text);
    if (trailing?.[2] && !insideString(text, text.lastIndexOf(trailing[2]))) return trailing[2].trim();
    return null;
  }
  if (HASH_FILES.test(path)) {
    if (/^#/u.test(trimmed)) return trimmed;
    const trailing = /\s(#\s.*)$/u.exec(text);
    if (trailing?.[1] && !insideString(text, text.lastIndexOf(trailing[1]))) return trailing[1].trim();
  }
  return null;
}

function insideString(text: string, index: number): boolean {
  let quote: string | null = null;
  for (let i = 0; i < index; i += 1) {
    const char = text[i];
    if (char === "\\") {
      i += 1;
      continue;
    }
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'" || char === "`") {
      quote = char;
    }
  }
  return quote !== null;
}

export function findComments(
  lines: readonly AddedLine[],
  allowlist: ReadonlySet<string> = new Set(),
): CommentFinding[] {
  return lines.flatMap((added) => {
    if (added.carried) return [];
    const comment = commentIn(added.path, added.text);
    if (!comment || ALLOWED.some((pattern) => pattern.test(comment))) return [];
    if (allowlist.has(`${added.path}:${comment}`)) return [];
    return [{ ...added, comment }];
  });
}

const FORMER_NAME = ["open", "bot"].join("");

export function sameAfterRename(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replaceAll(`nightly-labs/${FORMER_NAME}`, "estack/estack")
    .replaceAll(`${FORMER_NAME}.run`, "estack.invalid")
    .replaceAll(FORMER_NAME, "estack");
}

export function parseAddedLines(diff: string): AddedLine[] {
  const added: AddedLine[] = [];
  const removed = new Set<string>();
  let path: string | null = null;
  let inHeader = false;
  let next = 0;
  for (const line of diff.split("\n")) {
    if (line.startsWith("diff --git ")) {
      inHeader = true;
      path = null;
    } else if (inHeader && line.startsWith("+++ ")) {
      path = line === "+++ /dev/null" ? null : line.replace(/^\+\+\+ b\//u, "");
    } else if (line.startsWith("@@")) {
      inHeader = false;
      next = Number(/\+(\d+)/u.exec(line)?.[1] ?? 0);
    } else if (inHeader) {
    } else if (line.startsWith("-")) {
      removed.add(sameAfterRename(line.slice(1)));
    } else if (path && line.startsWith("+")) {
      added.push({ path, line: next, text: line.slice(1) });
      next += 1;
    } else if (path && !line.startsWith("\\")) {
      next += 1;
    }
  }
  return added.map((line) => (removed.has(sameAfterRename(line.text)) ? { ...line, carried: true } : line));
}

function readAllowlist(root: string): Set<string> {
  const file = join(root, "estack", "checks", "comment-allowlist.txt");
  if (!existsSync(file)) return new Set();
  return new Set(
    readFileSync(file, "utf8")
      .split("\n")
      .map((entry) => entry.trim())
      .filter((entry) => entry !== "" && !entry.startsWith("#")),
  );
}

/** Vendored third-party code. estack's comment rules apply to estack-written lines, not to it. */
export const VENDORED_PATHS = ["packages/bloub"];

function main(argv: readonly string[]): 0 | 1 | 2 {
  const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  const baseIndex = argv.indexOf("--base");
  const staged = argv.includes("--staged");
  if (!staged && baseIndex < 0) {
    process.stderr.write("使い方: bun scripts/estack/check-comments.ts --staged | --base <ref>\n");
    return 2;
  }
  if (staged && existsSync(join(root, ".git", "MERGE_HEAD"))) {
    process.stdout.write("マージのコミットなので、コメントの検査は飛ばします（upstream の取り込みを含むため）。\n");
    return 0;
  }
  const range = staged ? ["--cached"] : [`${argv[baseIndex + 1]}...HEAD`];
  const diff = execFileSync(
    "git",
    [
      "-c",
      "core.quotePath=false",
      "diff",
      "-U0",
      "--no-color",
      ...range,
      "--",
      ".",
      ...VENDORED_PATHS.map((path) => `:(exclude)${path}`),
    ],
    {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  const findings = findComments(parseAddedLines(diff), readAllowlist(root));
  if (findings.length === 0) return 0;
  process.stderr.write(
    [
      "estack ではコメントを書きません（estack/計画.md「作り方の芯」の 3）。",
      "なぜそうしたかは名前・型・試験で表し、経緯や持ち主の言葉はコミットの文に書いてください。",
      "どうしても残す物（外の仕様の注意など）は、持ち主の承認を得て estack/checks/comment-allowlist.txt に「パス:コメント」で足します。",
      "",
      ...findings.map((finding) => `${finding.path}:${finding.line}: ${finding.comment}`),
      "",
    ].join("\n"),
  );
  return 1;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
