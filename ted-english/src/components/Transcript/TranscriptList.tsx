import { TranscriptSegment } from '../../features/analyze/core/chunk';
import { useAnalyzeStore } from '../../features/analyze/store/useAnalyzeStore';
import { formatTimestamp } from '../../utils/youtube';

type TranscriptListProps = {
  segments: TranscriptSegment[];
  onJump?: (segment: TranscriptSegment) => void;
};

export const TranscriptList = ({ segments, onJump }: TranscriptListProps) => {
  const activeSegmentIndex = useAnalyzeStore((state) => state.activeSegmentIndex);

  if (segments.length === 0) {
    return (
      <div className="rounded-md border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">
        붙여넣기 또는 URL로 전사를 불러오면 문장이 여기에 표시됩니다.
      </div>
    );
  }

  return (
    <ul className="grid max-h-[28rem] gap-2 overflow-y-auto pr-2" aria-label="Transcript segments">
      {segments.map((segment) => {
        const isActive = segment.index === activeSegmentIndex;
        return (
          <li key={segment.id}>
            <button
              type="button"
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                isActive
                  ? 'border-orange-500/60 bg-orange-500/10 text-orange-100'
                  : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700 hover:bg-slate-900'
              }`}
              onClick={() => onJump?.(segment)}
            >
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
                <span>{formatTimestamp(segment.start ?? segment.index * 5)}</span>
                <span>#{segment.index + 1}</span>
              </div>
              <p className="mt-1 leading-relaxed text-slate-100">{segment.text}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
