import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { isDynamicRecord, isString } from "@estack/contracts/runtime-values";
import { createEstackLogger } from "@estack/logging";
import { connectToDevApp } from "../../scripts/dev-automation/cdp-client";
import { readDevInstanceRecords, selectDevInstance } from "../../scripts/dev-automation/instance-registry";

const projectRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const email = process.argv[2];
if (!email?.includes("@")) throw new Error("使い方: bun estack/scripts/server-signin.ts <メールアドレス>");

const selection = selectDevInstance(readDevInstanceRecords(), { projectRoot, service: "app" });
if (selection.kind !== "selected")
  throw new Error(
    "この作業場の開発用アプリが動いていません。先に estack/bin/estack-instance <版> start を回してください。",
  );
const desktop = selection.record;
const logger = createEstackLogger("server-signin", (line) => process.stderr.write(`${line}\n`), "warn");
const session = await connectToDevApp(desktop.remoteDebuggingPort, logger, {
  expectedRendererPort: desktop.rendererPort,
  ownerPid: desktop.pid,
});

try {
  const state = await session.page.evaluate("window.estack.auth.getState()");
  const current = isDynamicRecord(state) && isDynamicRecord(state.user) ? state.user.email : null;
  if (current !== email) {
    if (current) await session.page.evaluate("window.estack.auth.logout()");
    const started = await session.page.evaluate(`window.estack.auth.requestEmailCode(${JSON.stringify(email)})`);
    const challengeId = isDynamicRecord(started) && isString(started.challengeId) ? started.challengeId : null;
    const code = isDynamicRecord(started) && isString(started.developmentCode) ? started.developmentCode : null;
    if (!challengeId || !code) throw new Error("開発用のアカウントの仕組みが確認のコードを返しませんでした。");
    const verified = await session.page.evaluate(
      `window.estack.auth.verifyEmailCode(${JSON.stringify({ challengeId, code })})`,
    );
    if (!isDynamicRecord(verified) || verified.status !== "signed_in")
      throw new Error("サーバーのサインインに失敗しました。");
  }
  await session.page.evaluate("window.estack.auth.createMobileConnect()");
  await session.page.evaluate("window.estack.auth.cancelMobileConnect()");
  process.stdout.write(`サーバーは ${email} で入り、公開を始めました。\n`);
} finally {
  await session.close();
}
