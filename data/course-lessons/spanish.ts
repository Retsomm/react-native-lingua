import type { Lesson } from "@/types/learning";
import { createLesson } from "./shared";

const languageId = "spanish";
const unitId = "spanish-basics";

export const spanishLessons: Lesson[] = [
  createLesson(languageId, unitId, {
    id: "spanish-greetings",
    title: "友善問候",
    description: "學習如何打招呼、道別，並詢問對方近況。",
    mode: "ai-teacher",
    order: 1,
    vocabulary: [
      { term: "hola", translation: "哈囉", pronunciation: "OH-lah", example: "Hola, Sofia." },
      { term: "adiós", translation: "再見", pronunciation: "ah-DYOS", example: "Adiós, Mateo." },
    ],
    phrase: { phrase: "¿Cómo estás?", translation: "你好嗎？", pronunciation: "KOH-moh ehs-TAHS", context: "和朋友或同學聊天時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "spanish-introductions",
    title: "自我介紹",
    description: "告訴別人你的名字，也詢問對方的名字。",
    mode: "practice",
    order: 2,
    vocabulary: [
      { term: "nombre", translation: "名字", pronunciation: "NOHM-breh", example: "Mi nombre es Ana." },
      { term: "llamo", translation: "叫做", pronunciation: "YAH-moh", example: "Me llamo Ana." },
    ],
    phrase: { phrase: "Me llamo...", translation: "我的名字是...", pronunciation: "meh YAH-moh", context: "自我介紹時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "spanish-cafe",
    title: "在咖啡店",
    description: "點一杯飲料，並有禮貌地向店員道謝。",
    mode: "audio",
    order: 3,
    vocabulary: [
      { term: "café", translation: "咖啡", pronunciation: "kah-FEH", example: "Quiero un café." },
      { term: "gracias", translation: "謝謝", pronunciation: "GRAH-see-ahs", example: "Gracias por el café." },
    ],
    phrase: { phrase: "Un café, por favor.", translation: "一杯咖啡，謝謝。", pronunciation: "oon kah-FEH por fah-VOR", context: "在咖啡店點餐時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "spanish-travel",
    title: "旅行與方向",
    description: "詢問地點在哪裡，並聽懂簡單方向。",
    mode: "practice",
    order: 4,
    vocabulary: [
      { term: "calle", translation: "街道", pronunciation: "KAH-yeh", example: "La calle es grande." },
      { term: "derecha", translation: "右邊", pronunciation: "deh-REH-chah", example: "Gira a la derecha." },
    ],
    phrase: { phrase: "¿Dónde está...?", translation: "...在哪裡？", pronunciation: "DON-deh ehs-TAH", context: "問路時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "spanish-shopping",
    title: "購物",
    description: "詢問價格，並認識常見商店詞彙。",
    mode: "chat",
    order: 5,
    vocabulary: [
      { term: "precio", translation: "價格", pronunciation: "PREH-see-oh", example: "El precio es bueno." },
      { term: "tienda", translation: "商店", pronunciation: "TYEN-dah", example: "La tienda está abierta." },
    ],
    phrase: { phrase: "¿Cuánto cuesta?", translation: "這個多少錢？", pronunciation: "KWAN-toh KWEHS-tah", context: "買東西前詢問價格時使用。" },
  }),
  createLesson(languageId, unitId, {
    id: "spanish-family",
    title: "家人與朋友",
    description: "談論身邊親近的人。",
    mode: "practice",
    order: 6,
    vocabulary: [
      { term: "familia", translation: "家人", pronunciation: "fah-MEE-lyah", example: "Mi familia es pequeña." },
      { term: "amigo", translation: "朋友", pronunciation: "ah-MEE-goh", example: "Mi amigo se llama Luis." },
    ],
    phrase: { phrase: "Este es mi amigo.", translation: "這是我的朋友。", pronunciation: "EHS-teh ehs mee ah-MEE-goh", context: "介紹朋友時使用。" },
  }),
];
