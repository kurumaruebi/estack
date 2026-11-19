import type { DeleteSharedTableInput, EstackDesktopApi, SharedTable } from "@estack/contracts/ipc";

/**
 * What the conversation domain reaches in main: agent and direct message pages, sends, reads,
 * shared tables, and the browser seams a view takes when no runtime is injected.
 */
export interface ConversationPort {
  /** A chat window opens the page of a browser takeover in the main window. */
  dynamicIsland: Pick<EstackDesktopApi["dynamicIsland"], "openBrowserTakeover">;
  agent: Pick<
    EstackDesktopApi["agent"],
    | "addPreviewPage"
    | "readAgentSessionSettings"
    | "listAgentNotificationLevels"
    | "askSideQuestion"
    | "saveSkillSuggestion"
    | "setAgentSessionSetting"
    | "resetAgentSessionSetting"
    | "onScopedEvent"
    | "deleteConversationMessage"
    | "deleteTable"
    | "listMemories"
    | "listPinnedMessages"
    | "listRoutines"
    | "listTables"
    | "markConversationRead"
    | "markConversationUnread"
    | "readConversationPage"
    | "releaseFilePreview"
    | "searchConversationMessages"
    | "sendMessage"
    | "setMessagePinned"
    | "withdrawFeedback"
  >;
  browser: Pick<
    EstackDesktopApi["browser"],
    | "capturePreview"
    | "finishLocalSignIn"
    | "onLiveViewEvent"
    | "openLocalSignIn"
    | "sendLiveViewInput"
    | "startLiveView"
    | "stopLiveView"
  >;
  servers: Pick<
    EstackDesktopApi["servers"],
    | "listDirectThreads"
    | "markDirectRead"
    | "onDirectMessage"
    | "onDirectTyping"
    | "readDirectConversationPage"
    | "sendDirectMessage"
    | "setDirectTyping"
  >;
  storage: Pick<EstackDesktopApi["storage"], "openLocation">;
  /** The reader's level for each agent of a joined server, which decides what Delete offers. */
  hostAdmin: Pick<EstackDesktopApi["hostAdmin"], "getAgentAccess">;
  browserDock: Pick<EstackDesktopApi["browserDock"], "publishPresentation" | "onAction" | "onShown">;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function conversationPort(): ConversationPort {
  return window.estack;
}

/** Cleanup can run after IPC shuts down; process shutdown also frees these in-memory pages. */
export function releaseFilePreviewPage(pageUrl: string | undefined): void {
  if (!pageUrl) return;
  void conversationPort()
    .agent.releaseFilePreview(pageUrl)
    .catch(() => undefined);
}

/** The tables every agent shares. The web client reaches them on the host through the Team API. */
export interface SharedTableCalls {
  listTables(): Promise<SharedTable[]>;
  deleteTable(input: DeleteSharedTableInput): Promise<void>;
}
