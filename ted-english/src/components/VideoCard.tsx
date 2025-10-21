import { Link } from 'react-router-dom';
import { VideoSummary } from '../types/video';

interface VideoCardProps {
  video: VideoSummary;
}

export const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <Link
      to={`/videos/${video.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-950/40 transition hover:-translate-y-1 hover:border-brand-500/60 hover:shadow-brand-500/20"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={`${video.title} 썸네일`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/80 px-2 py-1 text-xs font-semibold text-slate-100">
          {video.duration}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-5 py-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold text-white transition group-hover:text-brand-200">{video.title}</h3>
          <span className="text-xs uppercase tracking-wide text-slate-400">{video.speaker}</span>
        </div>
        <p className="line-clamp-3 text-sm text-slate-300">{video.shortDescription}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};
