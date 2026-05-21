import { ChatInputBar } from "@/components/chat-input-bar";
import { ChatMessageBubble } from "@/components/chat-message-bubble";
import { appThemeColors } from "@/constants/theme";
import { defaultLanguageId, languages } from "@/data/languages";
import { createMockTutorReply } from "@/features/chat/tutor-reply";
import { useChatStore, type ChatMessage } from "@/store/use-chat-store";
import { useLanguageStore } from "@/store/UseLanguageStore";
import { useThemeStore } from "@/store/use-theme-store";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const starterPrompts = ["今天練習問候", "幫我改一句話", "用三句話聊天"];

function buildWelcomeMessage(languageName: string): ChatMessage {
  return {
    createdAt: Date.now() - 1000 * 60 * 3,
    id: `welcome-${languageName}`,
    languageId: "system",
    sender: "assistant",
    text: `嗨，我是你的 AI ${languageName}家教。你可以像 LINE 聊天一樣傳訊息給我，我會陪你練習短句、修正文法，也可以幫你準備下一堂課。`,
  };
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedLanguageId = useLanguageStore(
    (state) => state.selectedLanguageId ?? defaultLanguageId,
  );
  const selectedLanguage =
    languages.find((language) => language.id === selectedLanguageId) ??
    languages[0];
  const hasHydratedChat = useChatStore((state) => state.hasHydrated);
  const allMessages = useChatStore((state) => state.messages);
  const sendUserMessage = useChatStore((state) => state.sendUserMessage);
  const addAssistantMessage = useChatStore((state) => state.addAssistantMessage);
  const clearMessages = useChatStore((state) => state.clearMessages);
  const theme = useThemeStore((state) => state.theme);
  const colors = appThemeColors[theme];

  const storedMessages = useMemo(
    () =>
      allMessages.filter(
        (message) => message.languageId === selectedLanguage.id,
      ),
    [allMessages, selectedLanguage.id],
  );

  const messages = useMemo(
    () =>
      storedMessages.length > 0
        ? storedMessages
        : [buildWelcomeMessage(selectedLanguage.name)],
    [selectedLanguage.name, storedMessages],
  );

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) {
        clearTimeout(replyTimerRef.current);
      }
    };
  }, []);

  const handleSend = (messageText = input) => {
    const trimmedInput = messageText.trim();

    if (!trimmedInput) {
      return;
    }

    setInput("");
    sendUserMessage({
      languageId: selectedLanguage.id,
      text: trimmedInput,
    });

    if (replyTimerRef.current) {
      clearTimeout(replyTimerRef.current);
    }

    replyTimerRef.current = setTimeout(() => {
      addAssistantMessage({
        languageId: selectedLanguage.id,
        text: createMockTutorReply(trimmedInput, selectedLanguage.id),
      });
    }, 650);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.keyboardRoot}
    >
      <View className="flex-1 bg-lingua-surface">
        <View
          className="bg-lingua-deep-purple px-[18px] pb-[12px]"
          style={{ paddingTop: Math.max(insets.top, 12) + 8 }}
        >
          <View className="flex-row items-center">
            <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-lingua-background">
              <Text className="font-poppins-bold text-[16px] leading-[22px] text-lingua-deep-purple">
                AI
              </Text>
            </View>

            <View className="ml-[12px] flex-1">
              <Text className="font-poppins-bold text-[18px] leading-[25px] text-white">
                AI {selectedLanguage.name}家教
              </Text>
              <View className="mt-[2px] flex-row items-center">
                <View className="h-[7px] w-[7px] rounded-full bg-white" />
                <Text className="ml-[6px] font-poppins-medium text-[12px] leading-[17px] text-white">
                  線上 · 文字練習
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel="清除聊天紀錄"
              accessibilityRole="button"
              hitSlop={10}
              style={({ pressed }) => pressed && styles.pressed}
              onPress={() => clearMessages(selectedLanguage.id)}
            >
              <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <FlatList
          contentContainerStyle={[
            styles.messageList,
            { paddingBottom: 18, paddingTop: 18 },
          ]}
          data={hasHydratedChat ? messages : []}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ChatMessageBubble
              message={item}
              showAvatar={
                index === 0 || messages[index - 1]?.sender !== item.sender
              }
            />
          )}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View className="mt-[2px] flex-row flex-wrap gap-[8px]">
              {starterPrompts.map((prompt) => (
                <Pressable
                  key={prompt}
                  accessibilityRole="button"
                  className="rounded-full bg-lingua-background px-[13px] py-[8px]"
                  style={({ pressed }) => [
                    { borderColor: colors.borderSoft, borderWidth: 1 },
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleSend(prompt)}
                >
                  <Text className="font-poppins-semibold text-[13px] leading-[18px] text-lingua-deep-purple">
                    {prompt}
                  </Text>
                </Pressable>
              ))}
            </View>
          }
        />

        <View style={{ paddingBottom: Math.max(insets.bottom, 8) + 108 }}>
          <ChatInputBar
            input={input}
            onChangeInput={setInput}
            onSend={handleSend}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
  },
  messageList: {
    gap: 10,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.72,
  },
});
