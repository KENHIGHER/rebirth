import { create } from 'zustand';
import { badges, chapters } from '../data/historyGameData';
import { ChapterResult, HistoryGameState } from '../types/historyGame';

type HistoryGameStore = HistoryGameState & {
  startGame: () => void;
  continueGame: () => void;
  goHome: () => void;
  chooseOption: (optionId: string) => void;
  proceedFromStory: () => void;
  answerQuestion: (optionId: string) => void;
  nextQuestion: () => void;
  advanceFromSummary: () => void;
  resetGame: () => void;
};

const STORAGE_KEY = 'party-history-game-progress';

const initialState: HistoryGameState = {
  view: 'home',
  currentChapterIndex: 0,
  currentQuestionIndex: 0,
  chapterPhase: 'story',
  score: 0,
  belief: 80,
  completedChapterIds: [],
  unlockedCharacterIds: [],
  unlockedBadgeIds: [],
  chapterResults: [],
  selectedChoiceId: null,
  selectedAnswerId: null,
  answeredCorrectly: null,
  quizCorrectCount: 0,
  runFinished: false,
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const clampBelief = (belief: number) => Math.max(0, Math.min(100, belief));

const loadState = (): HistoryGameState => {
  if (!canUseStorage()) return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...JSON.parse(raw) };
  } catch {
    return initialState;
  }
};

const computeBadges = (state: HistoryGameState) => {
  const next = new Set<string>();

  if (state.completedChapterIds.includes('nanhu')) next.add('first-light');
  if (state.completedChapterIds.includes('changzheng')) next.add('long-march');
  if (state.runFinished) next.add('inherit-fire');
  if (state.belief >= 100) next.add('full-belief');

  const allCorrect = state.chapterResults.every(
    (item) => item.correctCount === item.totalQuestions,
  ) && state.chapterResults.length === chapters.length;
  if (allCorrect) next.add('perfect-score');

  return badges.filter((badge) => next.has(badge.id)).map((badge) => badge.id);
};

const persistState = (state: HistoryGameState) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const buildChapterResult = (
  state: HistoryGameState,
  scoreEarned: number,
  choiceId: string,
): ChapterResult => {
  const chapter = chapters[state.currentChapterIndex];
  return {
    chapterId: chapter.id,
    scoreEarned,
    correctCount: state.quizCorrectCount,
    totalQuestions: chapter.quiz.length,
    chosenOptionId: choiceId,
  };
};

const applyState = (partial: Partial<HistoryGameState>, getState: () => HistoryGameState) => {
  const nextState = { ...getState(), ...partial };
  const withBadges = { ...nextState, unlockedBadgeIds: computeBadges(nextState) };
  persistState(withBadges);
  return withBadges;
};

export const useHistoryGameStore = create<HistoryGameStore>((set, get) => ({
  ...loadState(),

  startGame: () => {
    const next = {
      ...initialState,
      view: 'chapter' as const,
      chapterPhase: 'story' as const,
    };
    persistState(next);
    set(next);
  },

  continueGame: () => {
    const state = get();
    set(applyState({ view: state.runFinished ? 'honor' : 'chapter' }, get));
  },

  goHome: () => {
    set(applyState({ view: 'home' }, get));
  },

  proceedFromStory: () => {
    set(applyState({ chapterPhase: 'choice' }, get));
  },

  chooseOption: (optionId: string) => {
    const state = get();
    const chapter = chapters[state.currentChapterIndex];
    if (state.chapterPhase !== 'choice' || state.selectedChoiceId) return;

    const option = chapter.choiceOptions.find((item) => item.id === optionId);
    if (!option) return;

    set(
      applyState(
        {
          selectedChoiceId: option.id,
          belief: clampBelief(state.belief + option.beliefDelta),
          score: state.score + option.scoreDelta,
          chapterPhase: 'quiz',
        },
        get,
      ),
    );
  },

  answerQuestion: (optionId: string) => {
    const state = get();
    const chapter = chapters[state.currentChapterIndex];
    const question = chapter.quiz[state.currentQuestionIndex];
    if (!question || state.selectedAnswerId) return;

    const isCorrect = question.answerId === optionId;
    const scoreDelta = isCorrect ? 20 : 5;
    const beliefDelta = isCorrect ? 4 : -3;

    set(
      applyState(
        {
          selectedAnswerId: optionId,
          answeredCorrectly: isCorrect,
          quizCorrectCount: state.quizCorrectCount + (isCorrect ? 1 : 0),
          score: state.score + scoreDelta,
          belief: clampBelief(state.belief + beliefDelta),
        },
        get,
      ),
    );
  },

  nextQuestion: () => {
    const state = get();
    const chapter = chapters[state.currentChapterIndex];
    const isLastQuestion = state.currentQuestionIndex >= chapter.quiz.length - 1;

    if (!state.selectedAnswerId) return;

    if (!isLastQuestion) {
      set(
        applyState(
          {
            currentQuestionIndex: state.currentQuestionIndex + 1,
            selectedAnswerId: null,
            answeredCorrectly: null,
          },
          get,
        ),
      );
      return;
    }

    const choiceId = state.selectedChoiceId ?? chapter.choiceOptions[0].id;
    const result = buildChapterResult(state, state.score, choiceId);
    const completedChapterIds = [...new Set([...state.completedChapterIds, chapter.id])];
    const unlockedCharacterIds = [...new Set([...state.unlockedCharacterIds, chapter.unlockCharacterId])];

    set(
      applyState(
        {
          chapterPhase: 'summary',
          selectedAnswerId: null,
          answeredCorrectly: null,
          completedChapterIds,
          unlockedCharacterIds,
          chapterResults: [...state.chapterResults.filter((item) => item.chapterId !== chapter.id), result],
        },
        get,
      ),
    );
  },

  advanceFromSummary: () => {
    const state = get();
    const isLastChapter = state.currentChapterIndex >= chapters.length - 1;

    if (isLastChapter) {
      set(applyState({ view: 'honor', runFinished: true }, get));
      return;
    }

    set(
      applyState(
        {
          view: 'chapter',
          currentChapterIndex: state.currentChapterIndex + 1,
          currentQuestionIndex: 0,
          chapterPhase: 'story',
          selectedChoiceId: null,
          selectedAnswerId: null,
          answeredCorrectly: null,
          quizCorrectCount: 0,
        },
        get,
      ),
    );
  },

  resetGame: () => {
    if (canUseStorage()) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    set(initialState);
  },
}));
