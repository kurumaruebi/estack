import { describe, expect, it, vi } from "vitest";
import {
  BLOCK_EXTERNAL_OPEN_ENV,
  blocksExternalOpen,
  guardExternalOpen,
  installExternalOpenGuard,
  type OpeningShell,
} from "./external-open-guard";

function fakeShell() {
  const openExternal = vi.fn(async () => undefined);
  const openPath = vi.fn(async () => "");
  const shell: OpeningShell = { openExternal, openPath };
  return { shell, openExternal, openPath };
}

describe("blocksExternalOpen", () => {
  it("blocks only when the variable is 1", () => {
    expect(blocksExternalOpen({ [BLOCK_EXTERNAL_OPEN_ENV]: "1" })).toBe(true);
    expect(blocksExternalOpen({})).toBe(false);
    expect(blocksExternalOpen({ [BLOCK_EXTERNAL_OPEN_ENV]: "0" })).toBe(false);
    expect(blocksExternalOpen({ [BLOCK_EXTERNAL_OPEN_ENV]: "" })).toBe(false);
  });
});

describe("installExternalOpenGuard", () => {
  it("replaces both opens with a log when blocked", async () => {
    const { shell, openExternal, openPath } = fakeShell();
    const log = vi.fn();
    expect(installExternalOpenGuard(shell, { [BLOCK_EXTERNAL_OPEN_ENV]: "1" }, log)).toBe(true);
    await shell.openExternal("https://estack.invalid/changelog");
    expect(await shell.openPath("/tmp/folder")).toBe("");
    expect(openExternal).not.toHaveBeenCalled();
    expect(openPath).not.toHaveBeenCalled();
    expect(log.mock.calls).toEqual([["https://estack.invalid/changelog"], ["/tmp/folder"]]);
  });

  it("leaves the shell alone otherwise", async () => {
    const { shell, openExternal } = fakeShell();
    const log = vi.fn();
    expect(installExternalOpenGuard(shell, {}, log)).toBe(false);
    await shell.openExternal("https://example.com/");
    expect(openExternal).toHaveBeenCalledWith("https://example.com/");
    expect(log).not.toHaveBeenCalled();
  });
});

describe("guardExternalOpen", () => {
  it("logs instead of opening when blocked", async () => {
    const open = vi.fn(async () => undefined);
    const log = vi.fn();
    await guardExternalOpen({ [BLOCK_EXTERNAL_OPEN_ENV]: "1" }, open, log)("https://estack.invalid/guide");
    expect(open).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("https://estack.invalid/guide");
  });

  it("returns the opener otherwise", () => {
    const open = vi.fn(async () => undefined);
    expect(guardExternalOpen({}, open)).toBe(open);
  });
});
