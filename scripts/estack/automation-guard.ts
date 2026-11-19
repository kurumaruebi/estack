import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isDynamicRecord, isNumber, isString } from "@estack/contracts/runtime-values";

export const STOP_FILE = "STOP";
export function ledgerFile(repo: string): string {
  return `automation-ledger-${repo.replaceAll(/[^A-Za-z0-9._-]/gu, "_")}.json`;
}

export interface SideEffect {
  pr: number;
  time: string;
}

export interface AutomationLedger {
  handled: number[];
  sideEffects: SideEffect[];
}

export interface SideEffectLimits {
  perHour: number;
  cooldownMs: number;
}

export const SIDE_EFFECT_LIMITS: SideEffectLimits = { perHour: 2, cooldownMs: 15 * 60_000 };

export type SideEffectVerdict = "ok" | "stopped" | "already-done" | "cooldown" | "hourly-limit";

export function stopRequested(workRoot: string): boolean {
  return existsSync(join(workRoot, STOP_FILE));
}

export function parseLedger(value: unknown): AutomationLedger {
  if (!isDynamicRecord(value)) return { handled: [], sideEffects: [] };
  const handled = Array.isArray(value.handled) ? value.handled.filter(isNumber) : [];
  const sideEffects = Array.isArray(value.sideEffects)
    ? value.sideEffects.flatMap((entry: unknown) =>
        isDynamicRecord(entry) && isNumber(entry.pr) && isString(entry.time) && !Number.isNaN(Date.parse(entry.time))
          ? [{ pr: entry.pr, time: entry.time }]
          : [],
      )
    : [];
  return { handled, sideEffects };
}

export function readLedger(path: string): AutomationLedger {
  try {
    return parseLedger(JSON.parse(readFileSync(path, "utf8")));
  } catch {
    return { handled: [], sideEffects: [] };
  }
}

export function writeLedger(path: string, ledger: AutomationLedger): void {
  writeFileSync(path, `${JSON.stringify(ledger, null, 2)}\n`, { mode: 0o600 });
}

export function markHandled(ledger: AutomationLedger, pr: number): AutomationLedger {
  return ledger.handled.includes(pr) ? ledger : { ...ledger, handled: [...ledger.handled, pr].slice(-500) };
}

export function sideEffectVerdict(
  ledger: AutomationLedger,
  pr: number,
  now: Date,
  stopped: boolean,
  limits: SideEffectLimits = SIDE_EFFECT_LIMITS,
): SideEffectVerdict {
  if (stopped) return "stopped";
  if (ledger.sideEffects.some((entry) => entry.pr === pr)) return "already-done";
  const ages = ledger.sideEffects.map((entry) => now.getTime() - Date.parse(entry.time));
  if (ages.some((age) => age < limits.cooldownMs)) return "cooldown";
  if (ages.filter((age) => age < 3_600_000).length >= limits.perHour) return "hourly-limit";
  return "ok";
}

export function recordSideEffect(ledger: AutomationLedger, pr: number, now: Date): AutomationLedger {
  return {
    handled: markHandled(ledger, pr).handled,
    sideEffects: [...ledger.sideEffects, { pr, time: now.toISOString() }].slice(-500),
  };
}

export function devAppEnvironment(base: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return {
    ...Object.fromEntries(Object.entries(base).filter(([name]) => name !== "ELECTRON_RUN_AS_NODE")),
    ESTACK_DEV_SKIP_SEED: "1",
    ESTACK_DEV_READY_TIMEOUT_MS: "300000",
    ESTACK_BLOCK_EXTERNAL_OPEN: "1",
  };
}
