import type { Unit } from "@/types/learning";

export const units: Unit[] = [
  {
    id: "spanish-basics",
    languageId: "spanish",
    title: "Spanish Basics",
    description: "Say hello, introduce yourself, and answer simple questions.",
    order: 1,
    color: "#ff6b6b",
    lessonIds: ["spanish-greetings", "spanish-introductions"],
  },
  {
    id: "french-basics",
    languageId: "french",
    title: "French Basics",
    description: "Use polite greetings and beginner cafe phrases.",
    order: 1,
    color: "#4d96ff",
    lessonIds: ["french-greetings", "french-cafe"],
  },
  {
    id: "japanese-basics",
    languageId: "japanese",
    title: "Japanese Basics",
    description: "Practice daily greetings and simple classroom language.",
    order: 1,
    color: "#ff8fab",
    lessonIds: ["japanese-greetings", "japanese-classroom"],
  },
];
