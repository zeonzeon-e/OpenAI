import { useState } from 'react';
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

import { TranscriptSegmentCard } from '../components/TranscriptSegmentCard';
import { VideoHero } from '../components/VideoHero';
import { useVideoById } from '../hooks/useVideoData';

const tabs = [
  { id: 'transcript', label: '스크립트' },
  { id: 'objectives', label: '학습 포인트' },
  { id: 'speaker', label: '강연자 소개' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export const VideoPage = () => {
  const video = useVideoById();
  const [activeTab, setActiveTab] = useState<TabId>('transcript');

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

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-slate-950 shadow shadow-brand-500/30'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === 'transcript' && (
            <div className="space-y-4">
              {video.transcript.map((segment) => (
                <TranscriptSegmentCard key={segment.start} segment={segment} />
              ))}
            </div>
          )}

          {activeTab === 'objectives' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">이 강연에서 배울 것들</h2>
              <ul className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                {video.learningObjectives.map((objective) => (
                  <li key={objective} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'speaker' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">{video.speaker}</h2>
              <p className="leading-relaxed text-slate-300">{video.speakerBio}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
