const { withEntitlementsPlist } = require("expo/config-plugins");

const PAID_ENTITLEMENTS = [
  "aps-environment",
  "com.apple.developer.associated-domains",
  "com.apple.developer.usernotifications.communication",
];

module.exports = (config) =>
  withEntitlementsPlist(config, (mod) => {
    for (const key of PAID_ENTITLEMENTS) delete mod.modResults[key];
    return mod;
  });
