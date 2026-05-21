import { images } from "@/constants/images";
import { defaultLanguageId, languages } from "@/data/languages";
import { useLanguageStore } from "@/store/UseLanguageStore";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/expo";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);

  const selectedLanguage =
    languages.find((language) => language.id === selectedLanguageId) ??
    languages.find((language) => language.id === defaultLanguageId) ??
    languages[0];

  const displayName =
    user?.fullName ?? user?.username ?? user?.primaryEmailAddress?.emailAddress ?? "學習者";
  const secondaryText =
    user?.primaryEmailAddress?.emailAddress ??
    user?.username ??
    "已登入你的學習帳號";
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleChangeLanguage = () => {
    router.push("/LanguageSelection");
  };

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
        <Text className="font-poppins-bold text-[31px] leading-[39px] text-lingua-text-primary">
          個人
        </Text>
        <Text className="mt-[6px] font-poppins text-[16px] leading-[24px] text-[#6E7894]">
          管理你的帳號與目前學習語言。
        </Text>

        <View className="mt-[30px] rounded-[28px] bg-[#FBFBFD] px-[22px] py-[24px]">
          <View className="flex-row items-center">
            <View className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-lingua-deep-purple">
              {user?.hasImage && user.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="h-[72px] w-[72px]"
                  resizeMode="cover"
                />
              ) : (
                <Text className="font-poppins-bold text-[25px] leading-[33px] text-white">
                  {initials}
                </Text>
              )}
            </View>

            <View className="ml-[18px] flex-1">
              <Text
                className="font-poppins-bold text-[24px] leading-[32px] text-lingua-text-primary"
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <Text
                className="mt-[4px] font-poppins text-[15px] leading-[22px] text-[#6E7894]"
                numberOfLines={1}
              >
                {secondaryText}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-[24px] rounded-[28px] border border-[#EEF0F5] bg-white px-[22px] py-[24px]">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-poppins-semibold text-[17px] leading-[24px] text-[#6E7894]">
                目前語言
              </Text>
              <Text className="mt-[6px] font-poppins-bold text-[28px] leading-[36px] text-lingua-text-primary">
                {selectedLanguage.name}
              </Text>
              <Text className="mt-[2px] font-poppins-medium text-[17px] leading-[25px] text-[#7D87A3]">
                {selectedLanguage.nativeName}
              </Text>
            </View>

            <View className="h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-full border border-[#EEF0F5] bg-white">
              <Image
                source={images.flags[selectedLanguage.flagKey]}
                className="h-[68px] w-[68px]"
                resizeMode="cover"
              />
            </View>
          </View>

          <View className="mt-[22px] flex-row items-center rounded-[20px] bg-[#F5F3FF] px-[18px] py-[16px]">
            <View className="h-[38px] w-[38px] items-center justify-center rounded-full bg-lingua-deep-purple">
              <Ionicons name="school" size={22} color="#FFFFFF" />
            </View>
            <Text className="ml-[14px] flex-1 font-poppins-medium text-[15px] leading-[22px] text-[#48516D]">
              {selectedLanguage.description}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="變更目前語言"
            className="mt-[18px] flex-row items-center justify-center rounded-[22px] bg-lingua-deep-purple px-[20px] py-[16px]"
            onPress={handleChangeLanguage}
            style={({ pressed }) => [styles.changeLanguageButton, pressed && styles.pressed]}
          >
            <Ionicons name="language" size={24} color="#FFFFFF" />
            <Text className="ml-[10px] font-poppins-bold text-[17px] leading-[25px] text-white">
              變更語言
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="登出"
          className="mt-[24px] flex-row items-center justify-center rounded-[24px] border border-[#FFE0E0] bg-[#FFF5F5] px-[22px] py-[18px]"
          onPress={handleSignOut}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Ionicons name="log-out-outline" size={26} color="#EF4444" />
          <Text className="ml-[10px] font-poppins-bold text-[18px] leading-[26px] text-[#EF4444]">
            登出
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "L";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const styles = StyleSheet.create({
  changeLanguageButton: {
    shadowColor: "#5B3BF6",
    shadowOffset: { height: 7, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  pressed: {
    opacity: 0.72,
  },
});
