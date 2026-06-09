export type GameView = 'home' | 'chapter' | 'honor';

export type ChapterPhase = 'story' | 'choice' | 'quiz' | 'summary';

export type ChoiceOption = {
  id: string;
  label: string;
  consequence: string;
  beliefDelta: number;
  scoreDelta: number;
  isCorrect: boolean;
};

export type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  answerId: string;
  explanation: string;
};

export type CharacterCard = {
  id: string;
  name: string;
  title: string;
  description: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
};

export type ChapterStage = {
  id: string;
  title: string;
  year: string;
  theme: string;
  narrative: string[];
  quote: string;
  choicePrompt: string;
  choiceOptions: ChoiceOption[];
  quiz: QuizQuestion[];
  unlockCharacterId: string;
  summary: string;
};

export type ChapterResult = {
  chapterId: string;
  scoreEarned: number;
  correctCount: number;
  totalQuestions: number;
  chosenOptionId: string;
};

export type HistoryGameState = {
  view: GameView;
  currentChapterIndex: number;
  currentQuestionIndex: number;
  chapterPhase: ChapterPhase;
  score: number;
  belief: number;
  completedChapterIds: string[];
  unlockedCharacterIds: string[];
  unlockedBadgeIds: string[];
  chapterResults: ChapterResult[];
  selectedChoiceId: string | null;
  selectedAnswerId: string | null;
  answeredCorrectly: boolean | null;
  quizCorrectCount: number;
  runFinished: boolean;
};
