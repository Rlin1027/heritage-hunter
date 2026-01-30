import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeType } from './types';

interface ThemeStore {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'cyberpunk',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({
        theme: state.theme === 'cyberpunk' ? 'indiana' : 'cyberpunk'
      })),
    }),
    { name: 'heritage-hunter-theme' }
  )
);
