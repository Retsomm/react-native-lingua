import type { Lesson } from "@/types/learning";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

export type LessonStatus = "completed" | "in-progress" | "not-started";

type LessonCardProps = {
  imageSource: ImageSourcePropType;
  lesson: Lesson;
  lessonNumber: number;
  onPress: () => void;
  status: LessonStatus;
};

const statusCopy: Record<LessonStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  "not-started": "0 / 6 lessons",
};

export function LessonCard({
  imageSource,
  lesson,
  lessonNumber,
  onPress,
  status,
}: LessonCardProps) {
  const isActive = status === "in-progress";

  return (
    <Pressable
      accessibilityLabel={`Open lesson ${lessonNumber}: ${lesson.title}`}
      accessibilityRole="button"
      className={`min-h-[111px] flex-row items-center rounded-[18px] border bg-white px-[24px] py-[18px] ${
        isActive ? "border-lingua-deep-purple" : "border-[#EEF0F5]"
      }`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isActive && styles.activeCard,
        pressed && styles.pressed,
      ]}
    >
      <View className="flex-1 pr-[18px]">
        <Text
          className={`font-poppins-semibold text-[15px] leading-[21px] ${
            isActive ? "text-lingua-deep-purple" : "text-[#8B94AD]"
          }`}
        >
          Lesson {lessonNumber}
        </Text>
        <Text className="mt-[12px] font-poppins-semibold text-[18px] leading-[25px] text-lingua-text-primary">
          {lesson.title}
        </Text>
        <Text
          className={`mt-[5px] font-poppins-semibold text-[15px] leading-[21px] ${
            isActive ? "text-lingua-deep-purple" : "text-[#8B94AD]"
          }`}
        >
          {statusCopy[status]}
        </Text>
      </View>

      <View className="h-[46px] w-[46px] items-center justify-center">
        {status === "completed" ? (
          <View className="h-[31px] w-[31px] items-center justify-center rounded-full bg-[#20C933]">
            <Ionicons name="checkmark" size={23} color="#FFFFFF" />
          </View>
        ) : (
          <>
            <Image
              source={imageSource}
              className="h-[46px] w-[46px]"
              resizeMode="contain"
            />
            {status === "not-started" ? (
              <View className="absolute h-[31px] w-[31px] items-center justify-center rounded-[7px] border-2 border-[#68718D] bg-white">
                <Ionicons name="lock-closed-outline" size={20} color="#68718D" />
              </View>
            ) : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeCard: {
    backgroundColor: "#FBFAFF",
    borderWidth: 2,
  },
  card: {
    shadowColor: "#0D132B",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.035,
    shadowRadius: 12,
  },
  pressed: {
    opacity: 0.74,
  },
});
