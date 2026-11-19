import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createEstackLogger } from "@estack/logging";
import { connectToDevApp } from "../../scripts/dev-automation/cdp-client";
import { readDevInstanceRecords, selectDevInstance } from "../../scripts/dev-automation/instance-registry";

const [method, input] = process.argv.slice(2);
if (!method || !/^[A-Za-z]+$/u.test(method)) {
  process.stderr.write("使い方: bun estack/scripts/agent-call.ts <window.estack.agent のメソッド> [JSON]\n");
  process.exit(2);
}
const projectRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const selection = selectDevInstance(readDevInstanceRecords(), { projectRoot, service: "app" });
if (selection.kind !== "selected") throw new Error("この作業場の開発用アプリが動いていません。");
const session = await connectToDevApp(
  selection.record.remoteDebuggingPort,
  createEstackLogger("agent-call", (line) => process.stderr.write(`${line}\n`), "warn"),
  { expectedRendererPort: selection.record.rendererPort, ownerPid: selection.record.pid },
);
try {
  const payload = input === undefined ? "" : JSON.stringify(JSON.parse(input));
  const result = await session.page.evaluate(`window.estack.agent.${method}(${payload})`);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} finally {
  await session.close();
}
