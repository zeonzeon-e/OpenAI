import { useMemo, useState } from 'react';
import { GrammarPoint, TimeRef } from '../../features/analyze/core/schema';

const DIFFICULTY_OPTIONS: Array<{ id: GrammarPoint['difficulty'] | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'A2', label: 'A2' },
  { id: 'B1', label: 'B1' },
  { id: 'B2', label: 'B2' },
  { id: 'C1', label: 'C1' },
  { id: 'C2', label: 'C2' },
];

type GrammarPanelProps = {
  points?: GrammarPoint[];
  onJump?: (ref?: TimeRef) => void;
};

export const GrammarPanel = ({ points, onJump }: GrammarPanelProps) => {
  const [difficulty, setDifficulty] = useState<GrammarPoint['difficulty'] | 'all'>('all');

  const filtered = useMemo(() => {
    if (!points) return [];
    if (difficulty === 'all') return points;
    return points.filter((point) => point.difficulty === difficulty);
  }, [points, difficulty]);

  if (!points || points.length === 0) {
    return <p className="text-sm text-slate-400">추출된 문법 포인트가 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Grammar difficulty filter">
        {DIFFICULTY_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={difficulty === option.id}
            onClick={() => setDifficulty(option.id === 'all' ? 'all' : option.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              difficulty === option.id
                ? 'border-orange-500/70 bg-orange-500/20 text-orange-100'
                : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ul className="space-y-4">
        {filtered.map((point) => (
          <li key={point.id} className="rounded-md border border-slate-800 bg-slate-900/60 p-4">
            <header className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">{point.name}</h3>
                <p className="mt-1 text-xs text-slate-300">{point.rule}</p>
              </div>
              {point.difficulty && (
                <span className="rounded-full border border-orange-500/50 px-2 py-0.5 text-xs text-orange-200">
                  {point.difficulty}
                </span>
              )}
            </header>
            <ul className="mt-3 space-y-2 text-sm text-slate-100">
              {point.examples.map((example, index) => (
                <li key={`${point.id}-example-${index}`}>
                  <button
                    type="button"
                    className="w-full rounded border border-transparent px-2 py-1 text-left transition hover:border-orange-400/70 hover:bg-slate-900"
                    onClick={() => onJump?.(example.ref)}
                  >
                    {example.text}
                  </button>
                </li>
              ))}
            </ul>
            {point.related && point.related.length > 0 && (
              <p className="mt-3 text-xs text-slate-400">Related: {point.related.join(', ')}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
