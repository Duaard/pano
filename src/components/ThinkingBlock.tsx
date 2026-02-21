import { useState } from "react";

interface Props {
  thinking: string;
}

export default function ThinkingBlock({ thinking }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="my-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
      >
        <span className={`transition-transform ${expanded ? "rotate-90" : ""}`}>▶</span>
        <span className="italic">thinking…</span>
        <span className="text-gray-600">
          ({thinking.length} chars)
        </span>
      </button>
      {expanded && (
        <div className="mt-2 ml-4 p-3 bg-purple-950/30 border border-purple-900/50 rounded text-sm text-purple-200 whitespace-pre-wrap max-h-96 overflow-y-auto">
          {thinking}
        </div>
      )}
    </div>
  );
}
