import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { isDynamicRecord, isString } from "@estack/contracts/runtime-values";
import { isJobId, type Job, type JobResult, parseJob, parseResult } from "./coding-jobs";

const STATES = ["inbox", "claimed", "done"] as const;
type QueueState = (typeof STATES)[number];

export function queueRoot(environment: NodeJS.ProcessEnv = process.env): string {
  return environment.ESTACK_QUEUE_DIR ?? join(homedir(), "estack-queue");
}

export class CodingQueue {
  constructor(readonly root: string) {
    for (const state of [...STATES, "results", "closed"])
      mkdirSync(join(root, state), { recursive: true, mode: 0o700 });
  }

  #path(state: QueueState | "results" | "closed", id: string): string {
    if (!isJobId(id)) throw new Error(`Not a job id: ${id}`);
    return join(this.root, state, `${id}.json`);
  }

  enqueue(job: Job): void {
    if (!parseJob(job)) throw new Error("The job is not valid.");
    const temporary = join(this.root, "inbox", `.${job.id}.tmp`);
    writeFileSync(temporary, `${JSON.stringify(job, null, 2)}\n`, { mode: 0o600, flag: "wx" });
    renameSync(temporary, this.#path("inbox", job.id));
  }

  claimNext(kind: Job["kind"] | null = null): Job | null {
    const ids = readdirSync(join(this.root, "inbox"))
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.slice(0, -5))
      .filter(isJobId)
      .sort();
    for (const id of ids) {
      if (kind !== null && parseJob(JSON.parse(readFileSync(this.#path("inbox", id), "utf8")))?.kind !== kind) continue;
      try {
        renameSync(this.#path("inbox", id), this.#path("claimed", id));
      } catch {
        continue;
      }
      const job = parseJob(JSON.parse(readFileSync(this.#path("claimed", id), "utf8")));
      if (job) return job;
      renameSync(this.#path("claimed", id), this.#path("done", id));
    }
    return null;
  }

  requeue(id: string): boolean {
    if (!existsSync(this.#path("claimed", id))) return false;
    renameSync(this.#path("claimed", id), this.#path("inbox", id));
    return true;
  }

  complete(result: JobResult): void {
    if (!parseResult(result)) throw new Error("The result is not valid.");
    if (!existsSync(this.#path("claimed", result.id))) throw new Error(`Job ${result.id} is not claimed.`);
    writeFileSync(this.#path("results", result.id), `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
    renameSync(this.#path("claimed", result.id), this.#path("done", result.id));
  }

  job(id: string): { state: QueueState; job: Job } | null {
    for (const state of STATES) {
      const path = this.#path(state, id);
      if (!existsSync(path)) continue;
      const job = parseJob(JSON.parse(readFileSync(path, "utf8")));
      return job ? { state, job } : null;
    }
    return null;
  }

  result(id: string): JobResult | null {
    const path = this.#path("results", id);
    return existsSync(path) ? parseResult(JSON.parse(readFileSync(path, "utf8"))) : null;
  }

  close(id: string, reason: string): void {
    if (!this.result(id)) throw new Error(`Job ${id} has no result to close.`);
    writeFileSync(
      this.#path("closed", id),
      `${JSON.stringify({ reason: reason.slice(0, 500), closedAt: new Date().toISOString() })}\n`,
      {
        mode: 0o600,
      },
    );
  }

  closedReason(id: string): string | null {
    const path = this.#path("closed", id);
    if (!existsSync(path)) return null;
    const value = JSON.parse(readFileSync(path, "utf8"));
    return isDynamicRecord(value) && isString(value.reason) ? value.reason : null;
  }

  list(): { id: string; state: QueueState }[] {
    return STATES.flatMap((state) =>
      readdirSync(join(this.root, state))
        .filter((name) => name.endsWith(".json"))
        .map((name) => ({ id: name.slice(0, -5), state })),
    ).sort((a, b) => a.id.localeCompare(b.id));
  }
}
