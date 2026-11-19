import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What provider state reaches in main: connecting, signing in and refreshing providers, and the
 * runtimes estack installs for them, on this computer or on a host the account administers.
 */
export interface ProvidersPort {
  cancelProviderCodeLogin: EstackDesktopApi["cancelProviderCodeLogin"];
  connectProvider: EstackDesktopApi["connectProvider"];
  connectProviderInMainlandChina: EstackDesktopApi["connectProviderInMainlandChina"];
  cancelProviderSignIn: EstackDesktopApi["cancelProviderSignIn"];
  refreshAgentProviders: EstackDesktopApi["refreshAgentProviders"];
  setProviderOn: EstackDesktopApi["setProviderOn"];
  restartProvider: EstackDesktopApi["restartProvider"];
  cancelProviderRestart: EstackDesktopApi["cancelProviderRestart"];
  chooseInstalledCli: EstackDesktopApi["chooseInstalledCli"];
  startProviderCodeLogin: EstackDesktopApi["startProviderCodeLogin"];
  providerRuntimes: EstackDesktopApi["providerRuntimes"];
  connectProviderAccount: EstackDesktopApi["connectProviderAccount"];
  connectProviderAccountKey: EstackDesktopApi["connectProviderAccountKey"];
  cancelProviderAccountSignIn: EstackDesktopApi["cancelProviderAccountSignIn"];
  renameProviderAccount: EstackDesktopApi["renameProviderAccount"];
  removeProviderAccount: EstackDesktopApi["removeProviderAccount"];
  setProviderAccountPool: EstackDesktopApi["setProviderAccountPool"];
  signOutProvider: EstackDesktopApi["signOutProvider"];
  providerUsageResets: EstackDesktopApi["providerUsageResets"];
  resetProviderUsage: EstackDesktopApi["resetProviderUsage"];
  /** The same, for the host of a joined server the account administers. */
  providerAdmin: EstackDesktopApi["providerAdmin"];
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function providersPort(): ProvidersPort {
  return window.estack;
}
