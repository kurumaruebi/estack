import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  devAppEnvironment,
  ledgerFile,
  markHandled,
  parseLedger,
  readLedger,
  recordSideEffect,
  STOP_FILE,
  sideEffectVerdict,
  stopRequested,
  writeLedger,
} from "./automation-guard";

const now = new Date("2026-11-20T00:00:00Z");
const minutesAgo = (n: number) => new Date(now.getTime() - n * 60_000).toISOString();
const empty = { handled: [], sideEffects: [] };

describe("deploy and fuzz after a merge", () => {
  it("runs once for a merge the worker made", () => {
    expect(sideEffectVerdict(empty, 17, now, false)).toBe("ok");
  });

  it("never runs twice for the same pull request, even long after (the 2026-11-19 loop)", () => {
    const ledger = recordSideEffect(empty, 17, new Date(now.getTime() - 86_400_000));
    expect(sideEffectVerdict(ledger, 17, now, false)).toBe("already-done");
  });

  it("waits 15 minutes after the last run and allows two runs an hour", () => {
    expect(sideEffectVerdict({ handled: [], sideEffects: [{ pr: 1, time: minutesAgo(5) }] }, 2, now, false)).toBe(
      "cooldown",
    );
    const twoInHour = {
      handled: [],
      sideEffects: [
        { pr: 1, time: minutesAgo(50) },
        { pr: 2, time: minutesAgo(20) },
      ],
    };
    expect(sideEffectVerdict(twoInHour, 3, now, false)).toBe("hourly-limit");
    expect(sideEffectVerdict({ handled: [], sideEffects: [{ pr: 1, time: minutesAgo(20) }] }, 3, now, false)).toBe(
      "ok",
    );
  });

  it("does nothing while the stop file is there", () => {
    expect(sideEffectVerdict(empty, 17, now, true)).toBe("stopped");
    const root = mkdtempSync(join(tmpdir(), "estack-stop-"));
    expect(stopRequested(root)).toBe(false);
    writeFileSync(join(root, STOP_FILE), "");
    expect(stopRequested(root)).toBe(true);
  });

  it("repeats nothing over many sweeps of the same merged pull request", () => {
    let ledger = recordSideEffect(empty, 17, now);
    let runs = 1;
    for (let sweep = 1; sweep <= 144; sweep++) {
      const at = new Date(now.getTime() + sweep * 10 * 60_000);
      if (sideEffectVerdict(ledger, 17, at, false) === "ok") {
        ledger = recordSideEffect(ledger, 17, at);
        runs++;
      }
    }
    expect(runs).toBe(1);
  });
});

describe("ledger of handled pull requests", () => {
  it("keeps a handled pull request once and survives a broken file", () => {
    expect(markHandled(markHandled(empty, 17), 17).handled).toEqual([17]);
    const dir = mkdtempSync(join(tmpdir(), "estack-ledger-"));
    const path = join(dir, "ledger.json");
    writeFileSync(path, "{not json");
    expect(readLedger(path)).toEqual(empty);
    writeLedger(path, recordSideEffect(empty, 17, now));
    expect(readLedger(path)).toEqual({ handled: [17], sideEffects: [{ pr: 17, time: now.toISOString() }] });
    expect(parseLedger({ handled: ["x", 3], sideEffects: [{ pr: 1, time: "bad" }] })).toEqual({
      handled: [3],
      sideEffects: [],
    });
  });
});

describe("ledger file name", () => {
  it("keeps one ledger per repository, so pull request numbers of two repositories never mix", () => {
    expect(ledgerFile("kurumaruebi/estack")).toBe("automation-ledger-kurumaruebi_estack.json");
    expect(ledgerFile("kurumaruebi/estack")).not.toBe(ledgerFile("kurumaruebi/estack-private-archive"));
  });
});

describe("environment of the dev app that the worker drives", () => {
  it("always blocks opening URLs and files outside the app", () => {
    const environment = devAppEnvironment({ ESTACK_BLOCK_EXTERNAL_OPEN: "0", ELECTRON_RUN_AS_NODE: "1", PATH: "/bin" });
    expect(environment.ESTACK_BLOCK_EXTERNAL_OPEN).toBe("1");
    expect(environment.ELECTRON_RUN_AS_NODE).toBeUndefined();
    expect(environment.PATH).toBe("/bin");
  });
});
