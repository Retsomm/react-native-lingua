import { images } from "@/constants/images";
import { lessons } from "@/data/lessons";
import { units } from "@/data/units";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LessonDetailScreen() {
  const insets = useSafeAreaInsets();
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = lessons.find((item) => item.id === lessonId);
  const unit = units.find((item) => item.id === lesson?.unitId);

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
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 10) + 34,
            paddingTop: Math.max(insets.top + 15, 30),
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
            <Ionicons name="chevron-back" size={35} color="#0D132B" />
          </Pressable>
          <Text className="ml-[18px] flex-1 font-poppins-semibold text-[24px] leading-[32px] text-lingua-text-primary">
            Lesson {lesson.order}
          </Text>
        </View>

        <View className="mt-[24px] overflow-hidden rounded-[28px] bg-[#F5F2FF] px-[24px] pt-[26px]">
          <Text className="font-poppins-semibold text-[16px] leading-[23px] text-lingua-deep-purple">
            {unit?.title ?? "Language Basics"}
          </Text>
          <Text className="mt-[8px] font-poppins-bold text-[32px] leading-[40px] text-lingua-text-primary">
            {lesson.title}
          </Text>
          <Text className="mt-[10px] font-poppins-medium text-[16px] leading-[24px] text-[#68718D]">
            {lesson.description}
          </Text>

          <View className="mt-[22px] flex-row gap-[12px]">
            <InfoPill iconName="time-outline" label={`${lesson.estimatedMinutes} min`} />
            <InfoPill iconName="flash-outline" label={`${lesson.xpReward} XP`} />
            <InfoPill iconName="sparkles-outline" label={lesson.mode} />
          </View>

          <Image
            source={images.mascotWelcome}
            className="mt-[4px] h-[155px] w-[155px] self-end"
            resizeMode="contain"
          />
        </View>

        <View className="mt-[28px]">
          <Text className="font-poppins-semibold text-[21px] leading-[29px] text-lingua-text-primary">
            Goals
          </Text>
          <View className="mt-[14px] gap-[10px]">
            {lesson.goals.map((goal) => (
              <View
                key={goal}
                className="flex-row items-center rounded-[18px] border border-[#EEF0F5] bg-white px-[18px] py-[16px]"
              >
                <Ionicons name="checkmark-circle" size={24} color="#20C933" />
                <Text className="ml-[12px] flex-1 font-poppins-medium text-[15px] leading-[22px] text-[#34405C]">
                  {goal}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-[28px]">
          <Text className="font-poppins-semibold text-[21px] leading-[29px] text-lingua-text-primary">
            Phrases
          </Text>
          <View className="mt-[14px] gap-[10px]">
            {lesson.phrases.map((phrase) => (
              <View
                key={phrase.id}
                className="rounded-[18px] border border-[#EEF0F5] bg-white px-[18px] py-[16px]"
              >
                <Text className="font-poppins-semibold text-[19px] leading-[27px] text-lingua-text-primary">
                  {phrase.phrase}
                </Text>
                <Text className="mt-[3px] font-poppins-medium text-[15px] leading-[22px] text-[#68718D]">
                  {phrase.translation} • {phrase.pronunciation}
                </Text>
                <Text className="mt-[8px] font-poppins-medium text-[14px] leading-[21px] text-[#8B94AD]">
                  {phrase.context}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-[28px]">
          <Text className="font-poppins-semibold text-[21px] leading-[29px] text-lingua-text-primary">
            Vocabulary
          </Text>
          <View className="mt-[14px] gap-[10px]">
            {lesson.vocabulary.map((item) => (
              <View
                key={item.id}
                className="rounded-[18px] border border-[#EEF0F5] bg-white px-[18px] py-[16px]"
              >
                <Text className="font-poppins-semibold text-[19px] leading-[27px] text-lingua-text-primary">
                  {item.term}
                </Text>
                <Text className="mt-[3px] font-poppins-medium text-[15px] leading-[22px] text-[#68718D]">
                  {item.translation} • {item.pronunciation}
                </Text>
                <Text className="mt-[8px] font-poppins-medium text-[14px] leading-[21px] text-[#8B94AD]">
                  {item.example}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

type InfoPillProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
};

function InfoPill({ iconName, label }: InfoPillProps) {
  return (
    <View className="flex-row items-center rounded-full bg-white px-[12px] py-[8px]">
      <Ionicons name={iconName} size={17} color="#5B3BF6" />
      <Text className="ml-[6px] font-poppins-semibold text-[13px] leading-[18px] text-[#5B3BF6]">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  pressed: {
    opacity: 0.72,
  },
});
