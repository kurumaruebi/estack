import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { run } from "./coding";
import {
  automationArguments,
  briefPrompt,
  type CodeJob,
  ciVerdict,
  type JobResult,
  keyInText,
  newJobId,
  parseJob,
  parseResult,
  parseVerifyPlan,
  reviewFixPrompt,
  reviewHasFindings,
  SESSION_GIT_ENVIRONMENT,
  secretInText,
  summaryLine,
} from "./coding-jobs";
import { CodingQueue } from "./coding-queue";
import { main as decisionsMain, decisionsSince } from "./decisions";
import { upstreamFor } from "./github-read-proxy";
import { serve } from "./queue-server";

const job: CodeJob = {
  kind: "code",
  id: "20261119010203-abc123",
  createdAt: "2026-11-19T01:02:03.000Z",
  requestedBy: "engineer",
  brief: {
    goal: "Show the job count on the settings page.",
    doneWhen: "The settings page shows the count.",
    evidence: "A screenshot of the settings page.",
    known: "",
    constraints: "",
  },
  cli: "claude",
  model: null,
  followUpOf: null,
};

const result = (id: string, fields: Partial<JobResult> = {}): JobResult => ({
  id,
  state: "pr-opened",
  finishedAt: "2026-11-19T02:00:00.000Z",
  summary: "done",
  branch: `estack/${id}`,
  pr: { number: 12, url: "https://github.com/example/estack/pull/12" },
  evidence: [],
  review: "No findings.",
  ...fields,
});

const temporaryQueue = (): CodingQueue => new CodingQueue(mkdtempSync(join(tmpdir(), "estack-queue-")));

describe("coding jobs", () => {
  it("makes job ids that sort by time", () => {
    expect(newJobId(new Date("2026-11-19T01:02:03Z"), "AB-c1d2e3f4")).toBe("20261119010203-abc1d2");
  });

  it("accepts a valid job and refuses a job with an unknown CLI, a bad model, or a missing goal", () => {
    expect(parseJob(job)).toEqual(job);
    expect(parseJob({ ...job, cli: "bash" })).toBeNull();
    expect(parseJob({ ...job, model: "opus; rm -rf /" })).toBeNull();
    expect(parseJob({ ...job, brief: { ...job.brief, goal: " " } })).toBeNull();
    expect(parseJob({ ...job, id: "../etc/passwd" })).toBeNull();
  });

  it("puts each part of the brief into the prompt", () => {
    const prompt = briefPrompt(job);
    for (const text of [job.brief.goal, job.brief.doneWhen, job.brief.evidence, "Do not push"]) {
      expect(prompt).toContain(text);
    }
  });

  it("merges only when every check run passed", () => {
    expect(ciVerdict([])).toBe("none");
    expect(ciVerdict([{ name: "Check", status: "in_progress", conclusion: null }])).toBe("pending");
    expect(ciVerdict([{ name: "Check", status: "completed", conclusion: "failure" }])).toBe("red");
    expect(
      ciVerdict([
        { name: "Check", status: "completed", conclusion: "success" },
        { name: "Other", status: "completed", conclusion: "skipped" },
      ]),
    ).toBe("green");
  });

  it("finds a piece of the private key in a diff", () => {
    const secret = `${"a".repeat(10)}0123456789abcdefghijklmnopqrstuvwxyz${"b".repeat(30)}`;
    expect(secretInText(`+const key = "${secret.slice(24, 60)}";`, secret)).toBe(true);
    expect(secretInText("+const key = 'nothing here';", secret)).toBe(false);
  });

  it("turns a verify plan into dev:automation arguments and refuses unsafe file names", () => {
    const steps = parseVerifyPlan({
      steps: [
        { action: "click", role: "button", name: "Settings", waitFor: "heading,Settings" },
        { action: "screenshot", out: "settings.png" },
      ],
    });
    expect(steps?.map(automationArguments)).toEqual([
      ["click", "--role=button", "--name=Settings", "--allow-mutations", "--wait-for=heading,Settings"],
      ["screenshot", "--out=settings.png"],
    ]);
    expect(parseVerifyPlan({ steps: [{ action: "screenshot", out: "../../x.png" }] })).toBeNull();
    expect(parseVerifyPlan({ steps: [{ action: "eval", text: "process.exit()" }] })).toBeNull();
  });
});

describe("coding queue", () => {
  it("gives each job to one worker and keeps the result", async () => {
    const queue = temporaryQueue();
    queue.enqueue(job);
    expect(JSON.parse(await serve("next", queue, async () => ""))).toEqual(job);
    expect(JSON.parse(await serve("next", queue, async () => ""))).toBeNull();
    await serve(`result ${job.id}`, queue, async () => JSON.stringify(result(job.id)));
    expect(queue.job(job.id)?.state).toBe("done");
    expect(parseResult(queue.result(job.id))).toEqual(result(job.id));
  });

  it("refuses commands that are not in the protocol", async () => {
    const queue = temporaryQueue();
    await expect(serve("rm -rf /", queue, async () => "")).rejects.toThrow();
    await expect(serve("next extra", queue, async () => "")).rejects.toThrow();
    await expect(serve(`result ${job.id}`, queue, async () => JSON.stringify(result(job.id)))).rejects.toThrow();
  });

  it("lets an agent request work and ask for a merge only after a pull request exists", async () => {
    const queue = temporaryQueue();
    const out: string[] = [];
    const write = (text: string) => {
      out.push(text);
    };
    expect(
      await run(["request", "--goal", "g", "--done-when", "d", "--evidence", "e", "--by", "engineer"], queue, write),
    ).toBe(0);
    const id = out[0]?.trim() ?? "";
    expect(queue.job(id)?.job).toMatchObject({ kind: "code", requestedBy: "engineer", cli: "claude" });
    expect(await run(["merge", id, "--approved", "owner in chat"], queue, write)).toBe(1);
    queue.claimNext();
    queue.complete(result(id));
    expect(await run(["merge", id], queue, write)).toBe(2);
    expect(await run(["merge", id, "--approved", "持ち主がチャンネルで承認"], queue, write)).toBe(0);
    expect(queue.job(out.at(-1)?.trim() ?? "")?.job).toMatchObject({
      kind: "merge",
      codeJobId: id,
      pr: 12,
      approval: "持ち主がチャンネルで承認",
    });
  });
});

describe("GitHub read proxy", () => {
  const url = (path: string) => new URL(`http://127.0.0.1:3190${path}`);

  it("reads the API and fetches with git for one repository", () => {
    expect(upstreamFor("example/estack", "GET", url("/api/pulls/3"))?.url).toBe(
      "https://api.github.com/repos/example/estack/pulls/3",
    );
    expect(upstreamFor("example/estack", "POST", url("/git/git-upload-pack"))?.url).toBe(
      "https://github.com/example/estack.git/git-upload-pack",
    );
  });

  it("refuses writes, pushes, and paths outside the repository", () => {
    expect(upstreamFor("example/estack", "POST", url("/api/pulls"))).toBeNull();
    expect(upstreamFor("example/estack", "POST", url("/git/git-receive-pack"))).toBeNull();
    expect(upstreamFor("example/estack", "GET", url("/git/info/refs?service=git-receive-pack"))).toBeNull();
    expect(upstreamFor("example/estack", "GET", url("/api/../../user"))).toBeNull();
  });
});

describe("decisions", () => {
  it("keeps one row per decision and reads the rows since a time", async () => {
    const file = join(mkdtempSync(join(tmpdir(), "estack-decisions-")), "decisions.tsv");
    const queue = temporaryQueue();
    const row = {
      time: "2026-11-19T01:00:00.000Z",
      actor: "mac-worker",
      stage: "code",
      decision: "pr-opened 20261119010203-abc123",
      reason: "checks\tpassed\nall",
      evidence: "https://github.com/example/estack/pull/12",
      result: "pr-opened",
    };
    await serve("decision", queue, async () => JSON.stringify(row), file);
    const out: string[] = [];
    expect(
      decisionsMain(["since", "2026-11-19T00:00:00Z"], file, (text) => {
        out.push(text);
      }),
    ).toBe(0);
    expect(out.slice(1)).toEqual([`${Object.values({ ...row, reason: "checks passed all" }).join("\t")}\n`]);
    expect(decisionsSince(file, new Date("2026-11-19T02:00:00Z"))).toEqual([]);
    await expect(
      serve("decision", queue, async () => JSON.stringify({ ...row, time: "yesterday" }), file),
    ).rejects.toThrow();
  });
});

describe("lessons from the 2026-11-19 log", () => {
  it("gives the decision log the first real line of a pull request report, not its heading", () => {
    expect(summaryLine("## What changed\n`estack/機能の一覧.md` の 1 行を直した。\n\n## How I checked it")).toBe(
      "`estack/機能の一覧.md` の 1 行を直した。",
    );
  });

  it("turns off the commit hook inside the coding session, where the sandbox cannot run it", async () => {
    const { spawnSync } = await import("node:child_process");
    const repo = mkdtempSync(join(tmpdir(), "estack-hook-"));
    const git = (...args: string[]) =>
      spawnSync("git", args, { cwd: repo, encoding: "utf8", env: { ...process.env, ...SESSION_GIT_ENVIRONMENT } });
    git("init", "-q");
    git("config", "core.hooksPath", ".githooks");
    const { mkdirSync, writeFileSync } = await import("node:fs");
    mkdirSync(join(repo, ".githooks"));
    writeFileSync(join(repo, ".githooks", "pre-commit"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
    writeFileSync(join(repo, "a.txt"), "a\n");
    git("add", "a.txt");
    const commit = git("-c", "user.name=t", "-c", "user.email=t@example.com", "commit", "-q", "-m", "a");
    expect(commit.status).toBe(0);
  });
});

describe("closing a job", () => {
  it("keeps the reason, and refuses a job without a result", async () => {
    const queue = temporaryQueue();
    queue.enqueue(job);
    queue.claimNext();
    expect(() => queue.close(job.id, "x")).toThrow();
    queue.complete(result(job.id, { state: "failed", pr: null }));
    const out: string[] = [];
    expect(await run(["close", job.id, "--reason", "superseded by a follow-up"], queue, (text) => out.push(text))).toBe(
      0,
    );
    expect(queue.closedReason(job.id)).toBe("superseded by a follow-up");
  });
});

describe("private key in published text", () => {
  const body = "MIIEowIBAAKCAQEAx9d2Q8b1Lz0aZ3kq7Wm4Vt1Rf8Ke2Np6Hs0Ju5Ly3Xc9Bg4Dw7Fq2Gr6Ht8Iu1Jv";
  const pem = `-----BEGIN RSA PRIVATE KEY-----\n${body.slice(0, 40)}\n${body.slice(40)}\n-----END RSA PRIVATE KEY-----\n`;
  const stored = Buffer.from(pem).toString("hex");

  it("finds the key in a report as base64 across lines, as hex, or as a PEM header", () => {
    expect(keyInText(`## What changed\n${body.slice(10, 34)}\n${body.slice(34, 60)}`, pem, stored)).toBe(true);
    expect(keyInText(`hex: ${stored.slice(100, 160).toUpperCase()}`, pem, stored)).toBe(true);
    expect(keyInText("-----BEGIN PRIVATE KEY-----", pem, stored)).toBe(true);
    expect(keyInText("## What changed\nThe first screen has no checkbox.", pem, stored)).toBe(false);
  });
});

describe("coding session as another macOS user", () => {
  it("runs the CLI directly without a coding user, and through sudo -n as that user with one", async () => {
    const { codingUserName, sessionCommand } = await import("./mac-worker");
    expect(sessionCommand("/bin/claude", ["-p", "x"], null, "/work/jobs/a")).toEqual(["/bin/claude", ["-p", "x"]]);
    const [command, args] = sessionCommand("/bin/claude", ["-p", "x"], "estackcoder", "/work/jobs/a");
    expect(command).toBe("/usr/bin/sudo");
    expect(args.slice(0, 4)).toEqual(["-n", "-u", "estackcoder", "-H"]);
    expect(args).toContain("GIT_CONFIG_VALUE_0=/dev/null");
    expect(args.slice(-3)).toEqual(["/work/jobs/a", "-p", "x"]);
    expect(codingUserName("estackcoder")).toBe("estackcoder");
    expect(codingUserName("root; rm")).toBeNull();
  });
});

describe("claiming only merge jobs while the coding user has no login", () => {
  it("skips code jobs and leaves them in the inbox", async () => {
    const queue = temporaryQueue();
    queue.enqueue(job);
    const merge = {
      kind: "merge" as const,
      id: "20261119020304-mmmmmm",
      createdAt: "2026-11-19T02:03:04.000Z",
      requestedBy: "engineer",
      codeJobId: job.id,
      pr: 12,
      approval: "持ち主がチャンネルで承認",
    };
    queue.enqueue(merge);
    expect(JSON.parse(await serve("next-merge", queue, async () => ""))).toEqual(merge);
    expect(JSON.parse(await serve("next-merge", queue, async () => ""))).toBeNull();
    expect(queue.job(job.id)?.state).toBe("inbox");
  });
});

describe("one fix round after the review", () => {
  it("runs a fix round only when the review has findings", () => {
    expect(reviewHasFindings("No findings.")).toBe(false);
    expect(reviewHasFindings("I read the diff.\n\nNo findings")).toBe(false);
    expect(reviewHasFindings("")).toBe(false);
    expect(
      reviewHasFindings(
        "- scripts/estack/mac-worker.test.ts:1: This adds a Vitest unit test outside the protected areas.",
      ),
    ).toBe(true);
  });

  it("asks the session to prove each finding and to reply to the wrong ones", () => {
    const prompt = reviewFixPrompt("- a.ts:3: the loop never ends.");
    expect(prompt).toContain("Review replies");
    expect(prompt).toContain("the loop never ends");
  });
});
