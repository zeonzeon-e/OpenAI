import { useMemo, useState } from 'react';

import type { GrammarPoint } from '../../features/analyze/core/schema';
import { cn } from '../../features/analyze/core/cn';
import { parseTimestamp } from '../../features/analyze/core/time';

interface GrammarPanelProps {
  grammar: GrammarPoint[];
  onJump?: (seconds: number) => void;
  resolveIndexToSeconds?: (index: number) => number;
}

const DIFFICULTY_ORDER = ['A2', 'B1', 'B2', 'C1', 'C2'] as const;

type Difficulty = (typeof DIFFICULTY_ORDER)[number];

export function GrammarPanel({ grammar, onJump, resolveIndexToSeconds }: GrammarPanelProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    if (difficultyFilter === 'ALL') {
      return grammar;
    }
    return grammar.filter((item) => item.difficulty === difficultyFilter);
  }, [difficultyFilter, grammar]);

  if (grammar.length === 0) {
    return <p className="text-sm text-slate-400">문법 포인트는 분석 후 표시됩니다.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setDifficultyFilter('ALL')}
          className={cn(
            'rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-rose-400 hover:text-rose-200',
            difficultyFilter === 'ALL' && 'border-rose-500 bg-rose-500/10 text-rose-100',
          )}
        >
          전체
        </button>
        {DIFFICULTY_ORDER.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setDifficultyFilter(level)}
            className={cn(
              'rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-rose-400 hover:text-rose-200',
              difficultyFilter === level && 'border-rose-500 bg-rose-500/10 text-rose-100',
            )}
          >
            {level}
          </button>
        ))}
      </div>
      <ul className="flex flex-col gap-4">
        {filtered.map((point) => (
          <li key={point.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">{point.name}</h3>
              {point.difficulty ? (
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{point.difficulty}</span>
              ) : null}
              {point.related?.map((related: string) => (
                <span key={related} className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs text-rose-200">
                  {related}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-slate-200">{point.rule}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {point.examples.map((example: GrammarPoint['examples'][number], index: number) => {
                const seconds =
                  parseTimestamp(example.ref?.timestamp)
                  ?? (typeof example.ref?.index === 'number'
                    ? resolveIndexToSeconds?.(example.ref.index)
                    : undefined);
                return (
                  <li key={`${point.id}-example-${index}`}>
                    <button
                      type="button"
                      className="w-full rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-rose-500 hover:bg-rose-500/10"
                      onClick={() => (typeof seconds === 'number' ? onJump?.(seconds) : undefined)}
                    >
                      {example.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
