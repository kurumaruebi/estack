import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What the account context reaches in main: the estack account session, its devices, and the
 * usage the page rail and the Usage page show.
 */
export interface AccountPort {
  agent: Pick<EstackDesktopApi["agent"], "getUsage">;
  auth: Pick<
    EstackDesktopApi["auth"],
    | "cancelMobileConnect"
    | "createMobileConnect"
    | "createMobileConnectLink"
    | "getMobileConnectLink"
    | "getState"
    | "listAccountSessions"
    | "listMobileConnectedDevices"
    | "logout"
    | "onEvent"
    | "openCompanySignIn"
    | "requestEmailCode"
    | "retry"
    | "revokeAccountSession"
    | "revokeMobileConnectedDevice"
    | "revokeMobileConnectLink"
    | "updateAvatar"
    | "updateChatColor"
    | "updateName"
    | "verifyEmailCode"
  >;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function accountPort(): AccountPort {
  return window.estack;
}
