import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What team presence reaches in main: who is online, and whether this member is typing.
 */
export interface TeamPort {
  servers: Pick<EstackDesktopApi["servers"], "onPresence" | "setTyping">;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function teamPort(): TeamPort {
  return window.estack;
}
