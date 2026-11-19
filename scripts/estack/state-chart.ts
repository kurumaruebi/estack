export interface Edge {
  from: string;
  to: string;
  label: string;
}

export function chartEdges(text: string): Edge[] {
  const block = /```mermaid\n([\s\S]*?)```/u.exec(text)?.[1] ?? "";
  return block.split("\n").flatMap((line) => {
    const match = /^\s*(\[\*\]|\w+)\s*-->\s*(\[\*\]|\w+)(?:\s*:\s*(\S+))?\s*$/u.exec(line);
    return match ? [{ from: match[1] ?? "", to: match[2] ?? "", label: match[3] ?? "" }] : [];
  });
}
