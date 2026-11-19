import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { grepArguments, PRIVATE_PATHS, readPatterns } from "./check-personal";

export const EXPORT_EXCLUDES: readonly string[] = [...PRIVATE_PATHS];
export const ALLOWLIST_PATH = "estack/checks/public-export-allowlist.txt";
export const COMMIT_MESSAGE = "estack を公開する";
export const PUBLIC_REPOSITORY_URL = "https://github.com/kurumaruebi/estack.git";

export interface Author {
  name: string;
  email: string;
}

export interface LeakFinding {
  file: string;
  ruleId: string;
  line: number;
}

export function isExcluded(path: string, excludes: readonly string[] = EXPORT_EXCLUDES): boolean {
  const clean = path.replace(/^\.\//u, "").replace(/\/+$/u, "");
  return excludes.some((exclude) => clean === exclude || clean.startsWith(`${exclude}/`));
}

export function noticeProblems(files: { license: string | null; notice: string | null }): string[] {
  const problems: string[] = [];
  if (files.license === null) problems.push("LICENSE がありません。");
  if (files.notice === null) problems.push("NOTICE がありません。");
  const lines = [files.license ?? "", files.notice ?? ""].flatMap((text) => text.split("\n"));
  if (!lines.some((line) => line.startsWith("Required Notice:"))) {
    problems.push("`Required Notice:` で始まる行がありません。");
  }
  return problems;
}

export function parseAuthor(text: string | undefined): Author | null {
  const match = /^\s*([^<>]+?)\s*<([^<>\s]+@[^<>\s]+)>\s*$/u.exec(text ?? "");
  if (!match?.[1] || !match[2]) return null;
  return { name: match[1], email: match[2] };
}

export function parseAllowlist(text: string): Set<string> {
  return new Set(
    text
      .split("\n")
      .map((line) => line.trim().split(/\s+/u).join(" "))
      .filter((line) => line !== "" && !line.startsWith("#")),
  );
}

interface GitleaksEntry {
  File?: string;
  RuleID?: string;
  StartLine?: number;
}

export function parseGitleaksReport(text: string): LeakFinding[] {
  const report = JSON.parse(text === "" ? "[]" : text) satisfies unknown;
  if (!Array.isArray(report)) return [];
  return report.map((entry: GitleaksEntry) => ({
    file: (entry.File ?? "").replace(/^\.\//u, ""),
    ruleId: entry.RuleID ?? "",
    line: entry.StartLine ?? 0,
  }));
}

export function unexpectedFindings(findings: readonly LeakFinding[], allowlist: ReadonlySet<string>): LeakFinding[] {
  return findings.filter((finding) => !allowlist.has(`${finding.file} ${finding.ruleId}`));
}

function readOptional(path: string): string | null {
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

function option(argv: readonly string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

function copyTree(root: string, ref: string, target: string): void {
  const archive = spawnSync("git", ["archive", "--format=tar", ref], {
    cwd: root,
    maxBuffer: 4 * 1024 * 1024 * 1024,
  });
  if (archive.status !== 0) throw new Error(`git archive ${ref} に失敗しました: ${archive.stderr.toString()}`);
  const extract = spawnSync("tar", ["-x", "-f", "-", "-C", target], { input: archive.stdout });
  if (extract.status !== 0) throw new Error(`展開に失敗しました: ${extract.stderr.toString()}`);
  for (const exclude of EXPORT_EXCLUDES) rmSync(join(target, exclude), { recursive: true, force: true });
}

function scanLeaks(target: string): LeakFinding[] | null {
  if (spawnSync("gitleaks", ["version"]).status !== 0) return null;
  const reportFolder = mkdtempSync(join(tmpdir(), "estack-gitleaks-"));
  const report = join(reportFolder, "report.json");
  try {
    const scan = spawnSync(
      "gitleaks",
      ["dir", ".", "--no-banner", "--redact", "--report-format", "json", "--report-path", report, "--exit-code", "0"],
      { cwd: target, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
    );
    if (scan.status !== 0) throw new Error(`gitleaks に失敗しました: ${scan.stderr}`);
    return parseGitleaksReport(readFileSync(report, "utf8"));
  } finally {
    rmSync(reportFolder, { recursive: true, force: true });
  }
}

function personalFindings(target: string): string[] | null {
  const patterns = readPatterns();
  if (patterns.length === 0) return null;
  const result = spawnSync(
    "git",
    ["-c", "core.quotePath=false", "grep", "-l", ...grepArguments(patterns, true).slice(1)],
    {
      cwd: target,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  if (result.status === 1) return [];
  if (result.status !== 0) throw new Error(`個人の値の検査に失敗しました: ${result.stderr}`);
  return result.stdout.split("\n").filter(Boolean);
}

function git(target: string, args: readonly string[], author?: Author): string {
  return execFileSync("git", ["-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", ...args], {
    cwd: target,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    env: author
      ? {
          ...process.env,
          GIT_AUTHOR_NAME: author.name,
          GIT_AUTHOR_EMAIL: author.email,
          GIT_COMMITTER_NAME: author.name,
          GIT_COMMITTER_EMAIL: author.email,
        }
      : process.env,
  }).trim();
}

function main(argv: readonly string[]): 0 | 1 | 2 {
  const targetArgument = argv[0];
  const ref = option(argv, "--ref") ?? "HEAD";
  const author = parseAuthor(option(argv, "--author") ?? process.env.ESTACK_PUBLIC_AUTHOR);
  if (!targetArgument || targetArgument.startsWith("--") || !author) {
    process.stderr.write(
      '使い方: bun scripts/estack/export-public.ts <書き出す先> [--ref <参照>] --author "<名前> <<noreply のアドレス>>"\n',
    );
    return 2;
  }
  const target = resolve(targetArgument);
  if (existsSync(target) && readdirSync(target).length > 0) {
    process.stderr.write(`書き出す先 ${target} が空ではありません。\n`);
    return 2;
  }
  const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  mkdirSync(target, { recursive: true });
  copyTree(root, ref, target);

  const failures: string[] = [];
  failures.push(
    ...noticeProblems({ license: readOptional(join(target, "LICENSE")), notice: readOptional(join(target, "NOTICE")) }),
  );

  const leaks = scanLeaks(target);
  const allowlist = parseAllowlist(readOptional(join(target, ALLOWLIST_PATH)) ?? "");
  const unexpected = leaks === null ? [] : unexpectedFindings(leaks, allowlist);
  if (leaks === null) process.stdout.write("gitleaks が無いので、鍵の検査は飛ばしました。\n");
  else process.stdout.write(`gitleaks: ${leaks.length} 件（許可の一覧のほか ${unexpected.length} 件）\n`);
  failures.push(...unexpected.map((finding) => `鍵に見える物: ${finding.file}:${finding.line} ${finding.ruleId}`));

  git(target, ["init", "-q", "-b", "main"]);
  git(target, ["add", "-A", "-f", "."]);
  const personal = personalFindings(target);
  if (personal === null) failures.push("個人の値の一覧（~/.config/estack/personal-patterns.txt）がありません。");
  else failures.push(...personal.map((path) => `個人の値: ${path}`));

  const files = git(target, ["ls-files", "-z"]).split("\u0000").filter(Boolean).length;
  process.stdout.write(`ファイル: ${files}\n`);
  if (failures.length > 0) {
    process.stderr.write(["書き出しを止めました（コミットは作っていません）。", ...failures, ""].join("\n"));
    return 1;
  }
  git(target, ["commit", "-q", "-m", COMMIT_MESSAGE], author);
  const commit = git(target, ["rev-parse", "HEAD"]);
  process.stdout.write(
    [
      `書き出しました: ${target}（${commit}、作者 ${author.name} <${author.email}>）`,
      "push はしていません。書き出した場所からだけ、この手順で push します（ほかのチェックアウトから打たない）:",
      `  cd ${target}`,
      `  git remote add origin ${PUBLIC_REPOSITORY_URL}`,
      "  git push -u origin main",
      "",
    ].join("\n"),
  );
  return 0;
}

if (import.meta.main) process.exit(main(process.argv.slice(2)));
