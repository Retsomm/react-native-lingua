export default {
  expo: {
    name: "expo-app-2026",
    slug: "expo-app-2026",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "expoapp2026",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.expo-app-2026",
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: "server",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-localization",
      "expo-router",
      "expo-secure-store",
      "@clerk/expo",
      [
        "expo-build-properties",
        {
          android: {
            minSdkVersion: 24,
          },
        },
      ],
      "@stream-io/video-react-native-sdk",
      [
        "@config-plugins/react-native-webrtc",
        {
          cameraPermission:
            "$(PRODUCT_NAME) uses the camera for video lessons when enabled.",
          microphonePermission:
            "$(PRODUCT_NAME) uses the microphone for live audio lessons.",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      posthogProjectToken:
        process.env.POSTHOG_API_KEY ?? process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST,
    },
  },
};
