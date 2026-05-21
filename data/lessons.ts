import { chineseLessons } from "@/data/course-lessons/chinese";
import { englishLessons } from "@/data/course-lessons/english";
import { frenchLessons } from "@/data/course-lessons/french";
import { japaneseLessons } from "@/data/course-lessons/japanese";
import { koreanLessons } from "@/data/course-lessons/korean";
import { spanishLessons } from "@/data/course-lessons/spanish";
import type { Lesson } from "@/types/learning";

export const lessons: Lesson[] = [
  ...spanishLessons,
  ...frenchLessons,
  ...japaneseLessons,
  ...koreanLessons,
  ...chineseLessons,
  ...englishLessons,
];
