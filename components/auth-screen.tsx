import { images } from "@/constants/images";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AuthMode = "sign-in" | "sign-up";

type AuthScreenProps = {
  mode: AuthMode;
};

const socialProviders = [
  {
    icon: <AntDesign name="google" size={28} color="#4285F4" />,
    label: "Continue with Google",
  },
  {
    icon: <FontAwesome name="facebook" size={31} color="#1877F2" />,
    label: "Continue with Facebook",
  },
  {
    icon: <FontAwesome name="apple" size={32} color="#06112B" />,
    label: "Continue with Apple",
  },
];

export function AuthScreen({ mode }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const [isVerificationVisible, setVerificationVisible] = useState(false);
  const isSignUp = mode === "sign-up";

  return (
    <>
      <ScrollView
        className="flex-1 bg-white"
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
                keyboardType="email-address"
                placeholder="alex@gmail.com"
                placeholderTextColor="#06112B"
                className="mt-[10px] p-0 font-poppins text-[18px] leading-[24px] text-lingua-text-primary"
              />
            </View>

            {isSignUp ? (
              <View className="h-[86px] flex-row items-center rounded-[16px] border border-[#eef0f5] bg-white px-[19px]">
                <View className="flex-1">
                  <Text className="font-poppins-medium text-[15px] leading-[21px] text-[#77819b]">
                    Password
                  </Text>
                  <TextInput
                    secureTextEntry
                    placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                    placeholderTextColor="#06112B"
                    className="mt-[10px] p-0 font-poppins text-[18px] leading-[24px] text-lingua-text-primary"
                  />
                </View>
                <Ionicons name="eye-outline" size={28} color="#77819b" />
              </View>
            ) : null}
          </View>

          <Pressable
            className="mt-[25px] h-[68px] items-center justify-center rounded-[14px] bg-lingua-deep-purple"
            onPress={() => setVerificationVisible(true)}
          >
            <Text className="font-poppins-bold text-[22px] leading-[29px] text-white">
              {isSignUp ? "Sign Up" : "Sign In"}
            </Text>
          </Pressable>

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
        visible={isVerificationVisible}
        onClose={() => setVerificationVisible(false)}
      />
    </>
  );
}

type VerificationModalProps = {
  onClose: () => void;
  visible: boolean;
};

function VerificationModal({ onClose, visible }: VerificationModalProps) {
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);

  const handleCodeChange = (value: string) => {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setCode(nextCode);

    if (nextCode.length === 6) {
      onClose();
      router.replace("/");
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
        className="flex-1 justify-end bg-black/35"
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
            textContentType="oneTimeCode"
            value={code}
            className="absolute h-0 w-0 opacity-0"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
