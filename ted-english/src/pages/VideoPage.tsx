import { ArrowUturnLeftIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import { TranscriptSegmentCard } from '../components/TranscriptSegmentCard';
import { VideoHero } from '../components/VideoHero';
import { useVideoById } from '../hooks/useVideoData';

export const VideoPage = () => {
  const video = useVideoById();

  if (!video) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6">
        <p className="text-lg text-slate-300">해당 강연을 찾을 수 없습니다.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-400"
        >
          <ArrowUturnLeftIcon className="h-4 w-4" /> 강연 목록으로 이동
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <VideoHero video={video} />

      <section className="grid gap-8 lg:grid-cols-[0.6fr,1.4fr]">
        <aside className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center gap-3 text-sm font-semibold text-brand-200">
            <LightBulbIcon className="h-5 w-5" /> 학습 포인트
          </div>
          {video.learningObjectives.length > 0 ? (
            <ul className="space-y-3 text-sm text-slate-300">
              {video.learningObjectives.map((objective) => (
                <li key={objective} className="rounded-2xl bg-slate-950/60 p-4">
                  {objective}
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-400">
              이 강연의 학습 포인트는 곧 업데이트될 예정입니다.
            </p>
          )}
        </aside>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-white">스크립트 & 학습 노트</h2>
          {video.transcript.length > 0 ? (
            <div className="grid gap-4">
              {video.transcript.map((segment) => (
                <TranscriptSegmentCard key={segment.start} segment={segment} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
              스크립트는 현재 준비 중입니다. 잠시 후 다시 확인해 주세요.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
