import { describe, expect, it } from "vitest";
import type { CodeJob } from "./coding-jobs";
import {
  claudeEffortName,
  claudeModelArgs,
  claudeModelName,
  earlyMergeAnswer,
  pullStage,
  savedPlace,
  sessionFor,
  sessionIsDone,
  startsDeploy,
} from "./mac-worker";

const job = (id: string, goal: string, followUpOf: string | null = null): CodeJob => ({
  kind: "code",
  id,
  createdAt: "2026-11-19T01:02:03.000Z",
  requestedBy: "engineer",
  brief: { goal, doneWhen: "Done.", evidence: "A test.", known: "", constraints: "" },
  cli: "claude",
  model: null,
  followUpOf,
});

describe("pull request title of a session", () => {
  it("keeps the goal of the first job for a follow-up that opens the first pull request", () => {
    const first = sessionFor(job("20261119010203-aaaaaa", "Show the job count.\nMore text."), undefined, "/work");
    expect(first).toMatchObject({ title: "Show the job count.", pr: null, branch: "estack/20261119010203-aaaaaa" });
    const followUp = sessionFor(
      job("20261119020304-bbbbbb", "Fix the lint error.", "20261119010203-aaaaaa"),
      first,
      "/work",
    );
    expect(followUp.title).toBe("Show the job count.");
    expect(followUp.branch).toBe(first.branch);
    const second = sessionFor(
      job("20261119030405-cccccc", "Fix the test.", "20261119020304-bbbbbb"),
      followUp,
      "/work",
    );
    expect(second.title).toBe("Show the job count.");
  });

  it("uses the goal of the follow-up when the saved session has no title", () => {
    const saved = { worktree: "/work/jobs/a", branch: "estack/a", cli: "claude" as const, sessionId: null, pr: null };
    const followUp = sessionFor(
      job("20261119020304-bbbbbb", "Fix the lint error."),
      { ...saved, title: null },
      "/work",
    );
    expect(followUp.title).toBe("Fix the lint error.");
  });

  it("uses the job id when the goal is empty", () => {
    expect(sessionFor(job("20261119010203-aaaaaa", ""), undefined, "/work").title).toBe("20261119010203-aaaaaa");
  });
});

describe("model and effort of a Claude session", () => {
  const config = { claudeModel: "claude-opus-5-5", claudeEffort: "high" as const };

  it("uses the default model and effort of the worker when the job names no model", () => {
    expect(claudeModelArgs(null, config)).toEqual(["--model", "claude-opus-5-5", "--effort", "high"]);
  });

  it("keeps the model that the job names", () => {
    expect(claudeModelArgs("sonnet", config)).toEqual(["--model", "sonnet", "--effort", "high"]);
  });

  it("adds nothing when the worker has no default", () => {
    expect(claudeModelArgs(null, { claudeModel: null, claudeEffort: null })).toEqual([]);
  });

  it("refuses an unknown effort and a model name with other characters", () => {
    expect(claudeEffortName("ultra")).toBeNull();
    expect(claudeEffortName("xhigh")).toBe("xhigh");
    expect(claudeModelName("opus; rm -rf /")).toBeNull();
    expect(claudeModelName("claude-opus-5-5")).toBe("claude-opus-5-5");
  });
});

describe("evidence place from the VPS", () => {
  it("reads the saved place and ignores any other answer", () => {
    expect(savedPlace('{"saved":"20261119010203-aaaaaa/shot.png"}\n')).toBe("20261119010203-aaaaaa/shot.png");
    expect(savedPlace("Unknown command: evidence x")).toBeNull();
    expect(savedPlace('{"saved":true}')).toBeNull();
  });
});

describe("merge answers that start a deploy", () => {
  const open = { merged: false, draft: false, state: "open" };

  it("never deploys or fuzzes for a pull request that was already merged", () => {
    const stage = pullStage({ merged: true, draft: false, state: "closed" });
    expect(stage).toBe("merged");
    const answer = earlyMergeAnswer(stage);
    expect(answer?.state).toBe("blocked");
    expect(answer && startsDeploy(answer)).toBe(false);
  });

  it("deploys only for a merge that the worker made in this call", () => {
    expect(startsDeploy({ state: "merged" })).toBe(true);
    expect(startsDeploy({ state: "blocked" })).toBe(false);
    expect(startsDeploy({ state: "failed" })).toBe(false);
    expect(earlyMergeAnswer(pullStage(open))).toBeNull();
  });

  it("refuses a closed or draft pull request", () => {
    expect(earlyMergeAnswer(pullStage({ ...open, state: "closed" }))?.state).toBe("blocked");
    expect(earlyMergeAnswer(pullStage({ ...open, draft: true }))?.state).toBe("blocked");
  });
});

describe("sessions that the merge sweep looks at", () => {
  it("drops sessions whose pull request is merged or closed and keeps open and draft ones", () => {
    expect(sessionIsDone(pullStage({ merged: true, draft: false, state: "closed" }))).toBe(true);
    expect(sessionIsDone(pullStage({ merged: false, draft: false, state: "closed" }))).toBe(true);
    expect(sessionIsDone(pullStage({ merged: false, draft: true, state: "open" }))).toBe(false);
    expect(sessionIsDone(pullStage({ merged: false, draft: false, state: "open" }))).toBe(false);
  });
});
