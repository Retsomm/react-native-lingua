import type { Lesson } from "@/types/learning";
import { createLesson } from "./shared";

const languageId = "chinese";
const unitId = "chinese-basics";

export const chineseLessons: Lesson[] = [
  createLesson(languageId, unitId, {
    id: "chinese-greetings-introductions",
    title: "問候與自我介紹",
    description: "練習打招呼並分享自己的名字。",
    mode: "practice",
    order: 1,
    vocabulary: [
      { term: "你好", translation: "哈囉", pronunciation: "ni hao", example: "你好，我是小明。" },
      { term: "名字", translation: "姓名", pronunciation: "ming zi", example: "我的名字是小明。" },
    ],
    phrase: { phrase: "我叫...", translation: "我的名字是...", pronunciation: "wo jiao", context: "自我介紹時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "chinese-daily-life",
    title: "日常生活",
    description: "聊聊學校與每天的作息。",
    mode: "practice",
    order: 2,
    vocabulary: [
      { term: "早上", translation: "早晨", pronunciation: "zao shang", example: "早上好。" },
      { term: "學校", translation: "學校", pronunciation: "xue xiao", example: "我去學校。" },
    ],
    phrase: { phrase: "我去學校。", translation: "我去學校。", pronunciation: "wo qu xue xiao", context: "描述一天行程時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "chinese-at-the-cafe",
    title: "在咖啡店",
    description: "練習有禮貌地點茶或咖啡。",
    mode: "audio",
    order: 3,
    vocabulary: [
      { term: "咖啡", translation: "咖啡", pronunciation: "ka fei", example: "我要咖啡。" },
      { term: "謝謝", translation: "謝謝", pronunciation: "xie xie", example: "謝謝你。" },
    ],
    phrase: { phrase: "我要一杯咖啡。", translation: "我要一杯咖啡。", pronunciation: "wo yao yi bei ka fei", context: "點咖啡時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "chinese-travel-directions",
    title: "旅行與方向",
    description: "詢問地點與方向。",
    mode: "practice",
    order: 4,
    vocabulary: [
      { term: "車站", translation: "車站", pronunciation: "che zhan", example: "車站在哪裡？" },
      { term: "右邊", translation: "右邊", pronunciation: "you bian", example: "在右邊。" },
    ],
    phrase: { phrase: "車站在哪裡？", translation: "車站在哪裡？", pronunciation: "che zhan zai na li", context: "問路時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "chinese-shopping",
    title: "購物",
    description: "詢問物品價格。",
    mode: "chat",
    order: 5,
    vocabulary: [
      { term: "價格", translation: "價格", pronunciation: "jia ge", example: "價格很好。" },
      { term: "商店", translation: "商店", pronunciation: "shang dian", example: "商店開了。" },
    ],
    phrase: { phrase: "多少錢？", translation: "多少錢？", pronunciation: "duo shao qian", context: "購物時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "chinese-family-friends",
    title: "家人與朋友",
    description: "談論家人與朋友。",
    mode: "practice",
    order: 6,
    vocabulary: [
      { term: "家人", translation: "家人", pronunciation: "jia ren", example: "我的家人。" },
      { term: "朋友", translation: "朋友", pronunciation: "peng you", example: "這是我的朋友。" },
    ],
    phrase: { phrase: "這是我的朋友。", translation: "這是我的朋友。", pronunciation: "zhe shi wo de peng you", context: "介紹朋友時使用。" },
  }),
];
