import { images } from "@/constants/images";
import { Link } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const mascotWelcome = require("../assets/images/mascot-welcome.png");

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: Math.max(insets.bottom, 20) + 12,
        paddingHorizontal: 45,
        paddingTop: insets.top + 24,
      }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="mx-auto min-h-full w-full max-w-[430px] flex-1">
        <View className="flex-row items-center justify-center gap-2">
          <Image
            source={images.mascotLogo}
            resizeMode="contain"
            style={{ height: 18, width: 18 }}
          />
          <Text className="font-poppins-bold text-[14px] leading-[18px] text-lingua-text-primary">
            lingua
          </Text>
        </View>

        <View className="mt-[42px]">
          <Text className="font-poppins-bold text-[24px] leading-[31px] text-lingua-text-primary">
            Your AI language{"\n"}
            <Text className="text-lingua-deep-purple">teacher.</Text>
          </Text>
          <Text className="mt-[10px] font-poppins text-[11px] leading-[16px] text-[#626b85]">
            Real conversations, personalized lessons, anytime,{"\n"}
            anywhere.
          </Text>
        </View>

        <View className="relative mt-[36px] min-h-[336px] items-center">
          <Text className="absolute left-[9px] top-[134px] font-poppins-bold text-[9px] leading-[12px] text-lingua-text-primary">
            Hello!
          </Text>
          <Text className="absolute right-[2px] top-[38px] font-poppins-bold text-[10px] leading-[13px] text-lingua-text-primary">
            ¡Hola!
          </Text>
          <Text className="absolute right-[5px] top-[240px] font-poppins-bold text-[10px] leading-[13px] text-[#ff6b7a]">
            你好!
          </Text>

          <Image
            source={mascotWelcome}
            resizeMode="contain"
            style={{ height: 245, marginTop: 91, width: 245 }}
          />
        </View>

        <View className="flex-1" />

        <Link href="/" asChild>
          <Pressable className="mt-8 h-[57px] overflow-hidden rounded-[8px] bg-lingua-deep-purple px-8">
            <View className="h-full flex-row items-center justify-center gap-2">
              <Text className="font-poppins-bold text-[12px] leading-[16px] text-white">
                Get Started
              </Text>
              <Text className="font-poppins text-[24px] leading-[24px] text-white">
                ›
              </Text>
            </View>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}
