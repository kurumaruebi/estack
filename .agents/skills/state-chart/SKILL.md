---
name: state-chart
description: Draw the states and transitions of a screen or a long-running flow as a Mermaid state chart in estack/状態の図/, and tie it to the code with a test, so the chart and the code cannot drift apart. Use when a change adds or changes a state, a status value, or a transition (a screen with several modes, a job or pull request lifecycle, a retry loop), or when a bug came from a transition that nobody drew.
---

# State chart

A state that nobody drew gets a transition that nobody wanted. The
2026-11-19 loop (a merged pull request started a deploy and a fuzz run
every 10 minutes) was a missing edge: "already merged" went to "deployed".

## Steps

1. Find the states in the code: the union type or the `as const` list
   that holds them. If the states are only strings spread over the code,
   first make one exported `as const` list and derive the type from it.
2. Write `estack/状態の図/<name>.md` with one `stateDiagram-v2` block.
   Name each edge with the value the code returns, or with an outside
   event in English (`approved`, `outside`).
3. Add a case to `scripts/estack/state-charts.test.ts` that reads the
   chart with `chartEdges` and checks it against the functions that decide
   the transitions. Check the forbidden edges too: which states may enter
   a state with a side effect (deploy, send, delete).
4. Change the chart and the code in the same commit.

## Verification

- `bunx vitest run scripts/estack/state-charts.test.ts` passes.
- Remove one edge from the chart and see the test fail.
