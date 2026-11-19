import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What the settings context reaches in main: the app-wide preferences, the switches for updates,
 * notifications and the Dynamic Island, the local agents and their background processes of the
 * Agents tab, and the agents and the user's own notification levels of each server for the
 * Notifications tab.
 */
export interface SettingsPort {
  getAgentDefaults: EstackDesktopApi["getAgentDefaults"];
  getAgentMemoryLimitPreference: EstackDesktopApi["getAgentMemoryLimitPreference"];
  getAnalyticsPreference: EstackDesktopApi["getAnalyticsPreference"];
  getAppBehaviorPreference: EstackDesktopApi["getAppBehaviorPreference"];
  getApprovalAutomation: EstackDesktopApi["getApprovalAutomation"];
  getBusyMessageModePreference: EstackDesktopApi["getBusyMessageModePreference"];
  getExternalLinkPreference: EstackDesktopApi["getExternalLinkPreference"];
  listExternalLinkBrowsers: EstackDesktopApi["listExternalLinkBrowsers"];
  chooseExternalLinkApp: EstackDesktopApi["chooseExternalLinkApp"];
  onExternalLinkFallback: EstackDesktopApi["onExternalLinkFallback"];
  getRemoteNetworkRoute: EstackDesktopApi["getRemoteNetworkRoute"];
  getRemoteSessionReusePreference: EstackDesktopApi["getRemoteSessionReusePreference"];
  onAgentMemoryLimitPreference: EstackDesktopApi["onAgentMemoryLimitPreference"];
  onAnalyticsPreference: EstackDesktopApi["onAnalyticsPreference"];
  onApprovalAutomation: EstackDesktopApi["onApprovalAutomation"];
  onOpenSettings: EstackDesktopApi["onOpenSettings"];
  onOpenUpdateSettings: EstackDesktopApi["onOpenUpdateSettings"];
  setAnalyticsPreference: EstackDesktopApi["setAnalyticsPreference"];
  setAppBehaviorPreference: EstackDesktopApi["setAppBehaviorPreference"];
  setExternalLinkPreference: EstackDesktopApi["setExternalLinkPreference"];
  setRemoteNetworkRoute: EstackDesktopApi["setRemoteNetworkRoute"];
  setRemoteSessionReusePreference: EstackDesktopApi["setRemoteSessionReusePreference"];
  agent: Pick<
    EstackDesktopApi["agent"],
    "listAgents" | "updateAgent" | "listAgentNotificationLevels" | "setAgentNotificationLevel" | "onScopedEvent"
  >;
  dynamicIsland: Pick<
    EstackDesktopApi["dynamicIsland"],
    "getBuiltInDisplayGeometry" | "getPreference" | "onPreference" | "setPreference" | "setXWayland"
  >;
  notifications: Pick<EstackDesktopApi["notifications"], "getPreference" | "openSettings" | "setPreference" | "test">;
  update: Pick<EstackDesktopApi["update"], "getPreference" | "onPreference" | "setPreference">;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function settingsPort(): SettingsPort {
  return window.estack;
}
