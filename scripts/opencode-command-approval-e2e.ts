import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const OUT = resolve(import.meta.dirname, "../.estack-build/opencode-command-approval-e2e");
const binary = process.argv[2] ?? process.env.ESTACK_OPENCODE_PATH;
if (!binary) throw new Error("Give the OpenCode binary as the first argument or in ESTACK_OPENCODE_PATH.");

const root = await mkdtemp(join(tmpdir(), "estack-opencode-command-approval-"));
const home = join(root, "home");
mkdirSync(home, { recursive: true });
process.env.HOME = home;
process.env.XDG_CONFIG_HOME = join(home, ".config");
process.env.XDG_DATA_HOME = join(home, ".local/share");
process.env.XDG_CACHE_HOME = join(home, ".cache");
process.env.XDG_STATE_HOME = join(home, ".local/state");

const { requireProviderDriver } = await import("../src/backend/provider-drivers");
const { runTurn, startThread, stopClients } = await import("./provider-fakes/host");
const { getString, isRecord } = await import("../src/backend/protocol");
const { claudeCommandNeedsApproval } = await import("../src/backend/agent/claude-command-approval");
type AgentClient = import("../src/backend/agent-client").AgentClient;

const MODEL = "shell-model";
const PROVIDER = "shell-endpoint";
const CASES = {
  "read-only": { command: "ls", decision: "accept", needsApproval: false, made: false },
  declined: { command: "touch made-by-opencode", decision: "decline", needsApproval: true, made: false },
  accepted: { command: "touch made-by-opencode", decision: "accept", needsApproval: true, made: true },
} as const;
type CaseName = keyof typeof CASES;
const NAMES: readonly CaseName[] = ["read-only", "declined", "accepted"];

function names(value: unknown, key: string): unknown[] {
  return isRecord(value) && Array.isArray(value[key]) ? value[key] : [];
}

function chunk(delta: unknown, finish: string | null): string {
  return `data: ${JSON.stringify({ id: "c1", object: "chat.completion.chunk", created: 0, model: MODEL, choices: [{ index: 0, delta, finish_reason: finish }] })}\n\n`;
}

function reply(response: ServerResponse, body: string): void {
  response.writeHead(200, { "content-type": "text/event-stream" });
  const request = JSON.parse(body);
  const tools = names(request, "tools").map((tool) => (isRecord(tool) ? getString(tool.function, "name") : null));
  const shell = tools.includes("shell") ? "shell" : tools.includes("bash") ? "bash" : null;
  const name = NAMES.find((key) => body.includes(`case:${key}`));
  const answered = names(request, "messages").some((message) => getString(message, "role") === "tool");
  if (name && shell && !answered) {
    const args = JSON.stringify({ command: CASES[name].command, description: name });
    const call = { index: 0, id: `call-${name}`, type: "function", function: { name: shell, arguments: args } };
    response.write(chunk({ role: "assistant", tool_calls: [call] }, null));
    response.write(chunk({}, "tool_calls"));
  } else {
    response.write(chunk({ role: "assistant", content: "done" }, null));
    response.write(chunk({}, "stop"));
  }
  response.write("data: [DONE]\n\n");
  response.end();
}

const server = createServer((request: IncomingMessage, response: ServerResponse) => {
  let body = "";
  request.on("data", (part) => {
    body += part;
  });
  request.on("end", () => {
    if (!request.url?.endsWith("/chat/completions")) return void response.writeHead(404).end();
    reply(response, body);
  });
});
await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
const address = server.address();
assert.ok(address && typeof address === "object", "the fake server has no port");

const context = {
  apiKey: () => null,
  customProviders: () => [
    {
      id: PROVIDER,
      name: "Shell endpoint",
      baseUrl: `http://127.0.0.1:${address.port}/v1`,
      apiKey: "test-key",
      models: [{ id: MODEL, name: "Shell model" }],
      headers: [],
    },
  ],
  mcpServers: () => [],
};

interface CaseReport {
  name: CaseName;
  approvals: { method: string; command: string | null }[];
  made: boolean;
  status: string | null;
  error: string | null;
}
const report: { binary: string; cases: CaseReport[]; result?: "pass" | "fail"; error?: string } = {
  binary,
  cases: [],
};
const clients: AgentClient[] = [];

try {
  const driver = requireProviderDriver("opencode");
  const cli = { executable: binary, version: "test", source: "system" as const };
  const client = driver.createClient(cli, 60_000, context, undefined);
  clients.push(client);
  let current: CaseReport | undefined;
  client.on("request", (request) => {
    if (!request.method.endsWith("/requestApproval") || !current) {
      client.respondError(request.id, { code: -32601, message: `The test does not answer ${request.method}.` });
      return;
    }
    const command = isRecord(request.params) ? getString(request.params, "command") : null;
    current.approvals.push({ method: request.method, command });
    client.respond(request.id, { decision: CASES[current.name].decision });
  });
  client.start();
  for (const name of NAMES) {
    const workspace = join(root, `workspace-${name}`);
    mkdirSync(workspace);
    const thread = await startThread(client, { cwd: workspace, model: `${PROVIDER}/${MODEL}` });
    current = { name, approvals: [], made: false, status: null, error: null };
    report.cases.push(current);
    const turn = await runTurn(client, thread, { text: `case:${name}`, timeoutMs: 90_000 });
    current.status = turn.status;
    current.error = turn.error;
    current.made = existsSync(join(workspace, "made-by-opencode"));
    const expected = CASES[name];
    assert.deepEqual(
      current.approvals.map((approval) => approval.command),
      [expected.command],
      `${name}: one approval with the command itself`,
    );
    assert.equal(claudeCommandNeedsApproval(expected.command), expected.needsApproval, `${name}: the card rule`);
    assert.equal(current.made, expected.made, `${name}: the command ran only when accepted`);
  }
  report.result = "pass";
} catch (error) {
  report.result = "fail";
  report.error = error instanceof Error ? error.message : String(error);
  throw error;
} finally {
  await stopClients(clients);
  server.close();
  await rm(root, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
}
process.stdout.write(`PASS opencode-command-approval-e2e: ${join(OUT, "report.json")}\n`);
