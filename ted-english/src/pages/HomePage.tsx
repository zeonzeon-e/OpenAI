import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';

import { VideoCard } from '../components/VideoCard';
import { useAllVideos } from '../hooks/useVideoData';

export const HomePage = () => {
  const videos = useAllVideos();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return videos;
    return videos.filter((video) =>
      [video.title, video.speaker, ...video.tags].some((value) => value.toLowerCase().includes(text))
    );
  }, [query, videos]);

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-xl shadow-slate-950/40">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">TED English Companion</p>
        <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
          TED 영상으로 배우는 실전 영어 학습 플랫폼
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-300">
          실제 TED 강연을 기반으로 영어 스크립트와 한국어 번역, 문법 노트, 단어장까지 한 곳에서 확인해 보세요.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-xl">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-full border border-slate-700 bg-slate-900/80 py-3 pl-12 pr-5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
              placeholder="강연 제목, 연사, 태그를 검색해보세요"
              type="search"
            />
          </div>
          <span className="text-sm text-slate-400">총 {filtered.length}개 강연</span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {filtered.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </section>
    </div>
  );
};
