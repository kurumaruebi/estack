import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What the storage panels reach in main: the stored files of a server, and the agent names that
 * label them.
 */
export interface FilesPort {
  agent: Pick<EstackDesktopApi["agent"], "listAgents">;
  /**
   * The old provider CLI versions, the machine use and the disk are optional: a client with no store
   * of its own, such as the web client, has none.
   */
  storage: Pick<EstackDesktopApi["storage"], "clear" | "deleteFile" | "getUsage" | "openFile"> &
    Partial<
      Pick<
        EstackDesktopApi["storage"],
        | "getRemovableRuntimes"
        | "removeRemovableRuntimes"
        | "getMachineMetrics"
        | "getDisk"
        | "getLibraryFolders"
        | "changeLibraryFolders"
      >
    >;
  /** The machine alert settings, beside `storage.getMachineMetrics`. */
  hostAdmin?: Pick<EstackDesktopApi["hostAdmin"], "getMachineAlerts" | "setMachineAlerts">;
  /** The programs that agents left running on the server. A client without these calls hides them. */
  backgroundProcesses?: Pick<EstackDesktopApi["backgroundProcesses"], "list" | "stop">;
  /**
   * Calls `listener` when the Library folders of the server change on its host, from any device or
   * agent (`library-folders-events-v1`). Returns the unsubscribe. A client without it reads the
   * folders after a scan only.
   */
  onLibraryFoldersChanged?: (serverId: string, listener: () => void) => () => void;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function filesPort(): FilesPort {
  const api = window.estack;
  return {
    agent: api.agent,
    storage: api.storage,
    hostAdmin: api.hostAdmin,
    backgroundProcesses: api.backgroundProcesses,
    onLibraryFoldersChanged: (serverId, listener) =>
      api.agent.onScopedEvent((scoped) => {
        if (scoped.serverId === serverId && scoped.event.type === "library-folders-changed") listener();
      }),
  };
}
