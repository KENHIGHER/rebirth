import React, { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const splitToPages = (text: string) => {
  const t = text.trim();
  if (!t) return [''];
  const parts: string[] = [];
  let i = 0;
  while (i < t.length) {
    parts.push(t.slice(i, i + 260));
    i += 260;
  }
  return parts;
};

const TestReportModal: React.FC = () => {
  const report = useGameStore((s) => s.eventTestReport);
  const [page, setPage] = useState(0);

  const pages = useMemo(() => (report ? splitToPages(report) : []), [report]);
  const safePage = Math.min(page, Math.max(0, pages.length - 1));

  useEffect(() => {
    setPage(0);
  }, [report]);

  if (!report) return null;

  const canPrev = page > 0;
  const canNext = page < pages.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] bg-zinc-950 border border-zinc-700 rounded-lg overflow-hidden re-pop">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-zinc-100 font-bold">测试报告</div>
          <button
            onClick={() => useGameStore.setState({ eventTestReport: null })}
            className="text-zinc-400 hover:text-zinc-200 text-sm px-2 py-1 rounded hover:bg-zinc-900 transition-colors"
          >
            关闭
          </button>
        </div>

        <div className="p-4">
          <div className="max-h-[52dvh] overflow-hidden">
            <div
              className="flex h-full transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${safePage * 100}%)` }}
            >
              {pages.map((p, idx) => (
                <div key={idx} className="w-full flex-shrink-0 pr-2">
                  <pre className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed font-mono">
                    {p}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setPage((v) => Math.max(0, v - 1))}
              disabled={!canPrev}
              className="px-3 py-1.5 rounded bg-zinc-900 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors text-xs"
            >
              上一页
            </button>
            <div className="text-xs text-zinc-500 font-mono">
              {pages.length === 0 ? '0/0' : `${safePage + 1}/${pages.length}`}
            </div>
            <button
              onClick={() => setPage((v) => Math.min(pages.length - 1, v + 1))}
              disabled={!canNext}
              className="px-3 py-1.5 rounded bg-zinc-900 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors text-xs"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestReportModal;
