import type { EstackDesktopApi } from "@estack/contracts/ipc";

export interface OnboardingPort {
  getSetupState: EstackDesktopApi["getSetupState"];
  saveSetup: EstackDesktopApi["saveSetup"];
  onSetupState: EstackDesktopApi["onSetupState"];
  servers: Pick<EstackDesktopApi["servers"], "previewInvite">;
  openUrl: EstackDesktopApi["openUrl"];
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function onboardingPort(): OnboardingPort {
  return window.estack;
}
