import { images } from "@/constants/images";
import { defaultLanguageId, languages } from "@/data/languages";
import { captureLanguageSelected } from "@/lib/analytics";
import { useLanguageStore } from "@/store/UseLanguageStore";
import type { SupportedLanguage } from "@/types/learning";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LanguageSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const persistedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const setSelectedLanguage = useLanguageStore(
    (state) => state.setSelectedLanguageId,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguageId, setSelectedLanguageId] = useState(
    persistedLanguageId ?? defaultLanguageId,
  );
  const earthWidth = Math.min(width * 0.95, 520);
  const earthHeight = earthWidth * (828 / 1127);

  const filteredLanguages = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return languages;
    }

    return languages.filter((language) => {
      const searchableText = [
        language.name,
        language.nativeName,
        language.shortName,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [searchQuery]);

  const selectedLanguage = useMemo(
    () =>
      languages.find((language) => language.id === selectedLanguageId) ??
      languages[0],
    [selectedLanguageId],
  );

  const handleConfirmLanguage = async () => {
    if (!selectedLanguage) {
      return;
    }

    captureLanguageSelected(selectedLanguage);
    setSelectedLanguage(selectedLanguage.id);
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: 0,
            paddingTop: Math.max(insets.top + 16, 28),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-center">
          <Pressable
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={30} color="#0D132B" />
          </Pressable>

          <Text className="font-poppins-semibold text-[26px] leading-[34px] text-lingua-text-primary">
            Choose a language
          </Text>
        </View>

        <View className="mt-[34px] flex-row items-center gap-[16px] rounded-[34px] border border-[#ECEEF4] bg-[#FBFBFD] px-[24px] py-[14px]">
          <Ionicons name="search" size={28} color="#66708F" />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="never"
            onChangeText={setSearchQuery}
            placeholder="Search languages"
            placeholderTextColor="#6E7894"
            returnKeyType="search"
            style={styles.searchInput}
            value={searchQuery}
          />

          {searchQuery.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear language search"
              hitSlop={10}
              onPress={() => setSearchQuery("")}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Ionicons name="close-circle" size={24} color="#8A93AA" />
            </Pressable>
          ) : null}
        </View>

        <Text className="mt-[34px] font-poppins-semibold text-[22px] leading-[30px] text-lingua-text-primary">
          Popular
        </Text>

        <View className="mt-[20px] gap-[2px]">
          {filteredLanguages.map((language) => (
            <LanguageRow
              key={language.id}
              isSelected={language.id === selectedLanguageId}
              language={language}
              onPress={() => setSelectedLanguageId(language.id)}
            />
          ))}
        </View>

        {filteredLanguages.length === 0 ? (
          <View className="mt-[28px] items-center rounded-[24px] border border-[#EEF0F5] bg-[#FBFBFD] px-[24px] py-[26px]">
            <Text className="font-poppins-semibold text-[18px] leading-[26px] text-lingua-text-primary">
              No languages found
            </Text>
            <Text className="mt-[6px] text-center font-poppins text-[15px] leading-[22px] text-[#6E7894]">
              Try searching by language name, native name, or short code.
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityLabel={`Confirm ${selectedLanguage.name}`}
          className="mt-[24px] flex-row items-center justify-center gap-[12px] rounded-[26px] bg-lingua-deep-purple px-[22px] py-[18px]"
          disabled={!selectedLanguage}
          onPress={handleConfirmLanguage}
          style={({ pressed }) => [styles.confirmButton, pressed && styles.pressed]}
        >
          <Ionicons name="checkmark-circle" size={26} color="#FFFFFF" />
          <Text className="font-poppins-bold text-[19px] leading-[27px] text-white">
            Continue with {selectedLanguage.name}
          </Text>
        </Pressable>

        <View style={styles.earthContainer}>
          <Image
            source={images.earthCropped}
            className="self-center"
            resizeMode="contain"
            style={{ height: earthHeight, width: earthWidth }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

type LanguageRowProps = {
  isSelected: boolean;
  language: SupportedLanguage;
  onPress: () => void;
};

function LanguageRow({
  isSelected,
  language,
  onPress,
}: LanguageRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className="min-h-[112px] flex-row items-center rounded-[24px] bg-white px-[16px]"
      onPress={onPress}
      style={({ pressed }) => [
        styles.languageRow,
        isSelected && styles.selectedLanguageRow,
        pressed && styles.pressed,
      ]}
    >
      <View className="h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full border border-[#EEF0F5] bg-white">
        <Image
          source={images.flags[language.flagKey]}
          className="h-[52px] w-[52px]"
          resizeMode="cover"
        />
      </View>

      <View className="ml-[24px] flex-1">
        <Text className="font-poppins-semibold text-[22px] leading-[30px] text-lingua-text-primary">
          {language.name}
        </Text>
        <Text className="mt-[4px] font-poppins text-[17px] leading-[25px] text-[#6E7894]">
          {language.learnerCount}
        </Text>
      </View>

      {isSelected ? (
        <View className="h-[40px] w-[40px] items-center justify-center rounded-full bg-lingua-deep-purple">
          <Ionicons name="checkmark" size={26} color="#FFFFFF" />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={26} color="#66708F" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backButton: {
    left: 0,
    position: "absolute",
  },
  confirmButton: {
    shadowColor: "#5B3BF6",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 37,
  },
  earthContainer: {
    justifyContent: "flex-end",
    marginTop: "auto",
    paddingTop: 34,
  },
  languageRow: {
    borderColor: "#F1F2F6",
    borderWidth: 1,
    shadowColor: "#0D132B",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.025,
    shadowRadius: 18,
  },
  pressed: {
    opacity: 0.72,
  },
  searchInput: {
    color: "#0D132B",
    flex: 1,
    fontFamily: "Poppins-Regular",
    fontSize: 21,
    lineHeight: 30,
    padding: 0,
  },
  selectedLanguageRow: {
    backgroundColor: "#FAF9FF",
    borderColor: "#8B68FF",
    borderWidth: 2,
  },
});
