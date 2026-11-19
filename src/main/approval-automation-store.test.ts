import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Effect } from "effect";
import { afterEach, describe, expect, it } from "vitest";
import { readApprovalAutomation } from "./approval-automation-store";

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("approval automation defaults", () => {
  it("asks before an agent acts when no choice was saved", async () => {
    const root = mkdtempSync(join(tmpdir(), "approval-automation-"));
    roots.push(root);
    const preference = await Effect.runPromise(readApprovalAutomation(join(root, "missing.json"), ["agent-1"]));
    expect(preference).toEqual({ defaultAutoApprove: false, autoApproveOverrides: {} });
  });
});
