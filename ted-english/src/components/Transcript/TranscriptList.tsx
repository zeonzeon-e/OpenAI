import { useMemo } from 'react';

import type { TranscriptEntry } from '../../features/analyze/core/chunk';
import { formatSeconds, parseTimestamp } from '../../features/analyze/core/time';
import { cn } from '../../features/analyze/core/cn';
import { useAnalyzeStore } from '../../features/analyze/store/useAnalyzeStore';

interface TranscriptListProps {
  entries: TranscriptEntry[];
  onJump?: (seconds: number) => void;
}

function getSeconds(entry: TranscriptEntry, fallbackSpan: number) {
  const parsed = parseTimestamp(entry.start);
  if (typeof parsed === 'number') {
    return parsed;
  }
  return entry.index * fallbackSpan;
}

export function TranscriptList({ entries, onJump }: TranscriptListProps) {
  const currentTime = useAnalyzeStore((state) => state.currentTime);
  const duration = useAnalyzeStore((state) => state.duration);
  const fallbackSpan = useMemo(() => {
    if (entries.length === 0) {
      return 5;
    }
    if (duration > 0) {
      return Math.max(2, Math.floor(duration / Math.max(entries.length, 1)));
    }
    return 5;
  }, [entries.length, duration]);

  const enriched = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        seconds: getSeconds(entry, fallbackSpan),
      })),
    [entries, fallbackSpan],
  );

  const activeId = useMemo(() => {
    if (entries.length === 0) {
      return undefined;
    }
    return enriched.reduce((closest, entry) => {
      if (!closest) {
        return entry;
      }
      const distance = Math.abs(entry.seconds - currentTime);
      const closestDistance = Math.abs(closest.seconds - currentTime);
      return distance < closestDistance ? entry : closest;
    }).index;
  }, [enriched, currentTime, entries.length]);

  return (
    <ol className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-2" aria-label="Transcript">
      {enriched.map((entry) => {
        const isActive = entry.index === activeId;
        return (
          <li
            key={entry.index}
            className={cn(
              'cursor-pointer rounded-lg border border-transparent px-3 py-2 text-sm transition hover:border-rose-400/40 hover:bg-rose-400/10',
              isActive && 'border-rose-500 bg-rose-500/10 text-rose-50 shadow-inner',
            )}
          >
            <button
              type="button"
              onClick={() => onJump?.(entry.seconds)}
              className="flex w-full items-start gap-3 text-left"
            >
              <span
                className={cn(
                  'mt-0.5 shrink-0 rounded bg-slate-800 px-2 py-1 text-xs text-slate-300',
                  isActive && 'bg-rose-600 text-rose-50',
                )}
              >
                {formatSeconds(entry.seconds)}
              </span>
              <span>{entry.text}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
