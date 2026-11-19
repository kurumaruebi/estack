import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const TLA_TOOLS_URL = "https://github.com/tlaplus/tlaplus/releases/download/v1.8.0/tla2tools.jar";
export const TLA_TOOLS_SHA256 = "7e53aa636dac8a3cb0533f343115c0548e03fc0ce5edc7739becf58d3d0fb84f";

export type Expectation = "pass" | "violation";

export interface ModelRun {
  config: string;
  expect: Expectation;
  why: string;
}

export const MODEL_RUNS: readonly ModelRun[] = [
  { config: "MergeLoop.cfg", expect: "pass", why: "今の作業係で、反映とファズが自分のマージのあと 1 回だけになる" },
  {
    config: "MergeLoopBefore.cfg",
    expect: "violation",
    why: "2026-11-19 より前の作業係では、マージ済みの PR で反映とファズが走る（モデルが不具合を見つけられる）",
  },
  {
    config: "MergeLoopReach.cfg",
    expect: "violation",
    why: "今の作業係でも、反映には実際にたどり着ける（空の証明ではない）",
  },
];

export function modelVerdict(expect: Expectation, status: number | null, output: string): boolean {
  if (expect === "pass") return status === 0 && output.includes("Model checking completed. No error has been found.");
  return /(Invariant|Action property|Temporal properties) .* violated/u.test(output) && status !== 0;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const modelsDir = join(root, "estack", "models");

async function toolsJar(): Promise<string> {
  const path = process.env.ESTACK_TLA_TOOLS_JAR ?? join(homedir(), ".cache", "estack", "tla2tools-1.8.0.jar");
  const matches = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex") === TLA_TOOLS_SHA256;
  if (existsSync(path) && matches(readFileSync(path))) return path;
  const response = await fetch(TLA_TOOLS_URL);
  if (!response.ok) throw new Error(`tla2tools.jar を取れませんでした: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!matches(bytes)) throw new Error("tla2tools.jar の SHA-256 が合いません。");
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, bytes);
  return path;
}

async function main(): Promise<0 | 1> {
  const jar = await toolsJar();
  let ok = true;
  for (const model of MODEL_RUNS) {
    const metadir = mkdtempSync(join(tmpdir(), "estack-tlc-"));
    const result = spawnSync(
      "java",
      [
        "-XX:+UseParallelGC",
        "-cp",
        jar,
        "tlc2.TLC",
        "-workers",
        "auto",
        "-noGenerateSpecTE",
        "-metadir",
        metadir,
        "-config",
        model.config,
        "MergeLoop.tla",
      ],
      { cwd: modelsDir, encoding: "utf8", timeout: 10 * 60_000 },
    );
    rmSync(metadir, { recursive: true, force: true });
    const output = `${result.stdout}\n${result.stderr}`;
    const passed = modelVerdict(model.expect, result.status, output);
    ok &&= passed;
    process.stdout.write(`${passed ? "ok" : "NG"}: ${model.config}（${model.why}）\n`);
    if (!passed) process.stdout.write(`${output.slice(-4000)}\n`);
  }
  return ok ? 0 : 1;
}

if (import.meta.main) process.exit(await main());
