import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What the usage panel reaches in main: the analytics of a server, its agents, and the events that
 * make the report stale.
 */
export interface UsagePort {
  agent: Pick<EstackDesktopApi["agent"], "getHostAnalytics" | "listAgents" | "onScopedEvent">;
  servers: Pick<EstackDesktopApi["servers"], "onEvent">;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function usagePort(): UsagePort {
  return window.estack;
}
