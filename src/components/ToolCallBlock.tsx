import { useState } from "react";
import type { MessageEntry } from "../lib/types";

interface Props {
  name: string;
  args: Record<string, unknown>;
  toolCallId: string;
  result?: MessageEntry;
}

function summarizeArgs(name: string, args: Record<string, unknown>): string {
  if (name === "exec" && typeof args.command === "string") {
    const cmd = args.command as string;
    return cmd.length > 80 ? cmd.slice(0, 80) + "…" : cmd;
  }
  if ((name === "Read" || name === "read") && (args.path || args.file_path)) {
    return String(args.path || args.file_path);
  }
  if ((name === "Write" || name === "write") && (args.path || args.file_path)) {
    return String(args.path || args.file_path);
  }
  if ((name === "Edit" || name === "edit") && (args.path || args.file_path)) {
    return String(args.path || args.file_path);
  }
  if (name === "web_search" && typeof args.query === "string") {
    return args.query as string;
  }
  const keys = Object.keys(args);
  return keys.length > 0 ? keys.join(", ") : "no args";
}

function getResultText(result: MessageEntry): string {
  const msg = result.message;
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    return msg.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n");
  }
  if (msg.details?.aggregated) return msg.details.aggregated;
  return "";
}

export default function ToolCallBlock({ name, args, result }: Props) {
  const [expanded, setExpanded] = useState(false);
  const summary = summarizeArgs(name, args);
  const resultText = result ? getResultText(result) : null;
  const isError = result?.message.isError;

  return (
    <div className="my-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-cyan-700 hover:text-cyan-600 transition-colors w-full text-left"
      >
        <span className={`transition-transform flex-shrink-0 ${expanded ? "rotate-90" : ""}`}>▶</span>
        <span className="font-mono font-semibold">{name}</span>
        <span className="text-gray-400 truncate">{summary}</span>
        {isError && <span className="text-red-500 flex-shrink-0">✗</span>}
        {result && !isError && <span className="text-green-500 flex-shrink-0">✓</span>}
      </button>
      {expanded && (
        <div className="mt-2 ml-4 space-y-2">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto text-gray-700">
            {JSON.stringify(args, null, 2)}
          </div>
          {resultText && (
            <div className={`p-3 border rounded text-xs font-mono whitespace-pre-wrap max-h-64 overflow-y-auto ${
              isError
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-gray-50 border-gray-200 text-gray-500"
            }`}>
              <div className="text-gray-400 mb-1 text-[10px] uppercase tracking-wider">Result</div>
              {resultText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
