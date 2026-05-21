import { useLanguageStore } from "@/store/UseLanguageStore";
import { useThemeStore } from "@/store/use-theme-store";
import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const hasHydratedLanguage = useLanguageStore((state) => state.hasHydrated);
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const theme = useThemeStore((state) => state.theme);
  const hasHydratedTheme = useThemeStore((state) => state.hasHydrated);
  const activeTheme = hasHydratedTheme ? theme : "light";

  if (!isLoaded || !hasHydratedLanguage) {
    return (
      <View
        className={`flex-1 bg-lingua-background ${activeTheme === "dark" ? "theme-dark" : ""}`}
      />
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!selectedLanguageId) {
    return <Redirect href="/LanguageSelection" />;
  }

  return <Redirect href="/home" />;
}
