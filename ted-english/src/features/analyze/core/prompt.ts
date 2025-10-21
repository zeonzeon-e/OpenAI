import type { TranscriptChunk } from './chunk';

interface BuildPromptOptions {
  task: 'SUMMARY' | 'GRAMMAR' | 'VOCAB';
  chunks: TranscriptChunk[];
  hints?: string[];
}

const SYSTEM_PROMPT = `You are an English-teaching editor. Input is a transcript from a TED talk.
Always output valid JSON strictly matching the provided TypeScript schema.
Provide Korean explanations for rules and senses.
Include timestamp references when available.`;

export function buildSystemPrompt() {
  return SYSTEM_PROMPT;
}

function chunkText(chunks: TranscriptChunk[]) {
  return chunks
    .map((chunk, index) => `TEXT_CHUNK#${index + 1}: "${chunk.text.replace(/"/g, '\"')}"`)
    .join('\n');
}

export function buildUserPrompt({ task, chunks, hints = [] }: BuildPromptOptions) {
  const base = [`TASK=${task}`];
  if (task === 'GRAMMAR' && hints.length > 0) {
    base.push(`HINTS=${JSON.stringify(hints)}`);
  }
  base.push(
    'CONSTRAINTS: '
      +
      (task === 'SUMMARY'
        ? 'Output { "summary": { "short", "medium", "long", "keyMessages" } } only.'
        : task === 'GRAMMAR'
          ? 'Output { "grammar": GrammarPoint[] } only.'
          : 'Output { "vocabulary": VocabItem[] } only, unique by lemma.'),
  );
  base.push(chunkText(chunks));
  return base.join('\n');
}
