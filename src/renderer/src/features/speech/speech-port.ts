import type { EstackDesktopApi } from "@estack/contracts/ipc";

/**
 * What spoken replies reach in main: the speech model and settings, the synthesis, the finished
 * answer, the recording a voice turn keeps with its message, and the user's own voice server.
 */
export interface SpeechPort {
  voice: Pick<
    EstackDesktopApi["voice"],
    | "getSpeechSettings"
    | "setSpeechSettings"
    | "getSpeechModelStatus"
    | "downloadSpeechModel"
    | "onSpeechModelStatus"
    | "speak"
    | "warmSpeech"
    | "keepRecording"
    | "getServer"
    | "onServerSettings"
  >;
  agent: Pick<EstackDesktopApi["agent"], "readConversationPage" | "discardDraftAttachment">;
}

/** Read on each call: tests and stories replace `window.estack` per case. */
export function speechPort(): SpeechPort {
  return window.estack;
}
