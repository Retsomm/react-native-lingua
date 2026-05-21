import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { useStreamAudioCall } from "@/hooks/useStreamAudioCall";
import type { LiveCaption } from "@/hooks/useStreamAudioCall";
import type { Lesson } from "@/types/learning";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { Href } from "expo-router";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconName = keyof typeof Ionicons.glyphMap;

type LessonControlProps = {
  disabled?: boolean;
  iconName: IoniconName;
  iconSize: number;
  isActive?: boolean;
  isDestructive?: boolean;
  label: string;
  onPress?: () => void;
  tone?: "call" | "speak";
};

const feedbackMetrics = [
  { color: "#19D229", label: "口說", value: "很棒" },
  { color: "#2085FF", label: "發音", value: "很好" },
  { color: "#5034FF", label: "文法", value: "不錯" },
];

const tabItems: { iconName: IoniconName; label: string; route: Href }[] = [
  { iconName: "home-outline", label: "首頁", route: "/home" },
  { iconName: "book", label: "學習", route: "/learn" },
  { iconName: "headset-outline", label: "AI 老師", route: "/ai-teacher" },
  { iconName: "chatbubble-outline", label: "聊天", route: "/chat" },
  { iconName: "person-outline", label: "個人", route: "/profile" },
];

type AudioTeacherSessionProps = {
  activeTabRoute?: "/ai-teacher" | "/learn";
  autoStartCall?: boolean;
  lesson?: Lesson;
  onCallEnded?: () => void;
  showEmbeddedTabBar?: boolean;
};

export function AudioTeacherSession({
  activeTabRoute = "/ai-teacher",
  autoStartCall = false,
  lesson,
  onCallEnded,
  showEmbeddedTabBar = false,
}: AudioTeacherSessionProps) {
  const insets = useSafeAreaInsets();

  if (!lesson) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-[28px]"
        style={{ paddingBottom: insets.bottom, paddingTop: insets.top }}
      >
        <Text className="text-center font-poppins-semibold text-[22px] leading-[30px] text-lingua-text-primary">
          找不到課程
        </Text>
        <Pressable
          className="mt-[18px] rounded-[18px] bg-lingua-deep-purple px-[22px] py-[14px]"
          onPress={() => router.back()}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text className="font-poppins-bold text-[16px] leading-[23px] text-white">
            返回
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <AudioTeacherSessionContent
      activeTabRoute={activeTabRoute}
      autoStartCall={autoStartCall}
      lesson={lesson}
      onCallEnded={onCallEnded}
      showEmbeddedTabBar={showEmbeddedTabBar}
    />
  );
}

type AudioTeacherSessionContentProps = {
  activeTabRoute: "/ai-teacher" | "/learn";
  autoStartCall: boolean;
  lesson: Lesson;
  onCallEnded?: () => void;
  showEmbeddedTabBar: boolean;
};

function AudioTeacherSessionContent({
  activeTabRoute,
  autoStartCall,
  lesson,
  onCallEnded,
  showEmbeddedTabBar,
}: AudioTeacherSessionContentProps) {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const didAutoStartCallRef = useRef(false);
  const chatScrollViewRef = useRef<ScrollView | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTogglingSpeaking, setIsTogglingSpeaking] = useState(false);
  const { width } = useWindowDimensions();
  const language = languages.find((item) => item.id === lesson.languageId);
  const previewHeight = Math.min(610, Math.max(540, width * 1.43));
  const greetingMascotSize = Math.min(330, Math.max(250, width * 0.72));

  const primaryPhrase = lesson.phrases[0];
  const languageName = language?.name ?? "語言";
  const goal = lesson.goals[0] ?? lesson.description;
  const audioCall = useStreamAudioCall({ language, lesson, user });
  const statusCopy = getAudioCallCopy(
    audioCall.status,
    audioCall.errorMessage,
    isSpeaking,
  );
  const agentStatusCopy = getAgentStatusCopy(audioCall.agentConnectionStatus);
  const chatCaptions = getChatCaptions(
    audioCall.liveCaptions,
    statusCopy.prompt ??
      primaryPhrase?.translation ??
      primaryPhrase?.phrase ??
      "跟著我念一次。",
  );
  const latestChatCaption = chatCaptions.at(-1);
  const chatCaptionSignature = `${chatCaptions.length}:${latestChatCaption?.id ?? ""}:${latestChatCaption?.text ?? ""}`;
  const isBusy =
    audioCall.status === "starting" ||
    audioCall.status === "connecting-agent" ||
    audioCall.status === "joining" ||
    audioCall.status === "muting" ||
    audioCall.status === "ending";
  const canJoin = audioCall.status === "ready";
  const canStart =
    audioCall.status === "idle" ||
    audioCall.status === "ended" ||
    audioCall.status === "error";
  const isInCall = audioCall.status === "joined";
  const shouldShowLiveCaptions = isInCall;
  const canEndCall =
    audioCall.status !== "idle" &&
    audioCall.status !== "ended" &&
    audioCall.status !== "error";
  const userName =
    audioCall.streamUser?.name ??
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "已登入學習者";

  const toggleCall = async () => {
    if (audioCall.status === "ending") {
      return;
    }

    if (canEndCall) {
      setIsSpeaking(false);
      try {
        await audioCall.stopSpeaking();
      } catch (error) {
        console.error("Failed to stop speaking before ending call", error);
      }

      await audioCall.endCall();
      onCallEnded?.();
      return;
    }

    if (!isBusy && (canStart || canJoin)) {
      audioCall.joinCall({ muted: true });
    }
  };

  const toggleSpeaking = async () => {
    if (!isInCall || isBusy || isTogglingSpeaking) {
      return;
    }

    const nextSpeaking = !isSpeaking;
    setIsTogglingSpeaking(true);

    try {
      if (nextSpeaking) {
        await audioCall.startSpeaking();
      } else {
        await audioCall.stopSpeaking();
      }

      setIsSpeaking(nextSpeaking);
    } catch (error) {
      console.error("Failed to toggle speaking", error);
    } finally {
      setIsTogglingSpeaking(false);
    }
  };

  useEffect(() => {
    didAutoStartCallRef.current = false;
    setIsSpeaking(false);
  }, [lesson.id]);

  useEffect(() => {
    if (!isInCall) {
      setIsSpeaking(false);
    }
  }, [isInCall]);

  useEffect(() => {
    if (!shouldShowLiveCaptions) {
      return;
    }

    requestAnimationFrame(() => {
      chatScrollViewRef.current?.scrollToEnd({ animated: true });
    });
  }, [chatCaptionSignature, shouldShowLiveCaptions]);

  useEffect(() => {
    if (
      !autoStartCall ||
      didAutoStartCallRef.current ||
      !user ||
      audioCall.status !== "idle"
    ) {
      return;
    }

    didAutoStartCallRef.current = true;
    audioCall.joinCall({ muted: true });
  }, [audioCall, autoStartCall, user]);

  const content = (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 10) + (showEmbeddedTabBar ? 128 : 112),
            paddingTop: Math.max(insets.top + 16, 30),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center">
          <Pressable
            accessibilityLabel="返回"
            hitSlop={12}
            onPress={() => router.back()}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Ionicons name="chevron-back" size={38} color="#0D132B" />
          </Pressable>

          <View className="ml-[18px] flex-1">
            <Text
              className="font-poppins-semibold text-[24px] leading-[31px] text-lingua-text-primary"
              numberOfLines={1}
            >
              AI 老師
            </Text>
            <View className="mt-[4px] flex-row items-center">
              <View
                className={`h-[13px] w-[13px] rounded-full ${
                  audioCall.status === "joined" ? "bg-[#19D229]" : "bg-[#FFB020]"
                }`}
              />
              <Text
                className="ml-[8px] flex-1 font-poppins-medium text-[17px] leading-[23px] text-[#4E5874]"
                numberOfLines={1}
              >
                {languageName} • {statusCopy.header}
              </Text>
            </View>
          </View>

          <HeaderAction
            accessibilityLabel="相機無法使用"
            disabled
            iconName="videocam"
            testID="audio-teacher-header-camera"
          />
          <View className="ml-[8px] h-[52px] w-[52px] items-center justify-center rounded-full border border-[#ECEEF7] bg-white">
            <Text className="font-poppins-semibold text-[21px] leading-[28px] text-lingua-text-primary">
              {lesson.estimatedMinutes + lesson.xpReward - 3}
            </Text>
          </View>
          <HeaderAction
            accessibilityLabel="通知無法使用"
            disabled
            iconName="notifications-outline"
            testID="audio-teacher-header-notifications"
          />
        </View>

        <View className="mt-[18px] rounded-[22px] border border-[#EEF0F5] bg-white px-[18px] py-[16px]">
          <View className="flex-row items-center">
            <View className="h-[44px] w-[44px] items-center justify-center rounded-full bg-[#F2EFFF]">
              <Ionicons name="person" size={23} color="#5B3BF6" />
            </View>
            <View className="ml-[13px] flex-1">
              <Text
                className="font-poppins-semibold text-[16px] leading-[22px] text-lingua-text-primary"
                numberOfLines={1}
              >
                {userName}
              </Text>
              <Text
                className="mt-[2px] font-poppins-medium text-[13px] leading-[19px] text-[#68718D]"
                numberOfLines={2}
              >
                {statusCopy.body}
              </Text>
            </View>
            <View className="rounded-full bg-[#F7F8FC] px-[12px] py-[7px]">
              <Text className="font-poppins-semibold text-[12px] leading-[16px] text-[#5B3BF6]">
                {audioCall.isMuted ? "已靜音" : audioCall.status === "joined" ? "直播中" : "語音"}
              </Text>
            </View>
          </View>
          <View className="mt-[14px] flex-row items-center rounded-[16px] bg-[#F7F8FC] px-[14px] py-[11px]">
            <View
              className="h-[10px] w-[10px] rounded-full"
              style={{ backgroundColor: agentStatusCopy.color }}
            />
            <Text className="ml-[9px] font-poppins-semibold text-[13px] leading-[18px] text-lingua-text-primary">
              AI 老師
            </Text>
            <Text className="ml-[7px] flex-1 font-poppins-medium text-[13px] leading-[18px] text-[#68718D]">
              {agentStatusCopy.label}
            </Text>
          </View>
        </View>

        <ImageBackground
          source={images.lessonArt.homeBackground}
          className="mt-[22px] overflow-hidden rounded-[28px]"
          imageStyle={styles.teacherBackground}
          resizeMode="cover"
          style={[styles.teacherPreview, { height: previewHeight }]}
        >
          <View className="absolute inset-0 bg-black/10" />

          {shouldShowLiveCaptions ? (
            <ScrollView
              contentContainerStyle={styles.chatTranscriptContent}
              onContentSizeChange={() => {
                chatScrollViewRef.current?.scrollToEnd({ animated: true });
              }}
              ref={chatScrollViewRef}
              showsVerticalScrollIndicator={false}
              style={styles.chatTranscript}
            >
              {chatCaptions.map((caption) => (
                <ChatCaptionBubble key={caption.id} caption={caption} />
              ))}
            </ScrollView>
          ) : (
            <View
              accessibilityLabel="AI 老師吉祥物正在打招呼"
              className="absolute inset-0 items-center justify-center px-[24px]"
              pointerEvents="none"
            >
              <View className="mb-[-12px] rounded-full bg-white px-[18px] py-[10px]" style={styles.greetingBubble}>
                <Text className="font-poppins-bold text-[18px] leading-[24px] text-lingua-text-primary">
                  哈囉！
                </Text>
              </View>
              <Image
                source={images.mascotWelcome}
                resizeMode="contain"
                style={{ height: greetingMascotSize, width: greetingMascotSize }}
              />
            </View>
          )}
        </ImageBackground>

        <View
          className="mt-[18px] flex-row justify-center gap-[22px]"
          style={styles.controlsRow}
        >
          <LessonControl
            disabled={
              audioCall.status === "ending" ||
              (!canEndCall && (isBusy || (!canJoin && !canStart)))
            }
            iconName="call"
            iconSize={38}
            isActive={canEndCall}
            label={canEndCall ? "結束" : "通話"}
            onPress={toggleCall}
            tone="call"
          />
          <LessonControl
            disabled={!isInCall || isBusy || isTogglingSpeaking}
            iconName={isSpeaking ? "send" : "mic"}
            iconSize={34}
            isActive={isSpeaking}
            label={isSpeaking ? "送出" : "說話"}
            onPress={toggleSpeaking}
            tone="speak"
          />
        </View>

        <View className="mt-[20px] gap-[16px] rounded-[24px] bg-white px-[24px] py-[22px]" style={styles.feedbackCard}>
          {feedbackMetrics.map((metric, index) => (
            <View
              key={metric.label}
              className="flex-row items-center justify-between"
              style={index > 0 ? styles.feedbackMetricDivider : undefined}
            >
              <Text className="font-poppins-semibold text-[17px] leading-[24px] text-lingua-text-primary">
                {metric.label}
              </Text>
              <Text
                className="font-poppins-semibold text-[18px] leading-[25px]"
                style={{ color: metric.color }}
              >
                {metric.value}
              </Text>
            </View>
          ))}
        </View>

        <View className="mt-[16px] rounded-[24px] border border-[#EEF0F5] bg-white px-[22px] py-[20px]">
          <Text className="font-poppins-semibold text-[16px] leading-[22px] text-lingua-deep-purple">
            課程目標
          </Text>
          <Text className="mt-[6px] font-poppins-semibold text-[18px] leading-[26px] text-lingua-text-primary">
            {goal}
          </Text>

          <View className="mt-[16px] gap-[9px]">
            {lesson.phrases.map((phrase) => (
              <View
                key={phrase.id}
                className="rounded-[16px] bg-[#F7F8FC] px-[16px] py-[13px]"
              >
                <Text className="font-poppins-semibold text-[17px] leading-[24px] text-lingua-text-primary">
                  {phrase.phrase}
                </Text>
                <Text className="mt-[3px] font-poppins-medium text-[14px] leading-[20px] text-[#68718D]">
                  {phrase.translation} • {phrase.pronunciation}
                </Text>
              </View>
            ))}
          </View>

          <Text className="mt-[16px] font-poppins-medium text-[13px] leading-[20px] text-[#68718D]">
            {lesson.aiTeacherPrompt}
          </Text>
        </View>
      </ScrollView>

      {showEmbeddedTabBar ? <LessonTabBar activeTabRoute={activeTabRoute} /> : null}
    </View>
  );

  if (audioCall.client && audioCall.StreamVideoProvider) {
    return (
      <audioCall.StreamVideoProvider client={audioCall.client}>
        {content}
      </audioCall.StreamVideoProvider>
    );
  }

  return (
    content
  );
}

type HeaderActionProps = {
  accessibilityLabel: string;
  disabled?: boolean;
  iconName: IoniconName;
  onPress?: () => void;
  testID: string;
};

function HeaderAction({
  accessibilityLabel,
  disabled = false,
  iconName,
  onPress,
  testID,
}: HeaderActionProps) {
  if (disabled || !onPress) {
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        className="ml-[8px] h-[52px] w-[52px] items-center justify-center rounded-full border border-[#ECEEF7] bg-white"
        style={[styles.headerAction, styles.disabledHeaderAction]}
        testID={testID}
      >
        <Ionicons name={iconName} size={27} color="#0D132B" />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="ml-[8px] h-[52px] w-[52px] items-center justify-center rounded-full border border-[#ECEEF7] bg-white"
      onPress={onPress}
      style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
      testID={testID}
    >
      <Ionicons name={iconName} size={27} color="#0D132B" />
    </Pressable>
  );
}

function LessonControl({
  disabled = false,
  iconName,
  iconSize,
  isActive = false,
  label,
  onPress,
  tone = "call",
}: LessonControlProps) {
  const colors = getLessonControlColors(tone, isActive);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={disabled ? { disabled: true } : undefined}
      className="w-[76px] items-center"
      onPress={() => {
        if (!disabled) {
          onPress?.();
        }
      }}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View
        className="h-[72px] w-[72px] items-center justify-center rounded-full"
        style={[
          styles.controlButton,
          { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor },
          disabled && styles.disabledControlButton,
        ]}
      >
        <Ionicons name={iconName} size={iconSize} color={colors.iconColor} />
      </View>
      <Text
        className="mt-[10px] text-center font-poppins-semibold text-[15px] leading-[20px]"
        numberOfLines={1}
        style={{ color: colors.labelColor }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getLessonControlColors(
  tone: "call" | "speak",
  isActive: boolean,
) {
  if (tone === "speak") {
    return isActive
      ? {
          backgroundColor: "#19D229",
          borderColor: "#19D229",
          iconColor: "#FFFFFF",
          labelColor: "#12851D",
        }
      : {
          backgroundColor: "#FFFFFF",
          borderColor: "#E4E7F1",
          iconColor: "#07133A",
          labelColor: "#0D132B",
        };
  }

  return isActive
    ? {
        backgroundColor: "#FF3F46",
        borderColor: "#FF3F46",
        iconColor: "#FFFFFF",
        labelColor: "#D92830",
      }
    : {
        backgroundColor: "#5B3BF6",
        borderColor: "#5B3BF6",
        iconColor: "#FFFFFF",
        labelColor: "#4D32D2",
      };
}

type ChatCaption = LiveCaption & {
  isPlaceholder?: boolean;
};

type ChatCaptionBubbleProps = {
  caption: ChatCaption;
};

function ChatCaptionBubble({ caption }: ChatCaptionBubbleProps) {
  const isTeacher = caption.role === "teacher";

  return (
    <View
      className={`mb-[13px] flex-row items-end ${
        isTeacher ? "justify-start" : "justify-end"
      }`}
    >
      {isTeacher ? (
        <Image
          source={images.aiTeacherFoxSweater}
          className="mr-[8px] h-[34px] w-[34px] rounded-full bg-white"
          resizeMode="cover"
        />
      ) : null}

      <View
        className={`max-w-[78%] rounded-[20px] px-[16px] py-[12px] ${
          isTeacher ? "rounded-bl-[6px] bg-white" : "rounded-br-[6px] bg-[#5B3BF6]"
        }`}
        style={styles.chatBubble}
      >
        <Text
          className={`font-poppins-semibold text-[15px] leading-[22px] ${
            isTeacher ? "text-lingua-text-primary" : "text-white"
          } ${caption.isPlaceholder ? "opacity-70" : ""}`}
        >
          {caption.text}
        </Text>
      </View>
    </View>
  );
}

function getAudioCallCopy(
  status:
    | "idle"
    | "starting"
    | "connecting-agent"
    | "ready"
    | "joining"
    | "joined"
    | "muting"
    | "ending"
    | "ended"
    | "error",
  errorMessage: string | null,
  isSpeaking: boolean,
) {
  switch (status) {
    case "starting":
      return {
        body: "正在建立私人 Stream 語音課程。",
        header: "啟動中",
        prompt: "正在準備你的語音課程...",
        status,
      };
    case "connecting-agent":
      return {
        body: "正在讓 AI 老師加入這堂課。",
        header: "老師加入中",
        prompt: "AI 老師正在加入...",
        status,
      };
    case "ready":
      return {
        body: "語音課程已準備好。點通話開始和老師練習。",
        header: "已準備",
        prompt: "課程已準備好，準備好時點通話。",
        status,
      };
    case "joining":
      return {
        body: "正在連線到即時 Stream 語音通話。",
        header: "連線中",
        prompt: "正在連接你的語音...",
        status,
      };
    case "joined":
      return {
        body: isSpeaking
          ? "正在聆聽。說完後點送出。"
          : "你已進入課程。點說話，說完後再點送出。",
        header: "進行中",
        prompt: isSpeaking ? "現在開始說，說完點送出。" : "點說話來回答。",
        status,
      };
    case "muting":
      return {
        body: "正在更新說話與送出控制。",
        header: "更新中",
        prompt: "正在更新控制...",
        status,
      };
    case "ending":
      return {
        body: "正在結束 Stream 語音通話。",
        header: "結束中",
        prompt: "正在結束你的課程通話...",
        status,
      };
    case "ended":
      return {
        body: "語音通話已結束。點通話建立新的課程。",
        header: "已結束",
        prompt: "通話已結束，練習得很好。",
        status,
      };
    case "error":
      return {
        body: errorMessage ?? "語音課程發生錯誤。",
        header: "需要處理",
        prompt: "語音設定需要處理。",
        status,
      };
    default:
      return {
        body: "為這堂課開始 Stream 語音課程。",
        header: "線上",
        prompt: undefined,
        status,
      };
  }
}

function getAgentStatusCopy(
  status: "idle" | "connecting" | "connected" | "failed",
) {
  switch (status) {
    case "connecting":
      return { color: "#FFB020", label: "連線中" };
    case "connected":
      return { color: "#19D229", label: "已連線" };
    case "failed":
      return { color: "#FF3F46", label: "連線失敗" };
    default:
      return { color: "#8B93A8", label: "待命" };
  }
}

function getChatCaptions(captions: LiveCaption[], fallbackText: string) {
  if (captions.length > 0) {
    return captions.slice(-8);
  }

  return [
    {
      createdAt: Date.now(),
      id: "teacher-placeholder",
      isPlaceholder: true,
      role: "teacher" as const,
      speakerId: "lingua-ai-teacher",
      speakerName: "AI 老師",
      text: fallbackText,
    },
  ];
}

type LessonTabBarProps = {
  activeTabRoute: "/ai-teacher" | "/learn";
};

function LessonTabBar({ activeTabRoute }: LessonTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 px-[14px]"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      <View
        className="h-[86px] flex-row items-center rounded-[28px] border border-[#F0F1F6] bg-white"
        style={styles.tabBar}
      >
        {tabItems.map((item) => {
          const isActive = item.route === activeTabRoute;

          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityState={isActive ? { selected: true } : {}}
              className="h-full flex-1 items-center justify-center"
              onPress={() => router.push(item.route)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Ionicons
                name={item.iconName}
                size={31}
                color={isActive ? "#5B3BF6" : "#64708E"}
              />
              <Text
                className={`mt-[6px] text-center font-poppins-semibold text-[13px] leading-[17px] ${
                  isActive ? "text-lingua-deep-purple" : "text-[#64708E]"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 14,
  },
  controlButton: {
    borderWidth: 1,
    shadowColor: "#0D132B",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  disabledControlButton: {
    opacity: 0.58,
  },
  feedbackCard: {
    shadowColor: "#0D132B",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
  },
  feedbackMetricDivider: {
    borderTopColor: "#ECEEF7",
    borderTopWidth: 1,
    paddingTop: 16,
  },
  disabledHeaderAction: {
    opacity: 0.55,
  },
  greetingBubble: {
    shadowColor: "#0D132B",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    zIndex: 2,
  },
  headerAction: {
    shadowColor: "#0D132B",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  chatBubble: {
    shadowColor: "#0D132B",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  chatTranscript: {
    bottom: 18,
    left: 16,
    position: "absolute",
    right: 16,
    top: 18,
    zIndex: 4,
  },
  chatTranscriptContent: {
    paddingBottom: 10,
    paddingTop: 4,
  },
  pressed: {
    opacity: 0.72,
  },
  previewHeader: {
    zIndex: 3,
  },
  controlsRow: {
    zIndex: 5,
  },
  tabBar: {
    shadowColor: "#0D132B",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  teacherBackground: {
    borderRadius: 28,
  },
  teacherPreview: {
    backgroundColor: "#C8C0BA",
  },
});
