import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What the agent dock window and the main renderer reach in main for the dock. The dock window sends
 * a password or a code itself, so the secret does not pass through the main renderer.
 */
export interface AgentDockPort {
  agentDock: EstackDesktopApi["agentDock"];
  agent: Pick<EstackDesktopApi["agent"], "respondToBrowserSecret">;
}

/** Read on each call: stories replace `window.estack` per case. */
export function agentDockPort(): AgentDockPort {
  return window.estack;
}
