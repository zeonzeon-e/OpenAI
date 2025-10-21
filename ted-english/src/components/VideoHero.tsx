import { CalendarDaysIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';
import { VideoDetail } from '../types/video';

interface VideoHeroProps {
  video: VideoDetail;
}

export const VideoHero = ({ video }: VideoHeroProps) => {
  const formattedDate = video.publishedAt ? new Date(video.publishedAt).toLocaleDateString('ko-KR') : '발표일 미정';
  const durationLabel = video.duration || '재생시간 미정';
  const speakerLabel = video.speaker || 'TED Speaker';
  const description = video.shortDescription || '이 강연의 상세 설명은 준비 중입니다.';

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950">
      <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr,0.8fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-200">
            TED Talk
          </div>
          <h1 className="text-4xl font-bold text-white lg:text-5xl">{video.title}</h1>
          <p className="text-lg text-slate-300">{description}</p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1">
              <UsersIcon className="h-4 w-4 text-brand-200" /> {speakerLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1">
              <ClockIcon className="h-4 w-4 text-brand-200" /> {durationLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1">
              <CalendarDaysIcon className="h-4 w-4 text-brand-200" /> {formattedDate}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {video.tags.length > 0 ? (
              video.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-900/80 px-4 py-1 text-xs font-semibold text-slate-300">
                  #{tag}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-slate-900/80 px-4 py-1 text-xs font-semibold text-slate-300">
                #TED
              </span>
            )}
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-lg shadow-brand-500/10">
          {video.youtubeId ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${video.youtubeId}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-950 text-sm text-slate-400">
              영상 링크를 불러오는 중입니다.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
