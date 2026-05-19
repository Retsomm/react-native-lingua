import { AudioTeacherSession } from "@/components/audio-teacher-session";
import { lessons } from "@/data/lessons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LessonDetailScreen() {
  const insets = useSafeAreaInsets();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = lessons.find((item) => item.id === lessonId);

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

  return (
    <AudioTeacherSession
      activeTabLabel="Learn"
      autoStartCall
      lesson={lesson}
      onCallEnded={() => router.replace("/learn")}
    />
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.72,
  },
});
