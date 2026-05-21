import { useAuth } from "@clerk/expo";
import { images } from "@/constants/images";
import { Redirect, router } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

export default function OnboardingScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <View
      className="flex-1 overflow-hidden bg-white"
      style={{
        paddingBottom: Math.max(insets.bottom, 20) + 12,
        paddingHorizontal: 32,
        paddingTop: insets.top + 24,
      }}
    >
      <View className="mx-auto w-full max-w-[430px] flex-1">
        <View className="flex-row items-center justify-center gap-[8px]">
          <Image
            source={images.mascotLogo}
            resizeMode="contain"
            style={{ height: 24, width: 24 }}
          />
          <Text className="font-poppins-bold text-[18px] leading-[24px] text-lingua-text-primary">
            lingua
          </Text>
        </View>

        <View className="mt-[42px]">
          <Text className="font-poppins-bold text-[31px] leading-[40px] text-lingua-text-primary">
            你的 AI 語言{"\n"}
            <Text className="text-lingua-deep-purple">老師。</Text>
          </Text>
          <Text className="mt-[16px] font-poppins text-[19px] leading-[27px] text-[#69728c]">
            真實對話、個人化課程，隨時隨地{"\n"}
            都能開始練習。
          </Text>
        </View>

        <View className="relative mt-[32px] min-h-[360px] items-center">
          <Text className="absolute left-[10px] top-[142px] font-poppins-bold text-[14px] leading-[18px] text-lingua-text-primary">
            哈囉！
          </Text>
          <Text className="absolute right-[2px] top-[42px] font-poppins-bold text-[14px] leading-[18px] text-lingua-text-primary">
            ¡Hola!
          </Text>
          <Text className="absolute right-[5px] top-[252px] font-poppins-bold text-[14px] leading-[18px] text-[#ff6b7a]">
            你好!
          </Text>

          <Image
            source={images.mascotWelcome}
            resizeMode="contain"
            style={{ height: 284, marginTop: 82, width: 284 }}
          />
        </View>

        <View className="flex-1" />

        <Pressable
          className="mt-8 h-[68px] overflow-hidden rounded-[14px] bg-lingua-deep-purple px-8"
          onPress={async () => {
            posthog.capture("onboarding_get_started_tapped");
            await posthog.flush().catch((flushError) => {
              console.error("Failed to flush onboarding analytics event", flushError);
            });
            router.push("/sign-up");
          }}
        >
          <View className="h-full flex-row items-center justify-center gap-2">
            <Text className="font-poppins-bold text-[22px] leading-[29px] text-white">
              開始學習
            </Text>
            <Text className="font-poppins text-[32px] leading-[32px] text-white">
              ›
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
