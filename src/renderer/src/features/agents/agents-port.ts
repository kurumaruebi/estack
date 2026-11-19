import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What the agents domain reaches in main: agent records, their models and read state, and the agent
 * event stream.
 */
export interface AgentsPort {
  agent: Pick<
    EstackDesktopApi["agent"],
    | "createAgent"
    | "deleteAgent"
    | "duplicateAgent"
    | "getAgentAdminSettings"
    | "getAgentHostSettings"
    | "updateAgentHostSettings"
    | "getAgentBackupModels"
    | "updateAgentBackupModels"
    | "getAgentNewChat"
    | "updateAgentNewChat"
    | "getAgentPlanCard"
    | "updateAgentPlanCard"
    | "getAgentFastMode"
    | "updateAgentFastMode"
    | "listAgents"
    | "listConversationReads"
    | "listModels"
    | "onEvent"
    | "getRuntimeSnapshot"
    | "setAgentHidden"
    | "setAgentNotificationLevel"
    | "setAvatar"
    | "updateAgent"
    | "updateAgentAdminSettings"
  >;
  /** The accounts of a joined server's providers, which its released agent routes do not carry. */
  providerAdmin: Pick<EstackDesktopApi["providerAdmin"], "accounts" | "accountUsage">;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function agentsPort(): AgentsPort {
  return window.estack;
}
