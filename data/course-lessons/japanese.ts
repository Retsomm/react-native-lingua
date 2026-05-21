import type { Lesson } from "@/types/learning";
import { createLesson } from "./shared";

const languageId = "japanese";
const unitId = "japanese-basics";

export const japaneseLessons: Lesson[] = [
  createLesson(languageId, unitId, {
    id: "japanese-greetings",
    title: "日常問候",
    description: "學習哈囉與謝謝等簡單問候。",
    mode: "ai-teacher",
    order: 1,
    vocabulary: [
      { term: "こんにちは", translation: "哈囉", pronunciation: "kohn-nee-chee-wah", example: "こんにちは、ゆいさん。" },
      { term: "ありがとう", translation: "謝謝", pronunciation: "ah-ree-gah-toh", example: "ありがとう、先生。" },
    ],
    phrase: { phrase: "はじめまして", translation: "初次見面", pronunciation: "hah-jee-meh-mah-shee-teh", context: "第一次見面時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "japanese-classroom",
    title: "課堂用語",
    description: "學習和老師上課時會用到的簡單詞彙。",
    mode: "practice",
    order: 2,
    vocabulary: [
      { term: "先生", translation: "老師", pronunciation: "sehn-say", example: "田中先生" },
      { term: "はい", translation: "是", pronunciation: "high", example: "はい、わかります。" },
    ],
    phrase: { phrase: "わかります", translation: "我懂了", pronunciation: "wah-kah-ree-mahs", context: "老師詢問是否理解時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "japanese-cafe",
    title: "在咖啡店",
    description: "用禮貌說法點茶或咖啡。",
    mode: "audio",
    order: 3,
    vocabulary: [
      { term: "コーヒー", translation: "咖啡", pronunciation: "koh-hee", example: "コーヒーをください。" },
      { term: "お茶", translation: "茶", pronunciation: "oh-chah", example: "お茶を飲みます。" },
    ],
    phrase: { phrase: "これをください。", translation: "請給我這個。", pronunciation: "koh-reh oh koo-dah-sai", context: "點餐或購物時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "japanese-travel",
    title: "旅行與方向",
    description: "詢問車站在哪裡，並理解方向。",
    mode: "practice",
    order: 4,
    vocabulary: [
      { term: "駅", translation: "車站", pronunciation: "eh-kee", example: "駅はどこですか。" },
      { term: "右", translation: "右邊", pronunciation: "mee-gee", example: "右に行きます。" },
    ],
    phrase: { phrase: "駅はどこですか。", translation: "車站在哪裡？", pronunciation: "eh-kee wah doh-koh dehs kah", context: "問路時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "japanese-shopping",
    title: "購物",
    description: "詢問價格，並指出自己想要的東西。",
    mode: "chat",
    order: 5,
    vocabulary: [
      { term: "いくら", translation: "多少錢", pronunciation: "ee-koo-rah", example: "これはいくらですか。" },
      { term: "店", translation: "店", pronunciation: "miseh", example: "店に行きます。" },
    ],
    phrase: { phrase: "これはいくらですか。", translation: "這個多少錢？", pronunciation: "koh-reh wah ee-koo-rah dehs kah", context: "購物時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "japanese-family",
    title: "家人與朋友",
    description: "談論你的家人與朋友。",
    mode: "practice",
    order: 6,
    vocabulary: [
      { term: "家族", translation: "家人", pronunciation: "kah-zoh-koo", example: "家族がいます。" },
      { term: "友だち", translation: "朋友", pronunciation: "toh-moh-dah-chee", example: "友だちです。" },
    ],
    phrase: { phrase: "こちらは友だちです。", translation: "這是我的朋友。", pronunciation: "koh-chee-rah wah toh-moh-dah-chee dehs", context: "介紹某個人時使用。" },
  }),
];
