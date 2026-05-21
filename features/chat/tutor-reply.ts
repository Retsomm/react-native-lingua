type TutorExample = {
  correction: string;
  defaultChat: string;
  greeting: string;
  threeLineChat: string;
};

export const tutorExamplesByLanguageId: Record<string, TutorExample> = {
  chinese: {
    correction:
      "可以，我們直接練一個例子：\n\n原句：我今天很開心學習。\n自然一點：我今天學得很開心。\n\n你也傳一句中文給我，我會幫你改成更自然的說法。",
    defaultChat:
      "收到，我們直接練一小段中文對話：\n\nAI：今天心情怎麼樣？\n你：我今天覺得很有精神。\nAI：很好！你為什麼覺得有精神？\n\n換你回一句，我會幫你接下一句。",
    greeting:
      "可以，先用這三句中文問候暖身：\n\n1. 你好，很高興認識你。\n2. 你今天過得怎麼樣？\n3. 我今天想練習簡單聊天。\n\n你先回第 1 句，我幫你改得更自然。",
    threeLineChat:
      "可以，我們直接用三句中文開始：\n\nAI：你好！今天想聊什麼？\n你：我想聊我的一天。\nAI：好，你今天做了哪三件事？\n\n你可以先回：「我今天做了...」，我會接下一句。",
  },
  english: {
    correction:
      "可以，我們直接練一個英文例子：\n\n原句：I very like learn English.\n自然一點：I really like learning English.\n\n你也傳一句英文給我，我會幫你改成更自然的說法。",
    defaultChat:
      "收到，我們直接練一小段英文對話：\n\nAI: How are you feeling today?\nYou: I feel energetic today.\nAI: Nice! Why do you feel energetic?\n\n換你回一句英文，我會幫你接下一句。",
    greeting:
      "可以，先用這三句英文問候暖身：\n\n1. Hi, nice to meet you.\n2. How is your day going?\n3. I want to practice simple conversation today.\n\n你先回第 1 句，我幫你改得更自然。",
    threeLineChat:
      "可以，我們直接用三句英文開始：\n\nAI: Hi! What do you want to talk about today?\nYou: I want to talk about my day.\nAI: Great. What are three things you did today?\n\n你可以先回：\"Today I...\"，我會接下一句。",
  },
  french: {
    correction:
      "可以，我們直接練一個法文例子：\n\n原句：Je suis très content apprendre français.\n自然一點：Je suis très content d'apprendre le français.\n\n你也傳一句法文給我，我會幫你改成更自然的說法。",
    defaultChat:
      "收到，我們直接練一小段法文對話：\n\nAI : Comment tu te sens aujourd'hui ?\nToi : Je me sens en forme aujourd'hui.\nAI : Très bien ! Pourquoi ?\n\n換你回一句法文，我會幫你接下一句。",
    greeting:
      "可以，先用這三句法文問候暖身：\n\n1. Bonjour, enchanté.\n2. Comment ça va aujourd'hui ?\n3. Je veux pratiquer une conversation simple.\n\n你先回第 1 句，我幫你改得更自然。",
    threeLineChat:
      "可以，我們直接用三句法文開始：\n\nAI : Salut ! Tu veux parler de quoi aujourd'hui ?\nToi : Je veux parler de ma journée.\nAI : D'accord. Tu as fait quelles trois choses aujourd'hui ?\n\n你可以先回：\"Aujourd'hui, j'ai...\"，我會接下一句。",
  },
  japanese: {
    correction:
      "可以，我們直接練一個日文例子：\n\n原句：私は日本語を勉強が楽しいです。\n自然一點：日本語を勉強するのは楽しいです。\n\n你也傳一句日文給我，我會幫你改成更自然的說法。",
    defaultChat:
      "收到，我們直接練一小段日文對話：\n\nAI：今日はどんな気分ですか？\nあなた：今日は元気です。\nAI：いいですね。どうして元気ですか？\n\n換你回一句日文，我會幫你接下一句。",
    greeting:
      "可以，先用這三句日文問候暖身：\n\n1. こんにちは、はじめまして。\n2. 今日はどうですか？\n3. 簡単な会話を練習したいです。\n\n你先回第 1 句，我幫你改得更自然。",
    threeLineChat:
      "可以，我們直接用三句日文開始：\n\nAI：こんにちは！今日は何について話したいですか？\nあなた：今日の一日について話したいです。\nAI：いいですね。今日は何を三つしましたか？\n\n你可以先回：「今日は...」，我會接下一句。",
  },
  korean: {
    correction:
      "可以，我們直接練一個韓文例子：\n\n原句：저는 한국어 공부 좋아요.\n自然一點：저는 한국어 공부하는 것을 좋아해요.\n\n你也傳一句韓文給我，我會幫你改成更自然的說法。",
    defaultChat:
      "收到，我們直接練一小段韓文對話：\n\nAI: 오늘 기분이 어때요?\n나: 오늘 기분이 좋아요.\nAI: 좋아요! 왜 기분이 좋아요?\n\n換你回一句韓文，我會幫你接下一句。",
    greeting:
      "可以，先用這三句韓文問候暖身：\n\n1. 안녕하세요, 만나서 반가워요.\n2. 오늘 하루 어땠어요?\n3. 오늘은 간단한 대화를 연습하고 싶어요.\n\n你先回第 1 句，我幫你改得更自然。",
    threeLineChat:
      "可以，我們直接用三句韓文開始：\n\nAI: 안녕하세요! 오늘 무엇에 대해 이야기하고 싶어요?\n나: 제 하루에 대해 이야기하고 싶어요.\nAI: 좋아요. 오늘 한 일 세 가지가 뭐예요?\n\n你可以先回：「오늘 저는...」，我會接下一句。",
  },
  spanish: {
    correction:
      "可以，我們直接練一個西班牙文例子：\n\n原句：Yo muy gusta estudiar español.\n自然一點：Me gusta mucho estudiar español.\n\n你也傳一句西班牙文給我，我會幫你改成更自然的說法。",
    defaultChat:
      "收到，我們直接練一小段西班牙文對話：\n\nAI: ¿Cómo te sientes hoy?\nTú: Hoy me siento con energía.\nAI: ¡Muy bien! ¿Por qué te sientes así?\n\n換你回一句西班牙文，我會幫你接下一句。",
    greeting:
      "可以，先用這三句西班牙文問候暖身：\n\n1. Hola, mucho gusto.\n2. ¿Cómo va tu día?\n3. Quiero practicar una conversación simple.\n\n你先回第 1 句，我幫你改得更自然。",
    threeLineChat:
      "可以，我們直接用三句西班牙文開始：\n\nAI: ¡Hola! ¿De qué quieres hablar hoy?\nTú: Quiero hablar de mi día.\nAI: Perfecto. ¿Qué tres cosas hiciste hoy?\n\n你可以先回：\"Hoy yo...\"，我會接下一句。",
  },
};

export function getTutorExample(languageId: string) {
  return tutorExamplesByLanguageId[languageId] ?? tutorExamplesByLanguageId.chinese;
}

export function createMockTutorReply(input: string, languageId: string) {
  const normalizedInput = input.trim();
  const example = getTutorExample(languageId);

  if (normalizedInput.includes("改") || normalizedInput.includes("文法")) {
    return example.correction;
  }

  if (normalizedInput.includes("問候") || normalizedInput.includes("你好")) {
    return example.greeting;
  }

  if (
    normalizedInput.includes("三句") ||
    normalizedInput.includes("3句") ||
    normalizedInput.includes("聊天")
  ) {
    return example.threeLineChat;
  }

  return example.defaultChat;
}
