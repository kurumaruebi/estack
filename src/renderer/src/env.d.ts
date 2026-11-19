/// <reference types="vite/client" />

import type { EstackDesktopApi } from "@estack/contracts/ipc";

declare global {
  interface HighlightRegistry {
    set(name: string, highlight: Highlight): this;
    delete(name: string): boolean;
  }

  interface Window {
    estack: EstackDesktopApi;
  }
}
