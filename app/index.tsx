import { useAuth } from "@clerk/expo";
import { images } from "@/constants/images";
import { colors, typography } from "@/theme/tokens";
import { Link, Redirect } from "expo-router";
import type React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const primaryColors = [
  { name: "Lingua Purple", hex: colors.primary.purple },
  { name: "Lingua Deep Purple", hex: colors.primary.deepPurple },
  { name: "Lingua Blue", hex: colors.primary.blue },
  { name: "Lingua Green", hex: colors.primary.green },
] as const;

const semanticColors = [
  { name: "Success", hex: colors.semantic.success },
  { name: "Warning", hex: colors.semantic.warning },
  { name: "Streak", hex: colors.semantic.streak },
  { name: "Error", hex: colors.semantic.error },
  { name: "Info", hex: colors.semantic.info },
] as const;

const neutralColors = [
  { name: "Text / Primary", hex: colors.neutral.textPrimary },
  { name: "Text / Secondary", hex: colors.neutral.textSecondary },
  { name: "Border", hex: colors.neutral.border },
  { name: "Surface", hex: colors.neutral.surface },
  { name: "Background", hex: colors.neutral.background },
] as const;

const typeRows = Object.values(typography.scale);

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const horizontalPadding = isWide ? 28 : 16;

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        isWide ? styles.contentWide : styles.contentNarrow,
        {
          paddingBottom: Math.max(insets.bottom + 16, horizontalPadding),
          paddingTop: Math.max(insets.top + 14, horizontalPadding),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View className={isWide ? "flex-row gap-4" : "gap-4"}>
        <View className="gap-4" style={isWide ? styles.column : undefined}>
          <Link href="/profile" asChild>
            <Text className="overflow-hidden rounded-[16px] bg-[#f6c443] px-5 py-4 text-center font-poppins-bold text-[18px] leading-[26px] text-lingua-text-primary">
              Open Profile
            </Text>
          </Link>

          <Link href="/onboarding" asChild>
            <Text className="overflow-hidden rounded-[16px] bg-lingua-deep-purple px-5 py-4 text-center font-poppins-bold text-[18px] leading-[26px] text-white">
              Open Onboarding
            </Text>
          </Link>

          <DesignCard title="Brand">
            <View className="min-h-37.5 flex-row items-center justify-center gap-6.5">
              <Image
                source={images.mascotLogo}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text className="font-poppins-bold text-[56px] leading-16.75 text-lingua-text-primary">
                lingua
              </Text>
            </View>
          </DesignCard>

          <DesignCard title="Colors">
            <ColorGroup title="Primary" items={primaryColors} size="large" />
            <ColorGroup title="Semantic" items={semanticColors} size="medium" />
            <ColorGroup
              title="Neutrals"
              items={neutralColors}
              size="medium"
              outlinedLast
            />
          </DesignCard>
        </View>

        <View style={isWide ? styles.column : undefined}>
          <DesignCard title="Typography" fill>
            <Text className="design-system__kicker mt-[8px]">Font Family</Text>
            <Text className="mt-[20px] font-poppins-bold text-[56px] leading-[67px] text-lingua-text-primary">
              Poppins
            </Text>
            <Text className="mt-[16px] max-w-[560px] font-poppins text-[15px] leading-[23px] text-[#506080]">
              Poppins is a modern, geometric sans-serif typeface that provides
              excellent readability and a friendly personality.
            </Text>

            <View className="mt-[42px] gap-[30px]">
              {typeRows.map((row) => (
                <TypographyRow key={row.label} row={row} />
              ))}
            </View>
          </DesignCard>
        </View>
      </View>
    </ScrollView>
  );
}

type DesignCardProps = {
  children: React.ReactNode;
  fill?: boolean;
  title: string;
};

function DesignCard({ children, fill, title }: DesignCardProps) {
  return (
    <View
      className="design-system__card px-[28px] py-[24px]"
      style={[styles.card, fill && styles.fillCard]}
    >
      <View className="flex-row items-center gap-[24px]">
        <Text className="design-system__section-title">{title}</Text>
        <View className="design-system__rule flex-1" />
      </View>
      <View className="mt-[28px]">{children}</View>
    </View>
  );
}

type ColorItem = {
  hex: string;
  name: string;
};

type ColorGroupProps = {
  items: readonly ColorItem[];
  outlinedLast?: boolean;
  size: "large" | "medium";
  title: string;
};

function ColorGroup({ items, outlinedLast, size, title }: ColorGroupProps) {
  const swatchStyle =
    size === "large" ? styles.largeSwatch : styles.mediumSwatch;

  return (
    <View className="mb-[34px] last:mb-0">
      <Text className="design-system__kicker mb-[16px]">{title}</Text>
      <View className="flex-row flex-wrap justify-between gap-y-[26px]">
        {items.map((item, index) => {
          const isOutlined = Boolean(
            outlinedLast && index === items.length - 1,
          );

          return (
            <View
              key={item.name}
              className={size === "large" ? "w-[112px]" : "w-[88px]"}
            >
              <View
                className={
                  isOutlined ? "border border-lingua-border" : undefined
                }
                style={[swatchStyle, { backgroundColor: item.hex }]}
              />
              <Text className="design-system__color-label mt-[10px]">
                {item.name}
              </Text>
              <Text className="design-system__color-value mt-[2px]">
                {item.hex}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

type TypographyRowProps = {
  row: (typeof typeRows)[number];
};

function TypographyRow({ row }: TypographyRowProps) {
  const isHeading = row.label.startsWith("H");
  const fontClass =
    row.weight === "Bold"
      ? "font-poppins-bold"
      : row.weight === "SemiBold"
        ? "font-poppins-semibold"
        : row.weight === "Medium"
          ? "font-poppins-medium"
          : "font-poppins";

  return (
    <View className="flex-row items-center gap-[12px]">
      <Text
        className={`${fontClass} text-lingua-text-primary`}
        style={[
          styles.typeLabel,
          { fontSize: row.size, lineHeight: row.lineHeight },
        ]}
      >
        {row.label}
      </Text>
      <Text className="design-system__type-meta flex-1">{row.usage}</Text>
      <Text className="design-system__type-meta w-[74px]">{row.size}px</Text>
      <Text className="design-system__type-meta w-[98px]">{row.weight}</Text>
      <Text className="design-system__type-meta w-[42px]">
        {isHeading
          ? (row.lineHeight / row.size).toFixed(1)
          : row.label === "Caption"
            ? "1.4"
            : "1.6"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.neutral.background,
    flex: 1,
  },
  content: {
    backgroundColor: colors.neutral.background,
  },
  contentWide: {
    padding: 28,
  },
  contentNarrow: {
    padding: 16,
  },
  column: {
    flex: 1,
  },
  card: {
    shadowColor: colors.neutral.textPrimary,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 18,
  },
  fillCard: {
    minHeight: 892,
  },
  logo: {
    height: 112,
    width: 112,
  },
  largeSwatch: {
    borderRadius: 8,
    height: 98,
    width: 104,
  },
  mediumSwatch: {
    borderRadius: 8,
    height: 78,
    width: 78,
  },
  typeLabel: {
    width: 160,
  },
});
