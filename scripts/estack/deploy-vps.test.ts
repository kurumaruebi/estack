import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const script = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "estack", "bin", "deploy-vps");
const git = (cwd: string, ...args: string[]) =>
  execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@example.invalid", ...args], { cwd, encoding: "utf8" });

function setup(): { root: string; checkout: string; run: (...args: string[]) => number; log: () => string } {
  const root = mkdtempSync(join(tmpdir(), "estack-deploy-"));
  const origin = join(root, "proxy", "git");
  mkdirSync(origin, { recursive: true });
  git(origin, "init", "-q", "-b", "main");
  mkdirSync(join(origin, "estack", "bin"), { recursive: true });
  for (const tool of ["estack-instance", "check-metro"]) {
    writeFileSync(join(origin, "estack", "bin", tool), "#!/bin/sh\nexit 0\n");
    chmodSync(join(origin, "estack", "bin", tool), 0o755);
  }
  writeFileSync(join(origin, "routeTree.gen.ts"), "old\n");
  git(origin, "add", "-A");
  git(origin, "commit", "-q", "-m", "first");
  const checkout = join(root, "checkout");
  git(root, "clone", "-q", origin, checkout);
  writeFileSync(join(origin, "routeTree.gen.ts"), "new\n");
  git(origin, "commit", "-q", "-am", "regenerated");
  const instances = join(root, "instances");
  mkdirSync(instances);
  writeFileSync(join(instances, "dev.env"), `ESTACK_CHECKOUT=${checkout}\n`);
  git(origin, "tag", "v0.1.0");
  const data = join(root, "data");
  mkdirSync(data);
  writeFileSync(
    join(instances, "stable.env"),
    `ESTACK_CHECKOUT=${checkout}\nESTACK_DATA_DIR=${data}\nESTACK_BACKUP_DIR=${join(root, "backups")}\n`,
  );
  const home = join(root, "home");
  mkdirSync(home);
  const run = (...args: string[]) =>
    spawnSync("sh", [script, ...args], {
      env: {
        PATH: process.env.PATH,
        HOME: home,
        ESTACK_INSTANCE_DIR: instances,
        ESTACK_GITHUB_READ_PROXY: join(root, "proxy"),
      },
      encoding: "utf8",
    }).status ?? -1;
  return { root, checkout, run, log: () => readFileSync(join(home, ".cache", "estack", "deploy.log"), "utf8") };
}

describe("deploy-vps", () => {
  it("refuses to run without a channel, so nothing deploys main to stable", () => {
    expect(setup().run()).toBe(2);
  });

  it("deploys dev when the only change is a file that already matches main, and keeps it in a stash", () => {
    const { checkout, run, log } = setup();
    writeFileSync(join(checkout, "routeTree.gen.ts"), "new\n");
    expect(run("dev")).toBe(0);
    expect(git(checkout, "log", "-1", "--format=%s").trim()).toBe("regenerated");
    expect(git(checkout, "status", "--porcelain", "--untracked-files=no")).toBe("");
    expect(git(checkout, "stash", "list")).toContain("already the same as FETCH_HEAD");
    expect(log()).toContain("Set aside changed files that already match FETCH_HEAD");
  });

  it("does not deploy over a change that differs from main", () => {
    const { checkout, run, log } = setup();
    writeFileSync(join(checkout, "routeTree.gen.ts"), "hand edit\n");
    expect(run("dev")).toBe(1);
    expect(git(checkout, "log", "-1", "--format=%s").trim()).toBe("first");
    expect(git(checkout, "stash", "list")).toBe("");
    expect(readFileSync(join(checkout, "routeTree.gen.ts"), "utf8")).toBe("hand edit\n");
    expect(log()).toContain("Not deploying");
  });

  it("moves stable to a release tag over a file that already matches the tag, and keeps it in a stash", () => {
    const { checkout, run } = setup();
    writeFileSync(join(checkout, "routeTree.gen.ts"), "new\n");
    expect(run("stable", "v0.1.0")).toBe(0);
    expect(git(checkout, "log", "-1", "--format=%s").trim()).toBe("regenerated");
    expect(git(checkout, "status", "--porcelain", "--untracked-files=no")).toBe("");
    expect(git(checkout, "stash", "list")).toContain("already the same as");
    expect(run("stable", "main")).toBe(2);
  });
});
