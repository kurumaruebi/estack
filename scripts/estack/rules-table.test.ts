import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const table = readFileSync(join(root, "estack", "決まりと止める仕組み.md"), "utf8");

function guardedRows(text: string): { rule: string; guards: string[]; mistake: string }[] {
  const section = text.split("## 仕組みで止めている決まり")[1]?.split("\n## ")[0] ?? "";
  return section
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.startsWith("|---") && !line.startsWith("| 決まり"))
    .map((line) => {
      const [rule = "", guard = "", mistake = ""] = line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      return { rule, guards: [...guard.matchAll(/`([^`]+)`/gu)].map((match) => match[1] ?? ""), mistake };
    });
}

describe("rules table", () => {
  const rows = guardedRows(table);

  it("has rows", () => {
    expect(rows.length).toBeGreaterThan(0);
  });

  it.each(rows)("names guards that exist and a real mistake: $rule", (row) => {
    expect(row.guards.length).toBeGreaterThan(0);
    expect(row.guards.filter((path) => !existsSync(join(root, path)))).toEqual([]);
    expect(row.mistake).not.toBe("");
  });
});
