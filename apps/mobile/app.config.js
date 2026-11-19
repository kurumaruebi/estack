const { existsSync } = require("node:fs");
const { isAbsolute } = require("node:path");

// Android notifications come through Firebase Cloud Messaging, which needs the Firebase file of the
// app. The file is optional, so the app builds before the Firebase project exists, and such a build
// gets no notifications on Android. The file has public identifiers only; the account service has the
// key that sends.
function googleServicesFile() {
  const file = process.env.ESTACK_GOOGLE_SERVICES_FILE?.trim();
  return file && isAbsolute(file) && existsSync(file) ? file : null;
}

function withOwnerSettings(config) {
  const owner = process.env.EXPO_OWNER;
  const projectId = process.env.EAS_PROJECT_ID;
  return {
    ...config,
    ...(owner ? { owner } : {}),
    extra: { ...config.extra, ...(projectId ? { eas: { ...config.extra?.eas, projectId } } : {}) },
  };
}

const VARIANTS = {
  production: { name: "estack", suffix: "", scheme: "estack", icon: null },
  development: { name: "estack dev", suffix: ".dev", scheme: "estack-dev", icon: "./assets/icons/app-icon-dev.icon" },
};

const PERSONAL_TEAM_PLUGINS = ["expo-widgets", "./plugins/with-notification-service"];

function appVariant() {
  const variant = process.env.APP_VARIANT?.trim() || "production";
  if (!Object.hasOwn(VARIANTS, variant)) {
    throw new Error(`APP_VARIANT is "${variant}". Use one of: ${Object.keys(VARIANTS).join(", ")}.`);
  }
  return variant;
}

function renamed(value, from, to) {
  if (typeof value === "string") return value.split(from).join(to);
  if (Array.isArray(value)) return value.map((item) => renamed(item, from, to));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, renamed(item, from, to)]));
  }
  return value;
}

const pluginName = (plugin) => (Array.isArray(plugin) ? plugin[0] : plugin);

function withPersonalTeam(config) {
  const teamId = process.env.ESTACK_APPLE_TEAM_ID?.trim();
  if (!teamId) throw new Error("ESTACK_IOS_SIGNING=personal needs ESTACK_APPLE_TEAM_ID, the Personal Team of Xcode.");
  const { associatedDomains, ...ios } = config.ios ?? {};
  const plugins = (config.plugins ?? [])
    .filter((plugin) => !PERSONAL_TEAM_PLUGINS.includes(pluginName(plugin)))
    .map((plugin) =>
      pluginName(plugin) === "./plugins/with-share-target"
        ? [plugin[0], { ...plugin[1], ios: { ...plugin[1].ios, enabled: false } }]
        : plugin,
    );
  return { ...config, ios: { ...ios, appleTeamId: teamId }, plugins: ["./plugins/with-personal-team", ...plugins] };
}

function withVariant(config) {
  const variant = VARIANTS[appVariant()];
  const baseId = config.ios?.bundleIdentifier;
  const bundleId = `${process.env.ESTACK_IOS_BUNDLE_ID?.trim() || baseId}${variant.suffix}`;
  const ios = renamed(config.ios ?? {}, baseId, bundleId);
  const varied = {
    ...config,
    name: variant.name,
    scheme: variant.scheme,
    ios: { ...ios, bundleIdentifier: bundleId, ...(variant.icon ? { icon: variant.icon } : {}) },
    android: { ...config.android, package: `${config.android?.package}${variant.suffix}` },
    plugins: renamed(config.plugins ?? [], baseId, bundleId),
  };
  return process.env.ESTACK_IOS_SIGNING?.trim() === "personal" ? withPersonalTeam(varied) : varied;
}

/** @param {{ config: import('expo/config').ExpoConfig }} context */
module.exports = ({ config }) => {
  const firebaseFile = googleServicesFile();
  return withOwnerSettings(
    withVariant(
      firebaseFile ? { ...config, android: { ...config.android, googleServicesFile: firebaseFile } } : config,
    ),
  );
};
