import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const VARIANTS = { production: "Release", development: "Debug" } as const;
type Variant = keyof typeof VARIANTS;

function isVariant(value: string): value is Variant {
  return Object.hasOwn(VARIANTS, value);
}

export function localSettings(text: string): Record<string, string> {
  const settings: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/u.exec(line);
    if (match?.[1] && match[2] !== undefined) settings[match[1]] = match[2].replace(/^"(.*)"$/u, "$1");
  }
  return settings;
}

export function iphoneEnvironment(
  variant: string,
  env: Readonly<Record<string, string | undefined>>,
): Record<string, string> {
  if (!isVariant(variant)) throw new Error(`Use production or development, not "${variant}".`);
  const teamId = env.ESTACK_APPLE_TEAM_ID?.trim();
  const bundleId = env.ESTACK_IOS_BUNDLE_ID?.trim();
  if (!teamId || !bundleId) {
    throw new Error(
      "Set ESTACK_APPLE_TEAM_ID (your team in Xcode) and ESTACK_IOS_BUNDLE_ID (a bundle ID of your own) in ~/.config/estack/iphone.env.",
    );
  }
  const signing = env.ESTACK_IOS_SIGNING?.trim() || "team";
  if (signing !== "team" && signing !== "personal") {
    throw new Error(`ESTACK_IOS_SIGNING is "${signing}". Use team (a paid Apple Developer Program team) or personal.`);
  }
  const apiUrl = env.EXPO_PUBLIC_ESTACK_API_URL?.trim();
  return {
    APP_VARIANT: variant,
    EXPO_PUBLIC_APP_ENV: variant,
    ...(signing === "personal" ? { ESTACK_IOS_SIGNING: "personal" } : {}),
    ...(apiUrl ? { EXPO_PUBLIC_ESTACK_API_URL: apiUrl } : {}),
    ESTACK_APPLE_TEAM_ID: teamId,
    ESTACK_IOS_BUNDLE_ID: bundleId,
  };
}

export function buildSteps(variant: Variant, device: string | undefined): string[][] {
  const run = ["run:ios", "--configuration", VARIANTS[variant], "--device", ...(device ? [device] : [])];
  return [["prebuild", "--platform", "ios", "--clean"], variant === "development" ? [...run, "--no-bundler"] : run];
}

function main(): number {
  const [variant = "", ...rest] = process.argv.slice(2);
  const deviceAt = rest.indexOf("--device");
  const device = deviceAt >= 0 ? rest[deviceAt + 1] : undefined;
  const file = join(homedir(), ".config", "estack", "iphone.env");
  const saved = existsSync(file) ? localSettings(readFileSync(file, "utf8")) : {};
  if (!isVariant(variant)) throw new Error(`Use production or development, not "${variant}".`);
  const settings = iphoneEnvironment(variant, { ...saved, ...process.env });
  const mobileRoot = fileURLToPath(new URL("../apps/mobile", import.meta.url));
  const expo = createRequire(join(mobileRoot, "package.json")).resolve("expo/bin/cli");
  for (const step of buildSteps(variant, device)) {
    const result = spawnSync("node", [expo, ...step], {
      cwd: mobileRoot,
      stdio: "inherit",
      env: { ...process.env, ...settings },
    });
    if (result.status !== 0) return result.status ?? 1;
  }
  return 0;
}

if (import.meta.main) process.exit(main());
