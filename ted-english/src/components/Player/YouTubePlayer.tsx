import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import React from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { TranscriptSegment } from '../../features/analyze/core/chunk';
import { useAnalyzeStore } from '../../features/analyze/store/useAnalyzeStore';
import { extractYouTubeId, formatTimestamp } from '../../utils/youtube';

const YouTubeComponent = (YouTube as unknown) as React.ComponentType<any>;

type YouTubePlayerProps = {
  videoUrl?: string;
  segments: TranscriptSegment[];
};

export type YouTubePlayerHandle = {
  seekTo: (segment: TranscriptSegment) => void;
};

const getSegmentForTime = (segments: TranscriptSegment[], currentTime: number) => {
  if (segments.length === 0) return undefined;
  const sorted = [...segments].sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
  let candidate = sorted[0];
  sorted.forEach((segment) => {
    if ((segment.start ?? 0) <= currentTime) {
      candidate = segment;
    }
  });
  return candidate;
};

export const YouTubePlayerEmbed = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
  ({ videoUrl, segments }, ref) => {
    const playerRef = useRef<YouTubePlayer | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [ready, setReady] = useState(false);
    const setActiveSegment = useAnalyzeStore((state) => state.setActiveSegment);
    const activeSegmentIndex = useAnalyzeStore((state) => state.activeSegmentIndex);
  const videoId = useMemo(() => extractYouTubeId(videoUrl ?? ''), [videoUrl]);

  useEffect(() => {
    if (!playerRef.current || !ready) return;
    const interval = window.setInterval(async () => {
      const time = await playerRef.current!.getCurrentTime();
      setCurrentTime(time);
      const segment = getSegmentForTime(segments, time);
      if (segment) {
        setActiveSegment(segment.index);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [segments, setActiveSegment, ready]);

    const handleReady = (event: YouTubeEvent) => {
      playerRef.current = event.target;
      setReady(true);
    };

    const handleSeekTo = (segment: TranscriptSegment) => {
      if (!playerRef.current) return;
      playerRef.current.seekTo(segment.start ?? 0, true);
    };

    useImperativeHandle(ref, () => ({ seekTo: handleSeekTo }), [segments]);

    if (!videoId) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-md border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-400">
          YouTube URL을 입력하면 플레이어가 여기에 표시됩니다.
        </div>
      );
    }
    return (
      <div className="flex h-full flex-col gap-3">
        <YouTubeComponent
          videoId={videoId}
          opts={{
            playerVars: {
              autoplay: 0,
              cc_lang_pref: 'en',
            },
          }}
          onReady={handleReady}
          className="overflow-hidden rounded-lg border border-slate-800 shadow-lg"
        />
        <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs">
          <span className="font-mono text-slate-300">{formatTimestamp(currentTime)}</span>
          {activeSegmentIndex !== undefined && (
            <button
              type="button"
              className="rounded bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              onClick={() => {
                const segment = segments.find((item) => item.index === activeSegmentIndex);
                if (segment) {
                  handleSeekTo(segment);
                }
              }}
            >
              현재 문장으로 이동
            </button>
          )}
        </div>
      </div>
    );
  },
);

YouTubePlayerEmbed.displayName = 'YouTubePlayerEmbed';
