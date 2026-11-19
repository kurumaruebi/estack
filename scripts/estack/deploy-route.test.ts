import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CodingQueue } from "./coding-queue";
import { type DeployCommand, devDeployCommand, isReleaseTag, stableReleaseCommand } from "./deploy-route";
import { releaseArguments } from "./mac-worker";
import { serve } from "./queue-server";

const temporary = (prefix: string) => mkdtempSync(join(tmpdir(), prefix));

function capture(): { launched: DeployCommand[]; launch: (deploy: DeployCommand) => void } {
  const launched: DeployCommand[] = [];
  return { launched, launch: (deploy) => launched.push(deploy) };
}

const touchesStable = (deploy: DeployCommand) => deploy.args.includes("stable");

describe("where the VPS queue deploys", () => {
  it("deploys only the dev instance for the deploy command, and updates its own code", async () => {
    const { launched, launch } = capture();
    const root = temporary("estack-route-");
    const output = await serve("deploy", new CodingQueue(root), async () => "", join(root, "d.tsv"), root, launch);
    expect(JSON.parse(output)).toEqual({ deploying: "dev" });
    expect(launched[0]?.args.at(-1)).toBe("dev");
    expect(launched[0]?.args.at(-2)?.endsWith("/estack/bin/deploy-vps")).toBe(true);
    expect(launched[1]?.command.endsWith("/estack/bin/update-queue-code")).toBe(true);
    expect(launched.some(touchesStable)).toBe(false);
  });

  it("never deploys stable after a merged result", async () => {
    const { launched, launch } = capture();
    const root = temporary("estack-route-");
    const queue = new CodingQueue(root);
    const id = "20261120010203-abcdef";
    queue.enqueue({
      kind: "merge",
      id,
      createdAt: "2026-11-20T01:02:03.000Z",
      requestedBy: "owner",
      codeJobId: "20261119010203-abc123",
      pr: 7,
      approval: "approved",
    });
    queue.claimNext("merge");
    const result = {
      id,
      state: "merged",
      finishedAt: "2026-11-20T01:02:03.000Z",
      summary: "Merged.",
      branch: null,
      pr: { number: 7, url: "https://github.com/owner/repo/pull/7" },
      evidence: [],
      review: null,
    };
    await serve(`result ${id}`, queue, async () => JSON.stringify(result), join(root, "d.tsv"), root, launch);
    expect(launched.length).toBe(2);
    expect(launched[0]?.args.at(-1)).toBe("dev");
    expect(launched.some(touchesStable)).toBe(false);
  });

  it("deploys stable only for a release of a v0.x.y tag", async () => {
    const { launched, launch } = capture();
    const root = temporary("estack-route-");
    const queue = new CodingQueue(root);
    const output = await serve("release v0.73.0", queue, async () => "", join(root, "d.tsv"), root, launch);
    expect(JSON.parse(output)).toEqual({ deploying: "stable", tag: "v0.73.0" });
    expect(launched).toHaveLength(1);
    expect(launched[0]?.args).toEqual(["stable", "v0.73.0"]);
    for (const bad of ["release main", "release v1", "release", "release v0.1.0-rc1"])
      await expect(serve(bad, queue, async () => "", join(root, "d.tsv"), root, launch)).rejects.toThrow();
    expect(launched).toHaveLength(1);
  });

  it("names the dev deploy through sudo as the dev user, with its checkout", () => {
    expect(devDeployCommand({})).toEqual({
      command: "/usr/bin/sudo",
      args: ["-n", "-H", "-u", "estack-dev", "/home/estack-dev/Projects/estack/estack/bin/deploy-vps", "dev"],
    });
    expect(devDeployCommand({ ESTACK_DEV_DEPLOY_USER: "dev2", ESTACK_DEV_CHECKOUT: "/srv/dev" }).args).toEqual([
      "-n",
      "-H",
      "-u",
      "dev2",
      "/srv/dev/estack/bin/deploy-vps",
      "dev",
    ]);
  });

  it("accepts only v0.x.y tags for stable", () => {
    expect(isReleaseTag("v0.73.0")).toBe(true);
    expect(isReleaseTag("main")).toBe(false);
    expect(() => stableReleaseCommand("/srv/stable", "main")).toThrow();
    expect(stableReleaseCommand("/srv/stable", "v1.2.3")).toEqual({
      command: "/srv/stable/estack/bin/deploy-vps",
      args: ["stable", "v1.2.3"],
    });
  });

  it("needs the owner's approval text for a release from the Mac", () => {
    expect(releaseArguments(["v0.73.0", "--approved", "持ち主の承認 2026-11-20"])).toEqual({
      tag: "v0.73.0",
      approval: "持ち主の承認 2026-11-20",
    });
    expect(releaseArguments(["v0.73.0"])).toBeNull();
    expect(releaseArguments(["v0.73.0", "--approved", " "])).toBeNull();
    expect(releaseArguments(["main", "--approved", "yes"])).toBeNull();
  });
});
