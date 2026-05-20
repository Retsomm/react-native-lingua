import type { Lesson } from "@/types/learning";

type StarterLessonSeed = {
  id: string;
  languageId: string;
  unitId: string;
  title: string;
  description: string;
  mode: Lesson["mode"];
  order: number;
  vocabulary: {
    term: string;
    translation: string;
    pronunciation: string;
    example: string;
  }[];
  phrase: {
    phrase: string;
    translation: string;
    pronunciation: string;
    context: string;
  };
};

type LessonRow = [
  title: string,
  description: string,
  term1: string,
  translation1: string,
  pronunciation1: string,
  example1: string,
  term2: string,
  translation2: string,
  pronunciation2: string,
  example2: string,
  phrase: string,
  phraseTranslation: string,
  phrasePronunciation: string,
  phraseContext: string,
];

function createStarterLesson(seed: StarterLessonSeed): Lesson {
  const primaryVocabulary = seed.vocabulary[0];
  const secondaryVocabulary = seed.vocabulary[1] ?? seed.vocabulary[0];

  return {
    id: seed.id,
    languageId: seed.languageId,
    unitId: seed.unitId,
    title: seed.title,
    description: seed.description,
    mode: seed.mode,
    order: seed.order,
    xpReward: 10,
    estimatedMinutes: seed.order <= 3 ? 5 : 6,
    goals: [
      `Learn ${primaryVocabulary.term} and ${secondaryVocabulary.term}.`,
      `Practice ${seed.phrase.phrase} in a short response.`,
      "Build confidence with beginner-friendly repetition.",
    ],
    vocabulary: seed.vocabulary.map((item, index) => ({
      id: `${seed.id}-vocab-${index + 1}`,
      ...item,
    })),
    phrases: [
      {
        id: `${seed.id}-phrase-1`,
        ...seed.phrase,
      },
    ],
    activities: [
      {
        id: `${seed.id}-vocab-activity-1`,
        type: "vocabulary",
        prompt: `Tap the word that means ${primaryVocabulary.translation}.`,
        vocabularyId: `${seed.id}-vocab-1`,
      },
      {
        id: `${seed.id}-choice-1`,
        type: "multiple-choice",
        prompt: `What does ${secondaryVocabulary.term} mean?`,
        answer: secondaryVocabulary.translation,
        options: [
          secondaryVocabulary.translation,
          primaryVocabulary.translation,
          "teacher",
          "water",
        ],
      },
      {
        id: `${seed.id}-repeat-1`,
        type: "listen-and-repeat",
        prompt: "Listen and repeat the phrase.",
        text: seed.phrase.phrase,
        pronunciation: seed.phrase.pronunciation,
      },
    ],
    aiTeacherPrompt: `Warm ${seed.languageId} lesson: use only ${seed.vocabulary
      .slice(0, 2)
      .map((item) => item.term)
      .join(", ")} and ${seed.phrase.phrase}. Mostly speak English, say each target item slowly with its meaning, listen, encourage, and ask for one repeat or try-again in one or two short sentences.`,
  };
}

export const lessons: Lesson[] = [
  {
    id: "spanish-greetings",
    languageId: "spanish",
    unitId: "spanish-basics",
    title: "Friendly Greetings",
    description: "Learn how to say hello, goodbye, and ask how someone is.",
    mode: "ai-teacher",
    order: 1,
    xpReward: 10,
    estimatedMinutes: 5,
    goals: [
      "Say hello and goodbye in Spanish.",
      "Ask someone how they are.",
      "Recognize common greeting vocabulary.",
    ],
    vocabulary: [
      {
        id: "es-hola",
        term: "hola",
        translation: "hello",
        pronunciation: "OH-lah",
        example: "Hola, Sofia.",
      },
      {
        id: "es-adios",
        term: "adiós",
        translation: "goodbye",
        pronunciation: "ah-DYOS",
        example: "Adiós, Mateo.",
      },
    ],
    phrases: [
      {
        id: "es-como-estas",
        phrase: "¿Cómo estás?",
        translation: "How are you?",
        pronunciation: "KOH-moh ehs-TAHS",
        context: "Use with friends or classmates.",
      },
    ],
    activities: [
      {
        id: "es-greetings-vocab-1",
        type: "vocabulary",
        prompt: "Tap the word that means hello.",
        vocabularyId: "es-hola",
      },
      {
        id: "es-greetings-choice-1",
        type: "multiple-choice",
        prompt: "What does adiós mean?",
        answer: "goodbye",
        options: ["goodbye", "please", "water", "teacher"],
      },
      {
        id: "es-greetings-repeat-1",
        type: "listen-and-repeat",
        prompt: "Listen and repeat the greeting.",
        text: "¿Cómo estás?",
        pronunciation: "KOH-moh ehs-TAHS",
      },
    ],
    aiTeacherPrompt:
      "Warm Spanish greetings lesson: use only hola, adiós, and ¿Cómo estás? Mostly speak English, say each Spanish phrase slowly with its meaning, listen, encourage, and ask for one repeat or try-again in one or two short sentences.",
  },
  {
    id: "spanish-introductions",
    languageId: "spanish",
    unitId: "spanish-basics",
    title: "Introduce Yourself",
    description: "Tell someone your name and ask for theirs.",
    mode: "practice",
    order: 2,
    xpReward: 10,
    estimatedMinutes: 6,
    goals: [
      "Say your name in Spanish.",
      "Ask another person for their name.",
      "Use a simple introduction in a short chat.",
    ],
    vocabulary: [
      {
        id: "es-nombre",
        term: "nombre",
        translation: "name",
        pronunciation: "NOHM-breh",
        example: "Mi nombre es Ana.",
      },
    ],
    phrases: [
      {
        id: "es-me-llamo",
        phrase: "Me llamo...",
        translation: "My name is...",
        pronunciation: "meh YAH-moh",
        context: "Use when introducing yourself.",
      },
      {
        id: "es-como-te-llamas",
        phrase: "¿Cómo te llamas?",
        translation: "What is your name?",
        pronunciation: "KOH-moh teh YAH-mahs",
        context: "Use with a new friend.",
      },
    ],
    activities: [
      {
        id: "es-intro-phrase-1",
        type: "phrase",
        prompt: "Learn the phrase for My name is...",
        phraseId: "es-me-llamo",
      },
      {
        id: "es-intro-chat-1",
        type: "chat-prompt",
        prompt: "Introduce yourself to your AI tutor.",
        expectedPhrases: ["Me llamo", "¿Cómo te llamas?"],
      },
    ],
    aiTeacherPrompt:
      "Warm Spanish introduction lesson: use only nombre, Me llamo..., and ¿Cómo te llamas? Mostly speak English, model each phrase slowly with its meaning, listen for the learner's name, encourage, and ask for one repeat or try-again in one or two short sentences.",
  },
  {
    id: "french-greetings",
    languageId: "french",
    unitId: "french-basics",
    title: "Bonjour Basics",
    description: "Say hello, goodbye, and ask how someone is in French.",
    mode: "ai-teacher",
    order: 1,
    xpReward: 10,
    estimatedMinutes: 5,
    goals: [
      "Greet someone politely in French.",
      "Say goodbye.",
      "Ask how someone is feeling.",
    ],
    vocabulary: [
      {
        id: "fr-bonjour",
        term: "bonjour",
        translation: "hello",
        pronunciation: "bohn-ZHOOR",
        example: "Bonjour, Camille.",
      },
      {
        id: "fr-au-revoir",
        term: "au revoir",
        translation: "goodbye",
        pronunciation: "oh ruh-VWAHR",
        example: "Au revoir, Louis.",
      },
    ],
    phrases: [
      {
        id: "fr-comment-ca-va",
        phrase: "Comment ça va ?",
        translation: "How are you?",
        pronunciation: "koh-MAHN sah vah",
        context: "Use in casual conversation.",
      },
    ],
    activities: [
      {
        id: "fr-greetings-vocab-1",
        type: "vocabulary",
        prompt: "Tap the word that means hello.",
        vocabularyId: "fr-bonjour",
      },
      {
        id: "fr-greetings-choice-1",
        type: "multiple-choice",
        prompt: "What does au revoir mean?",
        answer: "goodbye",
        options: ["goodbye", "thank you", "bread", "yes"],
      },
      {
        id: "fr-greetings-repeat-1",
        type: "listen-and-repeat",
        prompt: "Listen and repeat the question.",
        text: "Comment ça va ?",
        pronunciation: "koh-MAHN sah vah",
      },
    ],
    aiTeacherPrompt:
      "Warm French greetings lesson: use only bonjour, au revoir, and Comment ça va ? Mostly speak English, say each French phrase slowly with its meaning, listen, encourage, and ask for one repeat or try-again in one or two short sentences.",
  },
  {
    id: "french-cafe",
    languageId: "french",
    unitId: "french-basics",
    title: "Cafe Starter",
    description: "Practice polite phrases for ordering a drink.",
    mode: "audio",
    order: 2,
    xpReward: 10,
    estimatedMinutes: 6,
    goals: [
      "Say please and thank you.",
      "Ask for a coffee politely.",
      "Recognize a simple cafe order.",
    ],
    vocabulary: [
      {
        id: "fr-merci",
        term: "merci",
        translation: "thank you",
        pronunciation: "mehr-SEE",
        example: "Merci beaucoup.",
      },
      {
        id: "fr-cafe",
        term: "café",
        translation: "coffee",
        pronunciation: "kah-FAY",
        example: "Un café, s'il vous plaît.",
      },
    ],
    phrases: [
      {
        id: "fr-sil-vous-plait",
        phrase: "s'il vous plaît",
        translation: "please",
        pronunciation: "seel voo PLEH",
        context: "Use for polite requests.",
      },
    ],
    activities: [
      {
        id: "fr-cafe-phrase-1",
        type: "phrase",
        prompt: "Learn the polite phrase for please.",
        phraseId: "fr-sil-vous-plait",
      },
      {
        id: "fr-cafe-choice-1",
        type: "multiple-choice",
        prompt: "Which word means coffee?",
        answer: "café",
        options: ["café", "bonjour", "merci", "chat"],
      },
    ],
    aiTeacherPrompt:
      "Warm French cafe lesson: use only café, merci, and s'il vous plaît. Mostly speak English, say each French phrase slowly with its meaning, listen, encourage, and ask for one repeat or try-again in one or two short sentences.",
  },
  {
    id: "japanese-greetings",
    languageId: "japanese",
    unitId: "japanese-basics",
    title: "Everyday Greetings",
    description: "Learn simple greetings for hello and thank you.",
    mode: "ai-teacher",
    order: 1,
    xpReward: 10,
    estimatedMinutes: 5,
    goals: [
      "Say hello in Japanese.",
      "Say thank you.",
      "Practice beginner-friendly pronunciation.",
    ],
    vocabulary: [
      {
        id: "ja-konnichiwa",
        term: "こんにちは",
        translation: "hello",
        pronunciation: "kohn-nee-chee-wah",
        example: "こんにちは、ゆいさん。",
      },
      {
        id: "ja-arigatou",
        term: "ありがとう",
        translation: "thank you",
        pronunciation: "ah-ree-gah-toh",
        example: "ありがとう、先生。",
      },
    ],
    phrases: [
      {
        id: "ja-hajimemashite",
        phrase: "はじめまして",
        translation: "Nice to meet you",
        pronunciation: "hah-jee-meh-mah-shee-teh",
        context: "Use when meeting someone for the first time.",
      },
    ],
    activities: [
      {
        id: "ja-greetings-vocab-1",
        type: "vocabulary",
        prompt: "Tap the phrase that means hello.",
        vocabularyId: "ja-konnichiwa",
      },
      {
        id: "ja-greetings-repeat-1",
        type: "listen-and-repeat",
        prompt: "Listen and repeat thank you.",
        text: "ありがとう",
        pronunciation: "ah-ree-gah-toh",
      },
      {
        id: "ja-greetings-choice-1",
        type: "multiple-choice",
        prompt: "What does はじめまして mean?",
        answer: "Nice to meet you",
        options: ["Nice to meet you", "Good night", "Water", "Book"],
      },
    ],
    aiTeacherPrompt:
      "Warm Japanese greetings lesson: use only こんにちは, ありがとう, and はじめまして. Mostly speak English, say each Japanese phrase slowly with its meaning, listen, encourage, and ask for one repeat or try-again in one or two short sentences.",
  },
  {
    id: "japanese-classroom",
    languageId: "japanese",
    unitId: "japanese-basics",
    title: "Classroom Words",
    description: "Use a few simple words for learning with a teacher.",
    mode: "practice",
    order: 2,
    xpReward: 10,
    estimatedMinutes: 6,
    goals: [
      "Recognize teacher and student.",
      "Say yes and no.",
      "Answer one simple classroom prompt.",
    ],
    vocabulary: [
      {
        id: "ja-sensei",
        term: "先生",
        translation: "teacher",
        pronunciation: "sehn-say",
        example: "田中先生",
      },
      {
        id: "ja-hai",
        term: "はい",
        translation: "yes",
        pronunciation: "high",
        example: "はい、わかります。",
      },
      {
        id: "ja-iie",
        term: "いいえ",
        translation: "no",
        pronunciation: "ee-eh",
        example: "いいえ、まだです。",
      },
    ],
    phrases: [
      {
        id: "ja-wakarimasu",
        phrase: "わかります",
        translation: "I understand",
        pronunciation: "wah-kah-ree-mahs",
        context: "Use when a teacher asks if you understand.",
      },
    ],
    activities: [
      {
        id: "ja-classroom-vocab-1",
        type: "vocabulary",
        prompt: "Tap the word that means teacher.",
        vocabularyId: "ja-sensei",
      },
      {
        id: "ja-classroom-choice-1",
        type: "multiple-choice",
        prompt: "Which word means yes?",
        answer: "はい",
        options: ["はい", "いいえ", "先生", "こんにちは"],
      },
      {
        id: "ja-classroom-chat-1",
        type: "chat-prompt",
        prompt: "Answer your teacher with yes or no.",
        expectedPhrases: ["はい", "いいえ"],
      },
    ],
    aiTeacherPrompt:
      "Warm Japanese classroom lesson: use only 先生, はい, いいえ, and わかります. Mostly speak English, say each Japanese word slowly with its meaning, listen, encourage, and ask for one repeat or try-again in one or two short sentences.",
  },
  ...getAdditionalStarterLessons(),
];

function getAdditionalStarterLessons() {
  return [
    createStarterLesson({
      id: "spanish-cafe",
      languageId: "spanish",
      unitId: "spanish-basics",
      title: "At the Cafe",
      description: "Order a drink and thank the server politely.",
      mode: "audio",
      order: 3,
      vocabulary: [
        { term: "café", translation: "coffee", pronunciation: "kah-FEH", example: "Quiero un café." },
        { term: "gracias", translation: "thank you", pronunciation: "GRAH-see-ahs", example: "Gracias por el café." },
      ],
      phrase: { phrase: "Un café, por favor.", translation: "A coffee, please.", pronunciation: "oon kah-FEH por fah-VOR", context: "Use when ordering at a cafe." },
    }),
    createStarterLesson({
      id: "spanish-travel",
      languageId: "spanish",
      unitId: "spanish-basics",
      title: "Travel & Directions",
      description: "Ask where a place is and follow a simple direction.",
      mode: "practice",
      order: 4,
      vocabulary: [
        { term: "calle", translation: "street", pronunciation: "KAH-yeh", example: "La calle es grande." },
        { term: "derecha", translation: "right", pronunciation: "deh-REH-chah", example: "Gira a la derecha." },
      ],
      phrase: { phrase: "¿Dónde está...?", translation: "Where is...?", pronunciation: "DON-deh ehs-TAH", context: "Use when asking for directions." },
    }),
    createStarterLesson({
      id: "spanish-shopping",
      languageId: "spanish",
      unitId: "spanish-basics",
      title: "Shopping",
      description: "Ask about prices and identify common store words.",
      mode: "chat",
      order: 5,
      vocabulary: [
        { term: "precio", translation: "price", pronunciation: "PREH-see-oh", example: "El precio es bueno." },
        { term: "tienda", translation: "store", pronunciation: "TYEN-dah", example: "La tienda está abierta." },
      ],
      phrase: { phrase: "¿Cuánto cuesta?", translation: "How much does it cost?", pronunciation: "KWAN-toh KWEHS-tah", context: "Use before buying something." },
    }),
    createStarterLesson({
      id: "spanish-family",
      languageId: "spanish",
      unitId: "spanish-basics",
      title: "Family & Friends",
      description: "Talk about people close to you.",
      mode: "practice",
      order: 6,
      vocabulary: [
        { term: "familia", translation: "family", pronunciation: "fah-MEE-lyah", example: "Mi familia es pequeña." },
        { term: "amigo", translation: "friend", pronunciation: "ah-MEE-goh", example: "Mi amigo se llama Luis." },
      ],
      phrase: { phrase: "Este es mi amigo.", translation: "This is my friend.", pronunciation: "EHS-teh ehs mee ah-MEE-goh", context: "Use when introducing a friend." },
    }),
    createStarterLesson({
      id: "french-daily-life",
      languageId: "french",
      unitId: "french-basics",
      title: "Daily Life",
      description: "Name simple routines and everyday moments.",
      mode: "practice",
      order: 3,
      vocabulary: [
        { term: "matin", translation: "morning", pronunciation: "mah-TAN", example: "Bonjour le matin." },
        { term: "soir", translation: "evening", pronunciation: "swahr", example: "Bonsoir le soir." },
      ],
      phrase: { phrase: "Je suis prêt.", translation: "I am ready.", pronunciation: "zhuh swee preh", context: "Use when starting an activity." },
    }),
    createStarterLesson({
      id: "french-travel",
      languageId: "french",
      unitId: "french-basics",
      title: "Travel & Directions",
      description: "Ask where something is during a trip.",
      mode: "practice",
      order: 4,
      vocabulary: [
        { term: "gare", translation: "station", pronunciation: "gahr", example: "La gare est proche." },
        { term: "droite", translation: "right", pronunciation: "drwaht", example: "Tournez à droite." },
      ],
      phrase: { phrase: "Où est la gare ?", translation: "Where is the station?", pronunciation: "oo eh lah gahr", context: "Use when traveling by train." },
    }),
    createStarterLesson({
      id: "french-shopping",
      languageId: "french",
      unitId: "french-basics",
      title: "Shopping",
      description: "Ask for an item and understand a simple price.",
      mode: "chat",
      order: 5,
      vocabulary: [
        { term: "prix", translation: "price", pronunciation: "pree", example: "Le prix est bas." },
        { term: "magasin", translation: "store", pronunciation: "mah-gah-ZAN", example: "Le magasin est ouvert." },
      ],
      phrase: { phrase: "Je voudrais ceci.", translation: "I would like this.", pronunciation: "zhuh voo-DREH suh-SEE", context: "Use while shopping politely." },
    }),
    createStarterLesson({
      id: "french-family",
      languageId: "french",
      unitId: "french-basics",
      title: "Family & Friends",
      description: "Introduce close people in simple French.",
      mode: "practice",
      order: 6,
      vocabulary: [
        { term: "famille", translation: "family", pronunciation: "fah-MEE", example: "Ma famille est ici." },
        { term: "ami", translation: "friend", pronunciation: "ah-MEE", example: "Mon ami parle français." },
      ],
      phrase: { phrase: "Voici mon ami.", translation: "This is my friend.", pronunciation: "vwah-SEE mohn ah-MEE", context: "Use when introducing a friend." },
    }),
    createStarterLesson({
      id: "japanese-cafe",
      languageId: "japanese",
      unitId: "japanese-basics",
      title: "At the Cafe",
      description: "Order tea or coffee with polite language.",
      mode: "audio",
      order: 3,
      vocabulary: [
        { term: "コーヒー", translation: "coffee", pronunciation: "koh-hee", example: "コーヒーをください。" },
        { term: "お茶", translation: "tea", pronunciation: "oh-chah", example: "お茶を飲みます。" },
      ],
      phrase: { phrase: "これをください。", translation: "This, please.", pronunciation: "koh-reh oh koo-dah-sai", context: "Use when ordering or buying." },
    }),
    createStarterLesson({
      id: "japanese-travel",
      languageId: "japanese",
      unitId: "japanese-basics",
      title: "Travel & Directions",
      description: "Ask where the station is and understand directions.",
      mode: "practice",
      order: 4,
      vocabulary: [
        { term: "駅", translation: "station", pronunciation: "eh-kee", example: "駅はどこですか。" },
        { term: "右", translation: "right", pronunciation: "mee-gee", example: "右に行きます。" },
      ],
      phrase: { phrase: "駅はどこですか。", translation: "Where is the station?", pronunciation: "eh-kee wah doh-koh dehs kah", context: "Use when asking for directions." },
    }),
    createStarterLesson({
      id: "japanese-shopping",
      languageId: "japanese",
      unitId: "japanese-basics",
      title: "Shopping",
      description: "Ask about prices and point to what you want.",
      mode: "chat",
      order: 5,
      vocabulary: [
        { term: "いくら", translation: "how much", pronunciation: "ee-koo-rah", example: "これはいくらですか。" },
        { term: "店", translation: "store", pronunciation: "miseh", example: "店に行きます。" },
      ],
      phrase: { phrase: "これはいくらですか。", translation: "How much is this?", pronunciation: "koh-reh wah ee-koo-rah dehs kah", context: "Use while shopping." },
    }),
    createStarterLesson({
      id: "japanese-family",
      languageId: "japanese",
      unitId: "japanese-basics",
      title: "Family & Friends",
      description: "Talk about your family and friends.",
      mode: "practice",
      order: 6,
      vocabulary: [
        { term: "家族", translation: "family", pronunciation: "kah-zoh-koo", example: "家族がいます。" },
        { term: "友だち", translation: "friend", pronunciation: "toh-moh-dah-chee", example: "友だちです。" },
      ],
      phrase: { phrase: "こちらは友だちです。", translation: "This is my friend.", pronunciation: "koh-chee-rah wah toh-moh-dah-chee dehs", context: "Use when introducing someone." },
    }),
    ...createLanguageStarterSet("korean", "korean-basics", [
      ["Greetings & Introductions", "Say hello and introduce yourself.", "안녕하세요", "hello", "ahn-nyoung-hah-seh-yoh", "안녕하세요, 민지예요.", "이름", "name", "ee-reum", "제 이름은 민지예요.", "제 이름은...", "My name is...", "jeh ee-reum-eun", "Use when introducing yourself."],
      ["Daily Life", "Practice useful daily routine words.", "아침", "morning", "ah-chim", "아침이에요.", "학교", "school", "hak-gyo", "학교에 가요.", "학교에 가요.", "I go to school.", "hak-gyo-eh gah-yoh", "Use when talking about your day."],
      ["At the Cafe", "Order a drink politely.", "커피", "coffee", "kuh-pee", "커피 주세요.", "감사합니다", "thank you", "gahm-sah-hahm-nee-dah", "감사합니다.", "커피 주세요.", "Coffee, please.", "kuh-pee joo-seh-yoh", "Use when ordering coffee."],
      ["Travel & Directions", "Ask where a place is.", "역", "station", "yeok", "역은 어디예요?", "오른쪽", "right", "oh-reun-jjok", "오른쪽으로 가요.", "역은 어디예요?", "Where is the station?", "yeok-eun oh-dee-yeh-yoh", "Use when asking for directions."],
      ["Shopping", "Ask prices and name store items.", "가격", "price", "gah-gyeok", "가격이 좋아요.", "가게", "store", "gah-geh", "가게에 가요.", "얼마예요?", "How much is it?", "eol-mah-yeh-yoh", "Use before buying something."],
      ["Family & Friends", "Introduce people close to you.", "가족", "family", "gah-jok", "가족이에요.", "친구", "friend", "chin-goo", "제 친구예요.", "제 친구예요.", "This is my friend.", "jeh chin-goo-yeh-yoh", "Use when introducing a friend."],
    ]),
    ...createLanguageStarterSet("chinese", "chinese-basics", [
      ["Greetings & Introductions", "Say hello and share your name.", "你好", "hello", "nee how", "你好，我是小明。", "名字", "name", "ming dzuh", "我的名字是小明。", "我叫...", "My name is...", "waw jyow", "Use when introducing yourself."],
      ["Daily Life", "Talk about school and routines.", "早上", "morning", "dzow shahng", "早上好。", "学校", "school", "shwe shyaow", "我去学校。", "我去学校。", "I go to school.", "waw chyoo shwe shyaow", "Use when describing your day."],
      ["At the Cafe", "Order tea or coffee politely.", "咖啡", "coffee", "kah fay", "我要咖啡。", "谢谢", "thank you", "shyeh shyeh", "谢谢你。", "我要一杯咖啡。", "I want a cup of coffee.", "waw yaow ee bay kah fay", "Use when ordering coffee."],
      ["Travel & Directions", "Ask for places and directions.", "车站", "station", "chuh jahn", "车站在哪里？", "右边", "right side", "yo byan", "在右边。", "车站在哪里？", "Where is the station?", "chuh jahn dzai nah lee", "Use when asking for directions."],
      ["Shopping", "Ask how much something costs.", "价格", "price", "jyah guh", "价格很好。", "商店", "store", "shahng dyan", "商店开了。", "多少钱？", "How much money?", "dwaw shaow chyan", "Use while shopping."],
      ["Family & Friends", "Talk about family and friends.", "家人", "family", "jyah ren", "我的家人。", "朋友", "friend", "peng yo", "这是我的朋友。", "这是我的朋友。", "This is my friend.", "juh shih waw duh peng yo", "Use when introducing a friend."],
    ]),
    ...createLanguageStarterSet("english", "english-basics", [
      ["Greetings & Introductions", "Say hello and introduce yourself.", "hello", "a greeting", "heh-LOW", "Hello, I am Mia.", "name", "name", "naym", "My name is Mia.", "My name is...", "My name is...", "my naym iz", "Use when introducing yourself."],
      ["Daily Life", "Practice simple routine words.", "morning", "morning", "MOR-ning", "Good morning.", "school", "school", "skool", "I go to school.", "I go to school.", "I go to school.", "eye goh too skool", "Use when talking about your day."],
      ["At the Cafe", "Order a drink politely.", "coffee", "coffee", "KAW-fee", "I want coffee.", "please", "please", "pleez", "Coffee, please.", "Coffee, please.", "Coffee, please.", "KAW-fee pleez", "Use when ordering a drink."],
      ["Travel & Directions", "Ask where a place is.", "station", "station", "STAY-shun", "Where is the station?", "right", "right", "ryt", "Turn right.", "Where is the station?", "Where is the station?", "wair iz the STAY-shun", "Use when asking for directions."],
      ["Shopping", "Ask about prices.", "price", "price", "prys", "The price is low.", "store", "store", "stor", "The store is open.", "How much is it?", "How much is it?", "how much iz it", "Use before buying something."],
      ["Family & Friends", "Introduce family and friends.", "family", "family", "FAM-uh-lee", "This is my family.", "friend", "friend", "frend", "This is my friend.", "This is my friend.", "This is my friend.", "this iz my frend", "Use when introducing a friend."],
    ]),
  ];
}

function createLanguageStarterSet(
  languageId: string,
  unitId: string,
  rows: LessonRow[],
) {
  return rows.map((row, index) => {
    const [
      title,
      description,
      term1,
      translation1,
      pronunciation1,
      example1,
      term2,
      translation2,
      pronunciation2,
      example2,
      phrase,
      phraseTranslation,
      phrasePronunciation,
      phraseContext,
    ] = row;

    return createStarterLesson({
      id: `${languageId}-${title.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-")}`,
      languageId,
      unitId,
      title,
      description,
      mode: index === 2 ? "audio" : index === 4 ? "chat" : "practice",
      order: index + 1,
      vocabulary: [
        {
          term: term1,
          translation: translation1,
          pronunciation: pronunciation1,
          example: example1,
        },
        {
          term: term2,
          translation: translation2,
          pronunciation: pronunciation2,
          example: example2,
        },
      ],
      phrase: {
        phrase,
        translation: phraseTranslation,
        pronunciation: phrasePronunciation,
        context: phraseContext,
      },
    });
  });
}
