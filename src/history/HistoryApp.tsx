import { Compass, Home, Medal } from 'lucide-react';
import ChapterScreen from '../components/history/ChapterScreen';
import HomeScreen from '../components/history/HomeScreen';
import HonorScreen from '../components/history/HonorScreen';
import ProgressHeader from '../components/history/ProgressHeader';
import { chapters } from '../data/historyGameData';
import { useHistoryGameStore } from '../store/historyGameStore';

function HistoryApp() {
  const {
    view,
    currentChapterIndex,
    currentQuestionIndex,
    chapterPhase,
    score,
    belief,
    completedChapterIds,
    unlockedCharacterIds,
    unlockedBadgeIds,
    chapterResults,
    selectedChoiceId,
    selectedAnswerId,
    answeredCorrectly,
    runFinished,
    startGame,
    continueGame,
    goHome,
    proceedFromStory,
    chooseOption,
    answerQuestion,
    nextQuestion,
    advanceFromSummary,
    resetGame,
  } = useHistoryGameStore();

  const currentChapter = chapters[currentChapterIndex];
  const hasProgress = completedChapterIds.length > 0 || currentChapterIndex > 0 || runFinished;

  return (
    <div className="history-shell min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="history-panel min-h-[calc(100vh-3rem)] rounded-[40px] border border-white/8 p-4 sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/8 bg-black/20 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.42em] text-zinc-500">网页小游戏</p>
              <h1 className="mt-2 font-serif text-2xl text-amber-50">红色经典中的党史之旅</h1>
            </div>
            <nav className="flex flex-wrap gap-3">
              <button
                onClick={goHome}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  view === 'home'
                    ? 'bg-amber-200 text-zinc-950'
                    : 'border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10'
                }`}
              >
                <Home size={16} />
                首页
              </button>
              <button
                onClick={continueGame}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  view === 'chapter'
                    ? 'bg-red-800 text-red-50'
                    : 'border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10'
                }`}
              >
                <Compass size={16} />
                闯关
              </button>
              <button
                onClick={() => useHistoryGameStore.setState({ view: 'honor' })}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  view === 'honor'
                    ? 'bg-amber-200 text-zinc-950'
                    : 'border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10'
                }`}
              >
                <Medal size={16} />
                荣誉墙
              </button>
            </nav>
          </div>

          {view !== 'home' && (
            <div className="mb-6">
              <ProgressHeader
                chapterTitle={runFinished ? '荣誉总览' : currentChapter.title}
                chapterYear={runFinished ? '完成全部章节' : currentChapter.year}
                score={score}
                belief={belief}
                completedCount={completedChapterIds.length}
                totalCount={chapters.length}
              />
            </div>
          )}

          {view === 'home' && (
            <HomeScreen
              completedChapterIds={completedChapterIds}
              hasProgress={hasProgress}
              onStart={startGame}
              onContinue={continueGame}
              onReset={resetGame}
              onViewHonor={() => useHistoryGameStore.setState({ view: 'honor' })}
            />
          )}

          {view === 'chapter' && (
            <ChapterScreen
              chapter={currentChapter}
              phase={chapterPhase}
              questionIndex={currentQuestionIndex}
              selectedChoiceId={selectedChoiceId}
              selectedAnswerId={selectedAnswerId}
              answeredCorrectly={answeredCorrectly}
              belief={belief}
              onProceedFromStory={proceedFromStory}
              onChooseOption={chooseOption}
              onAnswerQuestion={answerQuestion}
              onNextQuestion={nextQuestion}
              onAdvanceFromSummary={advanceFromSummary}
            />
          )}

          {view === 'honor' && (
            <HonorScreen
              score={score}
              belief={belief}
              unlockedCharacterIds={unlockedCharacterIds}
              unlockedBadgeIds={unlockedBadgeIds}
              chapterResults={chapterResults}
              runFinished={runFinished}
              onGoHome={goHome}
              onRestart={startGame}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryApp;
