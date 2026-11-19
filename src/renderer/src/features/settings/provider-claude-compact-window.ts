import type { ClaudeCompactWindowSetting, EstackDesktopApi } from "@estack/contracts/ipc";
import type { ProviderClaudeCompactWindow } from "@estack/ui/features/settings/ProviderSettingsPage";
import { useText } from "@estack/ui/text";
import { createHostSetting } from "./host-setting-state";

/** The Claude compaction size calls of one server's host. The desktop reaches them through main. */
export type HostClaudeCompactWindowCalls = Pick<
  EstackDesktopApi["hostAdmin"],
  "getClaudeCompactWindow" | "setClaudeCompactWindow"
>;

export interface HostClaudeCompactWindowOptions {
  /** The calls of a client with no `window.estack`, such as the web client. */
  calls?: HostClaudeCompactWindowCalls;
}

export interface ProviderClaudeCompactWindowSource extends HostClaudeCompactWindowOptions {
  serverId: string;
}

/**
 * The Claude page's compaction size of this computer or a joined server (`claude-compact-window-v1`).
 * The host checks the role again. Undefined while `source` is.
 *
 * Each new value of `status` reads the size again: the host sends a status event after a change.
 */
export function createProviderClaudeCompactWindow(
  source: () => ProviderClaudeCompactWindowSource | undefined,
  status: () => unknown,
): () => ProviderClaudeCompactWindow | undefined {
  const { t } = useText();
  const calls = (): HostClaudeCompactWindowCalls => source()?.calls ?? window.estack.hostAdmin;
  const setting = createHostSetting<ClaudeCompactWindowSetting, number | null>({
    serverId: () => source()?.serverId,
    status,
    read: (serverId) => calls().getClaudeCompactWindow(serverId),
    save: (tokens, serverId) => calls().setClaudeCompactWindow(tokens, serverId),
    loadFailed: () => t("provider.settings.compactWindowLoadFailed"),
  });
  const compaction: ProviderClaudeCompactWindow = {
    get value() {
      return setting.state.value;
    },
    get pending() {
      return setting.state.pending;
    },
    get error() {
      return setting.state.error;
    },
    onChange: (tokens) => void setting.choose(tokens),
  };
  return () => (source() ? compaction : undefined);
}
