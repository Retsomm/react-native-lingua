import PostHog from "posthog-react-native";
import Constants from "expo-constants";

const apiKeyRaw = Constants.expoConfig?.extra?.posthogProjectToken;
const hostRaw = Constants.expoConfig?.extra?.posthogHost;

const apiKey =
  typeof apiKeyRaw === "string" && apiKeyRaw.trim() !== ""
    ? apiKeyRaw.trim()
    : undefined;
const host =
  typeof hostRaw === "string" && hostRaw.trim() !== "" ? hostRaw.trim() : undefined;
const isPostHogConfigured = Boolean(
  apiKey && apiKey !== "phc_your_project_token_here",
);

export const posthog = new PostHog(apiKey ?? "", {
  host,
  disabled: !isPostHogConfigured,
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
  maxBatchSize: 100,
  maxQueueSize: 1000,
  preloadFeatureFlags: true,
  fetchRetryCount: 3,
  fetchRetryDelay: 3000,
});
