import { useMemo, useState } from 'react';

import type { VocabItem } from '../../features/analyze/core/schema';
import { cn } from '../../features/analyze/core/cn';
import { parseTimestamp } from '../../features/analyze/core/time';

interface VocabPanelProps {
  vocabulary: VocabItem[];
  onJump?: (seconds: number) => void;
  resolveIndexToSeconds?: (index: number) => number;
}

const SORT_OPTIONS = [
  { id: 'difficulty', label: '난이도' },
  { id: 'frequency', label: '빈도' },
  { id: 'alpha', label: '알파벳' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['id'];

const FREQUENCY_ORDER: Record<string, number> = {
  high: 0,
  mid: 1,
  low: 2,
};

export function VocabPanel({ vocabulary, onJump, resolveIndexToSeconds }: VocabPanelProps) {
  const [sortBy, setSortBy] = useState<SortOption>('difficulty');

  const sorted = useMemo(() => {
    const items = [...vocabulary];
    if (sortBy === 'difficulty') {
      return items.sort((a, b) => (a.difficulty ?? 'C2').localeCompare(b.difficulty ?? 'C2'));
    }
    if (sortBy === 'frequency') {
      return items.sort((a, b) => (FREQUENCY_ORDER[a.frequencyHint ?? 'mid'] ?? 1) - (FREQUENCY_ORDER[b.frequencyHint ?? 'mid'] ?? 1));
    }
    return items.sort((a, b) => a.lemma.localeCompare(b.lemma));
  }, [sortBy, vocabulary]);

  if (vocabulary.length === 0) {
    return <p className="text-sm text-slate-400">어휘 항목은 분석 후 표시됩니다.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSortBy(option.id)}
            className={cn(
              'rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-rose-400 hover:text-rose-200',
              sortBy === option.id && 'border-rose-500 bg-rose-500/10 text-rose-100',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {sorted.map((item: VocabItem) => {
          const firstExample = item.examples[0];
          const indexRef = firstExample?.ref?.index;
          const seconds =
            parseTimestamp(firstExample?.ref?.timestamp)
            ?? (typeof indexRef === 'number' ? resolveIndexToSeconds?.(indexRef) : undefined);
          return (
            <li key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-rose-100">{item.lemma}</h3>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{item.pos ?? '—'}</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  {item.difficulty ? <span className="block">CEFR {item.difficulty}</span> : null}
                  {item.frequencyHint ? <span className="block">빈도 {item.frequencyHint}</span> : null}
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-200">{item.senseKo}</p>
              {item.notes ? <p className="mt-2 text-xs text-slate-400">{item.notes}</p> : null}
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                {item.examples.map((example: VocabItem['examples'][number], index: number) => (
                  <li key={`${item.id}-example-${index}`}>
                    <button
                      type="button"
                      className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-left transition hover:border-rose-500 hover:bg-rose-500/10"
                      onClick={() => {
                        const time =
                          parseTimestamp(example.ref?.timestamp)
                          ?? (typeof example.ref?.index === 'number'
                            ? resolveIndexToSeconds?.(example.ref.index)
                            : undefined);
                        if (typeof time === 'number') {
                          onJump?.(time);
                        }
                      }}
                    >
                      {example.text}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
