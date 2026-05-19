import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { units } from "@/data/units";
import { useLanguageStore } from "@/store/UseLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DAILY_GOAL_XP = 20;
const PREVIEW_EARNED_XP = 15;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);

  const selectedLanguage =
    languages.find((language) => language.id === selectedLanguageId) ?? languages[0];
  const languageLessons = lessons
    .filter((lesson) => lesson.languageId === selectedLanguage.id)
    .sort((a, b) => a.order - b.order);
  const languageUnits = units
    .filter((unit) => unit.languageId === selectedLanguage.id)
    .sort((a, b) => a.order - b.order);
  const currentLesson = languageLessons[0];
  const currentUnit = languageUnits[0];
  const vocabularyCount = languageLessons.reduce(
    (total, lesson) => total + lesson.vocabulary.length,
    0,
  );
  const earnedXp = Math.min(PREVIEW_EARNED_XP, DAILY_GOAL_XP);
  const dailyProgress = (earnedXp / DAILY_GOAL_XP) * 100;
  const firstName =
    user?.firstName ?? user?.fullName?.split(" ")[0] ?? user?.username ?? "Learner";

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, 10) + 122,
            paddingTop: Math.max(insets.top + 18, 36),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center">
          <View className="h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full bg-white">
            <Image
              source={images.flags[selectedLanguage.flagKey]}
              className="h-[42px] w-[42px]"
              resizeMode="cover"
            />
          </View>

          <Text className="ml-[13px] flex-1 font-poppins-semibold text-[20px] leading-[28px] text-lingua-text-primary">
            Hola, {firstName}! 👋
          </Text>

          <View className="mr-[22px] flex-row items-center">
            <Image
              source={images.streakFire}
              className="h-[34px] w-[34px]"
              resizeMode="contain"
            />
            <Text className="ml-[6px] font-poppins-semibold text-[18px] leading-[25px] text-[#48516D]">
              12
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Notifications"
            hitSlop={12}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Ionicons name="notifications-outline" size={30} color="#0D132B" />
          </Pressable>
        </View>

        <View className="mt-[45px] flex-row items-center rounded-[18px] bg-[#FFF8EF] px-[24px] py-[22px]">
          <View className="flex-1">
            <Text className="font-poppins-semibold text-[17px] leading-[24px] text-[#34405C]">
              Daily goal
            </Text>
            <View className="mt-[10px] flex-row items-end">
              <Text className="font-poppins-bold text-[32px] leading-[40px] text-[#17203E]">
                {earnedXp}
              </Text>
              <Text className="mb-[5px] ml-[8px] font-poppins-semibold text-[17px] leading-[24px] text-[#7D87A3]">
                / {DAILY_GOAL_XP} XP
              </Text>
            </View>
            <View className="mt-[20px] h-[8px] overflow-hidden rounded-full bg-[#FFE5C7]">
              <View
                className="h-full rounded-full bg-[#FF7A00]"
                style={{ width: `${dailyProgress}%` as const }}
              />
            </View>
          </View>

          <Image
            source={images.treasure}
            className="ml-[22px] h-[92px] w-[92px]"
            resizeMode="contain"
          />
        </View>

        <View className="mt-[28px] overflow-hidden rounded-[18px] bg-lingua-deep-purple px-[25px] py-[24px]">
          <View className="absolute bottom-[-42px] left-[128px] h-[148px] w-[148px] rounded-full bg-[#4B32D1] opacity-35" />
          <View className="absolute right-[-18px] top-[26px] h-[116px] w-[116px] rounded-full bg-[#785CFF] opacity-45" />
          <Image
            source={images.palace}
            className="absolute bottom-[-6px] right-[-1px] h-[162px] w-[162px]"
            resizeMode="contain"
          />

          <Text className="font-poppins-semibold text-[17px] leading-[24px] text-white">
            Continue learning
          </Text>
          <Text className="mt-[13px] font-poppins-semibold text-[29px] leading-[37px] text-white">
            {selectedLanguage.name}
          </Text>
          <Text className="mt-[2px] font-poppins-medium text-[19px] leading-[27px] text-white">
            A1 · Unit {currentUnit?.order ?? 1}
          </Text>

          <Pressable
            accessibilityRole="button"
            className="mt-[18px] h-[49px] w-[126px] items-center justify-center rounded-[15px] bg-white"
            style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}
          >
            <Text className="font-poppins-bold text-[18px] leading-[25px] text-lingua-deep-purple">
              Continue
            </Text>
          </Pressable>
        </View>

        <View className="mt-[31px] flex-row items-center justify-between">
          <Text className="font-poppins-semibold text-[21px] leading-[29px] text-lingua-text-primary">
            {"Today's plan"}
          </Text>
          <Pressable hitSlop={10} style={({ pressed }) => pressed && styles.pressed}>
            <Text className="font-poppins-bold text-[19px] leading-[27px] text-lingua-deep-purple">
              View all
            </Text>
          </Pressable>
        </View>

        <View className="mt-[22px] gap-[26px]">
          <PlanRow
            iconName="book"
            isComplete
            subtitle={currentLesson?.title ?? "Start your first lesson"}
            title="Lesson"
          />
          <PlanRow
            iconName="headset"
            subtitle="Talk about your day"
            title="AI Conversation"
          />
          <PlanRow
            iconName="chatbox-ellipses"
            subtitle={`${Math.max(vocabularyCount, 1)} words`}
            title="New words"
            variant="coral"
          />
        </View>

      </ScrollView>
    </View>
  );
}

type PlanRowProps = {
  iconName: keyof typeof Ionicons.glyphMap;
  isComplete?: boolean;
  subtitle: string;
  title: string;
  variant?: "purple" | "coral";
};

function PlanRow({
  iconName,
  isComplete = false,
  subtitle,
  title,
  variant = "purple",
}: PlanRowProps) {
  const iconBackground = variant === "coral" ? "bg-[#FF515B]" : "bg-lingua-deep-purple";

  return (
    <View className="flex-row items-center">
      <View
        className={`h-[52px] w-[52px] items-center justify-center rounded-[11px] ${iconBackground}`}
        style={styles.planIcon}
      >
        <Ionicons name={iconName} size={29} color="#FFFFFF" />
      </View>

      <View className="ml-[23px] flex-1">
        <Text className="font-poppins-semibold text-[18px] leading-[25px] text-lingua-text-primary">
          {title}
        </Text>
        <Text className="mt-[3px] font-poppins-medium text-[16px] leading-[23px] text-[#7F89A5]">
          {subtitle}
        </Text>
      </View>

      <View
        className={`h-[29px] w-[29px] items-center justify-center rounded-full ${
          isComplete ? "bg-lingua-deep-purple" : "border-2 border-[#8C94AE]"
        }`}
      >
        {isComplete ? <Ionicons name="checkmark" size={19} color="#FFFFFF" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  continueButton: {
    shadowColor: "#1B1450",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  planIcon: {
    shadowColor: "#5B3BF6",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  pressed: {
    opacity: 0.72,
  },
});
