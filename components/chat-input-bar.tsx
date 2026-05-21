import { appThemeColors } from "@/constants/theme";
import { useThemeStore } from "@/store/use-theme-store";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

type ChatInputBarProps = {
  input: string;
  onChangeInput: (value: string) => void;
  onSend: () => void;
};

export function ChatInputBar({
  input,
  onChangeInput,
  onSend,
}: ChatInputBarProps) {
  const canSend = input.trim().length > 0;
  const theme = useThemeStore((state) => state.theme);
  const colors = appThemeColors[theme];

  return (
    <View className="border-t border-lingua-border bg-lingua-background px-[12px] py-[9px]">
      <View className="flex-row items-end gap-[8px]">
        <Pressable
          accessibilityLabel="新增聊天附件"
          accessibilityRole="button"
          className="h-[38px] w-[38px] items-center justify-center rounded-full"
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Ionicons name="add" size={29} color={colors.deepPurple} />
        </Pressable>

        <TextInput
          multiline
          placeholder="輸入訊息"
          placeholderTextColor={colors.textTertiary}
          returnKeyType="send"
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.borderSoft,
              color: colors.textPrimary,
            },
          ]}
          underlineColorAndroid="transparent"
          value={input}
          onChangeText={onChangeInput}
        />

        <Pressable
          accessibilityLabel="送出訊息"
          accessibilityRole="button"
          className={`h-[38px] w-[38px] items-center justify-center rounded-full ${
            canSend ? "bg-lingua-deep-purple" : "bg-lingua-surface-muted"
          }`}
          disabled={!canSend}
          style={({ pressed }) => pressed && styles.pressed}
          onPress={onSend}
        >
          <Ionicons name="arrow-up" size={23} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 19,
    borderWidth: 1,
    color: "#0D132B",
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 15,
    lineHeight: 22,
    maxHeight: 104,
    minHeight: 38,
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  pressed: {
    opacity: 0.72,
  },
});
