import { TranscriptChunk, detectGrammarCandidates } from './chunk';

const SYSTEM_PROMPT = `You are an English-teaching editor. Input is a transcript from a TED talk.
Always output valid JSON strictly matching the provided TypeScript schema.
Provide Korean explanations for rules and senses.
Include timestamp references when available.`;

export type PromptTask = 'SUMMARY' | 'GRAMMAR' | 'VOCAB';

export const getSystemPrompt = () => SYSTEM_PROMPT;

const formatChunk = (chunk: TranscriptChunk, index: number) =>
  `TEXT_CHUNK#${index + 1}: "${chunk.text.replace(/"/g, '\"')}"`;

export const buildSummaryPrompt = (chunks: TranscriptChunk[]) => {
  const body = chunks.map((chunk, index) => formatChunk(chunk, index)).join('\n');
  return `TASK=SUMMARY\nCONSTRAINTS: Output { summary: { short, medium, long, keyMessages[] } } only.\n${body}`;
};

export const buildGrammarPrompt = (chunks: TranscriptChunk[]) => {
  const hints = detectGrammarCandidates(chunks.flatMap((chunk) => chunk.segments));
  const hintsLine = hints.length > 0 ? `HINTS (optional candidates from regex pre-scan): ${JSON.stringify(hints)}\n` : '';
  const body = chunks.map((chunk, index) => formatChunk(chunk, index)).join('\n');
  return `TASK=GRAMMAR\n${hintsLine}CONSTRAINTS: Output { grammar: GrammarPoint[] } only.\n${body}`;
};

export const buildVocabPrompt = (chunks: TranscriptChunk[]) => {
  const body = chunks.map((chunk, index) => formatChunk(chunk, index)).join('\n');
  return `TASK=VOCAB\nCONSTRAINTS: Output { vocabulary: VocabItem[] } only, unique by lemma.\nPrefer teachable items (collocations, false friends). Add CEFR estimates.\n${body}`;
};
