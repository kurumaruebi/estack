import { describe, expect, it } from "vitest";
import { MODEL_RUNS, modelVerdict } from "./check-model";

describe("model check of the merge loop", () => {
  it("passes a clean run and a found violation only when each is expected", () => {
    const clean = "Model checking completed. No error has been found.";
    const broken = "Error: Invariant AtMostOncePerMerge is violated.";
    expect(modelVerdict("pass", 0, clean)).toBe(true);
    expect(modelVerdict("pass", 12, broken)).toBe(false);
    expect(modelVerdict("violation", 12, broken)).toBe(true);
    expect(modelVerdict("violation", 0, clean)).toBe(false);
    expect(modelVerdict("violation", 150, "Error: parse error")).toBe(false);
  });

  it("checks the fixed worker, the old worker and that a deploy is reachable", () => {
    expect(MODEL_RUNS.map((run) => [run.config, run.expect])).toEqual([
      ["MergeLoop.cfg", "pass"],
      ["MergeLoopBefore.cfg", "violation"],
      ["MergeLoopReach.cfg", "violation"],
    ]);
  });
});
