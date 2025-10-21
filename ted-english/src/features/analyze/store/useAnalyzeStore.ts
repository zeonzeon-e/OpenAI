import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AnalysisResult, GrammarPoint, Summary, VocabItem } from '../core/schema';
import type { TranscriptEntry, TranscriptChunk } from '../core/chunk';

export type AnalysisStatus = 'idle' | 'processing' | 'success' | 'error';

export interface AnalyzeState {
  transcriptInput: string;
  urlInput: string;
  proxyUrl: string;
  youtubeUrl: string;
  openAIKey: string;
  provider: 'mock' | 'openai';
  status: AnalysisStatus;
  result?: AnalysisResult;
  transcriptEntries: TranscriptEntry[];
  chunks: TranscriptChunk[];
  summary?: Summary;
  grammar: GrammarPoint[];
  vocabulary: VocabItem[];
  error?: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;

  setTranscriptInput(value: string): void;
  setUrlInput(value: string): void;
  setProxyUrl(value: string): void;
  setYoutubeUrl(value: string): void;
  setOpenAIKey(value: string): void;
  setProvider(value: 'mock' | 'openai'): void;
  setStatus(value: AnalysisStatus): void;
  setResult(value: AnalysisResult | undefined): void;
  setTranscriptEntries(value: TranscriptEntry[]): void;
  setChunks(value: TranscriptChunk[]): void;
  setSummary(value: Summary | undefined): void;
  setGrammar(value: GrammarPoint[]): void;
  setVocabulary(value: VocabItem[]): void;
  setError(value: string | undefined): void;
  setCurrentTime(value: number): void;
  setDuration(value: number): void;
  setIsPlaying(value: boolean): void;
  reset(): void;
}

export const useAnalyzeStore = create<AnalyzeState>()(
  persist(
    (set) => ({
      transcriptInput: '',
      urlInput: '',
      proxyUrl: '',
      youtubeUrl: '',
      openAIKey: '',
      provider: 'mock',
      status: 'idle',
      transcriptEntries: [],
      chunks: [],
      grammar: [],
      vocabulary: [],
      currentTime: 0,
      duration: 0,
      isPlaying: false,

      setTranscriptInput: (value) => set({ transcriptInput: value }),
      setUrlInput: (value) => set({ urlInput: value }),
      setProxyUrl: (value) => set({ proxyUrl: value }),
      setYoutubeUrl: (value) => set({ youtubeUrl: value }),
      setOpenAIKey: (value) => set({ openAIKey: value }),
      setProvider: (value) => set({ provider: value }),
      setStatus: (value) => set({ status: value }),
      setResult: (value) => set({ result: value }),
      setTranscriptEntries: (value) => set({ transcriptEntries: value }),
      setChunks: (value) => set({ chunks: value }),
      setSummary: (value) => set({ summary: value }),
      setGrammar: (value) => set({ grammar: value }),
      setVocabulary: (value) => set({ vocabulary: value }),
      setError: (value) => set({ error: value }),
      setCurrentTime: (value) => set({ currentTime: value }),
      setDuration: (value) => set({ duration: value }),
      setIsPlaying: (value) => set({ isPlaying: value }),
      reset: () =>
        set({
          status: 'idle',
          result: undefined,
          transcriptEntries: [],
          chunks: [],
          summary: undefined,
          grammar: [],
          vocabulary: [],
          error: undefined,
          currentTime: 0,
          duration: 0,
          isPlaying: false,
        }),
    }),
    {
      name: 'analyze-store',
      partialize: (state) => ({
        transcriptInput: state.transcriptInput,
        urlInput: state.urlInput,
        proxyUrl: state.proxyUrl,
        youtubeUrl: state.youtubeUrl,
        openAIKey: state.openAIKey,
        provider: state.provider,
      }),
    },
  ),
);
