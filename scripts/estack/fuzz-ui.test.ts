import { describe, expect, it } from "vitest";
import {
  clickOutcome,
  fuzzTargets,
  opensOutside,
  pickTarget,
  seededRandom,
  targetKey,
  withoutBlocked,
} from "./fuzz-ui";

const snapshot = [
  "- main:",
  '  - heading "AI チームを作りましょう。" [level=1]',
  '  - button "無料のモデルを使う"',
  '  - button "自分の AI サブスクリプションを使う"',
  '  - link "利用規約"',
  '  - button "エージェントを削除"',
  '  - button "Sign out"',
  '  - button "OpenCode のアップデート"',
  '  - tab "設定"',
  '  - button "無料のモデルを使う"',
].join("\n");

describe("UI fuzz", () => {
  it("clicks buttons and tabs, never links or risky names", () => {
    expect(fuzzTargets(snapshot)).toEqual(
      [
        { role: "button", name: "無料のモデルを使う" },
        { role: "button", name: "自分の AI サブスクリプションを使う" },
        { role: "tab", name: "設定" },
      ].filter((target) => target.name !== "無料のモデルを使う"),
    );
  });

  it("never clicks a name that opens a page outside the app", () => {
    const outside = [
      "完全な変更履歴",
      "Changelog",
      "ガイドを読む",
      "Discord に参加",
      "GitHub",
      "X",
      "X (旧 Twitter)",
      "Reddit",
      "Facebook",
      "LinkedIn",
      "Instagram",
      "TikTok",
      "Threads",
      "フィードバックを送る",
      "Give feedback",
      "問題を報告",
      "Report a problem",
      "ブラウザで開く",
      "Open in browser",
      "ドキュメントを開く",
    ];
    const lines = [...outside.map((name) => `  - button "${name}"`), '  - link "設定"', '  - button "設定"'];
    expect(fuzzTargets(lines.join("\n"))).toEqual([{ role: "button", name: "設定" }]);
  });

  it("tells outside names from names inside the app", () => {
    expect(opensOutside("完全な変更履歴")).toBe(true);
    expect(opensOutside("X")).toBe(true);
    expect(opensOutside("エクスポート")).toBe(false);
    expect(opensOutside("Export")).toBe(false);
    expect(opensOutside("無料のモデルを使う")).toBe(false);
    expect(opensOutside("設定")).toBe(false);
  });

  it("repeats the same run for the same seed", () => {
    const targets = fuzzTargets(snapshot);
    const first = Array.from(
      { length: 5 },
      (
        (random) => () =>
          pickTarget(targets, random)
      )(seededRandom(42)),
    );
    const second = Array.from(
      { length: 5 },
      (
        (random) => () =>
          pickTarget(targets, random)
      )(seededRandom(42)),
    );
    expect(first).toEqual(second);
    expect(pickTarget([], seededRandom(1))).toBeNull();
  });
});

describe("UI fuzz on the 2026-11-19 run", () => {
  it("skips a name that several buttons share, which dev:automation refuses as ambiguous", () => {
    const shared = ['- button "閉じる"', '- button "閉じる"', '- button "ヘルプ"'].join("\n");
    expect(fuzzTargets(shared)).toEqual([{ role: "button", name: "ヘルプ" }]);
    expect(fuzzTargets(['- button "使用量"', '- menuitem "使用量を見る"', '- tab "設定"'].join("\n"))).toEqual([
      { role: "menuitem", name: "使用量を見る" },
      { role: "tab", name: "設定" },
    ]);
  });

  it("counts a button behind a dialog as blocked, not as a failure of the app", () => {
    expect(clickOutcome(1, "ERROR [dev-automation] click: Timeout 10000ms exceeded.")).toBe("blocked");
    expect(clickOutcome(1, "ERROR [dev-automation] click: Error: Target page has been closed")).toBe("failed");
    expect(clickOutcome(0, "")).toBe("clicked");
    expect(
      clickOutcome(
        1,
        "click: Error: strict mode violation: getByRole('button', { name: '使用量' }) resolved to 4 elements",
      ),
    ).toBe("ambiguous");
  });
});

describe("UI fuzz after a blocked click", () => {
  it("does not pick a target again after it was blocked, as the menu item ファイル was 23 times on 2026-11-19", () => {
    const targets = [
      { role: "menuitem", name: "ファイル" },
      { role: "menuitem", name: "ブラウザ" },
    ];
    const blocked = new Set([targetKey({ role: "menuitem", name: "ファイル" })]);
    expect(withoutBlocked(targets, blocked)).toEqual([{ role: "menuitem", name: "ブラウザ" }]);
  });
});
