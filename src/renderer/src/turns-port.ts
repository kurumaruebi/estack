import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What turn state reaches in main: the queue, the routine ids, and the answers to prompts,
 * approvals and browser takeovers.
 */
export interface TurnsPort {
  agent: Pick<
    EstackDesktopApi["agent"],
    | "cancelQueuedMessage"
    | "cancelWait"
    | "clearContext"
    | "compactContext"
    | "compactTaskContext"
    | "deleteHistory"
    | "interrupt"
    | "listActiveQueues"
    | "listQueue"
    | "listRoutines"
    | "listWaits"
    | "readPendingApproval"
    | "reorderQueue"
    | "respondToApproval"
    | "respondToBrowserTakeover"
    | "respondToPrompt"
    | "steerQueuedMessage"
    | "updateQueuedMessage"
  >;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function turnsPort(): TurnsPort {
  return window.estack;
}
