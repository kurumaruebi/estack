import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/window";

export const messages = {
  "window.localHostTitle": "estack – lokalny host",
  "window.localClientTitle": "estack – lokalny klient",
  "window.computerUsePermissionTitle": "Włącz Sterowanie komputerem",
} as const satisfies PartialTranslation<typeof source>;
