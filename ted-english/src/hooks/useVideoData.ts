import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { videos, videosById } from '../data/videos';
import { TranscriptSegment, VideoDetail } from '../types/video';

const TED_YOUTUBE_CHANNEL_ID = 'UCsT0YIqwnpJCM-mx7-gSA4Q';
const TED_YOUTUBE_FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${TED_YOUTUBE_CHANNEL_ID}`;
const PROXY_FEED_PREFIXES = [
  'https://r.jina.ai/https://www.youtube.com/feeds/videos.xml?channel_id=',
  'https://cors.isomorphic-git.org/https://www.youtube.com/feeds/videos.xml?channel_id=',
];

const buildFeedCandidates = () => {
  const explicitUrl = import.meta.env.VITE_TED_FEED_URL;
  const proxyPrefix = import.meta.env.VITE_TED_FEED_PROXY_PREFIX;

  const urls = [explicitUrl, TED_YOUTUBE_FEED];

  if (proxyPrefix) {
    urls.push(`${proxyPrefix}${TED_YOUTUBE_CHANNEL_ID}`);
  }

  PROXY_FEED_PREFIXES.forEach((prefix) => {
    urls.push(`${prefix}${TED_YOUTUBE_CHANNEL_ID}`);
  });

  return Array.from(new Set(urls.filter((value): value is string => Boolean(value))));
};

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
      const candidates = buildFeedCandidates();
      let lastError: unknown;

      for (const endpoint of candidates) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8',
            },
          });

          if (!response.ok) {
            throw new Error(`YouTube 피드를 불러오지 못했습니다: ${response.status}`);
          }

          const payload = await response.text();
          const parsed = parseYoutubeFeed(payload).filter((video) => Boolean(video.youtubeId));
          const mergedVideos = parsed.map(mergeWithLocal);

          if (isMounted) {
            setRemoteVideos(mergedVideos);
          }

          return;
        } catch (error) {
          lastError = error;
        }
      }

      if (import.meta.env.DEV && lastError) {
        // eslint-disable-next-line no-console
        console.error(lastError);
      }

      if (isMounted && videos.length > 0) {
        setRemoteVideos(videos);
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
