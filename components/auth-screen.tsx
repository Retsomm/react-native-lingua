import { images } from "@/constants/images";
import { identifyPostHogUser } from "@/lib/analytics";
import { useLanguageStore } from "@/store/UseLanguageStore";
import { useAuth, useSignIn, useSignUp, useSSO } from "@clerk/expo";
import {
  AntDesign,
  FontAwesome,
  FontAwesome5,
  Ionicons,
} from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

type AuthMode = "sign-in" | "sign-up";
type SocialStrategy =
  | "oauth_google"
  | "oauth_line"
  | "oauth_github"
  | "oauth_apple";

type AuthScreenProps = {
  mode: AuthMode;
};

const socialProviders = [
  {
    icon: <AntDesign name="google" size={28} color="#4285F4" />,
    label: "Continue with Google",
    strategy: "oauth_google",
  },
  {
    icon: <FontAwesome5 name="line" size={30} color="#06C755" />,
    label: "Continue with LINE",
    strategy: "oauth_line",
  },
  {
    icon: <FontAwesome name="github" size={31} color="#06112B" />,
    label: "Continue with GitHub",
    strategy: "oauth_github",
  },
  {
    icon: <FontAwesome name="apple" size={32} color="#06112B" />,
    label: "Continue with Apple",
    strategy: "oauth_apple",
  },
] satisfies {
  icon: ReactNode;
  label: string;
  strategy: SocialStrategy;
}[];

function getPendingSignUpMessage(status: string | null) {
  if (status === "missing_requirements") {
    return "Your account needs a little more information before sign up can finish.";
  }

  return "Sign up is not complete yet. Please finish the required account steps.";
}

function getPendingSignInMessage(status: string | null) {
  if (status === "needs_second_factor" || status === "needs_client_trust") {
    return "This account needs another verification step before sign in can finish.";
  }

  return "Sign in is not complete yet. Please finish the required account steps.";
}

function getAuthErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function getStableUserId(resource: unknown) {
  if (!resource || typeof resource !== "object") {
    return undefined;
  }

  if (
    "createdUserId" in resource &&
    typeof resource.createdUserId === "string"
  ) {
    return resource.createdUserId;
  }

  if (
    "user" in resource &&
    resource.user &&
    typeof resource.user === "object" &&
    "id" in resource.user &&
    typeof resource.user.id === "string"
  ) {
    return resource.user.id;
  }

  return undefined;
}

export function AuthScreen({ mode }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { signUp, fetchStatus: signUpStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { userId: authUserId } = useAuth();
  const posthog = usePostHog();
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerificationVisible, setVerificationVisible] = useState(false);
  const [isSocialAuthInProgress, setSocialAuthInProgress] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const isSignUp = mode === "sign-up";
  const isSubmitting =
    signInStatus === "fetching" ||
    signUpStatus === "fetching" ||
    isSocialAuthInProgress;
  const redirectUrl = Linking.createURL("oauth-callback");

  const handleEmailAuth = async () => {
    if (isSubmitting) {
      return;
    }

    const email = emailAddress.trim();

    if (!email) {
      setAuthError("Enter your email address.");
      return;
    }

    if (isSignUp && !password) {
      setAuthError("Enter a password.");
      return;
    }

    setAuthError(null);

    if (isSignUp) {
      posthog.capture("sign_up_submitted");
    } else {
      posthog.capture("sign_in_submitted");
    }

    try {
      if (isSignUp) {
        const { error } = await signUp.password({
          emailAddress: email,
          password,
        });

        if (error) {
          setAuthError(error.message);
          return;
        }

        const { error: verificationError } =
          await signUp.verifications.sendEmailCode();

        if (verificationError) {
          setAuthError(verificationError.message);
          return;
        }
      } else {
        const { error } = await signIn.emailCode.sendCode({
          emailAddress: email,
        });

        if (error) {
          setAuthError(error.message);
          return;
        }
      }

      setVerificationVisible(true);
    } catch (error) {
      posthog.captureException(error, { auth_mode: mode });
      setAuthError(getAuthErrorMessage(error));
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (isSubmitting) {
      return;
    }

    setAuthError(null);

    try {
      if (isSignUp) {
        const { error } = await signUp.verifications.verifyEmailCode({ code });

        if (error) {
          setAuthError(error.message);
          return;
        }

        if (signUp.status !== "complete") {
          setAuthError(getPendingSignUpMessage(signUp.status));
          return;
        }

        const { error: finalizeError } = await signUp.finalize({
          navigate: async () => {
            router.replace("/");
          },
        });

        if (finalizeError) {
          setAuthError(finalizeError.message);
          return;
        }

        const newUserId = signUp.createdUserId;
        if (newUserId) {
          identifyPostHogUser({
            isSignUp: true,
            preferredLanguageId: selectedLanguageId,
            userId: newUserId,
          });
        }
        posthog.capture("sign_up_completed");
      } else {
        const { error } = await signIn.emailCode.verifyCode({ code });

        if (error) {
          setAuthError(error.message);
          return;
        }

        if (signIn.status !== "complete") {
          setAuthError(getPendingSignInMessage(signIn.status));
          return;
        }

        const { error: finalizeError } = await signIn.finalize({
          navigate: async () => {
            router.replace("/");
          },
        });

        if (finalizeError) {
          setAuthError(finalizeError.message);
          return;
        }

        const signedInUserId = getStableUserId(signIn);
        if (signedInUserId) {
          identifyPostHogUser({
            preferredLanguageId: selectedLanguageId,
            userId: signedInUserId,
          });
        }
        posthog.capture("sign_in_completed");
      }

      setVerificationVisible(false);
      router.replace("/");
    } catch (error) {
      posthog.captureException(error, { auth_mode: mode });
      setAuthError(getAuthErrorMessage(error));
    }
  };

  const handleSocialAuth = async (strategy: SocialStrategy) => {
    if (isSubmitting) {
      return;
    }

    setSocialAuthInProgress(true);
    setAuthError(null);

    posthog.capture("social_auth_started", { strategy, auth_mode: mode });

    try {
      try {
        await WebBrowser.dismissBrowser();
      } catch {
        // No browser session is open. Continue with a new OAuth attempt.
      }

      const {
        createdSessionId,
        setActive,
        signIn: ssoSignIn,
        signUp: ssoSignUp,
      } = await startSSOFlow({
        redirectUrl,
        strategy,
      });

      const sessionId =
        createdSessionId ??
        ssoSignIn?.createdSessionId ??
        ssoSignUp?.createdSessionId;

      if (sessionId) {
        await setActive?.({ session: sessionId });
        const completedUserId =
          getStableUserId(ssoSignUp) ?? getStableUserId(ssoSignIn) ?? authUserId;

        if (completedUserId) {
          identifyPostHogUser({
            isSignUp: Boolean(ssoSignUp?.createdUserId),
            preferredLanguageId: selectedLanguageId,
            userId: completedUserId,
          });
        }
        posthog.capture("social_auth_completed", { strategy, auth_mode: mode });
        router.replace("/");
        return;
      }

      if (ssoSignIn) {
        setAuthError(getPendingSignInMessage(ssoSignIn.status));
        return;
      }

      if (ssoSignUp) {
        setAuthError(getPendingSignUpMessage(ssoSignUp.status));
        return;
      }

      setAuthError("Social sign in was cancelled or could not be completed.");
    } catch (error) {
      posthog.captureException(error, { strategy, auth_mode: mode });
      setAuthError(getAuthErrorMessage(error));
    } finally {
      setSocialAuthInProgress(false);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Math.max(insets.bottom, 28) + 18,
          paddingHorizontal: 32,
          paddingTop: Math.max(insets.top + 2, 24),
        }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto min-h-full w-full max-w-[430px] flex-1">
          <Pressable
            accessibilityLabel="Go back"
            className="h-[38px] w-[38px] items-start justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={34} color="#06112B" />
          </Pressable>

          <View className="mt-[18px]">
            <Text className="font-poppins-bold text-[31px] leading-[40px] text-lingua-text-primary">
              {isSignUp ? "Create your account" : "Welcome back"}
            </Text>
            <Text className="mt-[16px] font-poppins text-[19px] leading-[27px] text-[#69728c]">
              {isSignUp
                ? "Start your language journey today "
                : "Continue your language journey "}
              {"\u2728"}
            </Text>
          </View>

          <View className="relative mt-[21px] h-[150px] items-center overflow-hidden">
            <Text className="absolute left-[82px] top-[37px] font-poppins-bold text-[24px] leading-[28px] text-[#ff8a00]">{"\u2726"}</Text>
            <Text className="absolute right-[74px] top-[45px] font-poppins-bold text-[24px] leading-[28px] text-[#6aa8ff]">{"\u2726"}</Text>
            <Text className="absolute right-[92px] top-[86px] font-poppins-bold text-[25px] leading-[29px] text-[#ffd13d]">{"\u2726"}</Text>
            <Image
              source={images.mascotAuth}
              resizeMode="contain"
              style={{ height: 176, marginTop: 10, width: 222 }}
            />
          </View>

          <View className="gap-[16px]">
            <View className="h-[86px] justify-center rounded-[16px] border border-[#eef0f5] bg-white px-[19px]">
              <Text className="font-poppins-medium text-[15px] leading-[21px] text-[#77819b]">
                Email
              </Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmailAddress}
                placeholder="alex@gmail.com"
                placeholderTextColor="#06112B"
                textContentType="emailAddress"
                value={emailAddress}
                style={styles.textInput}
              />
            </View>

            {isSignUp ? (
              <View className="h-[86px] flex-row items-center rounded-[16px] border border-[#eef0f5] bg-white px-[19px]">
                <View className="flex-1">
                  <Text className="font-poppins-medium text-[15px] leading-[21px] text-[#77819b]">
                    Password
                  </Text>
                  <TextInput
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                    placeholderTextColor="#06112B"
                    textContentType="newPassword"
                    value={password}
                    style={styles.textInput}
                  />
                </View>
                <Pressable
                  accessibilityLabel={
                    isPasswordVisible ? "Hide password" : "Show password"
                  }
                  className="h-[44px] w-[44px] items-end justify-center"
                  onPress={() => setPasswordVisible((current) => !current)}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                    size={28}
                    color="#77819b"
                  />
                </Pressable>
              </View>
            ) : null}
          </View>

          <Pressable
            className="mt-[25px] h-[68px] items-center justify-center rounded-[14px] bg-lingua-deep-purple"
            disabled={isSubmitting}
            onPress={handleEmailAuth}
          >
            <Text className="font-poppins-bold text-[22px] leading-[29px] text-white">
              {isSubmitting ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
            </Text>
          </Pressable>
          {authError ? (
            <Text className="mt-[12px] text-center font-poppins text-[14px] leading-[21px] text-[#ff4b4b]">
              {authError}
            </Text>
          ) : null}

          <View className="mt-[35px] flex-row items-center gap-[20px]">
            <View className="h-px flex-1 bg-[#e8eaf1]" />
            <Text className="font-poppins text-[18px] leading-[24px] text-[#77819b]">
              or continue with
            </Text>
            <View className="h-px flex-1 bg-[#e8eaf1]" />
          </View>

          <View className="mt-[25px] gap-[14px]">
            {socialProviders.map((provider) => (
              <Pressable
                key={provider.label}
                className="h-[64px] flex-row items-center rounded-[16px] border border-[#f0f1f5] bg-white px-[42px]"
                disabled={isSubmitting}
                onPress={() => handleSocialAuth(provider.strategy)}
              >
                <View className="w-[48px] items-start">{provider.icon}</View>
                <Text className="font-poppins-medium text-[18px] leading-[24px] text-lingua-text-primary">
                  {provider.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="flex-1" />

          <View className="mt-[44px] flex-row justify-center">
            <Text className="font-poppins text-[17px] leading-[24px] text-[#77819b]">
              {isSignUp ? "Already have an account? " : "Need an account? "}
            </Text>
            <Pressable
              onPress={() => router.push(isSignUp ? "/sign-in" : "/sign-up")}
            >
              <Text className="font-poppins-semibold text-[17px] leading-[24px] text-lingua-deep-purple">
                {isSignUp ? "Log in" : "Sign up"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <VerificationModal
        error={authError}
        isSubmitting={isSubmitting}
        onCodeComplete={handleVerifyCode}
        visible={isVerificationVisible}
        onClose={() => setVerificationVisible(false)}
      />
    </>
  );
}

type VerificationModalProps = {
  error: string | null;
  isSubmitting: boolean;
  onCodeComplete: (code: string) => Promise<void>;
  onClose: () => void;
  visible: boolean;
};

function VerificationModal({
  error,
  isSubmitting,
  onClose,
  onCodeComplete,
  visible,
}: VerificationModalProps) {
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setCode("");
    }
  }, [visible]);

  const handleCodeChange = (value: string) => {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setCode(nextCode);

    if (nextCode.length === 6) {
      void onCodeComplete(nextCode);
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        style={styles.verificationKeyboardView}
      >
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-[28px] bg-white px-[28px] pb-[34px] pt-[28px]">
          <View className="mx-auto h-[4px] w-[48px] rounded-full bg-[#d9dde8]" />
          <Text className="mt-[28px] text-center font-poppins-bold text-[24px] leading-[31px] text-lingua-text-primary">
            Check your email
          </Text>
          <Text className="mt-[10px] text-center font-poppins text-[15px] leading-[23px] text-[#69728c]">
            We sent you a verification code. Enter the 6 digits below.
          </Text>
          {error ? (
            <Text className="mt-[12px] text-center font-poppins text-[14px] leading-[21px] text-[#ff4b4b]">
              {error}
            </Text>
          ) : null}

          <Pressable
            className="mt-[26px] flex-row justify-center gap-[10px]"
            onPress={() => inputRef.current?.focus()}
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <View
                key={index}
                className="h-[52px] w-[44px] items-center justify-center rounded-[12px] border border-[#e7e9f0] bg-white"
              >
                <Text className="font-poppins-bold text-[22px] leading-[29px] text-lingua-text-primary">
                  {code[index] ?? ""}
                </Text>
              </View>
            ))}
          </Pressable>

          <TextInput
            ref={inputRef}
            autoFocus
            keyboardType="number-pad"
            maxLength={6}
            onChangeText={handleCodeChange}
            editable={!isSubmitting}
            textContentType="oneTimeCode"
            value={code}
            style={styles.hiddenCodeInput}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  hiddenCodeInput: {
    height: 0,
    opacity: 0,
    position: "absolute",
    width: 0,
  },
  scrollView: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  textInput: {
    color: "#06112B",
    fontFamily: "Poppins-Regular",
    fontSize: 18,
    lineHeight: 24,
    marginTop: 10,
    padding: 0,
  },
  verificationKeyboardView: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    flex: 1,
    justifyContent: "flex-end",
  },
});
