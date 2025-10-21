import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chunkTranscript, parseTranscriptInput, TranscriptChunk, TranscriptSegment } from '../core/chunk';
import { AnalysisResult } from '../core/schema';

export type AnalyzeStatus = 'idle' | 'preparing' | 'analyzing' | 'completed' | 'error';

export type AnalyzeConfig = {
  llmMode: 'mock' | 'openai';
  openAiKey?: string;
  proxyUrl?: string;
  talkUrl?: string;
  youtubeUrl?: string;
  chunkTargetTokens: number;
};

export type AnalyzeStore = {
  config: AnalyzeConfig;
  segments: TranscriptSegment[];
  chunks: TranscriptChunk[];
  analysis?: AnalysisResult;
  status: AnalyzeStatus;
  progress: number;
  error?: string;
  rawResponse?: string;
  activeSegmentIndex?: number;
  setConfig: (partial: Partial<AnalyzeConfig>) => void;
  setSegmentsFromInput: (raw: string) => void;
  setSegments: (segments: TranscriptSegment[]) => void;
  setChunks: (chunks: TranscriptChunk[]) => void;
  setAnalysis: (analysis?: AnalysisResult) => void;
  setStatus: (status: AnalyzeStatus) => void;
  setProgress: (progress: number) => void;
  setError: (message?: string) => void;
  setRawResponse: (raw?: string) => void;
  setActiveSegment: (index?: number) => void;
  reset: () => void;
};

const defaultConfig: AnalyzeConfig = {
  llmMode: 'mock',
  chunkTargetTokens: 350,
};

export const useAnalyzeStore = create<AnalyzeStore>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      segments: [],
      chunks: [],
      analysis: undefined,
      status: 'idle',
      progress: 0,
      error: undefined,
      rawResponse: undefined,
      activeSegmentIndex: undefined,
      setConfig: (partial) =>
        set((state) => ({
          config: { ...state.config, ...partial },
        })),
      setSegmentsFromInput: (raw) => {
        const segments = parseTranscriptInput(raw);
        set({ segments, chunks: chunkTranscript(segments, get().config.chunkTargetTokens) });
      },
      setSegments: (segments) => {
        set({ segments, chunks: chunkTranscript(segments, get().config.chunkTargetTokens) });
      },
      setChunks: (chunks) => set({ chunks }),
      setAnalysis: (analysis) => set({ analysis }),
      setStatus: (status) => set({ status }),
      setProgress: (progress) => set({ progress }),
      setError: (message) => set({ error: message }),
      setRawResponse: (raw) => set({ rawResponse: raw }),
      setActiveSegment: (index) => set({ activeSegmentIndex: index }),
      reset: () =>
        set({
          segments: [],
          chunks: [],
          analysis: undefined,
          status: 'idle',
          progress: 0,
          error: undefined,
          rawResponse: undefined,
        }),
    }),
    {
      name: 'analyze-settings',
      partialize: (state) => ({ config: state.config }),
      merge: (persisted, current) => {
        const persistedData = persisted as { config?: AnalyzeConfig } | null;
        return {
          ...current,
          config: { ...current.config, ...persistedData?.config },
        };
      },
    },
  ),
);
