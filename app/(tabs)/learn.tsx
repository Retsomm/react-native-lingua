import { LessonCard, type LessonStatus } from "@/components/lesson-card";
import { images } from "@/constants/images";
import { defaultLanguageId, languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { units } from "@/data/units";
import { useLanguageStore } from "@/store/UseLanguageStore";
import type { Lesson } from "@/types/learning";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LearnTab = "lessons" | "practice";

const lessonArt = [
  images.lessonArt.completed,
  images.lessonArt.practice,
  images.lessonArt.inProgress,
  images.lessonArt.cafe,
  images.lessonArt.notStarted,
  images.mascotWelcome,
];

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const [activeTab, setActiveTab] = useState<LearnTab>("lessons");
  const heroHeight = width * (272 / 546);

  const selectedLanguage =
    languages.find((language) => language.id === selectedLanguageId) ??
    languages.find((language) => language.id === defaultLanguageId) ??
    languages[0];

  const languageUnits = useMemo(
    () =>
      units
        .filter((unit) => unit.languageId === selectedLanguage.id)
        .sort((a, b) => a.order - b.order),
    [selectedLanguage.id],
  );

  const currentUnit = languageUnits[0];
  const unitLessons = useMemo(() => {
    const lessonsForLanguage = lessons
      .filter((lesson) => lesson.languageId === selectedLanguage.id)
      .sort((a, b) => a.order - b.order);

    if (!currentUnit) {
      return lessonsForLanguage;
    }

    const lessonMap = new Map(
      lessonsForLanguage.map((lesson) => [lesson.id, lesson] as const),
    );
    const orderedUnitLessons = currentUnit.lessonIds
      .map((lessonId) => lessonMap.get(lessonId))
      .filter((lesson): lesson is Lesson => Boolean(lesson));

    return orderedUnitLessons.length > 0 ? orderedUnitLessons : lessonsForLanguage;
  }, [currentUnit, selectedLanguage.id]);

  const completedCount = Math.min(2, unitLessons.length);
  const activeLessonIndex = Math.min(completedCount, Math.max(unitLessons.length - 1, 0));
  const activeLesson = unitLessons[activeLessonIndex] ?? unitLessons[0];

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 10) + 122,
            paddingTop: Math.max(insets.top + 15, 30),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="返回"
            hitSlop={12}
            onPress={() => router.back()}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Ionicons name="chevron-back" size={35} color="#0D132B" />
          </Pressable>

          <View className="flex-1 px-[22px]">
            <Text className="font-poppins-semibold text-[25px] leading-[33px] text-lingua-text-primary">
              {activeLesson?.title ?? currentUnit?.title ?? selectedLanguage.name}
            </Text>
            <Text className="mt-[4px] font-poppins-medium text-[18px] leading-[25px] text-[#7A84A1]">
              單元 {currentUnit?.order ?? 1} • {completedCount} / {unitLessons.length} 堂課
            </Text>
          </View>

          <Pressable
            accessibilityLabel="儲存單元"
            hitSlop={12}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Ionicons name="bookmark-outline" size={34} color="#5B3BF6" />
          </Pressable>
        </View>

        <ImageBackground
          source={images.lessonArt.cafeScene}
          imageStyle={styles.heroImage}
          resizeMode="contain"
          style={[styles.hero, { height: heroHeight, width }]}
        />

        <View
          className="h-[80px] flex-row overflow-hidden rounded-[22px] bg-white/95"
          style={styles.segmentContainer}
        >
          <SegmentButton
            isActive={activeTab === "lessons"}
            label="課程"
            onPress={() => setActiveTab("lessons")}
          />
          <SegmentButton
            isActive={activeTab === "practice"}
            label="練習"
            onPress={() => setActiveTab("practice")}
          />
        </View>

        {activeTab === "lessons" ? (
          <View className="mt-[28px] gap-[12px]">
            {unitLessons.map((lesson, index) => (
              <LessonCard
                key={lesson.id}
                imageSource={getLessonImageSource(index)}
                lesson={lesson}
                lessonNumber={index + 1}
                onPress={() => {
                  router.push({
                    pathname: "/lesson/[lessonId]",
                    params: { lessonId: lesson.id },
                  });
                }}
                status={getLessonStatus(index)}
              />
            ))}
          </View>
        ) : (
          <View className="mt-[28px] gap-[12px]">
            {unitLessons.slice(0, 4).map((lesson, index) => (
              <Pressable
                key={lesson.id}
                accessibilityLabel={`練習${lesson.title}`}
                accessibilityRole="button"
                className="min-h-[96px] flex-row items-center rounded-[18px] border border-[#EEF0F5] bg-white px-[22px] py-[18px]"
                onPress={() =>
                  router.push({
                    pathname: "/lesson/[lessonId]",
                    params: { lessonId: lesson.id },
                  })
                }
                style={({ pressed }) => [styles.practiceCard, pressed && styles.pressed]}
              >
                <View className="h-[48px] w-[48px] items-center justify-center rounded-[14px] bg-[#F2EFFF]">
                  <Ionicons
                    name={index % 2 === 0 ? "mic-outline" : "chatbubble-ellipses-outline"}
                    size={27}
                    color="#5B3BF6"
                  />
                </View>
                <View className="ml-[18px] flex-1">
                  <Text className="font-poppins-semibold text-[18px] leading-[25px] text-lingua-text-primary">
                    {lesson.title}
                  </Text>
                  <Text className="mt-[4px] font-poppins-medium text-[15px] leading-[22px] text-[#8B94AD]">
                    {lesson.activities.length} 個快速練習題
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#8B94AD" />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getLessonStatus(index: number): LessonStatus {
  if (index < 2) {
    return "completed";
  }

  if (index === 2) {
    return "in-progress";
  }

  return "not-started";
}

function getLessonImageSource(index: number) {
  const status = getLessonStatus(index);

  if (status === "not-started") {
    return images.lessonArt.notStarted;
  }

  return lessonArt[index % lessonArt.length];
}

type SegmentButtonProps = {
  isActive: boolean;
  label: string;
  onPress: () => void;
};

function SegmentButton({ isActive, label, onPress }: SegmentButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      className="flex-1 items-center justify-center bg-white"
      onPress={onPress}
      style={({ pressed }) => [
        isActive && styles.activeSegment,
        pressed && styles.pressed,
      ]}
    >
      <Text
        className={`font-poppins-semibold text-[20px] leading-[28px] ${
          isActive ? "text-lingua-deep-purple" : "text-[#65708E]"
        }`}
      >
        {label}
      </Text>
      {isActive ? <View className="absolute bottom-0 h-[4px] w-full rounded-full bg-lingua-deep-purple" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeSegment: {
    borderRadius: 22,
    shadowColor: "#5B3BF6",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  content: {
    paddingHorizontal: 24,
  },
  hero: {
    backgroundColor: "#FFFFFF",
    marginLeft: -24,
    marginTop: 19,
    overflow: "hidden",
  },
  heroImage: {
    borderRadius: 0,
  },
  practiceCard: {
    shadowColor: "#0D132B",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.035,
    shadowRadius: 12,
  },
  pressed: {
    opacity: 0.72,
  },
  segmentContainer: {
    marginHorizontal: -5,
    marginTop: -1,
  },
});
