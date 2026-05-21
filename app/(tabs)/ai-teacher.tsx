import { AudioTeacherSession } from "@/components/audio-teacher-session";
import { defaultLanguageId } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { useLanguageStore } from "@/store/UseLanguageStore";
import type { Lesson } from "@/types/learning";
import { useMemo } from "react";

export default function AiTeacherScreen() {
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);

  const lesson = useMemo(
    () => getTeacherLesson(selectedLanguageId ?? defaultLanguageId),
    [selectedLanguageId],
  );

  return <AudioTeacherSession activeTabRoute="/ai-teacher" lesson={lesson} />;
}

function getTeacherLesson(languageId: string): Lesson | undefined {
  const languageLessons = lessons
    .filter((lesson) => lesson.languageId === languageId)
    .sort((a, b) => a.order - b.order);

  return (
    languageLessons.find(
      (lesson) => lesson.mode === "ai-teacher" || lesson.mode === "audio",
    ) ?? languageLessons[0]
  );
}
