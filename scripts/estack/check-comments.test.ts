import { describe, expect, it } from "vitest";

const former = ["Open", "Bot"].join("");

import { commentIn, findComments, parseAddedLines } from "./check-comments";

const added = (path: string, text: string) => ({ path, line: 1, text });

describe("estack comment check", () => {
  it("stops the comments that ebi kept writing", () => {
    const lines = [
      added("src/a.ts", "// 2026-10-22 持ち主「送信でキーボードを閉じない」"),
      added("src/a.ts", "    /// 前は 720p で 24MB に収めていた"),
      added("src/a.ts", "const size = 720; // 11/17 に直した"),
      added("src/a.tsx", "      {/* 持ち主が嫌ったので外した */}"),
      added("scripts/run.sh", "# 10/24 に OTA へ切り替えた"),
      added("tools/x.py", "limit = 10  # 前は 30 だった"),
      added("src/b.ts", " * The agent stays quiet here because the owner asked."),
    ];
    expect(findComments(lines).map((finding) => finding.text)).toEqual(lines.map((line) => line.text));
  });

  it("keeps tool directives, licenses, issue links and code", () => {
    const lines = [
      added("src/a.ts", "// biome-ignore lint/style/noNonNullAssertion: checked above"),
      added("src/a.ts", '/// <reference types="vite/client" />'),
      added("src/a.ts", "// @ts-expect-error the old type has no field"),
      added("src/a.ts", 'const url = "https://example.com/a//b";'),
      added("src/a.ts", "const pattern = /\\/\\/ comment/;"),
      added("src/a.ts", "const text = 'a // b';"),
      added("scripts/run.sh", "#!/bin/sh"),
      added("scripts/run.sh", 'echo "# not a comment"'),
      added("LICENSE.ts", "// SPDX-License-Identifier: MIT"),
      added("src/a.ts", "// https://github.com/estack/estack/issues/1263"),
      added("README.md", "# A heading"),
    ];
    expect(findComments(lines)).toEqual([]);
  });

  it("lets the owner approve one comment in the allowlist", () => {
    const line = added("src/a.ts", "// Apple rejects a build without this key.");
    expect(findComments([line], new Set(["src/a.ts:// Apple rejects a build without this key."]))).toEqual([]);
  });

  it("reads only the added lines of a diff, with their line numbers", () => {
    const diff = [
      "diff --git a/src/a.ts b/src/a.ts",
      "--- a/src/a.ts",
      "+++ b/src/a.ts",
      "@@ -10,0 +11,2 @@",
      "+const a = 1;",
      "+// 前はここで待っていた",
      "@@ -20 +22 @@",
      "-// old comment",
      "+const b = 2;",
    ].join("\n");
    expect(parseAddedLines(diff)).toEqual([
      { path: "src/a.ts", line: 11, text: "const a = 1;" },
      { path: "src/a.ts", line: 12, text: "// 前はここで待っていた" },
      { path: "src/a.ts", line: 22, text: "const b = 2;" },
    ]);
    expect(commentIn("src/a.ts", "// 前はここで待っていた")).toBe("// 前はここで待っていた");
  });

  it("does not count a comment that only changed its product name or moved to another file", () => {
    const diff = [
      `diff --git a/src/old-${former.toLowerCase()}.ts b/src/new-estack.ts`,
      `--- a/src/old-${former.toLowerCase()}.ts`,
      "+++ b/src/new-estack.ts",
      "@@ -1,2 +1,3 @@",
      `-// ${former} keeps the session in the keychain.`,
      "+// estack keeps the session in the keychain.",
      "+// 11/18 に足した",
      "diff --git a/src/b.ts b/src/b.ts",
      "--- a/src/b.ts",
      "+++ b/src/b.ts",
      "@@ -0,0 +1 @@",
      "+// The window opens on the last tab.",
      "diff --git a/src/c.ts b/src/c.ts",
      "--- a/src/c.ts",
      "+++ b/src/c.ts",
      "@@ -4 +3,0 @@",
      "-// The window opens on the last tab.",
    ].join("\n");
    expect(findComments(parseAddedLines(diff)).map((finding) => finding.text)).toEqual(["// 11/18 に足した"]);
  });
});
