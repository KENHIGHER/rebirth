import { BookOpen, Flame, Trophy } from 'lucide-react';

type ProgressHeaderProps = {
  chapterTitle: string;
  chapterYear: string;
  score: number;
  belief: number;
  completedCount: number;
  totalCount: number;
};

export default function ProgressHeader({
  chapterTitle,
  chapterYear,
  score,
  belief,
  completedCount,
  totalCount,
}: ProgressHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-[28px] border border-amber-200/20 bg-zinc-950/90 px-6 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_28%)]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.45em] text-amber-200/60">
            <BookOpen size={14} />
            党史长卷
          </p>
          <h2 className="font-serif text-2xl text-amber-50">{chapterTitle}</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {chapterYear} · 已完成 {completedCount}/{totalCount} 章
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
              <Trophy size={14} />
              总分
            </p>
            <p className="text-xl font-semibold text-amber-100">{score}</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
            <p className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-zinc-500">
              <Flame size={14} />
              信念值
            </p>
            <p className="text-xl font-semibold text-red-200">{belief}</p>
          </div>

          <div className="col-span-2 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 md:col-span-1">
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">进度脉冲</p>
            <div className="h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-red-700 via-amber-400 to-yellow-200 transition-all duration-500"
                style={{ width: `${belief}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
