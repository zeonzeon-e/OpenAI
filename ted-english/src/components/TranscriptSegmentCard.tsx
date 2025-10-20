import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { BookOpenIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

import { TranscriptSegment } from '../types/video';

interface TranscriptSegmentCardProps {
  segment: TranscriptSegment;
  isActive?: boolean;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${secs}`;
};

export const TranscriptSegmentCard = ({ segment, isActive }: TranscriptSegmentCardProps) => {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border ${
        isActive ? 'border-brand-400/80 bg-slate-900/90 shadow-lg shadow-brand-500/20' : 'border-slate-800 bg-slate-900/60'
      } p-5 transition`}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">{formatTime(segment.start)}</p>
          <p className="mt-2 text-lg font-semibold text-white">{segment.english}</p>
        </div>
      </header>
      <p className="mt-3 text-sm text-slate-300">{segment.korean}</p>

      {segment.grammarNotes && segment.grammarNotes.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-200">
            <BookOpenIcon className="h-5 w-5" /> 문법 노트
          </div>
          <ul className="mt-2 space-y-2 text-sm text-slate-300">
            {segment.grammarNotes.map((note) => (
              <li key={note} className="leading-relaxed">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {segment.vocabulary && segment.vocabulary.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-200">
            <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> 단어장
          </div>
          <dl className="mt-2 grid gap-3 text-sm text-slate-300">
            {segment.vocabulary.map((item) => (
              <div key={item.term} className="rounded-xl bg-slate-900/80 p-3">
                <dt className="font-semibold text-white">
                  {item.term}
                  {item.partOfSpeech && <span className="ml-2 text-xs uppercase text-brand-300">{item.partOfSpeech}</span>}
                </dt>
                <dd className="mt-1 text-sm text-slate-300">{item.definition}</dd>
                {item.example && <p className="mt-2 text-xs text-slate-400">예문: {item.example}</p>}
              </div>
            ))}
          </dl>
        </div>
      )}

      <Transition
        as={Fragment}
        show={Boolean(isActive)}
        enter="transition ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="pointer-events-none absolute inset-0 border-2 border-brand-300/40" />
      </Transition>
    </article>
  );
};
