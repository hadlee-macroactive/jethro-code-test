import { create } from 'zustand';

interface UserState {
  userId: number | null;
  creatorId: number | null;
  role: 'user' | 'creator' | 'admin' | null;
  name: string | null;
  email: string | null;
  hydrated: boolean;
  setUser: (user: { userId: number; creatorId: number; role: string; name: string; email: string }) => void;
  clearUser: () => void;
  setHydrated: (v: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  creatorId: null,
  role: null,
  name: null,
  email: null,
  hydrated: false,
  setUser: (user) => set({
    userId: user.userId,
    creatorId: user.creatorId,
    role: user.role as any,
    name: user.name,
    email: user.email,
    hydrated: true,
  }),
  clearUser: () => set({
    userId: null, creatorId: null, role: null, name: null, email: null
  }),
  setHydrated: (v) => set({ hydrated: v }),
}));
