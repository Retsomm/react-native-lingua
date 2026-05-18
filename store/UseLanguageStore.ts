import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

type LanguageState = {
  clearSelectedLanguage: () => void;
  hasHydrated: boolean;
  selectedLanguageId: string | null;
  setHasHydrated: (hasHydrated: boolean) => void;
  setSelectedLanguageId: (languageId: string) => void;
};

const noopStorage: StateStorage = {
  getItem: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
};

const getLanguageStorage = () => {
  if (process.env.EXPO_OS === "web" && typeof window === "undefined") {
    return noopStorage;
  }

  return AsyncStorage;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      clearSelectedLanguage: () => set({ selectedLanguageId: null }),
      hasHydrated: false,
      selectedLanguageId: null,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setSelectedLanguageId: (languageId) =>
        set({ selectedLanguageId: languageId }),
    }),
    {
      name: "lingua-language-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        selectedLanguageId: state.selectedLanguageId,
      }),
      storage: createJSONStorage(getLanguageStorage),
    },
  ),
);

useLanguageStore.persist.onFinishHydration((state) => {
  state.setHasHydrated(true);
});

if (useLanguageStore.persist.hasHydrated()) {
  useLanguageStore.setState({ hasHydrated: true });
}
