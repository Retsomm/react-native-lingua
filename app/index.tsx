import { useLanguageStore } from "@/store/UseLanguageStore";
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const hasHydratedLanguage = useLanguageStore((state) => state.hasHydrated);
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);

  if (!isLoaded || !hasHydratedLanguage) {
    return <View className="flex-1 bg-lingua-background" />;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!selectedLanguageId) {
    return <Redirect href="/LanguageSelection" />;
  }

  return <Redirect href="/home" />;
}
