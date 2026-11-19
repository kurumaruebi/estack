import { defineMessages } from "../../../message";

export const messages = defineMessages("status.host", {
  // Status lines of the WebRTC host.
  "status.host.registered": "Registered this estack for WebRTC access.",
  "status.host.keyRotated": "Server key changed. Paired devices stay paired.",
  "status.host.identityUpdated": "Server identity updated.",
  "status.host.starting": "Starting the WebRTC host…",
  "status.host.ready": "This estack is ready for WebRTC connections.",
  "status.host.signalLost": "Other devices cannot reach this estack now. It connects again.",
  "status.host.stopping": "Making this estack private…",
  "status.host.private": "This estack is private.",
  "status.host.removed": "This estack was removed from your account. Publish it again to share it.",
});
