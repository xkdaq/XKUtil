import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  collapsed: boolean;
  isDark: boolean;
  toggleCollapsed: () => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      collapsed: false,
      isDark: false,
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
    }),
    {
      name: "xkutil-app-settings",
    }
  )
);
