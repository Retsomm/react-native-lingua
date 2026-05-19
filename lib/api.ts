import Constants from "expo-constants";
import { Platform } from "react-native";

function getConfiguredApiBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    Constants.expoConfig?.extra?.apiBaseUrl ??
    ""
  ).replace(/\/+$/, "");
}

export function getApiUrl(path: string) {
  if (Platform.OS === "web") {
    return path;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    "";
  const host = hostUri.split(":").slice(0, 2).join(":");

  if (!host) {
    const apiBaseUrl = getConfiguredApiBaseUrl();

    if (!apiBaseUrl) {
      throw new Error("Missing EXPO_PUBLIC_API_BASE_URL for native API calls.");
    }

    return `${apiBaseUrl}${path}`;
  }

  return `http://${host}${path}`;
}
