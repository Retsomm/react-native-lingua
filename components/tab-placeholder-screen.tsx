import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabPlaceholderScreenProps = {
  subtitle: string;
  title: string;
};

export function TabPlaceholderScreen({
  subtitle,
  title,
}: TabPlaceholderScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-lingua-background px-[28px]"
      style={{
        paddingBottom: insets.bottom + 120,
        paddingTop: Math.max(insets.top, 18) + 28,
      }}
    >
      <View className="mx-auto w-full max-w-[430px] flex-1 justify-center">
        <View className="rounded-[24px] border border-lingua-border-soft bg-lingua-surface-muted px-[24px] py-[28px]">
          <Text className="font-poppins-bold text-[28px] leading-[36px] text-lingua-text-primary">
            {title}
          </Text>
          <Text className="mt-[8px] font-poppins text-[16px] leading-[24px] text-lingua-text-secondary">
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
}
