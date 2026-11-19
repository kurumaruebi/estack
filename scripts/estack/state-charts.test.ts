import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { RESULT_STATES } from "./coding-jobs";
import { earlyMergeAnswer, PULL_STAGES, sessionIsDone, startsDeploy } from "./mac-worker";
import { chartEdges } from "./state-chart";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

describe("state chart of the Mac worker", () => {
  const edges = chartEdges(readFileSync(join(root, "estack", "状態の図", "作業係.md"), "utf8"));
  const from = (state: string) => edges.filter((edge) => edge.from === state);

  it("has every pull request stage of the code", () => {
    const states = new Set(edges.flatMap((edge) => [edge.from, edge.to]));
    expect(PULL_STAGES.filter((stage) => !states.has(stage))).toEqual([]);
  });

  it.each(PULL_STAGES)("answers a merge request in stage %s as the code does", (stage) => {
    const answer = earlyMergeAnswer(stage);
    if (answer === null) {
      expect(from(stage)).toContainEqual({ from: stage, to: "merging", label: "approved" });
      return;
    }
    expect(from(stage)).toContainEqual({
      from: stage,
      to: sessionIsDone(stage) ? "forgotten" : stage,
      label: answer.state,
    });
    expect(from(stage).some((edge) => edge.to === "merging")).toBe(false);
  });

  it.each(RESULT_STATES.filter((state) => state !== "pr-opened"))(
    "goes from a merge attempt that answers %s to the place the code goes",
    (state) => {
      const targets = from("merging").filter((edge) => edge.label === state);
      expect(targets).toHaveLength(1);
      expect(targets[0]?.to === "deployed").toBe(startsDeploy({ state }));
    },
  );

  it("deploys only after a merge that the worker made, and fuzzes only after that deploy", () => {
    expect(edges.filter((edge) => edge.to === "deployed")).toEqual([
      { from: "merging", to: "deployed", label: "merged" },
    ]);
    expect(edges.filter((edge) => edge.to === "fuzzed").map((edge) => edge.from)).toEqual(["deployed"]);
    expect(from("merged").map((edge) => edge.to)).toEqual(["forgotten"]);
  });
});
