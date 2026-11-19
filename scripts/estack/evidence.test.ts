import { mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CodingQueue } from "./coding-queue";
import { evidenceLines, isEvidenceKey, isEvidenceName, parseEvidence, saveEvidence } from "./evidence";
import { serve } from "./queue-server";

const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.from("image")]);
const temporary = (prefix: string): string => mkdtempSync(join(tmpdir(), prefix));

describe("estack evidence store", () => {
  it("accepts only plain keys and PNG names, so nothing leaves the store folder", () => {
    expect(isEvidenceKey("20261119010203-abc123")).toBe(true);
    expect(isEvidenceKey("fuzz-6be74fe6f-4242")).toBe(true);
    for (const key of ["", "../x", "a/b", ".hidden", "a b", "a.b"]) expect(isEvidenceKey(key)).toBe(false);
    expect(isEvidenceName("settings-after.png")).toBe(true);
    for (const name of ["../x.png", "x.jpg", ".png", "a/b.png"]) expect(isEvidenceName(name)).toBe(false);
  });

  it("reads only PNG files sent as base64", () => {
    expect(parseEvidence({ name: "shot.png", base64: png.toString("base64") })?.bytes.equals(png)).toBe(true);
    expect(parseEvidence({ name: "shot.png", base64: Buffer.from("text").toString("base64") })).toBeNull();
    expect(parseEvidence({ name: "shot.png", base64: "not base64!" })).toBeNull();
    expect(parseEvidence({ name: "../shot.png", base64: png.toString("base64") })).toBeNull();
  });

  it("saves the file only for its owner and names the place without the home folder", () => {
    const root = temporary("estack-evidence-");
    const place = saveEvidence(root, "20261119010203-abc123", { name: "shot.png", bytes: png });
    expect(place).toBe("20261119010203-abc123/shot.png");
    expect(readFileSync(join(root, place)).equals(png)).toBe(true);
    expect(statSync(join(root, place)).mode & 0o777).toBe(0o600);
    expect(statSync(join(root, "20261119010203-abc123")).mode & 0o777).toBe(0o700);
  });

  it("stores a screenshot from the Mac worker through the queue command", async () => {
    const root = temporary("estack-evidence-");
    const queue = new CodingQueue(temporary("estack-queue-"));
    const input = async () => JSON.stringify({ name: "fuzz-6be74fe6f.png", base64: png.toString("base64") });
    const output = await serve("evidence fuzz-6be74fe6f-4242", queue, input, join(root, "decisions.tsv"), root);
    expect(JSON.parse(output)).toEqual({ saved: "fuzz-6be74fe6f-4242/fuzz-6be74fe6f.png" });
    await expect(serve("evidence ../x", queue, input, join(root, "decisions.tsv"), root)).rejects.toThrow();
    const text = async () => JSON.stringify({ name: "x.png", base64: "aGVsbG8=" });
    await expect(serve("evidence fuzz-1", queue, text, join(root, "decisions.tsv"), root)).rejects.toThrow();
  });

  it("writes the places in the pull request instead of image links", () => {
    expect(evidenceLines([])).toEqual([]);
    const lines = evidenceLines(["vps:20261119010203-abc123/shot.png"]).join("\n");
    expect(lines).toContain("`vps:20261119010203-abc123/shot.png`");
    expect(lines).not.toContain("![");
    expect(lines).not.toContain("github.com");
  });
});
