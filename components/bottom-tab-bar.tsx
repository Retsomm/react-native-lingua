import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabIconName = ComponentProps<typeof Ionicons>["name"];

const ACTIVE_SIZE = 54;

const tabIcons: Record<string, TabIconName> = {
  "ai-teacher": "headset",
  chat: "chatbubble-outline",
  home: "home",
  learn: "book-outline",
  profile: "person-outline",
};

const tabLabels: Record<string, string> = {
  "ai-teacher": "AI Teacher",
  chat: "Chat",
  home: "Home",
  learn: "Learn",
  profile: "Profile",
};

export function BottomTabBar({
  descriptors,
  navigation,
  state,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const tabWidth = barWidth / state.routes.length;

  useEffect(() => {
    if (!barWidth) {
      return;
    }

    Animated.spring(indicatorX, {
      damping: 18,
      mass: 0.7,
      stiffness: 180,
      toValue: state.index * tabWidth + (tabWidth - ACTIVE_SIZE) / 2,
      useNativeDriver: true,
    }).start();
  }, [barWidth, indicatorX, state.index, tabWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 px-[14px]"
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
    >
      <View
        className="relative h-[86px] flex-row items-center overflow-hidden rounded-[28px] border border-[#F0F1F6] bg-white"
        onLayout={handleLayout}
        style={styles.bar}
      >
        {barWidth > 0 ? (
          <Animated.View
            className="absolute top-[10px] h-[54px] w-[54px] items-center justify-center rounded-full bg-lingua-deep-purple"
            pointerEvents="none"
            style={[styles.activeCircle, { transform: [{ translateX: indicatorX }] }]}
          >
            <Ionicons
              name={tabIcons[state.routes[state.index].name] ?? "ellipse"}
              size={29}
              color="#FFFFFF"
            />
          </Animated.View>
        ) : null}

        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const isFocused = state.index === index;
          const label = tabLabels[route.name] ?? String(descriptor.options.title);
          const iconName = tabIcons[route.name] ?? "ellipse-outline";

          const onPress = () => {
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: "tabPress",
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityLabel={descriptor.options.tabBarAccessibilityLabel}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              className="h-full flex-1 items-center justify-end pb-[14px]"
              onPress={onPress}
              style={({ pressed }) => pressed && styles.pressed}
            >
              {isFocused ? (
                <View className="h-[29px]" />
              ) : (
                <>
                  <Ionicons name={iconName} size={29} color="#838BA6" />
                  <Text className="mt-[5px] font-poppins-semibold text-[13px] leading-[17px] text-[#838BA6]">
                    {label}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeCircle: {
    left: 0,
    zIndex: 1,
  },
  bar: {
    boxShadow: "0 8px 24px rgba(13, 19, 43, 0.08)",
  },
  pressed: {
    opacity: 0.72,
  },
});
