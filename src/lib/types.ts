// JSONL entry types

export interface SessionEntry {
  type: "session";
  id: string;
  version: number;
  timestamp: string;
  cwd: string;
}

export interface ModelChangeEntry {
  type: "model_change";
  id: string;
  parentId: string | null;
  timestamp: string;
  provider: string;
  modelId: string;
}

export interface ThinkingLevelChangeEntry {
  type: "thinking_level_change";
  id: string;
  parentId: string | null;
  timestamp: string;
  thinkingLevel: string;
}

export interface TextContent {
  type: "text";
  text: string;
}

export interface ThinkingContent {
  type: "thinking";
  thinking: string;
  thinkingSignature?: string;
}

export interface ToolCallContent {
  type: "toolCall";
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export type ContentBlock = TextContent | ThinkingContent | ToolCallContent;

export interface UsageInfo {
  input: number;
  output: number;
  cacheRead?: number;
  cacheWrite?: number;
  totalTokens: number;
  cost?: {
    input: number;
    output: number;
    cacheRead?: number;
    cacheWrite?: number;
    total: number;
  };
}

export interface MessageEntry {
  type: "message";
  id: string;
  parentId: string | null;
  timestamp: string;
  message: {
    role: "user" | "assistant" | "system" | "toolResult";
    content: ContentBlock[] | string;
    timestamp?: number;
    // Tool result fields
    toolCallId?: string;
    toolName?: string;
    details?: {
      status?: string;
      exitCode?: number;
      durationMs?: number;
      aggregated?: string;
      cwd?: string;
      diff?: string;
      firstChangedLine?: number;
    };
    isError?: boolean;
  };
  // Assistant-specific fields (at entry level for assistant msgs)
  api?: string;
  provider?: string;
  model?: string;
  usage?: UsageInfo;
  stopReason?: string;
}

export interface CustomEntry {
  type: "custom";
  customType: string;
  data: Record<string, unknown>;
  id: string;
  parentId: string | null;
  timestamp: string;
}

export type LogEntry =
  | SessionEntry
  | ModelChangeEntry
  | ThinkingLevelChangeEntry
  | MessageEntry
  | CustomEntry;
