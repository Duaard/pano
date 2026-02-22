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
        className="flex items-center gap-2 text-xs text-purple-600 hover:text-purple-500 transition-colors"
      >
        <span className={`transition-transform ${expanded ? "rotate-90" : ""}`}>▶</span>
        <span className="italic">thinking…</span>
        <span className="text-gray-400">
          ({thinking.length} chars)
        </span>
      </button>
      {expanded && (
        <div className="mt-2 ml-4 p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-900 whitespace-pre-wrap max-h-96 overflow-y-auto">
          {thinking}
        </div>
      )}
    </div>
  );
}
