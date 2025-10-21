import { useState } from 'react';

import type { Summary } from '../../features/analyze/core/schema';
import { cn } from '../../features/analyze/core/cn';
import { parseTimestamp } from '../../features/analyze/core/time';

interface SummaryPanelProps {
  summary?: Summary;
  onJump?: (seconds: number) => void;
  resolveIndexToSeconds?: (index: number) => number;
}

const SUMMARY_LENGTHS = [
  { id: 'short', label: '짧게' },
  { id: 'medium', label: '보통' },
  { id: 'long', label: '자세히' },
] as const;

type SummaryLength = (typeof SUMMARY_LENGTHS)[number]['id'];

export function SummaryPanel({ summary, onJump, resolveIndexToSeconds }: SummaryPanelProps) {
  const [length, setLength] = useState<SummaryLength>('medium');

  if (!summary) {
    return <p className="text-sm text-slate-400">분석을 실행하면 요약이 여기에 표시됩니다.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {SUMMARY_LENGTHS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setLength(item.id)}
            className={cn(
              'rounded-md border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-rose-400 hover:text-rose-200',
              length === item.id && 'border-rose-500 bg-rose-500/10 text-rose-100',
            )}
            aria-pressed={length === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-100">
        {summary[length]}
      </p>
      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-200">핵심 메시지</h3>
        <ul className="flex flex-col gap-2">
          {summary.keyMessages.map((message: Summary['keyMessages'][number], index: number) => {
            const seconds =
              parseTimestamp(message.ref?.timestamp)
              ?? (typeof message.ref?.index === 'number'
                ? resolveIndexToSeconds?.(message.ref.index)
                : undefined);
            return (
              <li key={message.text}>
                <button
                  type="button"
                  className="flex w-full items-start gap-3 rounded-md border border-slate-800 bg-slate-900/40 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-rose-500 hover:bg-rose-500/10"
                  onClick={() => (typeof seconds === 'number' ? onJump?.(seconds) : undefined)}
                >
                  <span className="mt-0.5 text-xs font-semibold text-rose-300">#{index + 1}</span>
                  <span>{message.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
