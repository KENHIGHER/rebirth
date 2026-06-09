import React, { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Delta, EventChoice } from '../types/randomEvent';
import { corruptText } from '../utils/textEffects';
import PagedTextBlock from './PagedTextBlock';

const deltaText = (d: Delta) => {
  if (d.type === 'cash') return `${d.amount > 0 ? '+' : ''}¥${d.amount}`;
  if (d.type === 'item') return `${d.amount > 0 ? '+' : ''}${d.amount} ${d.itemName}`;
  return `${d.amount > 0 ? '+' : ''}${d.amount} ${d.key}`;
};

const deltaColor = (d: Delta) => {
  if (d.type === 'cash') return d.amount >= 0 ? 'text-yellow-300' : 'text-yellow-500';
  if (d.type === 'item') return d.amount >= 0 ? 'text-emerald-300' : 'text-red-300';
  return d.amount >= 0 ? 'text-emerald-300' : 'text-red-300';
};

const splitToPages = <T,>(items: T[], pageSize: number) => {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  return pages;
};

const splitTextToPages = (text: string, pageChars: number) => {
  const clean = text.trim();
  if (!clean) return [''];
  const pages: string[] = [];
  for (let i = 0; i < clean.length; i += pageChars) {
    pages.push(clean.slice(i, i + pageChars));
  }
  return pages;
};

const RandomEventModal: React.FC = () => {
  const { activeEvent, resolveRandomEvent, closeRandomEvent, san } = useGameStore();
  const [page, setPage] = useState(0);
  const [deltaPage, setDeltaPage] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
  const [floats, setFloats] = useState<Array<{ id: string; text: string; color: string }>>([]);
  const glitch = (text: string) => corruptText(text, san);
  const activeEventId = activeEvent?.id;
  const activeEventStage = activeEvent?.stage;

  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  useEffect(() => {
    setPage(0);
    setDeltaPage(0);
    setFloats([]);
  }, [activeEventId, activeEventStage]);

  const scenePages = useMemo(() => {
    if (!activeEvent) return [];
    const pageChars = viewportHeight < 700 ? 150 : viewportHeight < 850 ? 240 : 360;
    return splitTextToPages(corruptText(activeEvent.def.scene, san), pageChars);
  }, [activeEvent, san, viewportHeight]);

  const choicesPerPage = viewportHeight < 700 ? 2 : 3;
  const choicePages = useMemo<EventChoice[][]>(() => {
    if (!activeEvent || activeEvent.stage === 'result') return [];
    return splitToPages(activeEvent.def.choices, choicesPerPage);
  }, [activeEvent, choicesPerPage]);

  const result = activeEvent?.lastResult;
  const deltaPages = useMemo(
    () => splitToPages((result?.outcome?.deltas || []).filter((d) => d.amount !== 0), 6),
    [result?.outcome?.deltas],
  );

  useEffect(() => {
    if (!activeEvent || activeEvent.stage !== 'result') return;
    const list = (result?.outcome?.deltas || [])
      .filter((d) => d.amount !== 0)
      .slice(0, 6)
      .map((d) => ({
        id: Math.random().toString(36).slice(2, 10),
        text: deltaText(d),
        color: deltaColor(d),
      }));
    setFloats(list);
    const timer = window.setTimeout(() => setFloats([]), 520);
    return () => window.clearTimeout(timer);
  }, [activeEvent, result?.outcome?.deltas]);

  if (!activeEvent) return null;

  const isResult = activeEvent.stage === 'result';
  const needsPaging = scenePages.length > 1 || choicePages.length > 1;
  const totalPages = isResult ? 1 : needsPaging ? scenePages.length + choicePages.length : 1;
  const isScenePage = !isResult && (!needsPaging || page < scenePages.length);
  const currentScene = needsPaging ? scenePages[page] : scenePages[0];
  const currentChoices = needsPaging ? choicePages[page - scenePages.length] || [] : choicePages[0] || [];
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-md max-h-[calc(100dvh-2rem)] bg-zinc-950 border border-red-900/60 rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.18)] overflow-hidden re-pop flex flex-col">
        <div className="shrink-0 px-4 py-3 border-b border-red-900/40 bg-gradient-to-r from-red-950/40 via-black to-black">
          <div className="flex items-center justify-between gap-3">
            <div className="text-red-200 font-bold tracking-wider">{glitch(activeEvent.def.title)}</div>
            <button
              onClick={() => closeRandomEvent()}
              className="text-zinc-400 hover:text-zinc-200 text-sm px-2 py-1 rounded hover:bg-zinc-900 transition-colors"
            >
              {glitch('关闭')}
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          {floats.length > 0 && (
            <div className="absolute z-10 inset-x-0 top-6 flex flex-col items-center gap-1 pointer-events-none">
              {floats.map((f) => (
                <div key={f.id} className={`re-float-up font-mono text-sm ${f.color}`}>
                  {f.text}
                </div>
              ))}
            </div>
          )}

          <div className="p-4">
            {isScenePage && (
              <div className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
                {currentScene}
              </div>
            )}

            {!isResult ? (
              <div className={`${isScenePage ? 'mt-4' : ''} space-y-2`}>
                {!isScenePage && (
                  <div className="mb-3 text-xs text-zinc-500 tracking-wider">{glitch('请选择你的行动')}</div>
                )}
                {currentChoices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => resolveRandomEvent(choice.id)}
                    className="w-full text-left bg-zinc-900 hover:bg-zinc-800 border border-red-900/30 text-red-200 p-3 rounded text-sm transition-colors"
                  >
                    {glitch(choice.label)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <div className="bg-black/40 border border-red-900/30 rounded p-3">
                  <PagedTextBlock
                    text={result?.outcome.text ? glitch(result.outcome.text) : ''}
                    pageChars={viewportHeight < 700 ? 80 : 120}
                    textClassName="text-sm text-zinc-200 whitespace-pre-wrap"
                  />
                  {deltaPages.length > 0 && (
                    <div className="mt-3">
                      <div className="grid grid-cols-2 gap-2">
                        {deltaPages[deltaPage].map((d, idx) => (
                          <div
                            key={`${deltaPage}-${idx}`}
                            className={`text-xs font-mono px-2 py-1 rounded bg-zinc-900/60 ${deltaColor(d)}`}
                          >
                            {deltaText(d)}
                          </div>
                        ))}
                      </div>
                      {deltaPages.length > 1 && (
                        <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                          <button
                            onClick={() => setDeltaPage((v) => Math.max(0, v - 1))}
                            disabled={deltaPage === 0}
                            className="px-2 py-1 rounded bg-zinc-900/70 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {glitch('上一组')}
                          </button>
                          <span className="font-mono">{deltaPage + 1}/{deltaPages.length}</span>
                          <button
                            onClick={() => setDeltaPage((v) => Math.min(deltaPages.length - 1, v + 1))}
                            disabled={deltaPage === deltaPages.length - 1}
                            className="px-2 py-1 rounded bg-zinc-900/70 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {glitch('下一组')}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => closeRandomEvent()}
                  className="mt-3 w-full bg-red-950 hover:bg-red-900 text-red-100 font-bold py-2 rounded border border-red-800 transition-colors"
                >
                  {glitch('确认')}
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setPage((v) => Math.max(0, v - 1))}
                  disabled={!canPrev}
                  className="px-3 py-1.5 rounded bg-zinc-900 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors text-xs"
                >
                  {glitch('上一页')}
                </button>
                <div className="text-xs text-zinc-500 font-mono">{page + 1}/{totalPages}</div>
                <button
                  onClick={() => setPage((v) => Math.min(totalPages - 1, v + 1))}
                  disabled={!canNext}
                  className="px-3 py-1.5 rounded bg-zinc-900 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors text-xs"
                >
                  {glitch('下一页')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomEventModal;
