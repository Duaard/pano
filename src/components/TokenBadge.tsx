import type { UsageInfo } from "../lib/types";

interface Props {
  usage: UsageInfo;
}

export default function TokenBadge({ usage }: Props) {
  const cost = usage.cost?.total;

  return (
    <div className="inline-flex items-center gap-2 text-[10px] text-gray-400 mt-1">
      <span title="Input tokens">↓{usage.input.toLocaleString()}</span>
      <span title="Output tokens">↑{usage.output.toLocaleString()}</span>
      {usage.cacheRead ? (
        <span title="Cache read">⚡{usage.cacheRead.toLocaleString()}</span>
      ) : null}
      {cost !== undefined && (
        <span title="Cost" className="text-amber-600">
          ${cost.toFixed(4)}
        </span>
      )}
    </div>
  );
}
