import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { isDynamicRecord, isString } from "@estack/contracts/runtime-values";

export const MAX_EVIDENCE_BYTES = 20 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export interface Evidence {
  name: string;
  bytes: Buffer;
}

export function evidenceRoot(environment: NodeJS.ProcessEnv = process.env): string {
  return environment.ESTACK_EVIDENCE_DIR ?? join(homedir(), "estack-evidence");
}

export function isEvidenceKey(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,119}$/u.test(value);
}

export function isEvidenceName(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_-]{0,95}\.png$/u.test(value);
}

export function parseEvidence(value: unknown): Evidence | null {
  if (!isDynamicRecord(value) || !isEvidenceName(value.name) || !isString(value.base64)) return null;
  if (!/^[A-Za-z0-9+/]*={0,2}$/u.test(value.base64)) return null;
  const bytes = Buffer.from(value.base64, "base64");
  if (bytes.length > MAX_EVIDENCE_BYTES || !bytes.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) return null;
  return { name: value.name, bytes };
}

export function saveEvidence(root: string, key: string, evidence: Evidence): string {
  if (!isEvidenceKey(key) || !isEvidenceName(evidence.name)) throw new Error("The evidence key or name is not valid.");
  mkdirSync(join(root, key), { recursive: true, mode: 0o700 });
  writeFileSync(join(root, key, evidence.name), evidence.bytes, { mode: 0o600 });
  return `${key}/${evidence.name}`;
}

export function evidenceLines(places: readonly string[]): string[] {
  if (places.length === 0) return [];
  return [
    "",
    "Screenshots are not in this repository. They are in the private evidence store (`vps:` on the VPS, `mac:` in the work folder of the Mac worker), and the lead attaches them in the 開発 channel:",
    ...places.map((place) => `- \`${place}\``),
  ];
}
