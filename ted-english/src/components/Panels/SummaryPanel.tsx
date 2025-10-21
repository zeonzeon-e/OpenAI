import { useState } from 'react';
import { Summary } from '../../features/analyze/core/schema';
import { TimeRef } from '../../features/analyze/core/schema';

type SummaryPanelProps = {
  summary?: Summary;
  onJump?: (ref?: TimeRef) => void;
};

const SUMMARY_VARIANTS: Array<{ id: 'short' | 'medium' | 'long'; label: string }> = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
];

export const SummaryPanel = ({ summary, onJump }: SummaryPanelProps) => {
  const [active, setActive] = useState<'short' | 'medium' | 'long'>('medium');

  if (!summary) {
    return <p className="text-sm text-slate-400">분석이 완료되면 요약이 여기에 표시됩니다.</p>;
  }

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Summary length" className="inline-flex rounded-md border border-slate-800 bg-slate-900/50 p-1">
        {SUMMARY_VARIANTS.map((variant) => (
          <button
            key={variant.id}
            role="tab"
            type="button"
            className={`rounded px-3 py-1 text-xs font-medium transition ${
              active === variant.id
                ? 'bg-orange-500 text-slate-900 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
            aria-selected={active === variant.id}
            onClick={() => setActive(variant.id)}
          >
            {variant.label}
          </button>
        ))}
      </div>
      <p className="rounded-md border border-slate-800 bg-slate-900/60 p-4 text-sm leading-relaxed text-slate-100">
        {summary[active]}
      </p>
      <section aria-labelledby="summary-key-messages" className="space-y-2">
        <h3 id="summary-key-messages" className="text-sm font-semibold text-slate-200">
          Key Messages
        </h3>
        <ul className="space-y-2">
          {summary.keyMessages.map((message, index) => (
            <li key={`${message.text}-${index}`}>
              <button
                type="button"
                className="w-full rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-left text-sm text-slate-100 transition hover:border-orange-500/70 hover:bg-slate-900"
                onClick={() => onJump?.(message.ref)}
              >
                {message.text}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
