import { posthog } from "@/lib/posthog";
import type { Lesson, SupportedLanguage } from "@/types/learning";

type IdentifyUserOptions = {
  isSignUp?: boolean;
  preferredLanguageId: string | null;
  userId: string;
};

export function identifyPostHogUser({
  isSignUp = false,
  preferredLanguageId,
  userId,
}: IdentifyUserOptions) {
  posthog.identify(userId, {
    $set: {
      preferred_language: preferredLanguageId,
    },
    ...(isSignUp
      ? {
          $set_once: {
            signup_date: new Date().toISOString(),
          },
        }
      : {}),
  });
}

export function captureLanguageSelected(language: SupportedLanguage) {
  posthog.capture("language_selected", {
    language_code: language.id,
    language_name: language.name,
  });
}

export function captureLessonStarted(lesson: Lesson, languageName: string) {
  posthog.capture("lesson_started", {
    language: languageName,
    lesson_id: lesson.id,
    lesson_number: lesson.order,
  });
}

export function captureLessonAbandoned({
  lastQuestionIndex,
  lessonId,
  startedAt,
}: {
  lastQuestionIndex: number;
  lessonId: string;
  startedAt: number;
}) {
  posthog.capture("lesson_abandoned", {
    last_question_index: lastQuestionIndex,
    lesson_id: lessonId,
    time_into_lesson_seconds: Math.max(
      0,
      Math.round((Date.now() - startedAt) / 1000),
    ),
  });
}
