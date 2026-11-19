import { type DynamicRecord, isDynamicRecord, isNumber, isString } from "@estack/contracts/runtime-values";

export const CODING_CLIS = ["claude", "codex", "opencode"] as const;
export type CodingCli = (typeof CODING_CLIS)[number];

export interface Brief {
  goal: string;
  doneWhen: string;
  evidence: string;
  known: string;
  constraints: string;
}

export interface CodeJob {
  kind: "code";
  id: string;
  createdAt: string;
  requestedBy: string;
  brief: Brief;
  cli: CodingCli;
  model: string | null;
  followUpOf: string | null;
}

export interface MergeJob {
  kind: "merge";
  id: string;
  createdAt: string;
  requestedBy: string;
  codeJobId: string;
  pr: number;
  approval: string;
}

export type Job = CodeJob | MergeJob;

export const RESULT_STATES = ["pr-opened", "merged", "failed", "blocked"] as const;
export type ResultState = (typeof RESULT_STATES)[number];

export interface JobResult {
  id: string;
  state: ResultState;
  finishedAt: string;
  summary: string;
  branch: string | null;
  pr: { number: number; url: string } | null;
  evidence: string[];
  review: string | null;
}

const JOB_ID = /^[a-z0-9][a-z0-9-]{5,63}$/u;

export function isJobId(value: unknown): value is string {
  return isString(value) && JOB_ID.test(value);
}

export function newJobId(now: Date, random: string): string {
  const stamp = now.toISOString().replaceAll(/[-:T]/gu, "").slice(0, 14);
  return `${stamp}-${random
    .toLowerCase()
    .replaceAll(/[^a-z0-9]/gu, "")
    .slice(0, 6)}`;
}

function isText(value: unknown, max: number): value is string {
  return isString(value) && value.trim() !== "" && value.length <= max;
}

function optionalText(value: unknown, max: number): string | null {
  return isString(value) && value.length <= max ? value : null;
}

function readBrief(value: unknown): Brief | null {
  if (!isDynamicRecord(value)) return null;
  const known = optionalText(value.known, 4000);
  const constraints = optionalText(value.constraints, 2000);
  if (!isText(value.goal, 2000) || !isText(value.doneWhen, 2000) || !isText(value.evidence, 1000)) return null;
  if (known === null || constraints === null) return null;
  return { goal: value.goal, doneWhen: value.doneWhen, evidence: value.evidence, known, constraints };
}

export function parseJob(value: unknown): Job | null {
  if (!isDynamicRecord(value) || !isJobId(value.id) || !isString(value.createdAt) || !isString(value.requestedBy))
    return null;
  const common = { id: value.id, createdAt: value.createdAt, requestedBy: value.requestedBy };
  if (value.kind === "code") {
    const brief = readBrief(value.brief);
    const cli = CODING_CLIS.find((name) => name === value.cli);
    if (!brief || !cli) return null;
    const model =
      value.model === null
        ? null
        : isString(value.model) && /^[A-Za-z0-9._:/-]{1,80}$/u.test(value.model)
          ? value.model
          : undefined;
    const followUpOf = value.followUpOf === null ? null : isJobId(value.followUpOf) ? value.followUpOf : undefined;
    if (model === undefined || followUpOf === undefined) return null;
    return { kind: "code", ...common, brief, cli, model, followUpOf };
  }
  if (value.kind === "merge") {
    if (!isJobId(value.codeJobId) || !isNumber(value.pr) || !Number.isInteger(value.pr) || value.pr < 1) return null;
    if (!isText(value.approval, 500)) return null;
    return { kind: "merge", ...common, codeJobId: value.codeJobId, pr: value.pr, approval: value.approval };
  }
  return null;
}

export function parseResult(value: unknown): JobResult | null {
  if (!isDynamicRecord(value) || !isJobId(value.id) || !isString(value.finishedAt) || !isString(value.summary))
    return null;
  const state = RESULT_STATES.find((name) => name === value.state);
  const branch = value.branch === null ? null : isString(value.branch) ? value.branch : undefined;
  const pr =
    value.pr === null
      ? null
      : isDynamicRecord(value.pr) && isNumber(value.pr.number) && isString(value.pr.url)
        ? { number: value.pr.number, url: value.pr.url }
        : undefined;
  const review = value.review === null ? null : isString(value.review) ? value.review : undefined;
  if (!state || branch === undefined || pr === undefined || review === undefined) return null;
  if (!Array.isArray(value.evidence) || !value.evidence.every(isString)) return null;
  return {
    id: value.id,
    state,
    finishedAt: value.finishedAt,
    summary: value.summary,
    branch,
    pr,
    evidence: value.evidence,
    review,
  };
}

export function briefPrompt(job: CodeJob): string {
  const { brief } = job;
  return [
    "You work on the estack repository in this git worktree. Do the task below.",
    "",
    `Goal: ${brief.goal}`,
    `Done when: ${brief.doneWhen}`,
    `Evidence to show: ${brief.evidence}`,
    ...(brief.known.trim() ? [`Known: ${brief.known}`] : []),
    ...(brief.constraints.trim() ? [`Constraints: ${brief.constraints}`] : []),
    "",
    "Rules:",
    "- Read AGENTS.md first. Follow .agents/skills/verify-estack/SKILL.md for the evidence.",
    "- Make small commits on the current branch. The worker runs the checks after your session. Do not push, merge, or open a pull request: the worker does that.",
    "- Do not add comments that tell history, dates, or reasons for a change. Put those in the commit message.",
    "- When you finish, write .estack-build/report.md: what changed, how you checked it, and what you could not check.",
  ].join("\n");
}

export interface CheckRun {
  name: string;
  status: string;
  conclusion: string | null;
}

export type CiVerdict = "green" | "pending" | "red" | "none";

export function ciVerdict(runs: readonly CheckRun[]): CiVerdict {
  if (runs.length === 0) return "none";
  if (
    runs.some((run) => run.status === "completed" && !["success", "skipped", "neutral"].includes(run.conclusion ?? ""))
  )
    return "red";
  if (runs.some((run) => run.status !== "completed")) return "pending";
  return "green";
}

export function secretInText(text: string, secret: string, window = 24): boolean {
  const compact = secret.replaceAll(/\s/gu, "");
  if (compact.length < window) return compact !== "" && text.includes(compact);
  for (let start = 0; start + window <= compact.length; start += window) {
    if (text.includes(compact.slice(start, start + window))) return true;
  }
  return false;
}

export const VERIFY_ACTIONS = ["snapshot", "click", "type", "screenshot"] as const;
export type VerifyAction = (typeof VERIFY_ACTIONS)[number];

export interface VerifyStep {
  action: VerifyAction;
  role?: string;
  name?: string;
  text?: string;
  waitFor?: string;
  out?: string;
  expect?: string;
}

export function parseVerifyPlan(value: unknown): VerifyStep[] | null {
  if (!isDynamicRecord(value) || !Array.isArray(value.steps) || value.steps.length > 40) return null;
  const steps: VerifyStep[] = [];
  for (const step of value.steps) {
    if (!isDynamicRecord(step)) return null;
    const action = VERIFY_ACTIONS.find((name) => name === step.action);
    if (!action) return null;
    const read = (key: string): string | undefined | null => {
      const field = step[key];
      if (field === undefined) return undefined;
      return isString(field) && field.length <= 500 ? field : null;
    };
    const parsed: VerifyStep = { action };
    for (const key of ["role", "name", "text", "waitFor", "expect", "out"] as const) {
      const field = read(key);
      if (field === null) return null;
      if (field !== undefined) parsed[key] = field;
    }
    if (parsed.out !== undefined && !/^[a-z0-9-]{1,40}\.png$/u.test(parsed.out)) return null;
    if ((action === "click" || action === "type") && (parsed.role === undefined || parsed.name === undefined))
      return null;
    if (action === "type" && parsed.text === undefined) return null;
    if (action === "screenshot" && parsed.out === undefined) return null;
    steps.push(parsed);
  }
  return steps;
}

export function automationArguments(step: VerifyStep): string[] {
  const wait = step.waitFor ? [`--wait-for=${step.waitFor}`] : [];
  switch (step.action) {
    case "snapshot":
      return ["snapshot", ...wait];
    case "screenshot":
      return ["screenshot", `--out=${step.out}`];
    case "click":
      return ["click", `--role=${step.role}`, `--name=${step.name}`, "--allow-mutations", ...wait];
    case "type":
      return [
        "type",
        `--role=${step.role}`,
        `--name=${step.name}`,
        `--text=${step.text}`,
        "--allow-mutations",
        ...wait,
      ];
  }
}

export function recordAt(value: unknown, ...path: string[]): DynamicRecord | null {
  let current = value;
  for (const key of path) {
    if (!isDynamicRecord(current)) return null;
    current = current[key];
  }
  return isDynamicRecord(current) ? current : null;
}

export function stringAt(value: unknown, ...path: string[]): string | null {
  const parent = recordAt(value, ...path.slice(0, -1));
  const field = parent?.[path.at(-1) ?? ""];
  return isString(field) ? field : null;
}

export function numberAt(value: unknown, ...path: string[]): number | null {
  const parent = recordAt(value, ...path.slice(0, -1));
  const field = parent?.[path.at(-1) ?? ""];
  return isNumber(field) ? field : null;
}

export function checkRunsOf(value: unknown): CheckRun[] {
  const runs = recordAt(value)?.check_runs;
  if (!Array.isArray(runs)) return [];
  return runs.flatMap((run: unknown) => {
    const name = stringAt(run, "name");
    const status = stringAt(run, "status");
    return name !== null && status !== null ? [{ name, status, conclusion: stringAt(run, "conclusion") }] : [];
  });
}

export const SESSION_GIT_ENVIRONMENT = {
  GIT_CONFIG_COUNT: "1",
  GIT_CONFIG_KEY_0: "core.hooksPath",
  GIT_CONFIG_VALUE_0: "/dev/null",
} as const;

export function summaryLine(summary: string): string {
  return (
    summary
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line !== "" && !line.startsWith("#") && !line.startsWith("|") && !line.startsWith("```")) ?? ""
  ).slice(0, 300);
}

export function keyInText(text: string, pem: string, stored: string): boolean {
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/u.test(text)) return true;
  const body = pem
    .split("\n")
    .filter((line) => !line.startsWith("-----"))
    .join("");
  const compact = text.replaceAll(/\s/gu, "");
  return secretInText(compact, body) || secretInText(compact.toLowerCase(), stored.toLowerCase());
}

export function reviewHasFindings(review: string): boolean {
  const text = review.trim();
  if (text === "") return false;
  return !/^\W*no findings\W*$/iu.test(
    text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .at(-1) ?? "",
  );
}

export function reviewFixPrompt(review: string): string {
  return [
    "A reviewer from another model family read your change. Fix each finding that you can prove from the code, then commit.",
    'Do not accept a finding only because it was written. For a finding that is wrong, do not change the code: add a short reason under the heading "## Review replies" in .estack-build/report.md.',
    "",
    review.slice(0, 20_000),
  ].join("\n");
}
