import { appThemeColors } from "@/constants/theme";
import type { ChatMessage } from "@/store/use-chat-store";
import { useThemeStore } from "@/store/use-theme-store";
import { Text, View } from "react-native";

type ChatMessageBubbleProps = {
  message: ChatMessage;
  showAvatar?: boolean;
};

function formatMessageTime(createdAt: number) {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

function getStatusLabel(status: NonNullable<ChatMessage["status"]>) {
  const statusLabels: Record<NonNullable<ChatMessage["status"]>, string> = {
    delivered: "已送達",
    read: "已讀",
    sent: "已發送",
  };

  return statusLabels[status];
}

export function ChatMessageBubble({
  message,
  showAvatar = true,
}: ChatMessageBubbleProps) {
  const isUser = message.sender === "user";
  const theme = useThemeStore((state) => state.theme);
  const colors = appThemeColors[theme];

  return (
    <View
      className={`w-full flex-row ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && showAvatar ? (
        <View className="mr-[8px] h-[34px] w-[34px] items-center justify-center rounded-full bg-lingua-deep-purple">
          <Text className="font-poppins-bold text-[16px] leading-[22px] text-white">
            AI
          </Text>
        </View>
      ) : null}

      <View
        className={`max-w-[76%] flex-row items-end gap-[6px] ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        <View
          className={`rounded-[18px] px-[14px] py-[10px] ${
            isUser
              ? "rounded-tr-[4px] bg-lingua-deep-purple"
              : "rounded-tl-[4px] bg-lingua-background"
          }`}
          style={!isUser ? { borderColor: colors.borderSoft, borderWidth: 1 } : undefined}
        >
          <Text
            className={`font-poppins-medium text-[15px] leading-[22px] ${
              isUser ? "text-white" : "text-lingua-text-primary"
            }`}
          >
            {message.text}
          </Text>
        </View>

        <View className={`pb-[2px] ${isUser ? "items-end" : "items-start"}`}>
          {isUser && message.status ? (
            <Text className="font-poppins-medium text-[10px] leading-[14px] text-lingua-text-tertiary">
              {getStatusLabel(message.status)}
            </Text>
          ) : null}
          <Text className="font-poppins-medium text-[10px] leading-[14px] text-lingua-text-tertiary">
            {formatMessageTime(message.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
}
