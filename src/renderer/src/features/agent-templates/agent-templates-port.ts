import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What the publish and install dialogs reach in main: the agent templates of this computer, and
 * adding or publishing a template's agent on a joined server.
 */
export interface AgentTemplatesPort {
  agent: Pick<
    EstackDesktopApi["agent"],
    "addTemplateAgent" | "previewAgentTemplate" | "publishAgentTemplate" | "unpublishAgentTemplate"
  >;
  agentTemplates: Pick<EstackDesktopApi["agentTemplates"], "get" | "install" | "preview" | "publish" | "unpublish">;
}

/** What the publish dialog reaches. The web client passes the host's. */
export type AgentTemplatePublishCalls = Pick<AgentTemplatesPort["agentTemplates"], "preview" | "publish" | "unpublish">;

/** What the install dialog reaches: reading a template, and adding its agent. The web client passes its own. */
export interface AgentTemplateInstallCalls {
  agent: Pick<AgentTemplatesPort["agent"], "addTemplateAgent">;
  agentTemplates: Pick<AgentTemplatesPort["agentTemplates"], "get" | "install">;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function agentTemplatesPort(): AgentTemplatesPort {
  return window.estack;
}
