import type { Lesson } from "@/types/learning";
import { createLesson } from "./shared";

const languageId = "english";
const unitId = "english-basics";

export const englishLessons: Lesson[] = [
  createLesson(languageId, unitId, {
    id: "english-greetings-introductions",
    title: "問候與自我介紹",
    description: "練習打招呼並介紹自己。",
    mode: "practice",
    order: 1,
    vocabulary: [
      { term: "hello", translation: "哈囉", pronunciation: "heh-LOW", example: "Hello, I am Mia." },
      { term: "name", translation: "名字", pronunciation: "naym", example: "My name is Mia." },
    ],
    phrase: { phrase: "My name is...", translation: "我的名字是...", pronunciation: "my naym iz", context: "自我介紹時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "english-daily-life",
    title: "日常生活",
    description: "練習簡單日常作息單字。",
    mode: "practice",
    order: 2,
    vocabulary: [
      { term: "morning", translation: "早上", pronunciation: "MOR-ning", example: "Good morning." },
      { term: "school", translation: "學校", pronunciation: "skool", example: "I go to school." },
    ],
    phrase: { phrase: "I go to school.", translation: "我去學校。", pronunciation: "eye goh too skool", context: "談論一天行程時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "english-at-the-cafe",
    title: "在咖啡店",
    description: "有禮貌地點一杯飲料。",
    mode: "audio",
    order: 3,
    vocabulary: [
      { term: "coffee", translation: "咖啡", pronunciation: "KAW-fee", example: "I want coffee." },
      { term: "please", translation: "請", pronunciation: "pleez", example: "Coffee, please." },
    ],
    phrase: { phrase: "Coffee, please.", translation: "咖啡，謝謝。", pronunciation: "KAW-fee pleez", context: "點飲料時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "english-travel-directions",
    title: "旅行與方向",
    description: "詢問某個地點在哪裡。",
    mode: "practice",
    order: 4,
    vocabulary: [
      { term: "station", translation: "車站", pronunciation: "STAY-shun", example: "Where is the station?" },
      { term: "right", translation: "右邊", pronunciation: "ryt", example: "Turn right." },
    ],
    phrase: { phrase: "Where is the station?", translation: "車站在哪裡？", pronunciation: "wair iz the STAY-shun", context: "問路時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "english-shopping",
    title: "購物",
    description: "詢問價格。",
    mode: "chat",
    order: 5,
    vocabulary: [
      { term: "price", translation: "價格", pronunciation: "prys", example: "The price is low." },
      { term: "store", translation: "商店", pronunciation: "stor", example: "The store is open." },
    ],
    phrase: { phrase: "How much is it?", translation: "這個多少錢？", pronunciation: "how much iz it", context: "買東西前使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "english-family-friends",
    title: "家人與朋友",
    description: "介紹家人與朋友。",
    mode: "practice",
    order: 6,
    vocabulary: [
      { term: "family", translation: "家人", pronunciation: "FAM-uh-lee", example: "This is my family." },
      { term: "friend", translation: "朋友", pronunciation: "frend", example: "This is my friend." },
    ],
    phrase: { phrase: "This is my friend.", translation: "這是我的朋友。", pronunciation: "this iz my frend", context: "介紹朋友時使用。" },
  }),
];
