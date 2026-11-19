import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What the sidebar reaches in main: the saved sidebar layout and its changes, the pins that the host
 * keeps for all devices of the user, the free space on the disk of a server for the storage card, and
 * its machine use and alert levels for the machine card.
 */
export interface SidebarPort {
  agent: Pick<
    EstackDesktopApi["agent"],
    "getSidebarLayout" | "mutateSidebarLayout" | "getSidebarPins" | "setSidebarPins" | "seedSidebarPins"
  >;
  storage: Pick<EstackDesktopApi["storage"], "getDisk" | "getMachineMetrics">;
  hostAdmin: Pick<EstackDesktopApi["hostAdmin"], "getMachineAlerts">;
}

/** The calls of the sidebar storage and machine cards. The web client sends them to its connected host. */
export type SidebarCardsPort = Pick<SidebarPort, "storage" | "hostAdmin">;

/** Read on each call: tests and stories replace `window.estack` per case. */
export function sidebarPort(): SidebarPort {
  return window.estack;
}
