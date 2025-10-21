import { nanoid } from 'nanoid';

export interface TranscriptEntry {
  text: string;
  start?: string;
  index: number;
}

export interface TranscriptChunk {
  id: string;
  entries: TranscriptEntry[];
  text: string;
}

const SENTENCE_END = /(?<=[.!?])\s+/u;
const TOKEN_PER_WORD = 1.3;

export function parseTranscript(raw: string): TranscriptEntry[] {
  const trimmed = raw.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed) as Array<{ start?: string; text: string }>;
    if (Array.isArray(parsed)) {
      return parsed
        .filter((item) => typeof item.text === 'string' && item.text.trim().length > 0)
        .map((item, index) => ({
          text: item.text.trim(),
          start: item.start,
          index,
        }));
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('Transcript treated as plain text', error);
    }
  }

  const sentences = trimmed
    .split(/\r?\n+/)
    .flatMap((line) => line.split(SENTENCE_END))
    .map((line) => line.trim())
    .filter(Boolean);

  return sentences.map((sentence, index) => ({
    text: sentence,
    index,
  }));
}

export function chunkTranscript(entries: TranscriptEntry[], maxTokens = 600): TranscriptChunk[] {
  if (entries.length === 0) {
    return [];
  }

  const chunks: TranscriptChunk[] = [];
  let buffer: TranscriptEntry[] = [];
  let runningTokens = 0;

  entries.forEach((entry) => {
    const tokens = estimateTokens(entry.text);
    if (runningTokens + tokens > maxTokens && buffer.length > 0) {
      chunks.push(createChunk(buffer));
      buffer = [];
      runningTokens = 0;
    }

    buffer.push(entry);
    runningTokens += tokens;
  });

  if (buffer.length > 0) {
    chunks.push(createChunk(buffer));
  }

  return chunks;
}

function createChunk(entries: TranscriptEntry[]): TranscriptChunk {
  return {
    id: nanoid(),
    entries,
    text: entries.map((entry) => entry.text).join('\n'),
  };
}

export function estimateTokens(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.ceil(words * TOKEN_PER_WORD);
}

export const grammarRegexHints = [
  /\b(if|when)\b[^.?!]*\b(would|could|might)\b/gi,
  /\bshould have\b/gi,
  /\bwould have\b/gi,
  /\b(can|could|may|might|must|should|would)\b\s+\w+/gi,
  /\bwhich\b[^.?!]*\bthat\b/gi,
];

export function extractGrammarCandidates(entries: TranscriptEntry[]): string[] {
  const collected = new Set<string>();
  const fullText = entries.map((entry) => entry.text).join(' ');

  grammarRegexHints.forEach((pattern) => {
    const matches = fullText.match(pattern);
    if (!matches) {
      return;
    }
    matches.forEach((match) => {
      collected.add(match.trim());
    });
  });

  return Array.from(collected).slice(0, 12);
}

export function alignTimeRef(entry: TranscriptEntry): { timestamp?: string; index?: number } {
  return entry.start ? { timestamp: entry.start } : { index: entry.index };
}
