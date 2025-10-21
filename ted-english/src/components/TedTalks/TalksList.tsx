import { useTalksStore } from '../../features/tedtalks/store/useTalksStore';
import { TedTalk } from '../../features/tedtalks/types';

type TalksListProps = {
  proxyUrl?: string;
  onSelectTalk?: (talk: TedTalk) => void;
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (isoDate: string): string => {
  try {
    return new Date(isoDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

export const TalksList = ({ proxyUrl, onSelectTalk }: TalksListProps) => {
  const talks = useTalksStore((state) => state.talks);
  const status = useTalksStore((state) => state.status);
  const error = useTalksStore((state) => state.error);
  const lastFetched = useTalksStore((state) => state.lastFetched);
  const useMockData = useTalksStore((state) => state.useMockData);
  const setUseMockData = useTalksStore((state) => state.setUseMockData);
  const fetchTalks = useTalksStore((state) => state.fetchTalks);
  const clearError = useTalksStore((state) => state.clearError);

  const handleLoadTalks = () => {
    void fetchTalks(proxyUrl);
  };

  const handleSelectTalk = (talk: TedTalk) => {
    onSelectTalk?.(talk);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">TED Talks 목록</h3>
          {lastFetched && (
            <p className="text-xs text-slate-400">
              마지막 업데이트: {lastFetched.toLocaleTimeString('ko-KR')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={useMockData}
              onChange={(e) => setUseMockData(e.target.checked)}
              className="rounded"
            />
            Mock 데이터
          </label>
          <button
            type="button"
            onClick={handleLoadTalks}
            disabled={status === 'loading'}
            className="rounded bg-orange-500 px-3 py-1 text-xs font-medium text-slate-900 transition hover:bg-orange-400 disabled:opacity-50"
          >
            {status === 'loading' ? '로딩 중...' : talks.length > 0 ? '새로고침' : '불러오기'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between rounded-md border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200">
          <p>{error}</p>
          <button
            type="button"
            onClick={clearError}
            className="text-xs text-red-300 hover:text-red-100"
          >
            ✕
          </button>
        </div>
      )}

      {status === 'idle' && talks.length === 0 && (
        <div className="rounded-md border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
          "불러오기" 버튼을 클릭하여 TED 강연 목록을 가져오세요.
        </div>
      )}

      {status === 'loading' && talks.length === 0 && (
        <div className="rounded-md border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
          강연 목록을 불러오는 중...
        </div>
      )}

      {status === 'success' && talks.length === 0 && (
        <div className="rounded-md border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
          강연을 찾을 수 없습니다.
        </div>
      )}

      {talks.length > 0 && (
        <div className="space-y-2">
          <div className="max-h-96 space-y-2 overflow-y-auto rounded-md border border-slate-800 bg-slate-900/30 p-2">
            {talks.map((talk) => (
              <button
                key={talk.id}
                type="button"
                onClick={() => handleSelectTalk(talk)}
                className="w-full rounded-md border border-slate-800 bg-slate-900/60 p-3 text-left transition hover:border-orange-500/70 hover:bg-slate-900"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-100">{talk.title}</h4>
                    <p className="mt-1 text-xs text-slate-400">{talk.presenterDisplayName}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {talk.videoContext && (
                        <span className="rounded bg-slate-800/50 px-2 py-0.5">{talk.videoContext}</span>
                      )}
                      <span>{formatDuration(talk.duration)}</span>
                      {talk.publishedAt && <span>{formatDate(talk.publishedAt)}</span>}
                      {talk.viewedCount && (
                        <span>{(talk.viewedCount / 1000000).toFixed(1)}M views</span>
                      )}
                    </div>
                    {talk.topics.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {talk.topics.slice(0, 3).map((topic, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-300"
                          >
                            {topic.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            총 {talks.length}개의 강연
            {useMockData && ' (Mock 데이터)'}
          </p>
        </div>
      )}
    </div>
  );
};
