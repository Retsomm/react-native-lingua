import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import type { AppTheme } from "@/constants/theme";

type ThemeState = {
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  setTheme: (theme: AppTheme) => void;
  theme: AppTheme;
  toggleTheme: () => void;
};

const noopStorage: StateStorage = {
  getItem: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
};

const getThemeStorage = () => {
  if (process.env.EXPO_OS === "web" && typeof window === "undefined") {
    return noopStorage;
  }

  return AsyncStorage;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setTheme: (theme) => set({ theme }),
      theme: "light",
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "lingua-theme-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        theme: state.theme,
      }),
      storage: createJSONStorage(getThemeStorage),
    },
  ),
);

useThemeStore.persist.onFinishHydration((state) => {
  state.setHasHydrated(true);
});

if (useThemeStore.persist.hasHydrated()) {
  useThemeStore.setState({ hasHydrated: true });
}
