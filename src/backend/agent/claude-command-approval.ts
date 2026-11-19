const READ_ONLY = new Set([
  "cd",
  "ls",
  "cat",
  "head",
  "tail",
  "grep",
  "rg",
  "wc",
  "pwd",
  "echo",
  "date",
  "sort",
  "uniq",
  "cut",
  "tr",
  "jq",
  "which",
  "stat",
  "file",
  "du",
  "df",
  "tree",
]);
const READ_ONLY_GIT = new Set(["status", "log", "diff", "show", "branch", "rev-parse", "ls-files", "blame", "remote"]);
const ESTACK_TOOLS: Record<string, ReadonlySet<string>> = {
  coding: new Set(["request", "status", "checks", "report"]),
  decision: new Set(["add", "since"]),
};
const FIND_ACTIONS = new Set(["-delete", "-exec", "-execdir", "-ok", "-okdir", "-fprint", "-fprintf", "-fls"]);

function splitCommands(command: string): string[][] | null {
  const segments: string[][] = [[]];
  let word = "";
  let inWord = false;
  let quote: "'" | '"' | null = null;
  const endWord = () => {
    if (inWord) segments.at(-1)?.push(word);
    word = "";
    inWord = false;
  };
  const nextSegment = () => {
    endWord();
    segments.push([]);
  };
  for (let index = 0; index < command.length; index++) {
    const char = command[index] ?? "";
    const next = command[index + 1];
    if (quote === "'") {
      if (char === "'") quote = null;
      else word += char;
    } else if (quote === '"') {
      if (char === '"') quote = null;
      else if (char === "$" || char === "`" || char === "\\") return null;
      else word += char;
    } else if (char === "'" || char === '"') {
      quote = char;
      inWord = true;
    } else if (char === " " || char === "\t") {
      endWord();
    } else if ((char === "&" && next === "&") || (char === "|" && next === "|")) {
      nextSegment();
      index++;
    } else if (char === "|" || char === ";" || char === "\n") {
      nextSegment();
    } else if ("&$`()<>\\*?{}[]!#".includes(char) || (char === "~" && inWord)) {
      return null;
    } else {
      word += char;
      inWord = true;
    }
  }
  if (quote) return null;
  endWord();
  return segments.every((segment) => segment.length > 0) ? segments : null;
}

function estackTool(program: string): string | null {
  const match = /^(?:~\/|\/home\/[a-z_][a-z0-9_-]*\/)Projects\/estack\/estack\/bin\/([a-z]+)$/u.exec(program);
  return match?.[1] ?? null;
}

function segmentIsSafe([program = "", ...args]: string[]): boolean {
  if (READ_ONLY.has(program)) return true;
  if (program === "find") return !args.some((arg) => FIND_ACTIONS.has(arg));
  if (program === "git") return READ_ONLY_GIT.has(args[0] ?? "") && !args.some((arg) => arg.startsWith("--output"));
  const tool = estackTool(program);
  return tool !== null && (ESTACK_TOOLS[tool]?.has(args[0] ?? "") ?? false);
}

const HARMLESS_REDIRECTS = /\s2>(?:&1|\/dev\/null)(?=\s|\||;|&&|$)/gu;

const TOOL_FOLDER_VARIABLE = /^(?:cd ~\s*[;\n]\s*)?([A-Z_][A-Z0-9_]*)=(~\/Projects\/estack\/estack\/bin)\s*[;\n]/u;

function inlineToolFolder(command: string): string {
  const match = TOOL_FOLDER_VARIABLE.exec(command);
  if (!match) return command;
  const [whole, name = "", folder = ""] = match;
  return command.slice(whole.length).replaceAll(`\${${name}}/`, `${folder}/`).replaceAll(`$${name}/`, `${folder}/`);
}

export function claudeCommandNeedsApproval(command: string): boolean {
  const segments = splitCommands(inlineToolFolder(command.trim()).replaceAll(HARMLESS_REDIRECTS, " ").trim());
  return segments === null || !segments.every(segmentIsSafe);
}

export function acpCommandText(rawInput: unknown): string | null {
  if (typeof rawInput === "string") return rawInput;
  if (
    typeof rawInput === "object" &&
    rawInput !== null &&
    "command" in rawInput &&
    typeof rawInput.command === "string"
  )
    return rawInput.command;
  return rawInput === undefined || rawInput === null ? null : JSON.stringify(rawInput);
}
