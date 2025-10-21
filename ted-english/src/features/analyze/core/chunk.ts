import { TimeRef } from './schema';

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

export type TranscriptSegment = {
  id: string;
  text: string;
  start?: number;
  timestamp?: string;
  index: number;
};

export type TranscriptChunk = {
  id: string;
  segments: TranscriptSegment[];
  text: string;
};

const DEFAULT_TARGET_TOKEN_COUNT = 350;

const timeStringToSeconds = (value: string) => {
  const parts = value.split(':').map(Number);
  if (parts.some((part) => Number.isNaN(part))) return undefined;
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  return parts[0];
};

const normaliseText = (text: string) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/“|”/g, '"')
    .replace(/‘|’/g, "'")
    .trim();

const estimateTokens = (text: string) => Math.max(20, Math.ceil(text.length / 4));

const createSegment = (text: string, index: number, timestamp?: string): TranscriptSegment => {
  const normalised = normaliseText(text);
  const start = timestamp ? timeStringToSeconds(timestamp) : index * 5;
  return {
    id: createId(),
    text: normalised,
    start,
    timestamp,
    index,
  };
};

export const parseTranscriptInput = (raw: string): TranscriptSegment[] => {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as Array<{ start?: string; text: string }>;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item, index) => createSegment(item.text, index, item.start))
        .filter((segment) => segment.text.length > 0);
    }
  } catch (error) {
    console.debug('Failed to parse structured transcript JSON. Falling back to sentence splitting.', error);
  }

  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.map((sentence, index) => createSegment(sentence, index));
};

export const chunkTranscript = (
  segments: TranscriptSegment[],
  targetTokenCount: number = DEFAULT_TARGET_TOKEN_COUNT,
): TranscriptChunk[] => {
  const chunks: TranscriptChunk[] = [];
  let current: TranscriptSegment[] = [];
  let tokenCount = 0;

  segments.forEach((segment) => {
    const segmentTokens = estimateTokens(segment.text);
    if (tokenCount + segmentTokens > targetTokenCount && current.length > 0) {
      chunks.push({ id: createId(), segments: current, text: current.map((item) => item.text).join(' ') });
      current = [];
      tokenCount = 0;
    }

    current.push(segment);
    tokenCount += segmentTokens;
  });

  if (current.length > 0) {
    chunks.push({ id: createId(), segments: current, text: current.map((item) => item.text).join(' ') });
  }

  return chunks;
};

export const mergeChunkResponses = <T extends { ref?: TimeRef }>(
  chunks: TranscriptChunk[],
  responses: Array<{ items: Array<T & { ref?: TimeRef }> }>,
): T[] => {
  const results: T[] = [];

  responses.forEach((response, chunkIndex) => {
    const chunk = chunks[chunkIndex];
    const mapped = response.items.map((item) => {
      if (!item.ref) return item;
      if (item.ref.timestamp) return item;
      if (item.ref.index === undefined) return item;

      const segment = chunk.segments.find((segmentItem) => segmentItem.index === item.ref?.index);
      if (!segment) return item;

      return {
        ...item,
        ref: {
          timestamp: segment.timestamp,
          index: segment.index,
        },
      };
    });
    results.push(...mapped);
  });

  return results;
};

const GRAMMAR_REGEXES: Array<{ id: string; label: string; pattern: RegExp }> = [
  { id: 'modal-would', label: 'modal would', pattern: /\bwould\b/gi },
  { id: 'if-past', label: 'if + past', pattern: /\bif\b[^.!?]+\b(past|were|had)\b/gi },
  { id: 'relative-that', label: 'relative clause (that/which)', pattern: /\b(that|which)\b[^.!?]+\b/gi },
  { id: 'modal-could', label: 'modal could', pattern: /\bcould\b/gi },
  { id: 'modal-should', label: 'modal should', pattern: /\bshould\b/gi },
];

export const detectGrammarCandidates = (segments: TranscriptSegment[]): string[] => {
  const hints = new Set<string>();
  const joined = segments.map((segment) => segment.text).join(' ');

  GRAMMAR_REGEXES.forEach((entry) => {
    if (entry.pattern.test(joined)) {
      hints.add(entry.label);
    }
    entry.pattern.lastIndex = 0;
  });

  return Array.from(hints);
};
