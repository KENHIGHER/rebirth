import { ArrowRight, BookMarked, Medal, PlayCircle, RotateCcw } from 'lucide-react';
import { chapters } from '../../data/historyGameData';

type HomeScreenProps = {
  completedChapterIds: string[];
  hasProgress: boolean;
  onStart: () => void;
  onContinue: () => void;
  onReset: () => void;
  onViewHonor: () => void;
};

export default function HomeScreen({
  completedChapterIds,
  hasProgress,
  onStart,
  onContinue,
  onReset,
  onViewHonor,
}: HomeScreenProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="relative overflow-hidden rounded-[32px] border border-red-900/40 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(56,10,10,0.92))] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_30%)]" />
        <div className="relative">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs uppercase tracking-[0.38em] text-amber-100/75">
            <BookMarked size={14} />
            红色经典互动长卷
          </p>
          <h1 className="max-w-3xl font-serif text-5xl leading-tight text-amber-50">
            党史闯关小游戏
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-300">
            从南湖启航到新中国成立，你将进入三个关键历史场景，在剧情抉择与知识问答中完成一场有温度、有节奏的党史学习体验。
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-3 rounded-full border border-amber-300/60 bg-amber-200 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-amber-100"
            >
              <PlayCircle size={18} />
              开始闯关
            </button>
            <button
              onClick={onContinue}
              disabled={!hasProgress}
              className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/8 px-6 py-3 text-sm font-semibold text-zinc-100 transition hover:-translate-y-0.5 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRight size={18} />
              继续进度
            </button>
            <button
              onClick={onViewHonor}
              className="inline-flex items-center gap-3 rounded-full border border-red-500/30 bg-red-950/60 px-6 py-3 text-sm font-semibold text-red-100 transition hover:-translate-y-0.5 hover:bg-red-900/60"
            >
              <Medal size={18} />
              查看荣誉墙
            </button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ['玩法', '剧情体验 + 历史抉择 + 单选答题'],
              ['目标', '点亮三章党史长卷，收集人物卡'],
              ['反馈', '信念值、章节总分与徽章系统'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/8 bg-black/20 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{title}</p>
                <p className="mt-3 text-sm leading-7 text-zinc-200">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[28px] border border-white/8 bg-zinc-950/85 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">章节一览</p>
              <h2 className="mt-2 font-serif text-2xl text-zinc-100">红色经典路线</h2>
            </div>
            {hasProgress && (
              <button
                onClick={onReset}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300 transition hover:bg-white/6"
              >
                <RotateCcw size={14} />
                重新开始
              </button>
            )}
          </div>

          <div className="space-y-4">
            {chapters.map((chapter, index) => {
              const completed = completedChapterIds.includes(chapter.id);
              return (
                <article
                  key={chapter.id}
                  className={`rounded-3xl border p-5 transition ${
                    completed
                      ? 'border-amber-400/30 bg-amber-200/10'
                      : 'border-white/8 bg-white/4 hover:bg-white/7'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                        第 {index + 1} 章 · {chapter.year}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-zinc-100">{chapter.title}</h3>
                      <p className="mt-2 text-sm text-zinc-400">{chapter.theme}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        completed ? 'bg-amber-300 text-zinc-950' : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {completed ? '已点亮' : '待挑战'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-red-900/30 bg-red-950/30 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-red-200/55">学习提示</p>
          <p className="mt-3 text-sm leading-7 text-red-50/85">
            本游戏以党史知识普及和价值导向教育为目的，采用历史场景化表达，帮助玩家在互动中理解中国共产党从诞生到带领人民走向胜利的重要历程。
          </p>
        </div>
      </div>
    </section>
  );
}
