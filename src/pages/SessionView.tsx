import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchSession } from "../lib/api";
import type {
  LogEntry,
  MessageEntry,
  UsageInfo,
  ContentBlock,
} from "../lib/types";
import ThinkingBlock from "../components/ThinkingBlock";
import ToolCallBlock from "../components/ToolCallBlock";
import TokenBadge from "../components/TokenBadge";

export default function SessionView() {
  const { agent, id } = useParams<{ agent: string; id: string }>();
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agent || !id) return;
    fetchSession(agent, id).then((data) => {
      setEntries(data as LogEntry[]);
      setLoading(false);
    });
  }, [agent, id]);

  // Build a map of tool call results by toolCallId
  const toolResults = new Map<string, MessageEntry>();
  for (const entry of entries) {
    if (
      entry.type === "message" &&
      (entry as MessageEntry).message.role === "toolResult"
    ) {
      const msg = entry as MessageEntry;
      if (msg.message.toolCallId) {
        toolResults.set(msg.message.toolCallId, msg);
      }
    }
  }

  // Compute session totals
  const sessionTotals = entries.reduce(
    (acc, entry) => {
      if (entry.type === "message") {
        const msg = entry as MessageEntry;
        if (msg.message.role === "assistant" && msg.usage) {
          acc.input += msg.usage.input;
          acc.output += msg.usage.output;
          acc.cacheRead += msg.usage.cacheRead || 0;
          acc.totalTokens += msg.usage.totalTokens;
          acc.cost += msg.usage.cost?.total || 0;
        }
      }
      return acc;
    },
    { input: 0, output: 0, cacheRead: 0, totalTokens: 0, cost: 0 }
  );

  // Filter to displayable entries (messages only, skip toolResults as they're shown inline)
  const displayEntries = entries.filter((e) => {
    if (e.type !== "message") return false;
    const msg = e as MessageEntry;
    return msg.message.role !== "toolResult";
  }) as MessageEntry[];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
        <p className="text-gray-500">Loading session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
            >
              ← back
            </Link>
            <div>
              <h1 className="text-sm font-mono text-gray-300">
                {agent}/{id}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>↓{sessionTotals.input.toLocaleString()}</span>
            <span>↑{sessionTotals.output.toLocaleString()}</span>
            {sessionTotals.cacheRead > 0 && (
              <span>⚡{sessionTotals.cacheRead.toLocaleString()}</span>
            )}
            <span className="text-yellow-600 font-medium">
              ${sessionTotals.cost.toFixed(4)}
            </span>
            <span className="text-gray-600">
              {sessionTotals.totalTokens.toLocaleString()} tokens
            </span>
          </div>
        </div>
      </header>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto py-6 px-4 space-y-4">
        {displayEntries.map((entry) => (
          <MessageBubble
            key={entry.id}
            entry={entry}
            toolResults={toolResults}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({
  entry,
  toolResults,
}: {
  entry: MessageEntry;
  toolResults: Map<string, MessageEntry>;
}) {
  const { role, content } = entry.message;
  const isUser = role === "user";
  const isAssistant = role === "assistant";
  const isSystem = role === "system";

  const contentBlocks: ContentBlock[] =
    typeof content === "string"
      ? [{ type: "text", text: content }]
      : (content as ContentBlock[]);

  const textBlocks = contentBlocks.filter((b) => b.type === "text");
  const thinkingBlocks = contentBlocks.filter((b) => b.type === "thinking");
  const toolCallBlocks = contentBlocks.filter((b) => b.type === "toolCall");

  const hasTextContent = textBlocks.some(
    (b) => (b as { text: string }).text.trim().length > 0
  );
  const usage = entry.usage as UsageInfo | undefined;

  return (
    <div
      className={`flex ${isUser ? "justify-start" : "justify-end"} ${
        isSystem ? "justify-center" : ""
      }`}
    >
      <div
        className={`max-w-3xl w-full rounded-lg p-4 ${
          isUser
            ? "bg-blue-950/40 border border-blue-900/40"
            : isSystem
            ? "bg-gray-900/50 border border-gray-800 max-w-2xl"
            : "bg-gray-900 border border-gray-800"
        }`}
      >
        {/* Role label */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold ${
              isUser
                ? "text-blue-400"
                : isSystem
                ? "text-gray-600"
                : "text-green-400"
            }`}
          >
            {role}
          </span>
          <span className="text-[10px] text-gray-600">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {/* Thinking blocks */}
        {thinkingBlocks.map((block, i) => (
          <ThinkingBlock
            key={i}
            thinking={(block as { thinking: string }).thinking}
          />
        ))}

        {/* Text content */}
        {hasTextContent && (
          <div className={`text-sm whitespace-pre-wrap ${isSystem ? "text-gray-500" : "text-gray-200"}`}>
            {textBlocks
              .map((b) => (b as { text: string }).text)
              .join("")
              .trim()}
          </div>
        )}

        {/* Tool calls */}
        {toolCallBlocks.map((block) => {
          const tc = block as { id: string; name: string; arguments: Record<string, unknown> };
          return (
            <ToolCallBlock
              key={tc.id}
              name={tc.name}
              args={tc.arguments}
              toolCallId={tc.id}
              result={toolResults.get(tc.id)}
            />
          );
        })}

        {/* Token badge */}
        {isAssistant && usage && <TokenBadge usage={usage} />}
      </div>
    </div>
  );
}
