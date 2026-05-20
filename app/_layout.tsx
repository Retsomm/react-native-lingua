import "../global.css";

import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { Stack, useGlobalSearchParams, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef } from "react";
import { PostHogProvider } from "posthog-react-native";
import { identifyPostHogUser } from "@/lib/analytics";
import { posthog } from "@/lib/posthog";
import { useLanguageStore } from "@/store/UseLanguageStore";

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!clerkPublishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

const sensitiveParamPattern = /(token|auth|email|id|session|secret|password|code)/i;

function getSafeSearchParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => {
      if (sensitiveParamPattern.test(key)) {
        return false;
      }

      return typeof value === "string" || Array.isArray(value);
    }),
  );
}

function PostHogUserIdentifier() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const lastIdentifySignature = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      lastIdentifySignature.current = null;
      return;
    }

    const identifySignature = `${userId}:${selectedLanguageId ?? "none"}`;

    if (lastIdentifySignature.current === identifySignature) {
      return;
    }

    lastIdentifySignature.current = identifySignature;
    identifyPostHogUser({
      preferredLanguageId: selectedLanguageId,
      userId,
    });
  }, [isLoaded, isSignedIn, selectedLanguageId, userId]);

  return null;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
  });

  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);
  const didCaptureAppOpened = useRef(false);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      const safeParams = getSafeSearchParams(params);

      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...safeParams,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  useEffect(() => {
    if ((!loaded && !error) || didCaptureAppOpened.current) {
      return;
    }

    didCaptureAppOpened.current = true;
    posthog.capture("app_opened");
    posthog.flush().catch((flushError) => {
      console.error("Failed to flush app_opened analytics event", flushError);
    });
  }, [error, loaded]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [error, loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ["testID"],
        maxElementsCaptured: 20,
      }}
    >
      <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
        <PostHogUserIdentifier />
        <Stack screenOptions={{ headerShown: false }} />
      </ClerkProvider>
    </PostHogProvider>
  );
}
