import Constants from "expo-constants";
import { Platform } from "react-native";

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
    return path;
  }

  return `http://${host}${path}`;
}
