import { useMemo, useState } from 'react';
import { TimeRef, VocabItem } from '../../features/analyze/core/schema';

const SORT_OPTIONS: Array<{ id: 'difficulty' | 'frequency' | 'lemma'; label: string }> = [
  { id: 'difficulty', label: '난이도' },
  { id: 'frequency', label: '빈도' },
  { id: 'lemma', label: '알파벳' },
];

type VocabPanelProps = {
  vocabulary?: VocabItem[];
  onJump?: (ref?: TimeRef) => void;
};

const difficultyOrder: Record<NonNullable<VocabItem['difficulty']>, number> = {
  A2: 1,
  B1: 2,
  B2: 3,
  C1: 4,
  C2: 5,
};

const frequencyOrder: Record<NonNullable<VocabItem['frequencyHint']>, number> = {
  high: 1,
  mid: 2,
  low: 3,
};

export const VocabPanel = ({ vocabulary, onJump }: VocabPanelProps) => {
  const [sort, setSort] = useState<'difficulty' | 'frequency' | 'lemma'>('difficulty');
  const [selected, setSelected] = useState<string | undefined>();

  const sorted = useMemo(() => {
    if (!vocabulary) return [];
    const copy = [...vocabulary];
    copy.sort((a, b) => {
      if (sort === 'lemma') return a.lemma.localeCompare(b.lemma);
      if (sort === 'difficulty') {
        return (difficultyOrder[a.difficulty ?? 'B1'] ?? 3) - (difficultyOrder[b.difficulty ?? 'B1'] ?? 3);
      }
      return (frequencyOrder[a.frequencyHint ?? 'mid'] ?? 2) - (frequencyOrder[b.frequencyHint ?? 'mid'] ?? 2);
    });
    return copy;
  }, [vocabulary, sort]);

  if (!vocabulary || vocabulary.length === 0) {
    return <p className="text-sm text-slate-400">강조할 어휘가 아직 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2" role="tablist" aria-label="Vocabulary sort order">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={sort === option.id}
            className={`rounded-md border px-3 py-1 text-xs transition ${
              sort === option.id
                ? 'border-orange-500/70 bg-orange-500/20 text-orange-100'
                : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:text-white'
            }`}
            onClick={() => setSort(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {sorted.map((item) => {
          const isSelected = selected === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
                  isSelected
                    ? 'border-orange-500/70 bg-orange-500/10 text-orange-100'
                    : 'border-slate-800 bg-slate-900/60 text-slate-100 hover:border-slate-700 hover:bg-slate-900'
                }`}
                onClick={() => setSelected(isSelected ? undefined : item.id)}
              >
                <span className="font-semibold">{item.lemma}</span>
                <span className="text-xs text-slate-300">
                  {item.pos ? `${item.pos} · ` : ''}
                  {item.difficulty ?? 'B1'} | {item.frequencyHint ?? 'mid'}
                </span>
              </button>
              {isSelected && (
                <div className="mt-2 space-y-2 rounded-md border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-100">
                  <p className="text-slate-200">{item.senseKo}</p>
                  {item.examples.map((example, index) => (
                    <button
                      key={`${item.id}-example-${index}`}
                      type="button"
                      className="block w-full rounded border border-transparent px-2 py-1 text-left text-xs transition hover:border-orange-400/70 hover:bg-slate-900"
                      onClick={() => onJump?.(example.ref)}
                    >
                      {example.text}
                    </button>
                  ))}
                  {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
