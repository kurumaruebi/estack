import type { EstackDesktopApi } from "@estack/contracts/ipc";

/** What the Voice tab reaches in main: the dictation models and the dictation settings. */
export interface VoicePort {
  voice: EstackDesktopApi["voice"];
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function voicePort(): VoicePort {
  return window.estack;
}
