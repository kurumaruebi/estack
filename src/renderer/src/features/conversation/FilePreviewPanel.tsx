import SharedFilePreviewPanel from "@estack/ui/features/conversation/FilePreviewPanel";
import type { ComponentProps } from "@solidjs/web";
import { readSidePanelWidth, resetSidePanelWidth, saveSidePanelWidth } from "../../components/side-panel-width";

const WRAP_LINES_STORAGE_KEY = "estack:file-preview-wrap-lines";

export default function FilePreviewPanel(
  props: Omit<
    ComponentProps<typeof SharedFilePreviewPanel>,
    "readWidth" | "onResizeEnd" | "onResetWidth" | "readWrapLines" | "onWrapLinesChange"
  >,
) {
  return (
    <SharedFilePreviewPanel
      {...props}
      readWidth={readSidePanelWidth}
      onResetWidth={resetSidePanelWidth}
      onResizeEnd={saveSidePanelWidth}
      readWrapLines={() => window.localStorage.getItem(WRAP_LINES_STORAGE_KEY) === "true"}
      onWrapLinesChange={(wrap) => window.localStorage.setItem(WRAP_LINES_STORAGE_KEY, String(wrap))}
    />
  );
}
