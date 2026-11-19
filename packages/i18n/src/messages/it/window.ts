import type { PartialTranslation } from "../../message";
import type { messages as source } from "../en/window";

export const messages = {
  "window.localHostTitle": "estack — host locale",
  "window.localClientTitle": "estack — client locale",
  "window.computerUsePermissionTitle": "Attiva il Controllo del computer",
} as const satisfies PartialTranslation<typeof source>;
