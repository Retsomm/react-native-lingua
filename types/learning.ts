export type LanguageLevel = "beginner" | "elementary" | "intermediate";

export type LessonMode = "practice" | "audio" | "ai-teacher" | "chat";

export type ActivityType =
  | "vocabulary"
  | "phrase"
  | "multiple-choice"
  | "listen-and-repeat"
  | "chat-prompt";

export type SupportedLanguage = {
  id: string;
  name: string;
  nativeName: string;
  shortName: string;
  flagUrl: string;
  accentColor: string;
  description: string;
  level: LanguageLevel;
};

export type VocabularyItem = {
  id: string;
  term: string;
  translation: string;
  pronunciation: string;
  example: string;
};

export type PhraseItem = {
  id: string;
  phrase: string;
  translation: string;
  pronunciation: string;
  context: string;
};

type BaseActivity = {
  id: string;
  type: ActivityType;
  prompt: string;
};

export type VocabularyActivity = BaseActivity & {
  type: "vocabulary";
  vocabularyId: string;
};

export type PhraseActivity = BaseActivity & {
  type: "phrase";
  phraseId: string;
};

export type MultipleChoiceActivity = BaseActivity & {
  type: "multiple-choice";
  answer: string;
  options: string[];
};

export type ListenAndRepeatActivity = BaseActivity & {
  type: "listen-and-repeat";
  text: string;
  pronunciation: string;
};

export type ChatPromptActivity = BaseActivity & {
  type: "chat-prompt";
  expectedPhrases: string[];
};

export type LessonActivity =
  | VocabularyActivity
  | PhraseActivity
  | MultipleChoiceActivity
  | ListenAndRepeatActivity
  | ChatPromptActivity;

export type Unit = {
  id: string;
  languageId: string;
  title: string;
  description: string;
  order: number;
  color: string;
  lessonIds: string[];
};

export type Lesson = {
  id: string;
  languageId: string;
  unitId: string;
  title: string;
  description: string;
  mode: LessonMode;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  goals: string[];
  vocabulary: VocabularyItem[];
  phrases: PhraseItem[];
  activities: LessonActivity[];
  aiTeacherPrompt: string;
};
