export interface FuzzTarget {
  role: string;
  name: string;
}

const CLICKABLE = /^\s*- (button|tab|menuitem|checkbox|switch|radio) "([^"]{1,120})"/u;
const RISKY =
  /delete|remove|sign ?out|log ?out|reset|uninstall|quit|archive|revoke|clear|send|publish|buy|pay|upgrade|update|download|erase|reboot|削除|消す|ログアウト|サインアウト|リセット|終了|送信|公開|購入|支払|アップデート|ダウンロード|取り消/iu;

const EXTERNAL =
  /changelog|change ?log|release notes|guide|docs|documentation|learn more|discord|github|reddit|facebook|linkedin|instagram|tiktok|threads|twitter|youtube|feedback|report (a )?(problem|bug|issue)|open in|browser|website|変更履歴|リリースノート|ガイド|ドキュメント|詳しく|フィードバック|問題を報告|不具合を報告|を開く|ブラウザ|ウェブサイト|サイト/iu;
const X_ACCOUNT = /(^|[\s(（])X($|[\s)）])/u;

export function opensOutside(name: string): boolean {
  return EXTERNAL.test(name) || X_ACCOUNT.test(name);
}

const IDEOGRAPHIC_SPACE = String.fromCharCode(0x3000);
const EDGE_SPACES = new RegExp(`^[\\s${IDEOGRAPHIC_SPACE}]+|[\\s${IDEOGRAPHIC_SPACE}]+$`, "gu");

export function comparableName(name: string): string {
  return name.replace(EDGE_SPACES, "");
}

export function fuzzTargets(snapshot: string): FuzzTarget[] {
  const counts = new Map<string, number>();
  const targets: FuzzTarget[] = [];
  for (const line of snapshot.split("\n")) {
    const match = CLICKABLE.exec(line);
    const role = match?.[1];
    const name = match?.[2] === undefined ? undefined : comparableName(match[2]);
    if (!role || !name || RISKY.test(name) || opensOutside(name)) continue;
    const key = `${role}:${name}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
    if (counts.get(key) === 1) targets.push({ role, name });
  }
  const names = [...counts.keys()].map((key) => key.slice(key.indexOf(":") + 1));
  return targets.filter(
    (target) =>
      counts.get(`${target.role}:${target.name}`) === 1 &&
      !names.some((other) => other !== target.name && other.includes(target.name)),
  );
}

export type ClickOutcome = "clicked" | "blocked" | "ambiguous" | "failed";

export function clickOutcome(status: number | null, stderr: string): ClickOutcome {
  if (status === 0) return "clicked";
  if (/strict mode violation/iu.test(stderr)) return "ambiguous";
  return /Timeout \d+ms exceeded|not visible|intercepts pointer events|not enabled/iu.test(stderr)
    ? "blocked"
    : "failed";
}

export function pickTarget(targets: readonly FuzzTarget[], random: () => number): FuzzTarget | null {
  if (targets.length === 0) return null;
  return targets[Math.min(targets.length - 1, Math.floor(random() * targets.length))] ?? null;
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4_294_967_296;
  };
}

export function targetKey(target: FuzzTarget): string {
  return `${target.role}:${target.name}`;
}

export function withoutBlocked(targets: readonly FuzzTarget[], blocked: ReadonlySet<string>): FuzzTarget[] {
  return targets.filter((target) => !blocked.has(targetKey(target)));
}
