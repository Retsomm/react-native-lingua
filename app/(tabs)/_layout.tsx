import { BottomTabBar } from "@/components/bottom-tab-bar";
import { useLanguageStore } from "@/store/UseLanguageStore";
import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";

export default function TabsLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const hasHydratedLanguage = useLanguageStore((state) => state.hasHydrated);
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);

  if (!isLoaded || !hasHydratedLanguage) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  if (!selectedLanguageId) {
    return <Redirect href="/LanguageSelection" />;
  }

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: "首頁" }} />
      <Tabs.Screen name="learn" options={{ title: "學習" }} />
      <Tabs.Screen name="ai-teacher" options={{ title: "AI 老師" }} />
      <Tabs.Screen name="chat" options={{ title: "聊天" }} />
      <Tabs.Screen name="profile" options={{ title: "個人" }} />
    </Tabs>
  );
}
