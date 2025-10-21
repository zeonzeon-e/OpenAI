import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { videos, videosById } from '../data/videos';
import { TranscriptSegment, VideoDetail } from '../types/video';

const TED_YOUTUBE_CHANNEL_ID = 'UCsT0YIqwnpJCM-mx7-gSA4Q';
const TED_YOUTUBE_FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${TED_YOUTUBE_CHANNEL_ID}`;

const formatDuration = (seconds?: number | null) => {
  if (seconds === undefined || seconds === null || Number.isNaN(seconds)) {
    return '';
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const normaliseWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const ensureKoreanSummary = (sentence: string, title: string) => {
  const trimmed = normaliseWhitespace(sentence);

  if (!trimmed) {
    return `${title} 영상의 핵심 내용을 직접 정리해 보세요.`;
  }

  return `이 문장은 "${title}" 영상에서 ${trimmed}라는 아이디어를 다루고 있습니다.`;
};

const deriveGrammarNotes = (sentence: string) => {
  const notes: string[] = [];
  const lower = sentence.toLowerCase();

  if (/[a-z]+ing\b/.test(lower)) {
    notes.push('동명사나 현재분사 형태(-ing)를 확인해 보세요.');
  }

  if (lower.includes(' to ')) {
    notes.push('to 부정사가 어떤 역할을 하는지 살펴보세요.');
  }

  if (/[?]/.test(sentence)) {
    notes.push('의문문 어순을 분석해 보세요.');
  }

  if (notes.length === 0) {
    notes.push('문장의 시제와 핵심 동사를 파악해 보세요.');
  }

  return notes;
};

const extractVocabulary = (sentence: string) => {
  const words = Array.from(new Set(sentence.toLowerCase().match(/[a-z]{6,}/g) ?? []));

  return words.slice(0, 3).map((word) => ({
    term: word,
    definition: `${word}의 의미를 사전에서 확인하고 문장으로 연습해 보세요.`,
    example: `Try using "${word}" in your own sentence.`,
  }));
};

const buildTranscriptFromDescription = (title: string, description: string): TranscriptSegment[] => {
  const sentences = description
    .split(/[.!?]\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .slice(0, 4);

  if (sentences.length === 0) {
    return [
      {
        start: 0,
        end: 20,
        english: 'Watch the video to explore fresh ideas from TED.',
        korean: '영상을 시청하며 TED의 새로운 아이디어를 직접 들어보세요.',
        grammarNotes: ['권유문 형태의 표현을 확인해 보세요.'],
        vocabulary: [
          {
            term: 'explore',
            definition: 'explore의 의미를 사전에서 확인하고 직접 문장을 만들어 보세요.',
            example: 'Try to explore new TED ideas and summarize them in English.',
          },
        ],
      },
    ];
  }

  return sentences.map((sentence, index) => {
    const start = index * 30;

    return {
      start,
      end: start + 30,
      english: sentence,
      korean: ensureKoreanSummary(sentence, title),
      grammarNotes: deriveGrammarNotes(sentence),
      vocabulary: extractVocabulary(sentence),
    };
  });
};

const generateLearningObjectives = (title: string, description: string) => {
  const candidates = description
    .replace(/\r?\n+/g, ' ')
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  const objectives: string[] = [];

  candidates.slice(0, 3).forEach((sentence) => {
    objectives.push(`영상에서 다루는 핵심 메시지 이해하기: ${sentence}`);
  });

  while (objectives.length < 3) {
    if (objectives.length === 0) {
      objectives.push(`${title} 영상의 주요 질문을 파악해 보세요.`);
    } else if (objectives.length === 1) {
      objectives.push('영상에 등장하는 핵심 어휘를 정리해 보세요.');
    } else {
      objectives.push('자신의 생각을 영어로 요약하는 연습을 해 보세요.');
    }
  }

  return objectives;
};

const parseYoutubeFeed = (xmlText: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const parserError = doc.querySelector('parsererror');

  if (parserError) {
    throw new Error('YouTube 피드를 파싱할 수 없습니다.');
  }

  return Array.from(doc.getElementsByTagName('entry'))
    .map((entry) => {
      const getText = (selector: string) => entry.querySelector(selector)?.textContent?.trim() ?? '';
      const getAttr = (selector: string, attribute: string) => entry.querySelector(selector)?.getAttribute(attribute) ?? '';

      const youtubeId = getText('yt\\:videoId');
      const title = getText('title') || '제목 미정';
    const author = getText('author > name') || 'TED';
    const publishedAt = getText('published');
    const description = getText('media\\:description');
    const durationRaw = getAttr('yt\\:duration', 'seconds');
    const durationSeconds = durationRaw ? Number.parseInt(durationRaw, 10) : undefined;
    const thumbnailUrl = getAttr('media\\:thumbnail', 'url') || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    const tags = Array.from(entry.querySelectorAll('media\\:category'))
      .map((node) => node.textContent?.trim())
      .filter((tag): tag is string => Boolean(tag) && tag.length > 0);

    const shortDescription =
      description.split(/\r?\n/).find((line) => line.trim().length > 0) ?? `${title} 영상에서 소개하는 아이디어를 들어 보세요.`;

      return {
        id: youtubeId || getText('id'),
        title,
        speaker: author || 'TED Speaker',
        thumbnailUrl,
        duration: formatDuration(durationSeconds),
        tags,
        shortDescription,
        youtubeId,
        publishedAt,
        learningObjectives: generateLearningObjectives(title, description),
        transcript: buildTranscriptFromDescription(title, description),
      } satisfies VideoDetail;
    })
    .sort((a, b) => {
      const left = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const right = b.publishedAt ? Date.parse(b.publishedAt) : 0;

      return right - left;
    });
};

const mergeWithLocal = (video: VideoDetail): VideoDetail => {
  const local = videosById[video.id];

  if (!local) {
    return {
      ...video,
      duration: video.duration || '재생시간 미정',
      tags: video.tags.length > 0 ? video.tags : ['TED'],
      shortDescription: video.shortDescription || '영상 설명이 준비 중입니다.',
      learningObjectives: video.learningObjectives.length > 0 ? video.learningObjectives : ['영상의 주요 메시지를 정리해 보세요.'],
      transcript: video.transcript,
    };
  }

  return {
    ...video,
    duration: video.duration || local.duration,
    tags: video.tags.length > 0 ? video.tags : local.tags,
    shortDescription: video.shortDescription || local.shortDescription,
    youtubeId: video.youtubeId || local.youtubeId,
    publishedAt: video.publishedAt || local.publishedAt,
    learningObjectives: local.learningObjectives.length > 0 ? local.learningObjectives : video.learningObjectives,
    transcript: local.transcript.length > 0 ? local.transcript : video.transcript,
  };
};

const useVideoLibrary = () => {
  const [remoteVideos, setRemoteVideos] = useState<VideoDetail[]>(videos);

  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      try {
        const response = await fetch(TED_YOUTUBE_FEED);

        if (!response.ok) {
          throw new Error(`YouTube 피드를 불러오지 못했습니다: ${response.status}`);
        }

        const payload = await response.text();
        const parsed = parseYoutubeFeed(payload).filter((video) => Boolean(video.youtubeId));
        const mergedVideos = parsed.map(mergeWithLocal);

        if (isMounted) {
          setRemoteVideos(mergedVideos);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error(error);
        }

        if (isMounted && videos.length > 0) {
          setRemoteVideos(videos);
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
