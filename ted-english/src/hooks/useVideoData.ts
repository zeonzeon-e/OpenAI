import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { videos, videosById } from '../data/videos';
import { TranscriptSegment, VideoDetail, VideoSource } from '../types/video';

const TED_YOUTUBE_CHANNEL_ID = 'UCsT0YIqwnpJCM-mx7-gSA4Q';
const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${TED_YOUTUBE_CHANNEL_ID}`;
const YOUTUBE_PROXY_PREFIXES = [
  'https://r.jina.ai/https://www.youtube.com/feeds/videos.xml?channel_id=',
  'https://cors.isomorphic-git.org/https://www.youtube.com/feeds/videos.xml?channel_id=',
];

const DEFAULT_TED_QUERY = 'language=en&order=newest&per_page=30';
const TED_PRIMARY_API = `https://tedcdnpi-a.akamaihd.net/api/tedweb/talks.json?${DEFAULT_TED_QUERY}`;
const TED_SECONDARY_API = `https://www.ted.com/talks?${DEFAULT_TED_QUERY}&format=json`;
const TED_PROXY_CANDIDATES = [
  `https://r.jina.ai/https://tedcdnpi-a.akamaihd.net/api/tedweb/talks.json?${DEFAULT_TED_QUERY}`,
  `https://r.jina.ai/https://www.ted.com/talks?${DEFAULT_TED_QUERY}&format=json`,
];

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

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const buildYoutubeSource = (youtubeId: string): VideoSource => ({
  type: 'youtube',
  id: youtubeId,
  embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
  watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
  providerName: 'YouTube',
});

const buildTedSource = (slugOrId: string, explicitUrl?: string): VideoSource => {
  const slug = slugOrId.replace(/^talks\//, '');
  const watchUrl = explicitUrl || `https://www.ted.com/talks/${slug}`;
  const embedUrl = `https://embed.ted.com/talks/${slug}`;

  return {
    type: 'ted',
    id: slug,
    embedUrl,
    watchUrl,
    providerName: 'TED',
  };
};

type UnknownRecord = Record<string, unknown>;

const extractImageUrl = (value: unknown): string => {
  if (isNonEmptyString(value)) {
    return value;
  }

  if (value && typeof value === 'object') {
    const record = value as UnknownRecord;

    if (isNonEmptyString(record.url)) {
      return record.url;
    }

    if (isNonEmptyString(record.src)) {
      return record.src;
    }

    if (isNonEmptyString(record.image)) {
      return record.image;
    }

    if (record.image && typeof record.image === 'object') {
      const nested = extractImageUrl(record.image);
      if (nested) {
        return nested;
      }
    }

    if (record.sizes && typeof record.sizes === 'object') {
      const sizes = record.sizes as UnknownRecord;
      const large = extractImageUrl(sizes.large);
      if (large) {
        return large;
      }
      const medium = extractImageUrl(sizes.medium);
      if (medium) {
        return medium;
      }
      const small = extractImageUrl(sizes.small);
      if (small) {
        return small;
      }
    }
  }

  return '';
};

const extractTags = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (isNonEmptyString(entry)) {
        return entry;
      }

      if (entry && typeof entry === 'object') {
        const record = entry as UnknownRecord;
        const candidate = [record.name, record.tag, record.value, record.slug]
          .filter(isNonEmptyString)
          .map((tag) => tag.trim())[0];

        if (candidate) {
          return candidate;
        }
      }

      return undefined;
    })
    .filter((tag): tag is string => Boolean(tag))
    .slice(0, 6);
};

const extractSpeaker = (value: UnknownRecord): string => {
  const names: string[] = [];

  const rawSpeakers = value.speakers;

  if (Array.isArray(rawSpeakers)) {
    rawSpeakers.forEach((item) => {
      if (isNonEmptyString(item)) {
        names.push(item);
        return;
      }

      if (item && typeof item === 'object') {
        const record = item as UnknownRecord;
        const nameCandidate = [record.name, record.full_name, record.display_name]
          .filter(isNonEmptyString)
          .map((name) => name.trim())[0];

        if (nameCandidate) {
          names.push(nameCandidate);
          return;
        }

        const first = isNonEmptyString(record.first_name) ? record.first_name : '';
        const last = isNonEmptyString(record.last_name) ? record.last_name : '';
        const combined = `${first} ${last}`.trim();
        if (combined) {
          names.push(combined);
        }
      }
    });
  }

  if (names.length > 0) {
    return Array.from(new Set(names)).join(', ');
  }

  const fallbackName = [
    value.speaker_display_name,
    value.speaker,
    value.host,
    value.presenter,
  ].filter(isNonEmptyString)[0];

  if (fallbackName) {
    return fallbackName;
  }

  return 'TED Speaker';
};

const buildVideoFromTed = (entry: UnknownRecord): VideoDetail | null => {
  const slug = [entry.slug, entry.talk_slug, entry.slug_name, entry.url_slug]
    .filter(isNonEmptyString)
    .map((candidate) => candidate.replace(/^talks\//, '').trim())[0];

  const rawUrlCandidates = [entry.url, entry.permalink, entry.canonical_url, entry.external_url]
    .filter(isNonEmptyString)
    .map((candidate) => candidate.trim());

  const watchUrl = rawUrlCandidates.find((candidate) => candidate.startsWith('http'));

  const id = slug || (isNonEmptyString(entry.id) ? entry.id : String(entry.id ?? ''));

  if (!id) {
    return null;
  }

  const title = [entry.name, entry.title, entry.headline, entry.display_title]
    .filter(isNonEmptyString)
    .map((candidate) => candidate.trim())[0] || '제목 미정';

  const description = [entry.dek, entry.description, entry.short_description, entry.abstract]
    .filter(isNonEmptyString)
    .map((candidate) => candidate.trim())[0] || `${title} 영상에서 소개하는 아이디어를 들어 보세요.`;

  const durationSeconds = parseNumber(entry.duration);

  const publishedAt = [entry.published_at, entry.released_at, entry.recorded_at, entry.filmed_at]
    .filter(isNonEmptyString)
    .map((candidate) => candidate.trim())[0] || '';

  const thumbnailUrl =
    extractImageUrl(entry.image_url) ||
    extractImageUrl(entry.hero_image) ||
    extractImageUrl(entry.hero) ||
    extractImageUrl(entry.primary_image) ||
    extractImageUrl(entry.image) ||
    'https://www.ted.com/favicon.ico';

  const tags = extractTags(entry.tags);
  const speaker = extractSpeaker(entry);

  const objectives = generateLearningObjectives(title, description);
  const transcript = buildTranscriptFromDescription(title, description);

  const source = buildTedSource(slug || id, watchUrl);

  return {
    id: slug || id,
    title,
    speaker,
    thumbnailUrl,
    duration: formatDuration(durationSeconds) || '재생시간 미정',
    tags,
    shortDescription: description,
    source,
    publishedAt,
    learningObjectives: objectives,
    transcript,
  };
};

const collectTedEntries = (payload: unknown): unknown[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (typeof payload !== 'object') {
    return [];
  }

  const record = payload as UnknownRecord;
  const directArrays = [record.results, record.talks, record.items, record.data, record.collection];

  for (const candidate of directArrays) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  if (record.data && typeof record.data === 'object') {
    const nested = record.data as UnknownRecord;
    if (Array.isArray(nested.results)) {
      return nested.results;
    }
    if (Array.isArray(nested.talks)) {
      return nested.talks;
    }
  }

  if (record._embedded && typeof record._embedded === 'object') {
    const embedded = record._embedded as UnknownRecord;
    if (Array.isArray(embedded.talks)) {
      return embedded.talks;
    }
  }

  return [];
};

const parseTedResponse = (payload: unknown) => {
  const entries = collectTedEntries(payload);
  const results: VideoDetail[] = [];

  entries.forEach((entry) => {
    if (entry && typeof entry === 'object') {
      const detail = buildVideoFromTed(entry as UnknownRecord);
      if (detail) {
        results.push(detail);
      }
    }
  });

  return results.sort((a, b) => {
    const left = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const right = b.publishedAt ? Date.parse(b.publishedAt) : 0;

    return right - left;
  });
};

const buildTedApiCandidates = () => {
  const explicitUrl = import.meta.env.VITE_TED_TALKS_API_URL;
  const proxyUrl = import.meta.env.VITE_TED_TALKS_PROXY_URL;

  const urls = [explicitUrl, TED_PRIMARY_API, TED_SECONDARY_API];

  if (proxyUrl) {
    urls.push(proxyUrl);
  }

  TED_PROXY_CANDIDATES.forEach((candidate) => urls.push(candidate));

  return Array.from(new Set(urls.filter((value): value is string => Boolean(value))));
};

const fetchTedTalks = async (): Promise<VideoDetail[]> => {
  const candidates = buildTedApiCandidates();
  let lastError: unknown;

  for (const endpoint of candidates) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'application/json, text/plain;q=0.9',
        },
      });

      if (!response.ok) {
        throw new Error(`TED 데이터를 불러오지 못했습니다: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') ?? '';
      let payload: unknown;

      if (contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        const textBody = await response.text();

        try {
          payload = JSON.parse(textBody);
        } catch (parseError) {
          throw parseError instanceof Error
            ? parseError
            : new Error('TED 데이터를 JSON으로 변환하는 데 실패했습니다.');
        }
      }

      const parsed = parseTedResponse(payload);

      if (parsed.length > 0) {
        return parsed;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
};

const buildFeedCandidates = () => {
  const explicitUrl = import.meta.env.VITE_TED_FEED_URL;
  const proxyPrefix = import.meta.env.VITE_TED_FEED_PROXY_PREFIX;

  const urls = [explicitUrl, YOUTUBE_FEED_URL];

  if (proxyPrefix) {
    urls.push(`${proxyPrefix}${TED_YOUTUBE_CHANNEL_ID}`);
  }

  YOUTUBE_PROXY_PREFIXES.forEach((prefix) => {
    urls.push(`${prefix}${TED_YOUTUBE_CHANNEL_ID}`);
  });

  return Array.from(new Set(urls.filter((value): value is string => Boolean(value))));
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

      if (!youtubeId) {
        return undefined;
      }

      const title = getText('title') || '제목 미정';
      const author = getText('author > name') || 'TED';
      const publishedAt = getText('published');
      const description = getText('media\\:description');
      const durationRaw = getAttr('yt\\:duration', 'seconds');
      const durationSeconds = durationRaw ? Number.parseInt(durationRaw, 10) : undefined;
      const thumbnailUrl =
        getAttr('media\\:thumbnail', 'url') || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      const tags = Array.from(entry.querySelectorAll('media\\:category'))
        .map((node) => node.textContent?.trim())
        .filter((tag): tag is string => Boolean(tag) && tag.length > 0);

      const shortDescription =
        description.split(/\r?\n/).find((line) => line.trim().length > 0) ?? `${title} 영상에서 소개하는 아이디어를 들어 보세요.`;

      return {
        id: youtubeId,
        title,
        speaker: author || 'TED Speaker',
        thumbnailUrl,
        duration: formatDuration(durationSeconds),
        tags,
        shortDescription,
        source: buildYoutubeSource(youtubeId),
        publishedAt,
        learningObjectives: generateLearningObjectives(title, description),
        transcript: buildTranscriptFromDescription(title, description),
      } satisfies VideoDetail;
    })
    .filter((video): video is VideoDetail => Boolean(video))
    .sort((a, b) => {
      const left = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const right = b.publishedAt ? Date.parse(b.publishedAt) : 0;

      return right - left;
    });
};

const fetchYoutubeVideos = async (): Promise<VideoDetail[]> => {
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
      const parsed = parseYoutubeFeed(payload);

      if (parsed.length > 0) {
        return parsed;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
};

const mergeWithLocal = (video: VideoDetail): VideoDetail => {
  const local = videosById[video.id];

  if (!local) {
    return {
      ...video,
      duration: video.duration || '재생시간 미정',
      tags: video.tags.length > 0 ? video.tags : ['TED'],
      shortDescription: video.shortDescription || '영상 설명이 준비 중입니다.',
      learningObjectives:
        video.learningObjectives.length > 0 ? video.learningObjectives : ['영상의 주요 메시지를 정리해 보세요.'],
      transcript: video.transcript,
    };
  }

  return {
    ...local,
    ...video,
    duration: video.duration || local.duration,
    tags: video.tags.length > 0 ? video.tags : local.tags,
    shortDescription: video.shortDescription || local.shortDescription,
    source: video.source || local.source,
    publishedAt: video.publishedAt || local.publishedAt,
    learningObjectives: video.learningObjectives.length > 0 ? video.learningObjectives : local.learningObjectives,
    transcript: video.transcript.length > 0 ? video.transcript : local.transcript,
  };
};

const useVideoLibrary = () => {
  const [remoteVideos, setRemoteVideos] = useState<VideoDetail[]>(videos);

  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      const strategies: Array<() => Promise<VideoDetail[]>> = [fetchTedTalks, fetchYoutubeVideos];
      let lastError: unknown;

      for (const strategy of strategies) {
        try {
          const fetched = await strategy();

          if (fetched.length > 0) {
            const merged = fetched.map(mergeWithLocal);

            if (isMounted) {
              setRemoteVideos(merged);
            }

            return;
          }
        } catch (error) {
          lastError = error;
        }
      }

      if (import.meta.env.DEV && lastError) {
        // eslint-disable-next-line no-console
        console.error(lastError);
      }

      if (isMounted) {
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
