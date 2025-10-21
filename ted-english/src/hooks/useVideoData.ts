import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { videos, videosById } from '../data/videos';
import { VideoDetail } from '../types/video';

const TED_TALKS_ENDPOINT = 'https://tedcdnpi-a.akamaihd.net/api/tedtalks/v1/?language=en&limit=50';

interface TedTalkApi {
  id?: number;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  published_at?: string;
  release_date?: string;
  recorded_at?: string;
  duration?: number;
  hero_image?: string;
  image?: string;
  thumbnail?: string;
  primary_image?: { url?: string };
  hero?: { image?: string };
  images?: Record<string, string | undefined>;
  tags?: Array<{ name?: string }>;
  topics?: Array<{ name?: string }>;
  speakers?: Array<{ name?: string; firstname?: string; lastname?: string }>;
  video?: { youtube_id?: string; duration?: number; media_duration?: number };
  resources?: {
    youtube?: { url?: string; id?: string };
    external?: Array<{ service?: string; uri?: string }>;
  };
  external?: Array<{ service?: string; uri?: string }>;
}

const extractYoutubeId = (input?: string | null) => {
  if (!input) {
    return '';
  }

  const urlPattern = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
  const directPattern = /^[\w-]{11}$/;

  const trimmed = input.trim();
  if (directPattern.test(trimmed)) {
    return trimmed;
  }

  const matched = trimmed.match(urlPattern);
  return matched?.[1] ?? '';
};

const formatDuration = (seconds?: number | null) => {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return '';
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const pickThumbnail = (talk: TedTalkApi) => {
  return (
    talk.hero?.image ??
    talk.hero_image ??
    talk.image ??
    talk.thumbnail ??
    talk.primary_image?.url ??
    talk.images?.landscape ??
    talk.images?.hero ??
    talk.images?.square ??
    ''
  );
};

const pickSpeaker = (talk: TedTalkApi) => {
  const speakerList = talk.speakers
    ?.map((speaker) => {
      if (speaker.name) {
        return speaker.name;
      }

      const parts = [speaker.firstname, speaker.lastname].filter(Boolean);
      return parts.join(' ');
    })
    .filter((name) => Boolean(name));

  if (speakerList && speakerList.length > 0) {
    return speakerList.join(', ');
  }

  return talk.name ?? 'TED Speaker';
};

const collectTags = (talk: TedTalkApi) => {
  const tagNames = talk.tags?.map((tag) => tag.name).filter((name): name is string => Boolean(name));
  if (tagNames && tagNames.length > 0) {
    return tagNames;
  }

  const topicNames = talk.topics?.map((topic) => topic.name).filter((name): name is string => Boolean(name));
  if (topicNames && topicNames.length > 0) {
    return topicNames;
  }

  return [];
};

const deriveYoutubeId = (talk: TedTalkApi) => {
  return (
    talk.video?.youtube_id ??
    extractYoutubeId(talk.resources?.youtube?.id) ??
    extractYoutubeId(talk.resources?.youtube?.url) ??
    talk.resources?.external?.map((resource) => extractYoutubeId(resource.uri)).find(Boolean) ??
    talk.external?.map((resource) => extractYoutubeId(resource.uri)).find(Boolean) ??
    ''
  );
};

const mapTalkToVideo = (talk: TedTalkApi): VideoDetail | null => {
  const id = talk.slug ?? (talk.id !== undefined ? `ted-${talk.id}` : undefined);

  if (!id) {
    return null;
  }

  const durationSeconds = talk.duration ?? talk.video?.duration ?? talk.video?.media_duration ?? null;
  const youtubeId = deriveYoutubeId(talk);

  return {
    id,
    title: talk.title ?? talk.name ?? '제목 미정',
    speaker: pickSpeaker(talk),
    thumbnailUrl: pickThumbnail(talk),
    duration: formatDuration(durationSeconds),
    tags: collectTags(talk),
    shortDescription: talk.description ?? '',
    youtubeId,
    publishedAt: talk.published_at ?? talk.release_date ?? talk.recorded_at ?? '',
    learningObjectives: [],
    transcript: [],
  };
};

const mergeWithLocal = (video: VideoDetail): VideoDetail => {
  const local = videosById[video.id];

  if (!local) {
    return {
      ...video,
      duration: video.duration || '재생시간 미정',
      tags: video.tags.length > 0 ? video.tags : [],
      shortDescription: video.shortDescription || '상세 설명이 준비 중입니다.',
      learningObjectives: [],
      transcript: [],
    };
  }

  return {
    ...video,
    duration: video.duration || local.duration,
    tags: video.tags.length > 0 ? video.tags : local.tags,
    shortDescription: video.shortDescription || local.shortDescription,
    youtubeId: video.youtubeId || local.youtubeId,
    publishedAt: video.publishedAt || local.publishedAt,
    learningObjectives: local.learningObjectives,
    transcript: local.transcript,
  };
};

const useVideoLibrary = () => {
  const [remoteVideos, setRemoteVideos] = useState<VideoDetail[]>(videos);

  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      try {
        const response = await fetch(TED_TALKS_ENDPOINT);

        if (!response.ok) {
          throw new Error(`Failed to fetch TED talks: ${response.status}`);
        }

        const payload = (await response.json()) as { results?: TedTalkApi[] };
        const mapped = (payload.results ?? [])
          .map(mapTalkToVideo)
          .filter((video): video is VideoDetail => Boolean(video && video.youtubeId));

        const mergedVideos = mapped.map(mergeWithLocal);

        const mergedMap = new Map<string, VideoDetail>();
        mergedVideos.forEach((video) => {
          mergedMap.set(video.id, video);
        });

        videos.forEach((localVideo) => {
          if (!mergedMap.has(localVideo.id)) {
            mergedMap.set(localVideo.id, localVideo);
          }
        });

        if (isMounted) {
          setRemoteVideos(Array.from(mergedMap.values()));
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  return remoteVideos;
};

export const useAllVideos = () => {
  return useVideoLibrary();
};

export const useVideoById = (): VideoDetail | undefined => {
  const { videoId } = useParams();
  const allVideos = useVideoLibrary();

  return useMemo(() => allVideos.find((video) => video.id === videoId), [allVideos, videoId]);
};
