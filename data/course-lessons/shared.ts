import type { Lesson } from "@/types/learning";

type LessonSeed = {
  description: string;
  id: string;
  mode: Lesson["mode"];
  order: number;
  phrase: {
    context: string;
    phrase: string;
    pronunciation: string;
    translation: string;
  };
  title: string;
  vocabulary: {
    example: string;
    pronunciation: string;
    term: string;
    translation: string;
  }[];
};

export function createLesson(
  languageId: string,
  unitId: string,
  seed: LessonSeed,
): Lesson {
  const primaryVocabulary = seed.vocabulary[0];
  const secondaryVocabulary = seed.vocabulary[1] ?? seed.vocabulary[0];

  return {
    id: seed.id,
    languageId,
    unitId,
    title: seed.title,
    description: seed.description,
    mode: seed.mode,
    order: seed.order,
    xpReward: 10,
    estimatedMinutes: seed.order <= 3 ? 5 : 6,
    goals: [
      `學習 ${primaryVocabulary.term} 和 ${secondaryVocabulary.term}。`,
      `用簡短回答練習「${seed.phrase.phrase}」。`,
      "透過適合初學者的重複練習建立信心。",
    ],
    vocabulary: seed.vocabulary.map((item, index) => ({
      id: `${seed.id}-vocab-${index + 1}`,
      ...item,
    })),
    phrases: [
      {
        id: `${seed.id}-phrase-1`,
        ...seed.phrase,
      },
    ],
    activities: [
      {
        id: `${seed.id}-vocab-activity-1`,
        type: "vocabulary",
        prompt: `點選「${primaryVocabulary.translation}」對應的單字。`,
        vocabularyId: `${seed.id}-vocab-1`,
      },
      {
        id: `${seed.id}-choice-1`,
        type: "multiple-choice",
        prompt: `${secondaryVocabulary.term} 是什麼意思？`,
        answer: secondaryVocabulary.translation,
        options: [
          secondaryVocabulary.translation,
          primaryVocabulary.translation,
          "老師",
          "水",
        ],
      },
      {
        id: `${seed.id}-repeat-1`,
        type: "listen-and-repeat",
        prompt: "聽一遍，然後跟著念這個短句。",
        text: seed.phrase.phrase,
        pronunciation: seed.phrase.pronunciation,
      },
    ],
    aiTeacherPrompt: `這是一堂溫暖、初學者友善的 ${languageId} 課程。除了目標語言單字或短句以外，請全程使用台灣國語和繁體中文說明。這堂課只練習 ${seed.vocabulary
      .slice(0, 2)
      .map((item) => item.term)
      .join("、")} 和 ${seed.phrase.phrase}。請慢慢念目標項目，說明國語意思，聆聽學習者回答，給一句簡短鼓勵，並請他跟讀或再試一次。`,
  };
}
