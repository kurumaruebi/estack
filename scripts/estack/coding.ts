import { randomBytes } from "node:crypto";
import { parseArgs } from "node:util";
import {
  CODING_CLIS,
  type CodeJob,
  type CodingCli,
  checkRunsOf,
  ciVerdict,
  isJobId,
  type MergeJob,
  newJobId,
  recordAt,
  stringAt,
} from "./coding-jobs";
import { CodingQueue, queueRoot } from "./coding-queue";
import { decisionsFile, main as decisionsMain } from "./decisions";

const USAGE = `使い方:
  coding request --goal <文> --done-when <文> --evidence <文> [--known <文>] [--constraints <文>]
                 [--cli claude|codex|opencode] [--model <名前>] [--follow-up <依頼の番号>] [--by <エージェント名>]
  coding status [<依頼の番号>]
  coding checks <依頼の番号>
  coding merge <依頼の番号> --approved <誰がいつどこで承認したか> [--by <エージェント名>]
  coding report [<時間>h]
  coding close <依頼の番号> --reason <理由>`;

const READ_PROXY = process.env.ESTACK_GITHUB_READ_PROXY ?? "http://127.0.0.1:3190";

async function readGithub<T>(path: string, parse: (value: unknown) => T): Promise<T> {
  const response = await fetch(`${READ_PROXY}/api/${path}`);
  if (!response.ok) throw new Error(`GitHub の読み取りの中継が ${response.status} を返しました。`);
  return parse(await response.json());
}

function newId(): string {
  return newJobId(new Date(), randomBytes(6).toString("hex"));
}

export async function run(argv: string[], queue: CodingQueue, write: (text: string) => void): Promise<0 | 1 | 2> {
  const [command, ...rest] = argv;
  if (command === "request") {
    const { values } = parseArgs({
      args: rest,
      options: {
        goal: { type: "string" },
        "done-when": { type: "string" },
        evidence: { type: "string" },
        known: { type: "string", default: "" },
        constraints: { type: "string", default: "" },
        cli: { type: "string", default: "claude" },
        model: { type: "string" },
        "follow-up": { type: "string" },
        by: { type: "string", default: "agent" },
      },
    });
    const cli = CODING_CLIS.find((name) => name === values.cli);
    if (!values.goal || !values["done-when"] || !values.evidence || !cli) {
      write(`${USAGE}\n`);
      return 2;
    }
    const followUpOf = values["follow-up"] ?? null;
    if (followUpOf !== null && !queue.result(followUpOf)) {
      write(`依頼 ${followUpOf} の結果がまだありません。\n`);
      return 1;
    }
    const job: CodeJob = {
      kind: "code",
      id: newId(),
      createdAt: new Date().toISOString(),
      requestedBy: values.by,
      brief: {
        goal: values.goal,
        doneWhen: values["done-when"],
        evidence: values.evidence,
        known: values.known,
        constraints: values.constraints,
      },
      cli: cli satisfies CodingCli,
      model: values.model ?? null,
      followUpOf,
    };
    queue.enqueue(job);
    write(`${job.id}\n`);
    return 0;
  }
  if (command === "status") {
    const id = rest[0];
    if (id === undefined) {
      for (const entry of queue.list()) write(`${entry.id} ${entry.state}\n`);
      return 0;
    }
    if (!isJobId(id)) {
      write(`${USAGE}\n`);
      return 2;
    }
    write(`${JSON.stringify({ ...queue.job(id), result: queue.result(id) }, null, 2)}\n`);
    return 0;
  }
  if (command === "checks") {
    const result = isJobId(rest[0]) ? queue.result(rest[0]) : null;
    if (!result?.pr) {
      write("この依頼には PR がありません。\n");
      return 1;
    }
    const pr = await readGithub(`pulls/${result.pr.number}`, (value) => ({
      sha: stringAt(value, "head", "sha"),
      state: stringAt(value, "state"),
      merged: recordAt(value)?.merged === true,
    }));
    const checks = pr.sha === null ? [] : await readGithub(`commits/${pr.sha}/check-runs`, checkRunsOf);
    write(
      `${JSON.stringify({ pr: result.pr, state: pr.state, merged: pr.merged, ci: ciVerdict(checks), checks }, null, 2)}\n`,
    );
    return 0;
  }
  if (command === "report") {
    const hours = Number(/^(\d+)h$/u.exec(rest[0] ?? "24h")?.[1] ?? "24");
    const since = new Date(Date.now() - hours * 3_600_000);
    write(`== 判断の記録（${hours} 時間）\n`);
    decisionsMain(["since", since.toISOString()], decisionsFile(), write);
    write("\n== 依頼\n");
    for (const entry of queue.list()) {
      const result = queue.result(entry.id);
      const pr = result?.pr;
      let ci = "";
      if (pr) {
        try {
          const head = await readGithub(`pulls/${pr.number}`, (value) => ({
            sha: stringAt(value, "head", "sha"),
            state: stringAt(value, "state"),
            merged: recordAt(value)?.merged === true,
          }));
          const checks = head.sha === null ? [] : await readGithub(`commits/${head.sha}/check-runs`, checkRunsOf);
          ci = ` ${head.merged ? "merged" : head.state} ci=${ciVerdict(checks)}`;
        } catch {
          ci = " (GitHub を読めなかった)";
        }
      }
      const closed = queue.closedReason(entry.id);
      write(
        `${entry.id} ${entry.state} ${result?.state ?? ""}${pr ? ` ${pr.url}` : ""}${ci}${closed ? ` closed: ${closed}` : ""}\n`,
      );
    }
    return 0;
  }
  if (command === "close") {
    const { values, positionals } = parseArgs({
      args: rest,
      allowPositionals: true,
      options: { reason: { type: "string" } },
    });
    const id = positionals[0];
    if (!isJobId(id) || !values.reason) {
      write(`${USAGE}\n`);
      return 2;
    }
    queue.close(id, values.reason);
    write(`closed ${id}\n`);
    return 0;
  }
  if (command === "merge") {
    const { values, positionals } = parseArgs({
      args: rest,
      allowPositionals: true,
      options: { by: { type: "string", default: "agent" }, approved: { type: "string" } },
    });
    const codeJobId = positionals[0];
    if (!values.approved?.trim()) {
      write(
        "マージには、持ち主が誰としていつどこで承認したかを --approved で書いてください（例: 持ち主がチャンネル「開発」で 2026-11-19 9:10 に承認）。\n",
      );
      return 2;
    }
    const result = isJobId(codeJobId) ? queue.result(codeJobId) : null;
    if (!codeJobId || !result?.pr) {
      write("マージする PR が見つかりません。先に coding status で結果を見てください。\n");
      return 1;
    }
    const job: MergeJob = {
      kind: "merge",
      id: newId(),
      createdAt: new Date().toISOString(),
      requestedBy: values.by,
      codeJobId,
      pr: result.pr.number,
      approval: values.approved.trim(),
    };
    queue.enqueue(job);
    write(`${job.id}\n`);
    return 0;
  }
  write(`${USAGE}\n`);
  return 2;
}

if (import.meta.main) {
  process.exit(
    await run(process.argv.slice(2), new CodingQueue(queueRoot()), (text) => {
      process.stdout.write(text);
    }),
  );
}
