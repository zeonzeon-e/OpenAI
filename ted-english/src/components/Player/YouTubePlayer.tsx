import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { useAnalyzeStore } from '../../features/analyze/store/useAnalyzeStore';

interface YouTubePlayerProps {
  videoId?: string;
}

export interface YouTubePlayerHandle {
  seekTo(seconds: number): void;
  play(): void;
  pause(): void;
}

declare global {
  namespace YT {
    interface Player {
      playVideo(): void;
      pauseVideo(): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      getCurrentTime(): number;
      getDuration(): number;
      destroy(): void;
    }
    interface PlayerEvent {
      target: Player;
    }
    interface OnStateChangeEvent extends PlayerEvent {
      data: number;
    }
    interface PlayerOptions {
      height: string;
      width: string;
      videoId: string;
      playerVars?: Record<string, unknown>;
      events?: {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: OnStateChangeEvent) => void;
      };
    }
  }
  interface Window {
    YT?: {
      Player: new (element: string | HTMLElement, options: YT.PlayerOptions) => YT.Player;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const PLAYER_STATES = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
};

function loadYouTubeAPI() {
  return new Promise<void>((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const existing = document.getElementById('youtube-iframe-api');
    if (existing) {
      window.onYouTubeIframeAPIReady = () => resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'youtube-iframe-api';
    script.src = 'https://www.youtube.com/iframe_api';
    window.onYouTubeIframeAPIReady = () => resolve();
    document.body.appendChild(script);
  });
}

export const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(function YouTubePlayer(
  { videoId },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player>();
  const setCurrentTime = useAnalyzeStore((state) => state.setCurrentTime);
  const setDuration = useAnalyzeStore((state) => state.setDuration);
  const setIsPlaying = useAnalyzeStore((state) => state.setIsPlaying);

  useEffect(() => {
    if (!videoId) {
      return undefined;
    }

    let mounted = true;
    loadYouTubeAPI().then(() => {
      if (!mounted || !containerRef.current || !window.YT) {
        return;
      }
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '360',
        width: '640',
        videoId,
        playerVars: {
          enablejsapi: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            setDuration(event.target.getDuration() ?? 0);
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            setIsPlaying(event.data === PLAYER_STATES.PLAYING);
          },
        },
      });
    });

    const interval = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) {
        return;
      }
      try {
        setCurrentTime(player.getCurrentTime?.() ?? 0);
        setDuration(player.getDuration?.() ?? 0);
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('YouTube player polling failed', error);
        }
      }
    }, 500);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      try {
        playerRef.current?.destroy();
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('Failed to destroy YouTube player', error);
        }
      }
      playerRef.current = undefined;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [videoId, setCurrentTime, setDuration, setIsPlaying]);

  useImperativeHandle(
    ref,
    () => ({
      seekTo: (seconds: number) => {
        playerRef.current?.seekTo(seconds, true);
      },
      play: () => playerRef.current?.playVideo(),
      pause: () => playerRef.current?.pauseVideo(),
    }),
    [],
  );

  if (!videoId) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900 text-sm text-slate-400">
        YouTube 영상 ID를 입력하면 플레이어가 나타납니다.
      </div>
    );
  }

  return <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-lg shadow-lg" />;
});
