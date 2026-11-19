import { randomUUID } from "node:crypto";
import { cpSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isDynamicRecord, isString } from "@estack/contracts/runtime-values";
import { createEstackLogger } from "@estack/logging";
import { connectToDevApp } from "../../scripts/dev-automation/cdp-client";
import { readDevInstanceRecords, selectDevInstance } from "../../scripts/dev-automation/instance-registry";

const projectRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const agentsFolder = join(projectRoot, "estack", "agents");

const MUSE = { provider: "opencode", model: "opencode-go/muse-spark-1.3-contributor" } as const;

const ROLES = [
  { name: "窓口", seed: "front-desk", ...MUSE, description: "持ち主と話し、頼みを整理して振る" },
  {
    name: "開発のリード",
    seed: "dev-lead",
    ...MUSE,
    description: "仕事を分けて PR を見張る。コードは書かない",
  },
  {
    name: "エンジニア",
    seed: "engineer",
    ...MUSE,
    description: "Mac の作業係に依頼を出し、結果を確かめる",
  },
  { name: "調べもの", seed: "researcher", ...MUSE, description: "Web と GitHub を読むだけ" },
  {
    name: "見直し係",
    seed: "reviewer",
    provider: "codex",
    model: "gpt-6-luna",
    description: "朝の見直しを Codex の目でする",
  },
  {
    name: "不具合係",
    seed: "bug-collector",
    ...MUSE,
    description: "試し操作の結果を集め、不具合を開発のリードに流す",
  },
] as const;

const CHANNEL = {
  name: "開発",
  instructions:
    "estack の開発のチャンネル。窓口が頼みを持ち込み、開発のリードが分け、エンジニアが Mac の作業係に依頼を出す。PR の URL と証拠をここに書く。",
};

const CHANNEL_ID = "estack-development";

const ROUTINES = [
  {
    agent: "エンジニア",
    name: "依頼の結果を見る",
    instruction:
      "`~/Projects/estack/estack/bin/coding report 2h` を 1 回だけ実行し、前の回から新しく終わった依頼があれば、PR の URL・結果・CI をこのチャンネルに短く書く。新しい結果が無ければ「新しい結果なし」とだけ書く。",
    schedule: { kind: "interval", amount: 2, unit: "hours", anchorAt: new Date().toISOString() },
  },
  {
    agent: "見直し係",
    name: "朝の見直し",
    instruction:
      "`~/Projects/estack/estack/bin/coding report 24h` を 1 回だけ実行して、この 24 時間の判断と依頼と PR の CI を読む（ほかのコマンドは使わない）。このチャンネルに、まず「注意」（失敗・止まった依頼・持ち主の承認待ち・おかしな判断）を書き、次にマージされた PR と開いている PR を 1 行ずつ書く。",
    schedule: { kind: "weekdays", time: "08:30" },
  },
  {
    agent: "不具合係",
    name: "試し操作の結果を見る",
    instruction: "AGENTS.md の手順で、この 24 時間の試し操作の結果を読み、不具合があれば開発のリードに宛てて書く。",
    schedule: { kind: "weekdays", time: "08:00" },
  },
] as const;

const selection = selectDevInstance(readDevInstanceRecords(), { projectRoot, service: "app" });
if (selection.kind !== "selected")
  throw new Error("この作業場の開発用アプリが動いていません。先に開発用一式を起動してください。");

mkdirSync(join(homedir(), ".agents", "skills"), { recursive: true });
cpSync(join(agentsFolder, "skills", "estack-coding"), join(homedir(), ".agents", "skills", "estack-coding"), {
  recursive: true,
});

const session = await connectToDevApp(
  selection.record.remoteDebuggingPort,
  createEstackLogger("setup-agents", (line) => process.stderr.write(`${line}\n`), "warn"),
  { expectedRendererPort: selection.record.rendererPort, ownerPid: selection.record.pid },
);

const call = async <T>(method: string, input: unknown, parse: (value: unknown) => T): Promise<T> =>
  parse(
    await session.page.evaluate(`window.estack.agent.${method}(${input === undefined ? "" : JSON.stringify(input)})`),
  );

const idOf = (value: unknown): string | null => (isDynamicRecord(value) && isString(value.id) ? value.id : null);
const listOf = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const textOf = (value: unknown): string => (isDynamicRecord(value) && isString(value.text) ? value.text : "");
const ignore = (): null => null;

const agentIds = new Map<string, string>();
try {
  for (const agent of await call("listAgents", undefined, listOf)) {
    if (isDynamicRecord(agent) && isString(agent.name) && isString(agent.id)) agentIds.set(agent.name, agent.id);
  }
  for (const role of ROLES) {
    if (!agentIds.has(role.name)) {
      const created = await call(
        "createAgent",
        {
          name: role.name,
          description: role.description,
          avatarSeed: role.seed,
          avatarHue: null,
          initialMessage: "AGENTS.md を読み、自分の役割を 1 行で答えてください。",
        },
        idOf,
      );
      if (created === null) throw new Error(`${role.name} を作れませんでした。`);
      agentIds.set(role.name, created);
      process.stdout.write(`作った: ${role.name}\n`);
    }
    const agentId = agentIds.get(role.name) ?? "";
    await call("updateAgent", { agentId, provider: role.provider, model: role.model }, ignore);
    const expected = await call("readAgentInstructions", agentId, textOf);
    const text = readFileSync(join(agentsFolder, `${role.name}.md`), "utf8");
    if (expected !== text) {
      await call("saveAgentInstructions", { agentId, text, expected }, ignore);
      process.stdout.write(`指示を書いた: ${role.name}\n`);
    }
  }

  const members = ROLES.map((role) => ({ agentId: agentIds.get(role.name) ?? "" }));
  await call(
    "channelCommand",
    {
      type: "save",
      operationId: randomUUID(),
      channelId: CHANNEL_ID,
      draft: {
        name: CHANNEL.name,
        title: CHANNEL.name,
        instructions: CHANNEL.instructions,
        members,
        leadAgentId: agentIds.get("開発のリード") ?? null,
      },
    },
    ignore,
  );
  process.stdout.write(`チャンネル: ${CHANNEL.name}\n`);

  for (const routine of ROUTINES) {
    const agentId = agentIds.get(routine.agent) ?? "";
    for (const old of await call("listRoutines", agentId, listOf)) {
      if (isDynamicRecord(old) && old.name === routine.name && isString(old.id)) {
        await call("deleteRoutine", { agentId, routineId: old.id }, ignore);
        process.stdout.write(`エージェントのルーチンをチャンネルへ移す: ${routine.name}\n`);
      }
    }
    const channelRoutines = await call("listChannelRoutines", CHANNEL_ID, listOf);
    const existing = channelRoutines.find((candidate) => isDynamicRecord(candidate) && candidate.name === routine.name);
    const instruction = `${routine.agent}: ${routine.instruction}`;
    if (isDynamicRecord(existing) && isString(existing.id)) {
      if (existing.instruction !== instruction) {
        await call("updateChannelRoutine", { channelId: CHANNEL_ID, routineId: existing.id, instruction }, ignore);
        process.stdout.write(`チャンネルのルーチンの指示を直した: ${routine.name}\n`);
      }
      continue;
    }
    await call(
      "createChannelRoutine",
      {
        channelId: CHANNEL_ID,
        name: routine.name,
        instruction,
        active: true,
        timezone: "Asia/Tokyo",
        schedule: routine.schedule,
      },
      ignore,
    );
    process.stdout.write(`チャンネルのルーチン: ${routine.name}\n`);
  }
} finally {
  await session.close();
}
