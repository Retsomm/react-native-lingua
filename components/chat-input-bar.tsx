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

  return (
    <View className="border-t border-[#E5E7EB] bg-white px-[12px] py-[9px]">
      <View className="flex-row items-end gap-[8px]">
        <Pressable
          accessibilityLabel="新增聊天附件"
          accessibilityRole="button"
          className="h-[38px] w-[38px] items-center justify-center rounded-full"
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Ionicons name="add" size={29} color="#5B3BF6" />
        </Pressable>

        <TextInput
          multiline
          placeholder="輸入訊息"
          placeholderTextColor="#8A97A6"
          returnKeyType="send"
          style={styles.input}
          underlineColorAndroid="transparent"
          value={input}
          onChangeText={onChangeInput}
        />

        <Pressable
          accessibilityLabel="送出訊息"
          accessibilityRole="button"
          className={`h-[38px] w-[38px] items-center justify-center rounded-full ${
            canSend ? "bg-lingua-deep-purple" : "bg-[#C8D2DC]"
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
