import { Award, BookHeart, Home, RotateCcw, Sparkles, Star } from 'lucide-react';
import { badges, characterCards, chapters } from '../../data/historyGameData';
import { ChapterResult } from '../../types/historyGame';

type HonorScreenProps = {
  score: number;
  belief: number;
  unlockedCharacterIds: string[];
  unlockedBadgeIds: string[];
  chapterResults: ChapterResult[];
  runFinished: boolean;
  onGoHome: () => void;
  onRestart: () => void;
};

export default function HonorScreen({
  score,
  belief,
  unlockedCharacterIds,
  unlockedBadgeIds,
  chapterResults,
  runFinished,
  onGoHome,
  onRestart,
}: HonorScreenProps) {
  const unlockedCharacters = characterCards.filter((item) => unlockedCharacterIds.includes(item.id));
  const unlockedBadges = badges.filter((item) => unlockedBadgeIds.includes(item.id));
  const totalQuestions = chapters.reduce((sum, chapter) => sum + chapter.quiz.length, 0);
  const correctAnswers = chapterResults.reduce((sum, item) => sum + item.correctCount, 0);

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-red-900/35 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(70,14,14,0.92))] p-8 shadow-[0_36px_100px_rgba(0,0,0,0.4)]">
        <p className="text-xs uppercase tracking-[0.42em] text-amber-200/60">最终荣誉</p>
        <h2 className="mt-3 font-serif text-4xl text-amber-50">
          {runFinished ? '党史长卷已点亮' : '阶段荣誉总览'}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-300">
          {runFinished
            ? '你已经完成全部章节，用剧情体验、历史抉择和知识问答走过一段浓缩的党史之旅。现在可以回顾本次成绩，也可以重新挑战更高分。'
            : '这里会汇总你当前已获得的分数、人物卡和徽章。完成全部章节后，荣誉墙将完整点亮。'}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            ['总分', `${score}`],
            ['信念值', `${belief}`],
            ['答对题数', `${correctAnswers}/${totalQuestions}`],
            ['解锁人物', `${unlockedCharacters.length}`],
          ].map(([title, value]) => (
            <div key={title} className="rounded-3xl border border-white/8 bg-black/20 px-5 py-5">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</p>
              <p className="mt-3 text-3xl font-semibold text-amber-50">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-3 rounded-full border border-amber-300/60 bg-amber-200 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-100"
          >
            <RotateCcw size={18} />
            再挑战一次
          </button>
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-6 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-white/12"
          >
            <Home size={18} />
            返回首页
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[28px] border border-white/8 bg-zinc-950/85 p-6">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
            <Award size={14} />
            徽章墙
          </p>
          <div className="mt-5 grid gap-4">
            {unlockedBadges.map((badge) => (
              <div key={badge.id} className="rounded-3xl border border-amber-300/20 bg-amber-100/5 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Star size={16} className="text-amber-300" />
                  <p className="text-base font-semibold text-amber-100">{badge.name}</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-300">{badge.description}</p>
              </div>
            ))}
            {unlockedBadges.length === 0 && (
              <p className="rounded-3xl border border-white/8 bg-white/[0.03] px-5 py-4 text-sm text-zinc-400">
                暂未解锁徽章，继续挑战会看到更多荣誉反馈。
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/8 bg-zinc-950/85 p-6">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
              <Sparkles size={14} />
              人物图鉴
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {unlockedCharacters.map((character) => (
                <article
                  key={character.id}
                  className="rounded-3xl border border-red-900/25 bg-[linear-gradient(180deg,rgba(120,20,20,0.18),rgba(255,255,255,0.02))] px-5 py-5"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{character.title}</p>
                  <h3 className="mt-3 font-serif text-2xl text-zinc-100">{character.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-300">{character.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-zinc-950/85 p-6">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
              <BookHeart size={14} />
              党史回顾
            </p>
            <div className="mt-5 space-y-4">
              {chapters.map((chapter, index) => {
                const result = chapterResults.find((item) => item.chapterId === chapter.id);
                return (
                  <div key={chapter.id} className="rounded-3xl border border-white/8 bg-white/[0.03] px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                      第 {index + 1} 章 · {chapter.year}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-zinc-100">{chapter.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-zinc-300">{chapter.summary}</p>
                    {result && (
                      <p className="mt-3 text-xs tracking-[0.12em] text-amber-200/75">
                        本章表现：{result.correctCount}/{result.totalQuestions} 题正确
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
