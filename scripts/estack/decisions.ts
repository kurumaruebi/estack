import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";
import { isDynamicRecord, isString } from "@estack/contracts/runtime-values";

export const DECISION_FIELDS = ["time", "actor", "stage", "decision", "reason", "evidence", "result"] as const;
export type Decision = Record<(typeof DECISION_FIELDS)[number], string>;

const HEADER = `${DECISION_FIELDS.join("\t")}\n`;

export function decisionsFile(environment: NodeJS.ProcessEnv = process.env): string {
  return environment.ESTACK_DECISIONS_FILE ?? join(homedir(), "estack-log", "decisions.tsv");
}

const clean = (value: string): string =>
  value
    .replaceAll(/[\t\r\n]+/gu, " ")
    .trim()
    .slice(0, 1000);

export function parseDecision(value: unknown): Decision | null {
  if (!isDynamicRecord(value)) return null;
  const row: Partial<Decision> = {};
  for (const field of DECISION_FIELDS) {
    const text = value[field];
    if (!isString(text)) return null;
    row[field] = clean(text);
  }
  const { time, actor, stage, decision, reason, evidence, result } = row;
  if (!time || !actor || !stage || !decision || reason === undefined || evidence === undefined || result === undefined)
    return null;
  if (Number.isNaN(Date.parse(time))) return null;
  return { time, actor, stage, decision, reason, evidence, result };
}

export function appendDecision(file: string, decision: Decision): void {
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  if (!existsSync(file)) appendFileSync(file, HEADER, { mode: 0o600 });
  appendFileSync(file, `${DECISION_FIELDS.map((field) => clean(decision[field])).join("\t")}\n`);
}

export function decisionsSince(file: string, since: Date): Decision[] {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8")
    .split("\n")
    .slice(1)
    .filter(Boolean)
    .flatMap((line) => {
      const cells = line.split("\t");
      const row = parseDecision(Object.fromEntries(DECISION_FIELDS.map((field, index) => [field, cells[index] ?? ""])));
      return row && Date.parse(row.time) >= since.getTime() ? [row] : [];
    });
}

const USAGE = `使い方:
  decision add --actor <名前> --stage <段階> --decision <判断> [--reason <理由>] [--evidence <証拠の場所>] [--result <結果>]
  decision since <ISO の日時 | 24h>`;

export function main(argv: string[], file: string, write: (text: string) => void, now = new Date()): 0 | 2 {
  const [command, ...rest] = argv;
  if (command === "add") {
    const { values } = parseArgs({
      args: rest,
      options: Object.fromEntries(DECISION_FIELDS.map((field) => [field, { type: "string" as const }])),
    });
    const row = parseDecision({ reason: "", evidence: "", result: "", ...values, time: now.toISOString() });
    if (!row) {
      write(`${USAGE}\n`);
      return 2;
    }
    appendDecision(file, row);
    return 0;
  }
  if (command === "since" && rest[0]) {
    const hours = /^(\d+)h$/u.exec(rest[0]);
    const since = hours ? new Date(now.getTime() - Number(hours[1]) * 3_600_000) : new Date(rest[0]);
    if (Number.isNaN(since.getTime())) {
      write(`${USAGE}\n`);
      return 2;
    }
    write(HEADER);
    for (const row of decisionsSince(file, since)) write(`${DECISION_FIELDS.map((field) => row[field]).join("\t")}\n`);
    return 0;
  }
  write(`${USAGE}\n`);
  return 2;
}

if (import.meta.main) {
  process.exit(
    main(process.argv.slice(2), decisionsFile(), (text) => {
      process.stdout.write(text);
    }),
  );
}
