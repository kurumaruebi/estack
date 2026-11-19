import type { EstackDesktopApi, ServerSummary } from "@estack/contracts/ipc";

/**
 * What the servers domain reaches in main: the server list and selection, the account changes, the local host, the
 * settings of one server, the name, logo and update of a joined server's host, the servers that
 * run on this computer, and the remote desktop setup of a server.
 */
export interface ServersPort {
  agent: Pick<
    EstackDesktopApi["agent"],
    | "getStatus"
    | "listAgents"
    | "listConversationReads"
    | "listHiddenAgents"
    | "listAgentNotificationLevels"
    | "listMcpServers"
    | "listModels"
    | "removeMcpServer"
    | "saveMcpServer"
    | "setMcpServerEnabled"
    | "testMcpServer"
    | "signInMcpServer"
    | "mcpSignInPage"
    | "mcpSignInRelay"
    | "openMcpSignInRelay"
    | "completeMcpSignInRelay"
    | "cancelMcpSignIn"
    | "signOutMcpServer"
    | "listMcpSignIns"
    | "mcpSignInApp"
    | "saveMcpSignInApp"
    | "removeMcpSignInApp"
  >;
  events: EstackDesktopApi["events"];
  auth: Pick<EstackDesktopApi["auth"], "onEvent">;
  browser: Pick<EstackDesktopApi["browser"], "setVisible">;
  hostAdmin: Pick<
    EstackDesktopApi["hostAdmin"],
    "cancelUpdate" | "getUpdateStatus" | "restartHost" | "rotateHostKey" | "startUpdate" | "updateIdentity"
  >;
  hostedServers: Pick<EstackDesktopApi["hostedServers"], "list" | "restart" | "wake">;
  localServers: EstackDesktopApi["localServers"];
  host: Pick<
    EstackDesktopApi["host"],
    | "configure"
    | "getRemoteControlPolicy"
    | "getStatus"
    | "onEvent"
    | "recheckScreenRecording"
    | "rotateIdentityKey"
    | "setRemoteControlPolicy"
    | "start"
    | "stop"
    | "stopRemoteControl"
    | "updateIdentity"
  >;
  notifications: Pick<EstackDesktopApi["notifications"], "onOpened" | "onWorkflowOpened">;
  remoteDesktop: Pick<
    EstackDesktopApi["remoteDesktop"],
    "checkSetup" | "connect" | "disconnect" | "list" | "openSetup" | "test"
  >;
  servers: Pick<
    EstackDesktopApi["servers"],
    | "getPresenceFor"
    | "join"
    | "list"
    | "onEvent"
    | "onPresence"
    | "refreshIdentity"
    | "remove"
    | "reorder"
    | "retryConnection"
    | "select"
    | "setMuted"
    | "setNotificationLevel"
  >;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function serversPort(): ServersPort {
  return window.estack;
}

/**
 * The member and invite calls for one server. This computer answers them for the local server
 * through `host`; a remote server answers them through `servers`, addressed by its id.
 */
export type ServerAdminPort = Pick<
  EstackDesktopApi["host"],
  "getPresence" | "listMembers" | "listInvites" | "createInvite" | "updateMember" | "removeMember" | "revokeInvite"
>;

export function serverAdminPort(server: Pick<ServerSummary, "id" | "kind">): ServerAdminPort {
  if (server.kind === "local") return window.estack.host;
  const serverId = server.id;
  return {
    getPresence: () => window.estack.servers.getPresenceFor(serverId),
    listMembers: () => window.estack.servers.listMembers(serverId),
    listInvites: () => window.estack.servers.listInvites(serverId),
    createInvite: (input) => window.estack.servers.createInvite(input, serverId),
    updateMember: (input) => window.estack.servers.updateMember(input, serverId),
    removeMember: (memberId) => window.estack.servers.removeMember(memberId, serverId),
    revokeInvite: (inviteId) => window.estack.servers.revokeInvite(inviteId, serverId),
  };
}

/** The server main marks active. A test teardown can remove the bridge while a join is pending. */
export async function activeServerId(): Promise<string> {
  if (!window.estack) return "local";
  return (await window.estack.servers.list()).find((item) => item.active)?.id ?? "local";
}
