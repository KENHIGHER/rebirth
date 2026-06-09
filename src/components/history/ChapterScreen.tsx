import { ArrowRight, CheckCircle2, HelpCircle, ScrollText } from 'lucide-react';
import { ChapterPhase, ChapterStage } from '../../types/historyGame';

type ChapterScreenProps = {
  chapter: ChapterStage;
  phase: ChapterPhase;
  questionIndex: number;
  selectedChoiceId: string | null;
  selectedAnswerId: string | null;
  answeredCorrectly: boolean | null;
  belief: number;
  onProceedFromStory: () => void;
  onChooseOption: (optionId: string) => void;
  onAnswerQuestion: (optionId: string) => void;
  onNextQuestion: () => void;
  onAdvanceFromSummary: () => void;
};

export default function ChapterScreen({
  chapter,
  phase,
  questionIndex,
  selectedChoiceId,
  selectedAnswerId,
  answeredCorrectly,
  belief,
  onProceedFromStory,
  onChooseOption,
  onAnswerQuestion,
  onNextQuestion,
  onAdvanceFromSummary,
}: ChapterScreenProps) {
  const currentQuestion = chapter.quiz[questionIndex];
  const chapterFinished = phase === 'summary';
  const isLastQuestion = questionIndex === chapter.quiz.length - 1;
  const selectedChoice = chapter.choiceOptions.find((item) => item.id === selectedChoiceId);
  const explanation = currentQuestion?.explanation ?? '';

  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-[32px] border border-white/8 bg-zinc-950/90 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.38em] text-zinc-500">
          <ScrollText size={14} />
          {chapter.year} · {chapter.theme}
        </div>
        <h2 className="font-serif text-4xl text-amber-50">{chapter.title}</h2>
        <p className="mt-5 rounded-3xl border border-amber-200/15 bg-amber-200/8 px-5 py-4 text-sm italic leading-7 text-amber-100/90">
          {chapter.quote}
        </p>

        {phase === 'story' && (
          <div className="mt-8 space-y-4">
            {chapter.narrative.map((paragraph) => (
              <p
                key={paragraph}
                className="rounded-3xl border border-white/6 bg-white/[0.03] px-5 py-4 text-base leading-8 text-zinc-200"
              >
                {paragraph}
              </p>
            ))}
            <button
              onClick={onProceedFromStory}
              className="mt-4 inline-flex items-center gap-3 rounded-full border border-amber-300/60 bg-amber-200 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-amber-100"
            >
              进入历史抉择
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {phase === 'choice' && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-zinc-50">{chapter.choicePrompt}</h3>
            <div className="mt-5 grid gap-4">
              {chapter.choiceOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onChooseOption(option.id)}
                  disabled={Boolean(selectedChoiceId)}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-5 text-left transition hover:border-red-400/50 hover:bg-red-950/30 disabled:cursor-default"
                >
                  <p className="text-base font-medium text-zinc-100">{option.label}</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    选择后将影响信念值与章节得分。
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'quiz' && currentQuestion && (
          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-zinc-50">党史问答</h3>
              <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-300">
                第 {questionIndex + 1} / {chapter.quiz.length} 题
              </span>
            </div>
            <p className="mt-5 text-lg leading-8 text-zinc-100">{currentQuestion.prompt}</p>

            <div className="mt-6 grid gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswerId === option.id;
                const isAnswer = currentQuestion.answerId === option.id;
                const showCorrect = Boolean(selectedAnswerId) && isAnswer;
                const showWrong = isSelected && !isAnswer;
                return (
                  <button
                    key={option.id}
                    onClick={() => onAnswerQuestion(option.id)}
                    disabled={Boolean(selectedAnswerId)}
                    className={`rounded-3xl border px-5 py-4 text-left transition ${
                      showCorrect
                        ? 'border-emerald-400/50 bg-emerald-400/10'
                        : showWrong
                          ? 'border-red-400/50 bg-red-500/10'
                          : 'border-white/10 bg-white/[0.03] hover:border-amber-300/40 hover:bg-white/[0.05]'
                    }`}
                  >
                    <p className="text-base text-zinc-100">{option.text}</p>
                  </button>
                );
              })}
            </div>

            {selectedAnswerId && (
              <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 px-5 py-5">
                <div className="flex items-center gap-3 text-sm font-semibold text-zinc-100">
                  <CheckCircle2
                    size={18}
                    className={answeredCorrectly ? 'text-emerald-400' : 'text-amber-300'}
                  />
                  {answeredCorrectly ? '回答正确' : '继续加油'}
                </div>
                <p className="mt-3 text-sm leading-7 text-zinc-300">{explanation}</p>
                <button
                  onClick={onNextQuestion}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-200 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-100"
                >
                  {isLastQuestion ? '查看章节结算' : '下一题'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {chapterFinished && selectedChoice && (
          <div className="mt-8 space-y-5">
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-5">
              <p className="text-sm font-semibold text-emerald-300">抉择反馈</p>
              <p className="mt-3 text-sm leading-7 text-zinc-200">{selectedChoice.consequence}</p>
            </div>
            <div className="rounded-3xl border border-amber-200/15 bg-amber-100/5 px-5 py-5">
              <p className="text-sm font-semibold text-amber-200">章节总结</p>
              <p className="mt-3 text-sm leading-7 text-zinc-200">{chapter.summary}</p>
            </div>
            <button
              onClick={onAdvanceFromSummary}
              className="inline-flex items-center gap-3 rounded-full border border-red-400/30 bg-red-900 px-6 py-3 text-sm font-semibold text-red-50 transition hover:bg-red-800"
            >
              进入下一阶段
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </article>

      <aside className="space-y-6">
        <div className="rounded-[28px] border border-white/8 bg-zinc-950/85 p-6">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
            <HelpCircle size={14} />
            当前节奏
          </p>
          <div className="mt-5 space-y-3">
            {[
              { label: '剧情导入', active: phase === 'story' },
              { label: '历史抉择', active: phase === 'choice' },
              { label: '党史答题', active: phase === 'quiz' },
              { label: '章节结算', active: phase === 'summary' },
            ].map(({ label, active }) => (
              <div
                key={label}
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  active
                    ? 'border-amber-300/40 bg-amber-200/10 text-amber-100'
                    : 'border-white/8 bg-white/[0.03] text-zinc-400'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-red-900/30 bg-red-950/35 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-red-200/60">信念状态</p>
          <div className="mt-5">
            <div className="h-3 rounded-full bg-white/10">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-red-700 via-red-500 to-amber-200 transition-all duration-500"
                style={{ width: `${belief}%` }}
              />
            </div>
            <p className="mt-3 text-sm leading-7 text-red-50/85">
              信念值越高，代表你在历史场景中的价值判断越坚定、理解越深入。
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-zinc-950/85 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">章节提示</p>
          <p className="mt-4 text-sm leading-7 text-zinc-300">
            历史抉择没有“娱乐化陷阱”，重点在于理解革命理想、组织纪律和人民立场在不同历史阶段中的真实分量。
          </p>
        </div>
      </aside>
    </section>
  );
}
