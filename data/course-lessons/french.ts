import type { Lesson } from "@/types/learning";
import { createLesson } from "./shared";

const languageId = "french";
const unitId = "french-basics";

export const frenchLessons: Lesson[] = [
  createLesson(languageId, unitId, {
    id: "french-greetings",
    title: "法文問候基礎",
    description: "用法文打招呼、道別，並詢問對方近況。",
    mode: "ai-teacher",
    order: 1,
    vocabulary: [
      { term: "bonjour", translation: "哈囉", pronunciation: "bohn-ZHOOR", example: "Bonjour, Camille." },
      { term: "au revoir", translation: "再見", pronunciation: "oh ruh-VWAHR", example: "Au revoir, Louis." },
    ],
    phrase: { phrase: "Comment ça va ?", translation: "你好嗎？", pronunciation: "koh-MAHN sah vah", context: "日常聊天時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "french-cafe",
    title: "咖啡店入門",
    description: "練習點飲料時會用到的禮貌短句。",
    mode: "audio",
    order: 2,
    vocabulary: [
      { term: "merci", translation: "謝謝", pronunciation: "mehr-SEE", example: "Merci beaucoup." },
      { term: "café", translation: "咖啡", pronunciation: "kah-FAY", example: "Un café, s'il vous plaît." },
    ],
    phrase: { phrase: "s'il vous plaît", translation: "請", pronunciation: "seel voo PLEH", context: "有禮貌地提出請求時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "french-daily-life",
    title: "日常生活",
    description: "說出簡單作息與日常時刻。",
    mode: "practice",
    order: 3,
    vocabulary: [
      { term: "matin", translation: "早晨", pronunciation: "mah-TAN", example: "Bonjour le matin." },
      { term: "soir", translation: "晚上", pronunciation: "swahr", example: "Bonsoir le soir." },
    ],
    phrase: { phrase: "Je suis prêt.", translation: "我準備好了。", pronunciation: "zhuh swee preh", context: "開始活動時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "french-travel",
    title: "旅行與方向",
    description: "旅行時詢問某個地點在哪裡。",
    mode: "practice",
    order: 4,
    vocabulary: [
      { term: "gare", translation: "車站", pronunciation: "gahr", example: "La gare est proche." },
      { term: "droite", translation: "右邊", pronunciation: "drwaht", example: "Tournez à droite." },
    ],
    phrase: { phrase: "Où est la gare ?", translation: "車站在哪裡？", pronunciation: "oo eh lah gahr", context: "搭火車旅行時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "french-shopping",
    title: "購物",
    description: "詢問想買的物品，並聽懂簡單價格。",
    mode: "chat",
    order: 5,
    vocabulary: [
      { term: "prix", translation: "價格", pronunciation: "pree", example: "Le prix est bas." },
      { term: "magasin", translation: "商店", pronunciation: "mah-gah-ZAN", example: "Le magasin est ouvert." },
    ],
    phrase: { phrase: "Je voudrais ceci.", translation: "我想要這個。", pronunciation: "zhuh voo-DREH suh-SEE", context: "有禮貌地購物時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "french-family",
    title: "家人與朋友",
    description: "用簡單法文介紹親近的人。",
    mode: "practice",
    order: 6,
    vocabulary: [
      { term: "famille", translation: "家人", pronunciation: "fah-MEE", example: "Ma famille est ici." },
      { term: "ami", translation: "朋友", pronunciation: "ah-MEE", example: "Mon ami parle français." },
    ],
    phrase: { phrase: "Voici mon ami.", translation: "這是我的朋友。", pronunciation: "vwah-SEE mohn ah-MEE", context: "介紹朋友時使用。" },
  }),
];
