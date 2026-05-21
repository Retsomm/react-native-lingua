import { AudioTeacherSession } from "@/components/audio-teacher-session";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { captureLessonAbandoned, captureLessonStarted } from "@/lib/analytics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LessonDetailScreen() {
  const insets = useSafeAreaInsets();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = lessons.find((item) => item.id === lessonId);
  const lessonStartTimeRef = useRef<number | null>(null);
  const didCompleteLessonRef = useRef(false);
  const lastQuestionIndexRef = useRef(0);

  useEffect(() => {
    if (!lesson) {
      return;
    }

    const languageName =
      languages.find((language) => language.id === lesson.languageId)?.name ??
      lesson.languageId;

    lessonStartTimeRef.current = Date.now();
    didCompleteLessonRef.current = false;
    lastQuestionIndexRef.current = 0;
    captureLessonStarted(lesson, languageName);

    return () => {
      const startedAt = lessonStartTimeRef.current;

      if (!startedAt || didCompleteLessonRef.current) {
        return;
      }

      captureLessonAbandoned({
        lastQuestionIndex: lastQuestionIndexRef.current,
        lessonId: lesson.id,
        startedAt,
      });
    };
  }, [lesson]);

  if (!lesson) {
    return (
      <View
        className="flex-1 items-center justify-center bg-lingua-background px-[28px]"
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
    <AudioTeacherSession
      activeTabRoute="/learn"
      autoStartCall
      lesson={lesson}
      onCallEnded={() => {
        didCompleteLessonRef.current = true;
        router.replace("/learn");
      }}
    />
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.72,
  },
});
