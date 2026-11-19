import { spawn } from "node:child_process";
import { join } from "node:path";

export const RELEASE_TAG = /^v\d+\.\d+\.\d+$/u;

export interface DeployCommand {
  command: string;
  args: string[];
}

export function isReleaseTag(value: unknown): value is string {
  return typeof value === "string" && RELEASE_TAG.test(value);
}

export function devDeployCommand(env: Readonly<Record<string, string | undefined>>): DeployCommand {
  const user = env.ESTACK_DEV_DEPLOY_USER ?? "estack-dev";
  const checkout = env.ESTACK_DEV_CHECKOUT ?? `/home/${user}/Projects/estack`;
  return {
    command: "/usr/bin/sudo",
    args: ["-n", "-H", "-u", user, join(checkout, "estack", "bin", "deploy-vps"), "dev"],
  };
}

export function stableReleaseCommand(stableCheckout: string, tag: string): DeployCommand {
  if (!isReleaseTag(tag)) throw new Error(`A release needs a tag like v0.1.0: ${tag}`);
  return { command: join(stableCheckout, "estack", "bin", "deploy-vps"), args: ["stable", tag] };
}

export function queueCodeUpdateCommand(queueCheckout: string): DeployCommand {
  return { command: join(queueCheckout, "estack", "bin", "update-queue-code"), args: [] };
}

export function launchDetached(deploy: DeployCommand): void {
  spawn(deploy.command, deploy.args, { detached: true, stdio: "ignore" }).unref();
}
