import { useMutation } from '@tanstack/react-query';

import { buildSystemPrompt, buildUserPrompt } from '../core/prompt';
import { alignTimeRef, chunkTranscript, extractGrammarCandidates, parseTranscript } from '../core/chunk';
import { analysisResultSchema, type AnalysisResult, type GrammarPoint, type VocabItem } from '../core/schema';
import { createLLMProvider } from '../api/llm';
import { extractTranscriptFromHtml, fetchTranscriptHtml } from '../api/proxyFetch';
import { useAnalyzeStore } from '../store/useAnalyzeStore';

export interface AnalyzeProgress {
  step: 'idle' | 'preprocess' | 'summary' | 'grammar' | 'vocabulary' | 'complete';
  completed: number;
  total: number;
}

const TOTAL_STEPS = 3;

async function loadTranscriptText(
  transcriptInput: string,
  urlInput: string,
  proxyUrl: string,
): Promise<string> {
  if (transcriptInput.trim().length > 0) {
    return transcriptInput;
  }
  if (!urlInput) {
    throw new Error('트랜스크립트를 붙여넣거나 TED URL을 입력해주세요.');
  }
  if (!proxyUrl) {
    throw new Error('직접 TED 페이지를 불러올 수 없습니다. CORS 프록시 URL을 입력하거나 붙여넣기 방식을 이용하세요.');
  }
  const html = await fetchTranscriptHtml({ tedUrl: urlInput, proxyUrl });
  return extractTranscriptFromHtml(html);
}

export function useAnalyze() {
  const store = useAnalyzeStore();
  const mutation = useMutation<AnalysisResult, Error, void>({
    mutationFn: async () => {
      store.setError(undefined);
      store.setStatus('processing');

      const rawTranscript = await loadTranscriptText(
        store.transcriptInput,
        store.urlInput,
        store.proxyUrl,
      );
      const entries = parseTranscript(rawTranscript);
      if (entries.length === 0) {
        throw new Error('인식된 문장이 없습니다. 트랜스크립트를 확인해주세요.');
      }
      store.setTranscriptEntries(entries);
      const chunks = chunkTranscript(entries);
      store.setChunks(chunks);

      const provider = createLLMProvider(store.provider, store.openAIKey);
      const system = buildSystemPrompt();
      const hints = extractGrammarCandidates(entries);

      const summary = await provider.summarize({
        system,
        user: buildUserPrompt({ task: 'SUMMARY', chunks }),
      });
      store.setSummary(summary);

      const grammar = await provider.extractGrammar({
        system,
        user: buildUserPrompt({ task: 'GRAMMAR', chunks, hints }),
      });
      const normalizedGrammar = grammar.map((item: GrammarPoint) => ({
        ...item,
        examples: item.examples.map((example) => {
          if (example.ref) {
            return example;
          }
          const fallbackEntry = entries[Math.min(example.ref?.index ?? 0, entries.length - 1)] ?? entries[0];
          return {
            ...example,
            ref: alignTimeRef(fallbackEntry),
          };
        }),
      }));
      store.setGrammar(normalizedGrammar);

      const vocabulary = await provider.extractVocab({
        system,
        user: buildUserPrompt({ task: 'VOCAB', chunks }),
      });
      const normalizedVocabulary = vocabulary.map((item: VocabItem) => ({
        ...item,
        examples: item.examples.map((example) => {
          if (example.ref) {
            return example;
          }
          const fallbackEntry = entries[Math.min(example.ref?.index ?? 0, entries.length - 1)] ?? entries[0];
          return {
            ...example,
            ref: alignTimeRef(fallbackEntry),
          };
        }),
      }));
      store.setVocabulary(normalizedVocabulary);

      const combined = analysisResultSchema.parse({
        summary,
        grammar: normalizedGrammar,
        vocabulary: normalizedVocabulary,
      });

      store.setResult(combined);
      store.setStatus('success');
      return combined;
    },
    onError: (error) => {
      store.setStatus('error');
      store.setError(error.message);
    },
  });

  const progress: AnalyzeProgress = mutation.isPending
    ? {
        step: 'preprocess',
        completed: mutation.variables ? 1 : 0,
        total: TOTAL_STEPS,
      }
    : store.status === 'success'
      ? { step: 'complete', completed: TOTAL_STEPS, total: TOTAL_STEPS }
      : { step: 'idle', completed: 0, total: TOTAL_STEPS };

  return {
    analyze: mutation.mutateAsync,
    isAnalyzing: mutation.isPending,
    progress,
    status: store.status,
    error: store.error,
  };
}
