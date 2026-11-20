import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSteps, iphoneEnvironment, localSettings } from "../mobile-iphone";

const mobileRoot = fileURLToPath(new URL("../../apps/mobile", import.meta.url));
const appJson = JSON.parse(readFileSync(join(mobileRoot, "app.json"), "utf8")).expo;
const appConfig = createRequire(join(mobileRoot, "package.json"))("./app.config.js");
const resolve = (env: Record<string, string>) => {
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return appConfig({ config: structuredClone(appJson) });
};
const pluginNames = (config: { plugins: unknown[] }) =>
  config.plugins.map((plugin) => (Array.isArray(plugin) ? plugin[0] : plugin));

afterEach(() => vi.unstubAllEnvs());

describe("mobile app variants", () => {
  it("keeps the released app as it was when no variant is set", () => {
    const config = resolve({ APP_VARIANT: "" });
    expect(config.name).toBe(appJson.name);
    expect(config.scheme).toBe(appJson.scheme);
    expect(config.ios.bundleIdentifier).toBe(appJson.ios.bundleIdentifier);
    expect(config.ios.icon).toBe(appJson.ios.icon);
    expect(pluginNames(config)).toEqual(pluginNames(appJson));
  });

  it("gives the development app its own name, scheme, icon and identifiers, so both fit on one phone", () => {
    const config = resolve({ APP_VARIANT: "development", ESTACK_IOS_BUNDLE_ID: "example.owner.estack" });
    expect(config.name).toBe("estack dev");
    expect(config.scheme).toBe("estack-dev");
    expect(config.ios.bundleIdentifier).toBe("example.owner.estack.dev");
    expect(config.ios.icon).toBe("./assets/icons/app-icon-dev.icon");
    expect(config.android.package).toBe(`${appJson.android.package}.dev`);
    expect(config.plugins).toContainEqual([
      "expo-widgets",
      expect.objectContaining({ groupIdentifier: "group.example.owner.estack.dev" }),
    ]);
    expect(config.plugins).toContainEqual([
      "./plugins/with-share-target",
      expect.objectContaining({
        ios: expect.objectContaining({ extensionBundleIdentifier: "example.owner.estack.dev.ShareExtension" }),
      }),
    ]);
    expect(JSON.stringify(config.plugins)).not.toContain(appJson.ios.bundleIdentifier);
  });

  it("signs with a paid team and keeps every capability and extension", () => {
    const config = resolve({
      APP_VARIANT: "development",
      ESTACK_APPLE_TEAM_ID: "TEAM000000",
      ESTACK_IOS_BUNDLE_ID: "example.owner.estack",
    });
    expect(config.ios.appleTeamId).toBe("TEAM000000");
    expect(config.ios.associatedDomains).toEqual(appJson.ios.associatedDomains);
    expect(pluginNames(config)).toEqual(pluginNames(appJson));
  });

  it("drops what a free Personal Team cannot sign", () => {
    const config = resolve({
      APP_VARIANT: "production",
      ESTACK_IOS_SIGNING: "personal",
      ESTACK_APPLE_TEAM_ID: "TEAM000000",
      ESTACK_IOS_BUNDLE_ID: "example.owner.estack",
    });
    expect(config.ios.appleTeamId).toBe("TEAM000000");
    expect(config.ios.associatedDomains).toBeUndefined();
    expect(pluginNames(config)).not.toContain("expo-widgets");
    expect(pluginNames(config)).not.toContain("./plugins/with-notification-service");
    expect(pluginNames(config)).toContain("./plugins/with-personal-team");
    expect(config.plugins).toContainEqual([
      "./plugins/with-share-target",
      expect.objectContaining({ ios: expect.objectContaining({ enabled: false }) }),
    ]);
  });

  it("refuses an unknown variant and a Personal Team build without a team", () => {
    expect(() => resolve({ APP_VARIANT: "preview" })).toThrow(/APP_VARIANT/u);
    expect(() => resolve({ APP_VARIANT: "", ESTACK_IOS_SIGNING: "personal", ESTACK_APPLE_TEAM_ID: "" })).toThrow(
      /ESTACK_APPLE_TEAM_ID/u,
    );
  });
});

describe("mobile-iphone", () => {
  it("reads the local settings file", () => {
    expect(
      localSettings('ESTACK_APPLE_TEAM_ID=TEAM000000\n# note\nESTACK_IOS_BUNDLE_ID="example.owner.estack"\n'),
    ).toEqual({
      ESTACK_APPLE_TEAM_ID: "TEAM000000",
      ESTACK_IOS_BUNDLE_ID: "example.owner.estack",
    });
  });

  it("builds the released app as a Release build and the development app as a dev client without a local bundler", () => {
    const env = { ESTACK_APPLE_TEAM_ID: "TEAM000000", ESTACK_IOS_BUNDLE_ID: "example.owner.estack" };
    expect(iphoneEnvironment("development", env)).toMatchObject({
      APP_VARIANT: "development",
      ESTACK_APPLE_TEAM_ID: "TEAM000000",
    });
    expect(iphoneEnvironment("development", env)).not.toHaveProperty("ESTACK_IOS_SIGNING");
    expect(iphoneEnvironment("development", { ...env, ESTACK_IOS_SIGNING: "personal" })).toMatchObject({
      ESTACK_IOS_SIGNING: "personal",
    });
    expect(() => iphoneEnvironment("development", { ...env, ESTACK_IOS_SIGNING: "free" })).toThrow(
      /ESTACK_IOS_SIGNING/u,
    );
    expect(() => iphoneEnvironment("development", {})).toThrow(/ESTACK_APPLE_TEAM_ID/u);
    expect(() => iphoneEnvironment("preview", env)).toThrow();
    expect(buildSteps("production", "PHONE")[1]).toEqual([
      "run:ios",
      "--configuration",
      "Release",
      "--device",
      "PHONE",
    ]);
    expect(buildSteps("development", undefined)[1]).toEqual([
      "run:ios",
      "--configuration",
      "Debug",
      "--device",
      "--no-bundler",
    ]);
  });

  it("passes the account service of the local settings to the build of either variant", () => {
    const env = { ESTACK_APPLE_TEAM_ID: "TEAM000000", ESTACK_IOS_BUNDLE_ID: "example.owner.estack" };
    expect(iphoneEnvironment("production", env)).not.toHaveProperty("EXPO_PUBLIC_ESTACK_API_URL");
    expect(iphoneEnvironment("development", env)).not.toHaveProperty("EXPO_PUBLIC_ESTACK_API_URL");
    for (const variant of ["production", "development"] as const) {
      expect(
        iphoneEnvironment(variant, { ...env, EXPO_PUBLIC_ESTACK_API_URL: " http://100.101.102.103:3100 " }),
      ).toMatchObject({
        APP_VARIANT: variant,
        EXPO_PUBLIC_ESTACK_API_URL: "http://100.101.102.103:3100",
      });
    }
  });
});
