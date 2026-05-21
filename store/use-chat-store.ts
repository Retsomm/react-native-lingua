import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

export type ChatMessage = {
  createdAt: number;
  id: string;
  languageId: string;
  sender: "assistant" | "user";
  status?: "delivered" | "read" | "sent";
  text: string;
};

type ChatState = {
  addAssistantMessage: (input: { languageId: string; text: string }) => void;
  clearMessages: (languageId: string) => void;
  hasHydrated: boolean;
  messages: ChatMessage[];
  sendUserMessage: (input: { languageId: string; text: string }) => ChatMessage;
  setHasHydrated: (hasHydrated: boolean) => void;
};

const noopStorage: StateStorage = {
  getItem: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
};

const getChatStorage = () => {
  if (process.env.EXPO_OS === "web" && typeof window === "undefined") {
    return noopStorage;
  }

  return AsyncStorage;
};

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      addAssistantMessage: ({ languageId, text }) => {
        const message: ChatMessage = {
          createdAt: Date.now(),
          id: createMessageId(),
          languageId,
          sender: "assistant",
          text,
        };

        set((state) => ({ messages: [...state.messages, message] }));
      },
      clearMessages: (languageId) => {
        set((state) => ({
          messages: state.messages.filter(
            (message) => message.languageId !== languageId,
          ),
        }));
      },
      hasHydrated: false,
      messages: [],
      sendUserMessage: ({ languageId, text }) => {
        const message: ChatMessage = {
          createdAt: Date.now(),
          id: createMessageId(),
          languageId,
          sender: "user",
          status: "read",
          text,
        };

        set((state) => ({ messages: [...state.messages, message] }));

        return message;
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "lingua-chat-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        messages: state.messages,
      }),
      storage: createJSONStorage(getChatStorage),
    },
  ),
);

useChatStore.persist.onFinishHydration((state) => {
  state.setHasHydrated(true);
});

if (useChatStore.persist.hasHydrated()) {
  useChatStore.setState({ hasHydrated: true });
}
