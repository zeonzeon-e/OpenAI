import { CalendarDaysIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';

import { formatDuration } from '../utils/time';
import { VideoDetail } from '../types/video';

interface VideoHeroProps {
  video: VideoDetail;
}

export const VideoHero = ({ video }: VideoHeroProps) => {
  const formattedDuration = formatDuration(video.durationSeconds, video.duration);

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
              <ClockIcon className="h-4 w-4 text-brand-200" /> {formattedDuration}
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
          {hasEmbed ? (
            <iframe
              className="h-full w-full"
              src={embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-950 px-6 text-center text-sm text-slate-400">
              <span>영상 임베드를 불러오지 못했습니다.</span>
              {watchUrl ? (
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-brand-400"
                >
                  {providerName}에서 시청하기
                </a>
              ) : null}
            </div>
          )}
        </div>
        {watchUrl ? (
          <div className="lg:col-span-2 lg:flex lg:justify-end">
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-brand-400"
            >
              {providerName}에서 원본 영상 보기
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
};
