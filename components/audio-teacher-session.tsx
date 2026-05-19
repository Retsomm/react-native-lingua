import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import type { Lesson } from "@/types/learning";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconName = keyof typeof Ionicons.glyphMap;

const sessionControls: {
  iconName: IoniconName;
  iconSize: number;
  isDestructive?: boolean;
  label: string;
}[] = [
  { iconName: "videocam", iconSize: 29, label: "Camera" },
  { iconName: "mic", iconSize: 35, label: "Mic" },
  { iconName: "language", iconSize: 34, label: "Subtitles" },
  { iconName: "call", iconSize: 35, isDestructive: true, label: "End Call" },
];

const feedbackMetrics = [
  { color: "#19D229", label: "Speaking", value: "Excellent" },
  { color: "#2085FF", label: "Pronunciation", value: "Great" },
  { color: "#5034FF", label: "Grammar", value: "Good" },
];

const tabItems: { iconName: IoniconName; label: string; route: Href }[] = [
  { iconName: "home-outline", label: "Home", route: "/home" },
  { iconName: "book", label: "Learn", route: "/learn" },
  { iconName: "headset-outline", label: "AI Teacher", route: "/ai-teacher" },
  { iconName: "chatbubble-outline", label: "Chat", route: "/chat" },
  { iconName: "person-outline", label: "Profile", route: "/profile" },
];

type AudioTeacherSessionProps = {
  activeTabLabel?: "AI Teacher" | "Learn";
  lesson?: Lesson;
  showEmbeddedTabBar?: boolean;
};

export function AudioTeacherSession({
  activeTabLabel = "AI Teacher",
  lesson,
  showEmbeddedTabBar = false,
}: AudioTeacherSessionProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const language = languages.find((item) => item.id === lesson?.languageId);
  const previewHeight = Math.min(610, Math.max(540, width * 1.43));

  if (!lesson) {
    return (
      <View
        className="flex-1 items-center justify-center bg-white px-[28px]"
        style={{ paddingBottom: insets.bottom, paddingTop: insets.top }}
      >
        <Text className="text-center font-poppins-semibold text-[22px] leading-[30px] text-lingua-text-primary">
          Lesson not found
        </Text>
        <Pressable
          className="mt-[18px] rounded-[18px] bg-lingua-deep-purple px-[22px] py-[14px]"
          onPress={() => router.back()}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text className="font-poppins-bold text-[16px] leading-[23px] text-white">
            Go back
          </Text>
        </Pressable>
      </View>
    );
  }

  const primaryPhrase = lesson.phrases[0];
  const languageName = language?.name ?? "Language";
  const goal = lesson.goals[0] ?? lesson.description;

  return (
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
            accessibilityLabel="Go back"
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
              AI Teacher
            </Text>
            <View className="mt-[4px] flex-row items-center">
              <View className="h-[13px] w-[13px] rounded-full bg-[#19D229]" />
              <Text
                className="ml-[8px] flex-1 font-poppins-medium text-[17px] leading-[23px] text-[#4E5874]"
                numberOfLines={1}
              >
                {languageName} • Online
              </Text>
            </View>
          </View>

          <HeaderAction
            accessibilityLabel="Camera unavailable"
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
            accessibilityLabel="Notifications unavailable"
            disabled
            iconName="notifications-outline"
            testID="audio-teacher-header-notifications"
          />
        </View>

        <ImageBackground
          source={images.lessonArt.homeBackground}
          className="mt-[32px] overflow-hidden rounded-[28px]"
          imageStyle={styles.teacherBackground}
          resizeMode="cover"
          style={[styles.teacherPreview, { height: previewHeight }]}
        >
          <View className="absolute inset-0 bg-black/10" />

          <Image
            source={images.aiTeacherFoxSweater}
            className="absolute bottom-[150px] left-[-18px] h-[400px] w-[350px]"
            resizeMode="contain"
            style={styles.previewMascot}
          />

          <View
            className="absolute bottom-[178px] left-[72px] right-[52px] flex-row items-center rounded-[24px] bg-white px-[24px] py-[20px]"
            style={styles.responseBubble}
          >
            <Text
              className="flex-1 font-poppins-semibold text-[20px] leading-[28px] text-lingua-text-primary"
              numberOfLines={2}
            >
              {primaryPhrase?.translation ?? primaryPhrase?.phrase ?? "Repeat after me."}
            </Text>
            <Ionicons name="volume-high" size={30} color="#5B3BF6" />
            <View className="absolute bottom-[-19px] right-[28px] h-0 w-0 border-l-[22px] border-t-[22px] border-l-transparent border-t-white" />
          </View>

          <View
            className="absolute bottom-[42px] left-0 right-0 flex-row justify-between px-[20px]"
            style={styles.controlsRow}
          >
            {sessionControls.map((control) => (
              <LessonControl key={control.label} {...control} />
            ))}
          </View>
        </ImageBackground>

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
            Lesson goal
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

      {showEmbeddedTabBar ? <LessonTabBar activeTabLabel={activeTabLabel} /> : null}
    </View>
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
  iconName,
  iconSize,
  isDestructive,
  label,
}: (typeof sessionControls)[number]) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className="w-[76px] items-center"
      onPress={() => {
        if (isDestructive) {
          router.back();
        }
      }}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View
        className={`h-[72px] w-[72px] items-center justify-center rounded-full ${
          isDestructive ? "bg-[#FF3F46]" : "bg-white"
        }`}
        style={styles.controlButton}
      >
        <Ionicons name={iconName} size={iconSize} color={isDestructive ? "#FFFFFF" : "#07133A"} />
      </View>
      <Text
        className="mt-[10px] text-center font-poppins-semibold text-[15px] leading-[20px] text-white"
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type LessonTabBarProps = {
  activeTabLabel: "AI Teacher" | "Learn";
};

function LessonTabBar({ activeTabLabel }: LessonTabBarProps) {
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
          const isActive = item.label === activeTabLabel;

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
    shadowColor: "#0D132B",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
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
  headerAction: {
    shadowColor: "#0D132B",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  pressed: {
    opacity: 0.72,
  },
  previewHeader: {
    zIndex: 3,
  },
  previewMascot: {
    zIndex: 1,
  },
  responseBubble: {
    shadowColor: "#0D132B",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    zIndex: 4,
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
