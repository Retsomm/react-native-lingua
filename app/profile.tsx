import { useAuth, useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const [isSigningOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const emailAddress = user?.primaryEmailAddress?.emailAddress ?? "";
  const displayName = user?.fullName ?? user?.firstName ?? "Language Learner";

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setSigningOut(true);
    setSignOutError(null);

    try {
      await signOut();
      router.replace("/onboarding");
    } catch (error) {
      console.error("Failed to sign out", error);
      setSignOutError("Unable to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <View
      className="flex-1 bg-white px-[28px]"
      style={{
        paddingBottom: Math.max(insets.bottom, 24),
        paddingTop: Math.max(insets.top, 18) + 12,
      }}
    >
      <View className="mx-auto w-full max-w-[430px] flex-1">
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Go back"
            className="h-[44px] w-[44px] items-start justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={32} color="#06112B" />
          </Pressable>
          <Text className="font-poppins-bold text-[20px] leading-[28px] text-lingua-text-primary">
            Profile
          </Text>
          <View className="h-[44px] w-[44px]" />
        </View>

        <View className="mt-[38px] items-center">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              resizeMode="cover"
              className="h-[104px] w-[104px] rounded-full bg-[#f0f1f5]"
            />
          ) : (
            <View className="h-[104px] w-[104px] items-center justify-center rounded-full bg-[#f0f1f5]">
              <Ionicons name="person" size={48} color="#77819b" />
            </View>
          )}

          <Text className="mt-[18px] text-center font-poppins-bold text-[26px] leading-[34px] text-lingua-text-primary">
            {displayName}
          </Text>
          {emailAddress ? (
            <Text className="mt-[6px] text-center font-poppins text-[15px] leading-[22px] text-[#69728c]">
              {emailAddress}
            </Text>
          ) : null}
        </View>

        <View className="mt-[38px] gap-[14px]">
          <View className="rounded-[18px] border border-[#eef0f5] bg-white px-[20px] py-[18px]">
            <Text className="font-poppins-medium text-[14px] leading-[20px] text-[#77819b]">
              Account
            </Text>
            <Text className="mt-[8px] font-poppins-semibold text-[18px] leading-[26px] text-lingua-text-primary">
              Signed in with Clerk
            </Text>
          </View>

          <Pressable
            className="h-[62px] flex-row items-center justify-center gap-[10px] rounded-[14px] bg-[#ff4b4b]"
            disabled={isSigningOut}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color="#ffffff" />
            <Text className="font-poppins-bold text-[18px] leading-[25px] text-white">
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </Text>
          </Pressable>
          {signOutError ? (
            <Text className="text-center font-poppins text-[14px] leading-[21px] text-[#ff4b4b]">
              {signOutError}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
