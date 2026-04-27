import { create } from 'zustand';

interface CacheState {
  lastFetch: Record<string, number>;
  setData: (key: string) => void;
  isStale: (key: string, staleMs: number) => boolean;
  invalidate: (key: string) => void;
  invalidateAll: () => void;
}

export const useCacheStore = create<CacheState>((set, get) => ({
  lastFetch: {},

  setData: (key: string) => {
    set(state => ({
      lastFetch: { ...state.lastFetch, [key]: Date.now() }
    }));
  },

  isStale: (key: string, staleMs: number) => {
    const lastFetch = get().lastFetch[key];
    if (!lastFetch) return true;
    return Date.now() - lastFetch > staleMs;
  },

  invalidate: (key: string) => {
    set(state => {
      const { [key]: _, ...rest } = state.lastFetch;
      return { lastFetch: rest };
    });
  },

  invalidateAll: () => {
    set({ lastFetch: {} });
  }
}));
