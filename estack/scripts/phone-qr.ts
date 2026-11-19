import { chmodSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseMobileConnectUrl } from "@estack/contracts/mobile-connect";
import { isDynamicRecord, isString } from "@estack/contracts/runtime-values";
import { createEstackLogger } from "@estack/logging";
import QRCode from "qrcode";
import { connectToDevApp } from "../../scripts/dev-automation/cdp-client";
import { readDevInstanceRecords, selectDevInstance } from "../../scripts/dev-automation/instance-registry";

const projectRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const expoGoIndex = process.argv.indexOf("--expo-go");
const expoGoOrigin = expoGoIndex >= 0 ? process.argv[expoGoIndex + 1] : undefined;
const output = expoGoIndex >= 0 ? null : (process.argv[2] ?? join(homedir(), ".cache", "estack", "phone-qr.png"));
const logger = createEstackLogger("phone-qr", (line) => process.stderr.write(`${line}\n`), "warn");

const selection = selectDevInstance(readDevInstanceRecords(), { projectRoot, service: "app" });
if (selection.kind !== "selected")
  throw new Error("この作業場の開発用アプリが動いていません。先に開発用一式を起動してください。");
const desktop = selection.record;

const session = await connectToDevApp(desktop.remoteDebuggingPort, logger, {
  expectedRendererPort: desktop.rendererPort,
  ownerPid: desktop.pid,
});
let link: string;
try {
  const ticket = await session.page.evaluate("window.estack.auth.createMobileConnect()");
  const value = isDynamicRecord(ticket) && isString(ticket.qrData) ? ticket.qrData : null;
  if (!value || !parseMobileConnectUrl(value))
    throw new Error("開発用アプリが正しい Mobile Connect のリンクを返しませんでした。");
  link = value;
} finally {
  await session.close();
}

if (output === null) {
  if (!expoGoOrigin?.startsWith("exp://"))
    throw new Error("--expo-go には exp://<アドレス>:<ポート> を渡してください。");
  process.stdout.write(`${expoGoOrigin}/--/mobile-connect${new URL(link).search}\n`);
} else if (output === "-") {
  process.stdout.write(await QRCode.toBuffer(link, { width: 600, margin: 2 }));
} else {
  mkdirSync(dirname(output), { recursive: true });
  await QRCode.toFile(output, link, { width: 600, margin: 2 });
  chmodSync(output, 0o600);
  process.stdout.write(`${output}\n`);
}
