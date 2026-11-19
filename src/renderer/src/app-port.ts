import type { EstackDesktopApi } from "@estack/contracts/ipc";
import type { CompanySignInCalls } from "./features/servers/ServerCompanySignInSection";

/**
 * What the app shell and the cross-domain root modules reach in main, plus the shell actions
 * (`openUrl`, `openExternal`) that several domains share.
 */
export interface AppPort {
  getAppInfo: EstackDesktopApi["getAppInfo"];
  getAppAppearancePreference: EstackDesktopApi["getAppAppearancePreference"];
  getAppInterfaceSizePreference: EstackDesktopApi["getAppInterfaceSizePreference"];
  getAppLanguagePreference: EstackDesktopApi["getAppLanguagePreference"];
  getAppLogoColorPreference: EstackDesktopApi["getAppLogoColorPreference"];
  listInstalledFonts: EstackDesktopApi["listInstalledFonts"];
  onAppAppearancePreference: EstackDesktopApi["onAppAppearancePreference"];
  onAppInterfaceSizePreference: EstackDesktopApi["onAppInterfaceSizePreference"];
  onAppLanguagePreference: EstackDesktopApi["onAppLanguagePreference"];
  onAppLogoColorPreference: EstackDesktopApi["onAppLogoColorPreference"];
  openExternal: EstackDesktopApi["openExternal"];
  getSentMessageStats: EstackDesktopApi["getSentMessageStats"];
  reportRendererTiming: EstackDesktopApi["reportRendererTiming"];
  openUrl: EstackDesktopApi["openUrl"];
  openChatWindow: EstackDesktopApi["openChatWindow"];
  getChatWindows: EstackDesktopApi["getChatWindows"];
  onChatWindows: EstackDesktopApi["onChatWindows"];
  onQuitShortcutHint: EstackDesktopApi["onQuitShortcutHint"];
  setAppAppearancePreference: EstackDesktopApi["setAppAppearancePreference"];
  setAppInterfaceSizePreference: EstackDesktopApi["setAppInterfaceSizePreference"];
  setAppLanguagePreference: EstackDesktopApi["setAppLanguagePreference"];
  setAppLogoColorPreference: EstackDesktopApi["setAppLogoColorPreference"];
  agent: Pick<
    EstackDesktopApi["agent"],
    "readConversationPage" | "searchConversationMessages" | "searchConversationFiles" | "listRoutines" | "listAgents"
  >;
  agentTemplates: Pick<EstackDesktopApi["agentTemplates"], "onOpenLink" | "takePendingLink">;
  acpRegistry: EstackDesktopApi["acpRegistry"];
  hostedSites: EstackDesktopApi["hostedSites"];
  billing: EstackDesktopApi["billing"];
  license: EstackDesktopApi["license"];
  auth: CompanySignInCalls;
  hostedServers: EstackDesktopApi["hostedServers"];
  routineFeed: EstackDesktopApi["routineFeed"];
  events: EstackDesktopApi["events"];
  plugins: Pick<EstackDesktopApi["plugins"], "onOpenListing" | "takePendingListing">;
  marketplace: Pick<EstackDesktopApi["marketplace"], "onOpenListing" | "takePendingListing">;
  servers: Pick<EstackDesktopApi["servers"], "onInvite" | "takePendingInvite">;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function appPort(): AppPort {
  return window.estack;
}
