import { useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createLLMProvider } from '../api/llm';
import { useAnalyzeStore } from '../store/useAnalyzeStore';
import { AnalysisResult } from '../core/schema';

export const useAnalyze = () => {
  const {
    config,
    chunks,
    setStatus,
    setProgress,
    setAnalysis,
    setError,
    setRawResponse,
    reset,
  } = useAnalyzeStore((state) => ({
    config: state.config,
    chunks: state.chunks,
    setStatus: state.setStatus,
    setProgress: state.setProgress,
    setAnalysis: state.setAnalysis,
    setError: state.setError,
    setRawResponse: state.setRawResponse,
    reset: state.reset,
  }));

  const provider = useMemo(() => {
    try {
      return createLLMProvider(config.llmMode, {
        apiKey: config.openAiKey ?? '',
      });
    } catch (error) {
      console.warn('Failed to create LLM provider', error);
      return createLLMProvider('mock');
    }
  }, [config.llmMode, config.openAiKey]);

  const mutation = useMutation({
    mutationKey: ['analyze', config],
    mutationFn: async (): Promise<AnalysisResult> => {
      setStatus('analyzing');
      setProgress(0.05);
      setError(undefined);
      setRawResponse(undefined);
      setAnalysis(undefined);

      const summaryResult = await provider.summarize(chunks);
      if (!summaryResult.success || !summaryResult.data) {
        setStatus('error');
        setRawResponse(summaryResult.raw);
        throw summaryResult.error ?? new Error('요약 생성에 실패했습니다.');
      }
      setProgress(0.35);

      const grammarResult = await provider.extractGrammar(chunks);
      if (!grammarResult.success || !grammarResult.data) {
        setStatus('error');
        setRawResponse(grammarResult.raw);
        throw grammarResult.error ?? new Error('문법 포인트 추출에 실패했습니다.');
      }
      setProgress(0.65);

      const vocabResult = await provider.extractVocabulary(chunks);
      if (!vocabResult.success || !vocabResult.data) {
        setStatus('error');
        setRawResponse(vocabResult.raw);
        throw vocabResult.error ?? new Error('어휘 추출에 실패했습니다.');
      }

      setProgress(1);
      return {
        summary: summaryResult.data,
        grammar: grammarResult.data,
        vocabulary: vocabResult.data,
      } satisfies AnalysisResult;
    },
    onSuccess: (result) => {
      setAnalysis(result);
      setStatus('completed');
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : String(error));
    },
    onSettled: (_result, error) => {
      if (error) {
        setProgress(0);
      }
    },
  });

  return {
    analyze: mutation.mutateAsync,
    isAnalyzing: mutation.isPending,
    reset,
  };
};
