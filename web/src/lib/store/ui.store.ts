import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  celebrationBadge: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  showCelebration: (badgeCode: string) => void;
  hideCelebration: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  celebrationBadge: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  showCelebration: (badgeCode) => set({ celebrationBadge: badgeCode }),
  hideCelebration: () => set({ celebrationBadge: null }),
}));
