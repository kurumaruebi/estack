import { createEstackLogger } from "@estack/logging";

const logger = createEstackLogger("external-open-guard");

export const BLOCK_EXTERNAL_OPEN_ENV = "ESTACK_BLOCK_EXTERNAL_OPEN";

export interface OpeningShell {
  openExternal: (url: string, options?: never) => Promise<void>;
  openPath: (path: string) => Promise<string>;
}

export function blocksExternalOpen(environment: Readonly<Record<string, string | undefined>>): boolean {
  return environment[BLOCK_EXTERNAL_OPEN_ENV] === "1";
}

const logBlocked = (target: string) => logger.info("Automation blocked an external open.", { target });

export function blockedOpen(log: (target: string) => void = logBlocked): (url: string) => Promise<void> {
  return async (url) => {
    log(url);
  };
}

export function guardExternalOpen(
  environment: Readonly<Record<string, string | undefined>>,
  open: (url: string) => Promise<void>,
  log: (target: string) => void = logBlocked,
): (url: string) => Promise<void> {
  return blocksExternalOpen(environment) ? blockedOpen(log) : open;
}

export function installExternalOpenGuard(
  shell: OpeningShell,
  environment: Readonly<Record<string, string | undefined>>,
  log: (target: string) => void = logBlocked,
): boolean {
  if (!blocksExternalOpen(environment)) return false;
  shell.openExternal = blockedOpen(log);
  shell.openPath = async (path) => {
    log(path);
    return "";
  };
  return true;
}
