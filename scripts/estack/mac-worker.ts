import { type SpawnSyncReturns, spawnSync } from "node:child_process";
import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { addedLines, personalLines, readPatterns } from "./check-personal";
import {
  automationArguments,
  briefPrompt,
  CODING_CLIS,
  type CodeJob,
  checkRunsOf,
  ciVerdict,
  type Job,
  type JobResult,
  keyInText,
  type MergeJob,
  numberAt,
  parseJob,
  parseVerifyPlan,
  recordAt,
  reviewFixPrompt,
  reviewHasFindings,
  SESSION_GIT_ENVIRONMENT,
  stringAt,
  summaryLine,
} from "./coding-jobs";
import { evidenceLines } from "./evidence";
import { clickOutcome, fuzzTargets, pickTarget, seededRandom, targetKey, withoutBlocked } from "./fuzz-ui";
import { type GithubApp, gitAuthArguments, githubApi, ignoreBody, installationToken } from "./github-app";
import { mainCommits, mayAutoMerge, prCategory, readMergeLine, revertStats } from "./merge-line";

export interface WorkerConfig {
  repo: string;
  writerAppId: string;
  writerInstallationId: string;
  keychainService: string;
  queueSsh: string[];
  workRoot: string;
  reviewer: "codex" | "claude";
  allowUnsandboxedClis: boolean;
  codingUser: string | null;
  claudeModel: string | null;
  claudeEffort: ClaudeEffort | null;
}

const CLAUDE_EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;
export type ClaudeEffort = (typeof CLAUDE_EFFORTS)[number];

export function claudeEffortName(value: string | null): ClaudeEffort | null {
  return CLAUDE_EFFORTS.find((effort) => effort === value) ?? null;
}

export function claudeModelName(value: string | null): string | null {
  return value !== null && /^[A-Za-z0-9._:/-]{1,80}$/u.test(value) ? value : null;
}

export function claudeModelArgs(
  jobModel: string | null,
  config: Pick<WorkerConfig, "claudeModel" | "claudeEffort">,
): string[] {
  const model = jobModel ?? config.claudeModel;
  return [...(model ? ["--model", model] : []), ...(config.claudeEffort ? ["--effort", config.claudeEffort] : [])];
}

export interface Session {
  worktree: string;
  branch: string;
  cli: CodeJob["cli"];
  sessionId: string | null;
  pr: number | null;
  title: string | null;
}

const goalTitle = (job: CodeJob): string => job.brief.goal.split("\n")[0]?.slice(0, 70) || job.id;

export function sessionFor(job: CodeJob, previous: Session | undefined, workRoot: string): Session {
  if (previous) return { ...previous, title: previous.title ?? goalTitle(job) };
  return {
    worktree: join(workRoot, "jobs", job.id),
    branch: `estack/${job.id}`,
    cli: job.cli,
    sessionId: null,
    pr: null,
    title: goalTitle(job),
  };
}

export function codingUserName(value: string | null): string | null {
  return value !== null && /^[a-z_][a-z0-9_-]{0,31}$/u.test(value) ? value : null;
}

export function sessionCommand(
  cliPath: string,
  args: readonly string[],
  codingUser: string | null,
  cwd: string,
): [string, string[]] {
  if (codingUser === null) return [cliPath, [...args]];
  const environment = Object.entries(SESSION_GIT_ENVIRONMENT).map(([name, value]) => `${name}=${value}`);
  return [
    "/usr/bin/sudo",
    [
      "-n",
      "-u",
      codingUser,
      "-H",
      "/usr/bin/env",
      ...environment,
      "/bin/zsh",
      "-lc",
      'cd "$1" && shift && token=~/.config/estack/claude-token && if [ -r "$token" ]; then export CLAUDE_CODE_OAUTH_TOKEN="$(cat "$token")"; fi && exec claude "$@"',
      "estack-session",
      cwd,
      ...args,
    ],
  ];
}

const expandHome = (path: string): string => (path.startsWith("~/") ? join(homedir(), path.slice(2)) : path);

function readConfig(): WorkerConfig {
  const value = JSON.parse(readFileSync(join(homedir(), ".config", "estack", "worker.json"), "utf8"));
  const repo = stringAt(value, "repo");
  const writerAppId = stringAt(value, "writerAppId");
  const writerInstallationId = stringAt(value, "writerInstallationId");
  const keychainService = stringAt(value, "keychainService");
  const workRoot = stringAt(value, "workRoot");
  const sshList = recordAt(value)?.queueSsh;
  if (
    repo === null ||
    writerAppId === null ||
    writerInstallationId === null ||
    keychainService === null ||
    workRoot === null ||
    !Array.isArray(sshList) ||
    !sshList.every((part: unknown): part is string => typeof part === "string")
  )
    throw new Error("~/.config/estack/worker.json is not valid.");
  return {
    repo,
    writerAppId,
    writerInstallationId,
    keychainService,
    workRoot: expandHome(workRoot),
    queueSsh: sshList.map(expandHome),
    reviewer: stringAt(value, "reviewer") === "claude" ? "claude" : "codex",
    allowUnsandboxedClis: recordAt(value)?.allowUnsandboxedClis === true,
    codingUser: codingUserName(stringAt(value, "codingUser")),
    claudeModel: claudeModelName(stringAt(value, "claudeModel")),
    claudeEffort: claudeEffortName(stringAt(value, "claudeEffort")),
  };
}

export interface PullState {
  merged: boolean;
  draft: boolean;
  state: string | null;
}

export const PULL_STAGES = ["open", "draft", "merged", "closed"] as const;
export type PullStage = (typeof PULL_STAGES)[number];

export function pullStage(pr: PullState): PullStage {
  if (pr.merged) return "merged";
  if (pr.state !== "open") return "closed";
  return pr.draft ? "draft" : "open";
}

export function sessionIsDone(stage: PullStage): boolean {
  return stage === "merged" || stage === "closed";
}

export function earlyMergeAnswer(stage: PullStage): Pick<JobResult, "state" | "summary"> | null {
  if (stage === "merged")
    return {
      state: "blocked",
      summary: "The pull request was already merged. The worker merged nothing, so nothing is deployed or fuzzed.",
    };
  if (stage !== "open") return { state: "blocked", summary: "The pull request is closed or a draft." };
  return null;
}

export function startsDeploy(result: Pick<JobResult, "state">): boolean {
  return result.state === "merged";
}

function log(text: string): void {
  process.stdout.write(`${new Date().toISOString()} ${text}\n`);
}

function run(
  command: string,
  args: readonly string[],
  options: { cwd?: string; input?: string; timeoutMs?: number; env?: NodeJS.ProcessEnv } = {},
): SpawnSyncReturns<string> {
  return spawnSync(command, args, {
    cwd: options.cwd,
    input: options.input,
    encoding: "utf8",
    timeout: options.timeoutMs ?? 10 * 60_000,
    maxBuffer: 256 * 1024 * 1024,
    env: options.env ?? process.env,
  });
}

function must(result: SpawnSyncReturns<string>, what: string): string {
  if (result.status !== 0) throw new Error(`${what} failed: ${(result.stderr || result.stdout || "").slice(-1500)}`);
  return result.stdout;
}

function whichCli(name: string): string {
  return must(run("/usr/bin/which", [name]), `finding ${name} in PATH`).trim();
}

class Worker {
  readonly #sessionsPath: string;

  constructor(readonly config: WorkerConfig) {
    mkdirSync(join(config.workRoot, "jobs"), { recursive: true });
    this.#sessionsPath = join(config.workRoot, "sessions.json");
  }

  queue(command: string, input?: string): string {
    return must(
      run("ssh", [...this.config.queueSsh, command], { input: input ?? "", timeoutMs: 60_000 }),
      `queue ${command}`,
    );
  }

  codingUserReady(): boolean {
    const user = this.config.codingUser;
    if (user === null) return true;
    return (
      run("/usr/bin/sudo", ["-n", "-u", user, "-H", "/bin/sh", "-c", "test -r ~/.config/estack/claude-token"], {
        timeoutMs: 30_000,
      }).status === 0
    );
  }

  decide(stage: string, decision: string, reason: string, evidence: string, result: string): void {
    const row = { time: new Date().toISOString(), actor: "mac-worker", stage, decision, reason, evidence, result };
    const sent = run("ssh", [...this.config.queueSsh, "decision"], { input: JSON.stringify(row), timeoutMs: 60_000 });
    if (sent.status !== 0) log(`could not log the decision: ${sent.stderr.trim()}`);
  }

  leaksKey(text: string): boolean {
    const pem = this.privateKeyPem();
    const stored = must(
      run("security", ["find-generic-password", "-s", this.config.keychainService, "-w"]),
      "reading the writer key",
    ).trim();
    return keyInText(text, pem, stored);
  }

  privateKeyPem(): string {
    const stored = must(
      run("security", ["find-generic-password", "-s", this.config.keychainService, "-w"]),
      "reading the writer key",
    ).trim();
    return /^[0-9a-f]+$/iu.test(stored) ? Buffer.from(stored, "hex").toString("utf8") : stored;
  }

  async token(): Promise<string> {
    const app: GithubApp = {
      appId: this.config.writerAppId,
      installationId: this.config.writerInstallationId,
      privateKeyPem: this.privateKeyPem(),
    };
    return (await installationToken(app)).token;
  }

  sessions(): Record<string, Session> {
    if (!existsSync(this.#sessionsPath)) return {};
    const value = JSON.parse(readFileSync(this.#sessionsPath, "utf8"));
    const sessions: Record<string, Session> = {};
    for (const [id, entry] of Object.entries(recordAt(value) ?? {})) {
      const worktree = stringAt(entry, "worktree");
      const branch = stringAt(entry, "branch");
      const cli = CODING_CLIS.find((name) => name === stringAt(entry, "cli"));
      if (worktree === null || branch === null || !cli) continue;
      sessions[id] = {
        worktree,
        branch,
        cli,
        sessionId: stringAt(entry, "sessionId"),
        pr: numberAt(entry, "pr"),
        title: stringAt(entry, "title"),
      };
    }
    return sessions;
  }

  saveSession(id: string, session: Session | null): void {
    const sessions = this.sessions();
    if (session) sessions[id] = session;
    else delete sessions[id];
    writeFileSync(this.#sessionsPath, `${JSON.stringify(sessions, null, 2)}\n`, { mode: 0o600 });
  }

  forgetSession(id: string): void {
    const session = this.sessions()[id];
    if (!session) return;
    const mirror = join(this.config.workRoot, "repo");
    run("git", ["worktree", "remove", "--force", session.worktree], { cwd: mirror });
    run("git", ["branch", "-D", session.branch], { cwd: mirror });
    this.saveSession(id, null);
  }

  async pullState(token: string, pr: number) {
    return githubApi(token, "GET", `/repos/${this.config.repo}/pulls/${pr}`, (value) => ({
      merged: recordAt(value)?.merged === true,
      draft: recordAt(value)?.draft === true,
      state: stringAt(value, "state"),
      url: stringAt(value, "html_url") ?? `https://github.com/${this.config.repo}/pull/${pr}`,
      sha: stringAt(value, "head", "sha"),
      ref: stringAt(value, "head", "ref"),
    }));
  }

  git(token: string, args: readonly string[], cwd: string, what: string): string {
    return must(run("git", [...gitAuthArguments(token), ...args], { cwd, timeoutMs: 15 * 60_000 }), what);
  }

  mirror(token: string): string {
    const mirror = join(this.config.workRoot, "repo");
    if (!existsSync(mirror))
      this.git(token, ["clone", `https://github.com/${this.config.repo}.git`, mirror], this.config.workRoot, "clone");
    this.git(token, ["fetch", "--prune", "origin"], mirror, "fetch");
    return mirror;
  }

  async handle(job: Job): Promise<JobResult> {
    return job.kind === "code" ? this.handleCode(job) : this.handleMerge(job);
  }

  result(job: Job, fields: Partial<JobResult> & Pick<JobResult, "state" | "summary">): JobResult {
    return {
      id: job.id,
      finishedAt: new Date().toISOString(),
      branch: null,
      pr: null,
      evidence: [],
      review: null,
      ...fields,
    };
  }

  runCli(job: CodeJob, session: Session, prompt: string, cwd: string): { sessionId: string | null; output: string } {
    if (session.cli === "claude") {
      const settings = join(this.config.workRoot, "claude-sandbox.json");
      writeFileSync(
        settings,
        JSON.stringify({
          sandbox: { enabled: true, autoAllowBashIfSandboxed: true, allowUnsandboxedCommands: false },
          permissions: { deny: ["Bash(security:*)", "WebFetch", "WebSearch"] },
        }),
      );
      const args = [
        "-p",
        prompt,
        "--output-format",
        "json",
        "--settings",
        settings,
        "--permission-mode",
        "acceptEdits",
        "--disallowedTools",
        "WebFetch",
        "WebSearch",
        ...claudeModelArgs(job.model, this.config),
        ...(session.sessionId ? ["--resume", session.sessionId] : []),
      ];
      const [command, commandArgs] = sessionCommand(whichCli("claude"), args, this.config.codingUser, cwd);
      const result = run(command, commandArgs, {
        cwd,
        timeoutMs: 90 * 60_000,
        env: { ...process.env, ...SESSION_GIT_ENVIRONMENT },
      });
      let sessionId: string | null = session.sessionId;
      let output = result.stdout;
      try {
        const parsed = JSON.parse(result.stdout);
        sessionId = stringAt(parsed, "session_id") ?? sessionId;
        output = stringAt(parsed, "result") ?? output;
      } catch {
        output = `${result.stdout}\n${result.stderr}`;
      }
      return { sessionId, output };
    }
    if (session.cli === "codex") {
      const last = join(this.config.workRoot, `${job.id}-codex-last.txt`);
      const result = run(
        whichCli("codex"),
        [
          "exec",
          "--sandbox",
          "workspace-write",
          "--output-last-message",
          last,
          ...(job.model ? ["-m", job.model] : []),
          prompt,
        ],
        { cwd, timeoutMs: 90 * 60_000, input: "" },
      );
      return { sessionId: null, output: existsSync(last) ? readFileSync(last, "utf8") : result.stdout };
    }
    const result = run(whichCli("opencode"), ["run", ...(job.model ? ["-m", job.model] : []), prompt], {
      cwd,
      timeoutMs: 90 * 60_000,
    });
    return { sessionId: null, output: result.stdout };
  }

  checks(worktree: string): { ok: boolean; report: string } {
    const changed = must(
      run("git", ["diff", "--name-only", "--diff-filter=ACMR", "origin/main...HEAD"], { cwd: worktree }),
      "changed files",
    )
      .split("\n")
      .filter(Boolean);
    const steps: [string, string, string[]][] = [
      ["new comments", "bun", ["scripts/estack/check-comments.ts", "--base", "origin/main"]],
      ["personal values", "bun", ["scripts/estack/check-personal.ts", "--all"]],
      [
        "lint",
        "bunx",
        [
          "biome",
          "check",
          "--no-errors-on-unmatched",
          "--files-ignore-unknown=true",
          ...(changed.length ? changed : ["package.json"]),
        ],
      ],
      ["typecheck", "bun", ["run", "typecheck"]],
      ["tests of the changed files", "bun", ["run", "test:changed"]],
    ];
    const lines: string[] = [];
    let ok = true;
    for (const [name, command, args] of steps) {
      const result = run(command, args, { cwd: worktree, timeoutMs: 30 * 60_000 });
      const passed = result.status === 0;
      ok &&= passed;
      lines.push(`- ${passed ? "pass" : "FAIL"}: ${name}`);
      if (!passed) lines.push("```", `${result.stdout}\n${result.stderr}`.trim().slice(-3000), "```");
    }
    return { ok, report: lines.join("\n") };
  }

  withDevApp(
    worktree: string,
    logName: string,
    work: (automation: (args: readonly string[]) => SpawnSyncReturns<string>) => string[],
  ): { lines: string[]; logPath: string; started: boolean } {
    const environment = {
      ...Object.fromEntries(Object.entries(process.env).filter(([name]) => name !== "ELECTRON_RUN_AS_NODE")),
      ESTACK_DEV_SKIP_SEED: "1",
      ESTACK_DEV_READY_TIMEOUT_MS: "300000",
      ESTACK_BLOCK_EXTERNAL_OPEN: "1",
    };
    const logPath = join(this.config.workRoot, `${logName}-dev.log`);
    const logFile = openSync(logPath, "w");
    const dev = Bun.spawn(["bun", "run", "dev"], { cwd: worktree, env: environment, stdout: logFile, stderr: logFile });
    const automation = (args: readonly string[]) =>
      run("bun", ["run", "dev:automation", ...args], { cwd: worktree, env: environment, timeoutMs: 120_000 });
    try {
      let ready = false;
      for (let attempt = 0; attempt < 120 && !ready; attempt++) {
        Bun.sleepSync(5000);
        ready = automation(["pages"]).status === 0;
      }
      if (!ready) return { lines: [], logPath, started: false };
      Bun.sleepSync(10_000);
      return { lines: work(automation), logPath, started: true };
    } finally {
      run("bun", ["run", "dev:stop"], { cwd: worktree, env: environment, timeoutMs: 120_000 });
      dev.kill();
      closeSync(logFile);
    }
  }

  screenshots(worktree: string): string[] {
    const shots = join(worktree, ".estack-build", "dev-automation");
    return existsSync(shots)
      ? readdirSync(shots)
          .filter((name) => name.endsWith(".png"))
          .map((name) => join(shots, name))
      : [];
  }

  verify(worktree: string, jobId: string): { files: string[]; report: string } {
    const planPath = join(worktree, ".estack-build", "verify-plan.json");
    if (!existsSync(planPath))
      return { files: [], report: "No verify plan (.estack-build/verify-plan.json): the app was not started." };
    const steps = parseVerifyPlan(JSON.parse(readFileSync(planPath, "utf8")));
    if (!steps) return { files: [], report: "The verify plan is not valid: the app was not started." };
    const outcome = this.withDevApp(worktree, jobId, (automation) =>
      steps.flatMap((step) => {
        const result = automation(automationArguments(step));
        const text = (result.status === 0 ? result.stdout : `${result.stdout}\n${result.stderr}`).trim().slice(-1500);
        const line = `- ${result.status === 0 ? "done" : "FAILED"}: ${step.action} ${step.name ?? step.out ?? ""}${step.expect ? ` (expect: ${step.expect})` : ""}`;
        return step.action === "snapshot" || result.status !== 0 ? [line, "```", text, "```"] : [line];
      }),
    );
    if (!outcome.started) return { files: [], report: `The dev app did not start. Log: ${outcome.logPath}` };
    return { files: this.screenshots(worktree), report: outcome.lines.join("\n") };
  }

  async fuzz(seed: number, steps = 25): Promise<void> {
    const token = await this.token();
    const mirror = this.mirror(token);
    const worktree = join(this.config.workRoot, "fuzz");
    if (!existsSync(worktree))
      must(run("git", ["worktree", "add", "--detach", worktree, "origin/main"], { cwd: mirror }), "fuzz worktree");
    else must(run("git", ["checkout", "-q", "--detach", "origin/main"], { cwd: worktree }), "fuzz checkout");
    const sha = must(run("git", ["rev-parse", "--short", "HEAD"], { cwd: worktree }), "rev-parse").trim();
    must(run("bun", ["install", "--frozen-lockfile"], { cwd: worktree, timeoutMs: 20 * 60_000 }), "bun install");
    rmSync(join(worktree, ".estack-build", "dev-automation"), { recursive: true, force: true });
    const random = seededRandom(seed);
    const runFuzz = () =>
      this.withDevApp(worktree, `fuzz-${sha}`, (automation) => {
        const lines: string[] = [];
        const blocked = new Set<string>();
        for (let step = 0; step < steps; step++) {
          const snapshot = automation(["snapshot"]);
          const tree =
            stringAt(JSON.parse(snapshot.stdout.slice(snapshot.stdout.indexOf("{")) || "{}"), "accessibility") ?? "";
          const target = pickTarget(withoutBlocked(fuzzTargets(tree), blocked), random);
          if (!target) {
            lines.push(`${step}: nothing to click`);
            break;
          }
          const clicked = automation(["click", `--role=${target.role}`, `--name=${target.name}`, "--allow-mutations"]);
          const outcome = clickOutcome(clicked.status, clicked.stderr);
          if (outcome !== "clicked") blocked.add(targetKey(target));
          lines.push(
            outcome === "clicked"
              ? `${step}: ${target.role} "${target.name}"`
              : `${step}: ${outcome === "failed" ? "FAILED" : outcome.toUpperCase()} ${target.role} "${target.name}": ${clickFailure(clicked.stderr)}`,
          );
          Bun.sleepSync(1500);
        }
        automation(["screenshot", `--out=fuzz-${sha}.png`]);
        return lines;
      });
    const first = runFuzz();
    const outcome = first.started ? first : runFuzz();
    const devLog = existsSync(outcome.logPath) ? readFileSync(outcome.logPath, "utf8") : "";
    const errors = devLog.split("\n").filter((line) => / ERROR \[/u.test(line));
    const failures = outcome.lines.filter((line) => line.includes("FAILED"));
    const stepsPath = join(this.config.workRoot, `fuzz-${sha}-${seed}.txt`);
    writeFileSync(stepsPath, `${outcome.lines.join("\n")}\n`);
    const evidence = this.storeEvidence(`fuzz-${sha}-${seed}`, this.screenshots(worktree));
    const blocked = outcome.lines.filter((line) => line.includes("BLOCKED") || line.includes("AMBIGUOUS"));
    const report = `${outcome.started ? outcome.lines.length : 0} steps, ${failures.length} failed clicks, ${blocked.length} not clickable (dialog or shared name), ${errors.length} ERROR lines`;
    this.decide(
      "fuzz",
      `fuzz main@${sha} seed ${seed}`,
      [report, failures[0], errors[0]?.slice(0, 300)].filter(Boolean).join("; "),
      [...evidence, stepsPath].join(" "),
      outcome.started && failures.length === 0 && errors.length === 0 ? "clean" : "problems",
    );
    log(`fuzz main@${sha}: ${report}`);
  }

  storeEvidence(key: string, files: readonly string[]): string[] {
    const places: string[] = [];
    for (const file of files) {
      const name = basename(file);
      const sent = run("ssh", [...this.config.queueSsh, `evidence ${key}`], {
        input: JSON.stringify({ name, base64: readFileSync(file).toString("base64") }),
        timeoutMs: 120_000,
      });
      const saved = sent.status === 0 ? savedPlace(sent.stdout) : null;
      if (saved !== null) {
        places.push(`vps:${saved}`);
        continue;
      }
      log(`could not store ${name} on the VPS, kept it on the Mac: ${sent.stderr.trim().slice(0, 300)}`);
      const local = join(this.config.workRoot, "evidence", key);
      mkdirSync(local, { recursive: true, mode: 0o700 });
      copyFileSync(file, join(local, name));
      places.push(`mac:${key}/${name}`);
    }
    return places;
  }

  personalIn(texts: readonly string[]): boolean {
    const patterns = readPatterns();
    return patterns.length > 0 && texts.some((text) => personalLines(text, patterns).length > 0);
  }

  review(worktree: string, author: CodeJob["cli"]): string {
    const reviewer = author === "codex" ? "claude" : this.config.reviewer;
    const diff = must(run("git", ["diff", "origin/main...HEAD"], { cwd: worktree }), "diff").slice(0, 200_000);
    const prompt = [
      "Review this change to the estack repository. Report only problems that you can prove from the code: a bug, a broken contract, a missing test for new behavior, or a comment that tells history.",
      "For each finding give the file, the line, and why it is wrong. If there is no real problem, answer exactly: No findings.",
      "",
      diff,
    ].join("\n");
    if (reviewer === "claude") {
      const result = run(
        whichCli("claude"),
        [
          "-p",
          prompt,
          "--output-format",
          "text",
          "--permission-mode",
          "plan",
          "--disallowedTools",
          "Bash",
          "Edit",
          "Write",
          "WebFetch",
          "WebSearch",
        ],
        { cwd: worktree, timeoutMs: 30 * 60_000, input: "" },
      );
      return result.stdout.trim() || result.stderr.trim();
    }
    const last = join(this.config.workRoot, "review-last.txt");
    rmSync(last, { force: true });
    const result = run(whichCli("codex"), ["exec", "--sandbox", "read-only", "--output-last-message", last, prompt], {
      cwd: worktree,
      timeoutMs: 30 * 60_000,
      input: "",
    });
    return existsSync(last) ? readFileSync(last, "utf8").trim() : `${result.stdout}\n${result.stderr}`.trim();
  }

  commitLeftovers(worktree: string, job: CodeJob): void {
    if (must(run("git", ["status", "--porcelain"], { cwd: worktree }), "status").trim() === "") return;
    must(run("git", ["add", "-A"], { cwd: worktree }), "add");
    const title = job.brief.goal.split("\n")[0]?.slice(0, 72) ?? job.id;
    must(
      run("git", ["commit", "-q", "--no-verify", "-m", `${title}\n\nCommitted by the Mac worker for job ${job.id}.`], {
        cwd: worktree,
      }),
      "commit",
    );
  }

  async handleCode(job: CodeJob): Promise<JobResult> {
    if (job.cli === "opencode" && !this.config.allowUnsandboxedClis)
      return this.result(job, {
        state: "blocked",
        summary: "OpenCode has no sandbox on this Mac. Use claude or codex, or let the owner allow it in worker.json.",
      });
    const token = await this.token();
    const mirror = this.mirror(token);
    const previous = job.followUpOf ? this.sessions()[job.followUpOf] : undefined;
    const session = sessionFor(job, previous, this.config.workRoot);
    if (!previous) {
      must(
        run("git", ["worktree", "add", "-b", session.branch, session.worktree, "origin/main"], { cwd: mirror }),
        "worktree",
      );
    }
    must(
      run("bun", ["install", "--frozen-lockfile"], { cwd: session.worktree, timeoutMs: 20 * 60_000 }),
      "bun install",
    );
    rmSync(join(session.worktree, ".estack-build", "report.md"), { force: true });
    rmSync(join(session.worktree, ".estack-build", "dev-automation"), { recursive: true, force: true });

    let outcome = this.runCli(job, session, briefPrompt(job), session.worktree);
    session.sessionId = outcome.sessionId;
    this.saveSession(job.id, session);
    this.commitLeftovers(session.worktree, job);
    let checks = this.checks(session.worktree);
    for (let round = 0; round < 2 && !checks.ok && session.cli === "claude"; round++) {
      outcome = this.runCli(
        job,
        session,
        `The checks failed. Fix the cause, then commit.\n\n${checks.report}`,
        session.worktree,
      );
      this.commitLeftovers(session.worktree, job);
      checks = this.checks(session.worktree);
    }
    const commits = must(
      run("git", ["rev-list", "--count", "origin/main..HEAD"], { cwd: session.worktree }),
      "count",
    ).trim();
    if (commits === "0") {
      this.saveSession(job.id, session);
      return this.result(job, {
        state: "failed",
        summary: `The coding session made no commit.\n\n${outcome.output.slice(-2000)}`,
      });
    }
    let review = this.review(session.worktree, session.cli);
    let reviewRounds = 0;
    if (reviewHasFindings(review) && session.cli === "claude") {
      reviewRounds = 1;
      outcome = this.runCli(job, session, reviewFixPrompt(review), session.worktree);
      this.commitLeftovers(session.worktree, job);
      checks = this.checks(session.worktree);
      review = this.review(session.worktree, session.cli);
    }
    const diff = must(run("git", ["diff", "origin/main...HEAD"], { cwd: session.worktree }), "diff");
    const verification = this.verify(session.worktree, job.id);
    const reportPath = join(session.worktree, ".estack-build", "report.md");
    const report = existsSync(reportPath)
      ? readFileSync(reportPath, "utf8").trim()
      : outcome.output.trim().slice(-4000);
    const evidence = this.storeEvidence(job.id, verification.files);
    const title = session.title ?? goalTitle(job);
    const body = [
      report,
      "",
      "## Local checks",
      checks.report,
      "",
      "## Verification in the dev app",
      verification.report,
      ...evidenceLines(evidence),
      "",
      `## Review (${session.cli === "codex" ? "claude" : this.config.reviewer}${reviewRounds > 0 ? ", after one fix round" : ""})`,
      review,
      "",
      `Job: \`${job.id}\` · CLI: ${session.cli}${job.model ? ` (${job.model})` : ""} · Requested by: ${job.requestedBy}`,
    ].join("\n");
    const published = [diff, report, review, verification.report, outcome.output, body];
    if (published.some((text) => this.leaksKey(text))) {
      this.saveSession(job.id, session);
      return this.result(job, {
        state: "blocked",
        branch: session.branch,
        evidence,
        summary:
          "The change, the report, or the review contains the writer's private key. The worker did not push or publish anything.",
      });
    }
    const commitTexts = must(
      run("git", ["log", "--format=%B", "origin/main..HEAD"], { cwd: session.worktree }),
      "commit messages",
    );
    if (this.personalIn([title, body, commitTexts, addedLines(diff)])) {
      this.saveSession(job.id, session);
      return this.result(job, {
        state: "blocked",
        branch: session.branch,
        evidence,
        summary:
          "The pull request title, the body, a commit message, or an added line contains a personal value from ~/.config/estack/personal-patterns.txt. The worker did not push or publish anything. Remove the value and ask for a follow-up.",
      });
    }
    this.git(token, ["push", "-u", "origin", `HEAD:refs/heads/${session.branch}`], session.worktree, "push");
    const repoPath = `/repos/${this.config.repo}`;
    let pr = session.pr;
    if (pr === null) {
      pr = await githubApi(token, "POST", `${repoPath}/pulls`, (value) => numberAt(value, "number"), {
        title,
        head: session.branch,
        base: "main",
        body,
        draft: !checks.ok,
      });
      if (pr === null) throw new Error("GitHub returned no pull request number.");
    } else {
      await githubApi(token, "POST", `${repoPath}/issues/${pr}/comments`, ignoreBody, { body });
    }
    session.pr = pr;
    this.saveSession(job.id, session);
    return this.result(job, {
      state: checks.ok ? "pr-opened" : "failed",
      branch: session.branch,
      pr: { number: pr, url: `https://github.com/${this.config.repo}/pull/${pr}` },
      evidence,
      review,
      summary: checks.ok
        ? report.slice(0, 2000)
        : `The local checks still fail after the fix rounds. The pull request is a draft.\n\n${checks.report.slice(0, 2000)}`,
    });
  }

  async autoMergeSweep(): Promise<void> {
    const line = readMergeLine();
    if (line.autoMerge.length === 0) return;
    const stamp = join(this.config.workRoot, "auto-merge-sweep.stamp");
    if (existsSync(stamp) && Date.now() - statSync(stamp).mtimeMs < 10 * 60_000) return;
    writeFileSync(stamp, new Date().toISOString());
    const candidates = Object.entries(this.sessions()).filter(([, session]) => session.pr !== null);
    if (candidates.length === 0) return;
    const token = await this.token();
    const mirror = this.mirror(token);
    const stats = revertStats(mainCommits(mirror), new Date(), line.windowDays, line.countSince);
    for (const [codeJobId, session] of candidates) {
      if (session.pr === null) continue;
      const stage = pullStage(await this.pullState(token, session.pr));
      if (sessionIsDone(stage)) {
        this.forgetSession(codeJobId);
        log(`forgot session ${codeJobId}: pull request #${session.pr} is ${stage}`);
        continue;
      }
      if (stage !== "open") continue;
      const files = await githubApi(
        token,
        "GET",
        `/repos/${this.config.repo}/pulls/${session.pr}/files?per_page=100`,
        (value) => (Array.isArray(value) ? value.flatMap((file: unknown) => stringAt(file, "filename") ?? []) : []),
      );
      const category = prCategory(files);
      if (!mayAutoMerge(line, category, stats)) continue;
      const result = await this.handleMerge({
        kind: "merge",
        id: `${codeJobId.slice(0, 50)}-auto`,
        createdAt: new Date().toISOString(),
        requestedBy: "merge-line",
        codeJobId,
        pr: session.pr ?? 0,
        approval: `merge line: ${category} (${stats.merges} merges, revert rate ${stats.rate})`,
      });
      this.decide(
        "merge",
        `auto ${result.state} #${session.pr}`,
        `${category}: ${result.summary}`,
        result.pr?.url ?? "",
        result.state,
      );
      if (startsDeploy(result)) {
        this.queue("deploy");
        await this.fuzz(Date.now() % 100_000);
      }
    }
  }

  async handleMerge(job: MergeJob): Promise<JobResult> {
    const token = await this.token();
    const repoPath = `/repos/${this.config.repo}`;
    const pr = await this.pullState(token, job.pr);
    const prRef = { number: job.pr, url: pr.url };
    const stage = pullStage(pr);
    const early = earlyMergeAnswer(stage);
    if (early) {
      if (sessionIsDone(stage)) this.forgetSession(job.codeJobId);
      return this.result(job, { ...early, pr: prRef });
    }
    if (pr.sha === null || pr.ref === null)
      return this.result(job, {
        state: "blocked",
        pr: prRef,
        summary: "GitHub returned no head for the pull request.",
      });
    const verdict = ciVerdict(await githubApi(token, "GET", `${repoPath}/commits/${pr.sha}/check-runs`, checkRunsOf));
    if (verdict !== "green")
      return this.result(job, {
        state: "blocked",
        pr: prRef,
        summary: `CI is ${verdict}. The worker merges only when CI is green.`,
      });
    await githubApi(token, "POST", `${repoPath}/issues/${job.pr}/comments`, ignoreBody, {
      body: `Merged by the Mac worker. Approval: ${this.personalIn([job.approval]) ? "recorded in the private decision log" : job.approval}. Requested by: ${job.requestedBy}.`,
    });
    await githubApi(token, "PUT", `${repoPath}/pulls/${job.pr}/merge`, ignoreBody, {
      merge_method: "squash",
      sha: pr.sha,
    });
    await githubApi(token, "DELETE", `${repoPath}/git/refs/heads/${pr.ref}`, ignoreBody).catch(() => null);
    this.forgetSession(job.codeJobId);
    return this.result(job, {
      state: "merged",
      pr: prRef,
      summary: `Squash-merged pull request #${job.pr}. Approval: ${job.approval}`,
    });
  }
}

function clickFailure(stderr: string): string {
  const lines = stderr.split("\n").map((line) => line.trim());
  return (
    lines.find((line) => / ERROR \[|strict mode|Timeout|not visible|disabled|No element|resolved to/iu.test(line)) ??
    lines.filter((line) => line !== "" && !line.startsWith("error: script")).at(-1) ??
    ""
  ).slice(0, 300);
}

export function savedPlace(output: string): string | null {
  try {
    return stringAt(JSON.parse(output), "saved");
  } catch {
    return null;
  }
}

function takeLock(path: string): boolean {
  try {
    writeFileSync(path, String(process.pid), { flag: "wx" });
    return true;
  } catch {
    const pid = Number(readFileSync(path, "utf8"));
    try {
      process.kill(pid, 0);
      return false;
    } catch {
      writeFileSync(path, String(process.pid));
      return true;
    }
  }
}

async function once(): Promise<void> {
  const worker = new Worker(readConfig());
  const lock = join(worker.config.workRoot, "worker.lock");
  if (!takeLock(lock)) return;
  try {
    const ready = worker.codingUserReady();
    if (!ready)
      log(`only merge jobs: ${worker.config.codingUser} has no Claude Code token yet (estack/bin/save-coding-token)`);
    const job = parseJob(JSON.parse(worker.queue(ready ? "next" : "next-merge")));
    if (!job) {
      await worker.autoMergeSweep();
      return;
    }
    log(`claimed ${job.kind} job ${job.id}`);
    worker.decide(job.kind, `claimed ${job.id}`, `requested by ${job.requestedBy}`, "", "started");
    let result: JobResult;
    try {
      result = await worker.handle(job);
    } catch (error) {
      result = worker.result(job, {
        state: "failed",
        summary: error instanceof Error ? error.message.slice(0, 3000) : String(error),
      });
    }
    worker.queue(`result ${job.id}`, JSON.stringify(result));
    worker.decide(
      job.kind,
      `${result.state} ${job.id}`,
      summaryLine(result.summary),
      result.pr?.url ?? "",
      result.state,
    );
    log(`finished ${job.id}: ${result.state}${result.pr ? ` ${result.pr.url}` : ""}`);
    if (startsDeploy(result)) await worker.fuzz(Date.now() % 100_000);
  } finally {
    rmSync(lock, { force: true });
  }
}

async function verifyAgain(codeJobId: string): Promise<void> {
  const worker = new Worker(readConfig());
  const lock = join(worker.config.workRoot, "worker.lock");
  if (!takeLock(lock)) throw new Error("The worker is busy. Try again when it is idle.");
  try {
    const session = worker.sessions()[codeJobId];
    if (!session?.pr) throw new Error(`No pull request for job ${codeJobId}.`);
    const verification = worker.verify(session.worktree, codeJobId);
    const token = await worker.token();
    const evidence = worker.storeEvidence(`${codeJobId}-verify-${Date.now()}`, verification.files);
    const body = ["## Verification in the dev app (again)", verification.report, ...evidenceLines(evidence)].join("\n");
    if (worker.personalIn([body]))
      throw new Error(
        "The verification report contains a personal value. The worker did not comment on the pull request.",
      );
    await githubApi(token, "POST", `/repos/${worker.config.repo}/issues/${session.pr}/comments`, ignoreBody, { body });
    worker.decide(
      "verify",
      `verified ${codeJobId} again`,
      verification.report.split("\n")[0] ?? "",
      evidence.join(" "),
      "commented",
    );
    log(`verified ${codeJobId} again: ${evidence.length} screenshots stored, commented on #${session.pr}`);
  } finally {
    rmSync(lock, { force: true });
  }
}

if (import.meta.main) {
  const [command, jobId] = process.argv.slice(2);
  if (command === "verify" && jobId) await verifyAgain(jobId);
  else if (command === "fuzz") {
    const worker = new Worker(readConfig());
    const lock = join(worker.config.workRoot, "worker.lock");
    if (!takeLock(lock)) throw new Error("The worker is busy. Try again when it is idle.");
    try {
      await worker.fuzz(Number(jobId ?? Date.now() % 100_000));
    } finally {
      rmSync(lock, { force: true });
    }
  } else await once();
}
