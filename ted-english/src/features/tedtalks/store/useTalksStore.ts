import { create } from 'zustand';
import { TedTalk } from '../types';
import { fetchLatestTedTalks, getMockTedTalks } from '../api/fetchTalks';

export type TalksStatus = 'idle' | 'loading' | 'success' | 'error';

type TalksState = {
  talks: TedTalk[];
  status: TalksStatus;
  error?: string;
  lastFetched?: Date;
  selectedTalk?: TedTalk;
  useMockData: boolean;
};

type TalksActions = {
  setUseMockData: (useMock: boolean) => void;
  fetchTalks: (proxyUrl?: string) => Promise<void>;
  setSelectedTalk: (talk?: TedTalk) => void;
  clearError: () => void;
};

export type TalksStore = TalksState & TalksActions;

export const useTalksStore = create<TalksStore>()((set, get) => ({
  talks: [],
  status: 'idle',
  error: undefined,
  lastFetched: undefined,
  selectedTalk: undefined,
  useMockData: true,

  setUseMockData: (useMock) => {
    set({ useMockData: useMock });
  },

  fetchTalks: async (proxyUrl) => {
    const currentStatus = get().status;
    if (currentStatus === 'loading') return;

    set({ status: 'loading', error: undefined });

    try {
      const { useMockData } = get();
      const response = useMockData ? getMockTedTalks() : await fetchLatestTedTalks({ proxyUrl });

      set({
        talks: response.talks,
        status: 'success',
        lastFetched: new Date(),
        error: undefined,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch TED talks';
      set({
        status: 'error',
        error: errorMessage,
      });
    }
  },

  setSelectedTalk: (talk) => {
    set({ selectedTalk: talk });
  },

  clearError: () => {
    set({ error: undefined });
  },
}));
