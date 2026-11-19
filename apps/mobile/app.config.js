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

/** @param {{ config: import('expo/config').ExpoConfig }} context */
module.exports = ({ config }) => {
  const firebaseFile = googleServicesFile();
  return withOwnerSettings(
    firebaseFile ? { ...config, android: { ...config.android, googleServicesFile: firebaseFile } } : config,
  );
};
