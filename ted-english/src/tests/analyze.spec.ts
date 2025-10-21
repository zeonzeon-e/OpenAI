import { describe, expect, it, beforeEach } from 'vitest';
import { chunkTranscript, detectGrammarCandidates, parseTranscriptInput } from '../features/analyze/core/chunk';
import { LocalMockLLM } from '../features/analyze/api/llm';
import { useAnalyzeStore } from '../features/analyze/store/useAnalyzeStore';
import sampleTranscript from '../data/sampleTranscript.json';

const SAMPLE_TEXT = `Fear can guide us. If I were you, I would listen.`;

describe('Transcript parsing utilities', () => {
  it('parses JSON transcript with timestamps', () => {
    const input = JSON.stringify(sampleTranscript);
    const segments = parseTranscriptInput(input);
    expect(segments).toHaveLength(sampleTranscript.length);
    expect(segments[0].timestamp).toBe('00:00');
    expect(segments[0].start).toBe(0);
  });

  it('splits plain text into sentences with synthetic timing', () => {
    const segments = parseTranscriptInput(SAMPLE_TEXT);
    expect(segments.length).toBeGreaterThan(1);
    expect(segments[0].start).toBe(0);
    expect(segments[1].start).toBe(5);
  });

  it('chunks transcript respecting token budgets', () => {
    const segments = parseTranscriptInput(SAMPLE_TEXT);
    const chunks = chunkTranscript(segments, 50);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].segments.length).toBeGreaterThan(0);
  });

  it('detects grammar candidates using regex hints', () => {
    const segments = parseTranscriptInput(SAMPLE_TEXT);
    const hints = detectGrammarCandidates(segments);
    expect(hints).toContain('modal would');
    expect(hints).toContain('if + past');
  });
});

describe('Analyze store', () => {
  beforeEach(() => {
    useAnalyzeStore.getState().reset();
  });

  it('stores segments from input and creates chunks', () => {
    const input = JSON.stringify(sampleTranscript);
    useAnalyzeStore.getState().setSegmentsFromInput(input);
    const state = useAnalyzeStore.getState();
    expect(state.segments).toHaveLength(sampleTranscript.length);
    expect(state.chunks.length).toBeGreaterThan(0);
  });
});

describe('LocalMockLLM', () => {
  it('returns mock summary, grammar, and vocabulary data', async () => {
    const segments = parseTranscriptInput(JSON.stringify(sampleTranscript));
    const chunks = chunkTranscript(segments, 200);
    const provider = new LocalMockLLM();

    const summary = await provider.summarize(chunks);
    const grammar = await provider.extractGrammar(chunks);
    const vocabulary = await provider.extractVocabulary(chunks);

    expect(summary.success).toBe(true);
    expect(summary.data?.short).toBeTruthy();
    expect(grammar.data?.length).toBeGreaterThan(0);
    expect(vocabulary.data?.length).toBeGreaterThan(0);
  });
});
