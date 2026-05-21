import type { Lesson } from "@/types/learning";
import { createLesson } from "./shared";

const languageId = "korean";
const unitId = "korean-basics";

export const koreanLessons: Lesson[] = [
  createLesson(languageId, unitId, {
    id: "korean-greetings-introductions",
    title: "問候與自我介紹",
    description: "練習打招呼並介紹自己。",
    mode: "practice",
    order: 1,
    vocabulary: [
      { term: "안녕하세요", translation: "哈囉", pronunciation: "ahn-nyoung-hah-seh-yoh", example: "안녕하세요, 민지예요." },
      { term: "이름", translation: "名字", pronunciation: "ee-reum", example: "제 이름은 민지예요." },
    ],
    phrase: { phrase: "제 이름은...", translation: "我的名字是...", pronunciation: "jeh ee-reum-eun", context: "自我介紹時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "korean-daily-life",
    title: "日常生活",
    description: "練習實用的日常作息詞彙。",
    mode: "practice",
    order: 2,
    vocabulary: [
      { term: "아침", translation: "早上", pronunciation: "ah-chim", example: "아침이에요." },
      { term: "학교", translation: "學校", pronunciation: "hak-gyo", example: "학교에 가요." },
    ],
    phrase: { phrase: "학교에 가요.", translation: "我去學校。", pronunciation: "hak-gyo-eh gah-yoh", context: "談論一天行程時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "korean-at-the-cafe",
    title: "在咖啡店",
    description: "有禮貌地點一杯飲料。",
    mode: "audio",
    order: 3,
    vocabulary: [
      { term: "커피", translation: "咖啡", pronunciation: "kuh-pee", example: "커피 주세요." },
      { term: "감사합니다", translation: "謝謝", pronunciation: "gahm-sah-hahm-nee-dah", example: "감사합니다." },
    ],
    phrase: { phrase: "커피 주세요.", translation: "請給我咖啡。", pronunciation: "kuh-pee joo-seh-yoh", context: "點咖啡時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "korean-travel-directions",
    title: "旅行與方向",
    description: "詢問某個地點在哪裡。",
    mode: "practice",
    order: 4,
    vocabulary: [
      { term: "역", translation: "車站", pronunciation: "yeok", example: "역은 어디예요?" },
      { term: "오른쪽", translation: "右邊", pronunciation: "oh-reun-jjok", example: "오른쪽으로 가요." },
    ],
    phrase: { phrase: "역은 어디예요?", translation: "車站在哪裡？", pronunciation: "yeok-eun oh-dee-yeh-yoh", context: "問路時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "korean-shopping",
    title: "購物",
    description: "詢問價格並說出商店常用詞。",
    mode: "chat",
    order: 5,
    vocabulary: [
      { term: "가격", translation: "價格", pronunciation: "gah-gyeok", example: "가격이 좋아요." },
      { term: "가게", translation: "商店", pronunciation: "gah-geh", example: "가게에 가요." },
    ],
    phrase: { phrase: "얼마예요?", translation: "多少錢？", pronunciation: "eol-mah-yeh-yoh", context: "買東西前使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "korean-family-friends",
    title: "家人與朋友",
    description: "介紹親近的人。",
    mode: "practice",
    order: 6,
    vocabulary: [
      { term: "가족", translation: "家人", pronunciation: "gah-jok", example: "가족이에요." },
      { term: "친구", translation: "朋友", pronunciation: "chin-goo", example: "제 친구예요." },
    ],
    phrase: { phrase: "제 친구예요.", translation: "這是我的朋友。", pronunciation: "jeh chin-goo-yeh-yoh", context: "介紹朋友時使用。" },
  }),
];
