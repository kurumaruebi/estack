import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isJobId, parseResult } from "./coding-jobs";
import { CodingQueue, queueRoot } from "./coding-queue";
import { appendDecision, decisionsFile, parseDecision } from "./decisions";
import {
  type DeployCommand,
  devDeployCommand,
  isReleaseTag,
  launchDetached,
  queueCodeUpdateCommand,
  stableReleaseCommand,
} from "./deploy-route";
import { evidenceRoot, isEvidenceKey, parseEvidence, saveEvidence } from "./evidence";

const repositoryRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

export async function serve(
  command: string,
  queue: CodingQueue,
  input: () => Promise<string>,
  decisions: string = decisionsFile(),
  evidence: string = evidenceRoot(),
  launch: (deploy: DeployCommand) => void = launchDetached,
): Promise<string> {
  const [verb, id, extra] = command.trim().split(/\s+/u);
  if (extra !== undefined) throw new Error("Too many words in the command.");
  if (verb === "next" && id === undefined) return JSON.stringify(queue.claimNext());
  if (verb === "next-merge" && id === undefined) return JSON.stringify(queue.claimNext("merge"));
  if (verb === "deploy" && id === undefined) {
    launch(devDeployCommand(process.env));
    launch(queueCodeUpdateCommand(repositoryRoot));
    return JSON.stringify({ deploying: "dev" });
  }
  if (verb === "release") {
    if (!isReleaseTag(id)) throw new Error("A release needs a tag like v0.1.0.");
    launch(stableReleaseCommand(process.env.ESTACK_STABLE_CHECKOUT ?? join(homedir(), "Projects", "estack"), id));
    return JSON.stringify({ deploying: "stable", tag: id });
  }
  if (verb === "decision" && id === undefined) {
    const row = parseDecision(JSON.parse(await input()));
    if (!row) throw new Error("The decision is not valid.");
    appendDecision(decisions, row);
    return JSON.stringify({ saved: true });
  }
  if (verb === "evidence" && isEvidenceKey(id)) {
    const file = parseEvidence(JSON.parse(await input()));
    if (!file) throw new Error("The evidence is not a valid PNG file.");
    return JSON.stringify({ saved: saveEvidence(evidence, id, file) });
  }
  if (!isJobId(id)) throw new Error(`Unknown command: ${command}`);
  if (verb === "requeue") return JSON.stringify({ requeued: queue.requeue(id) });
  if (verb === "result") {
    const result = parseResult(JSON.parse(await input()));
    if (!result || result.id !== id) throw new Error("The result is not valid for this job.");
    queue.complete(result);
    if (result.state === "merged") {
      launch(devDeployCommand(process.env));
      launch(queueCodeUpdateCommand(repositoryRoot));
    }
    return JSON.stringify({ saved: true });
  }
  throw new Error(`Unknown command: ${command}`);
}

if (import.meta.main) {
  try {
    const output = await serve(process.env.SSH_ORIGINAL_COMMAND ?? "", new CodingQueue(queueRoot()), readStdin);
    process.stdout.write(`${output}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
