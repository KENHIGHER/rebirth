import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import PagedList from './PagedList';
import RandomEventModal from './RandomEventModal';
import SceneBanner from './SceneBanner';

type ExploreLocation = {
  id: string;
  name: string;
  risk: string;
  drops: string;
  hint: string;
};

const BASE_LOCATIONS = [
  { id: 'supermarket', name: '废弃超市', risk: '低', drops: '食物、水、日用杂物', hint: '' },
  { id: 'pharmacy', name: '药店', risk: '中', drops: '药品、医疗用品', hint: '' },
  { id: 'police', name: '警察局', risk: '高', drops: '武器、弹药', hint: '' },
  { id: 'hardware', name: '五金店', risk: '中', drops: '建材、燃料、工具', hint: '' },
  { id: 'residential', name: '居民楼', risk: '低', drops: '随机物资、特殊物品', hint: '' },
];

const ExploreView: React.FC = () => {
  const { advanceTime, time, archivedMessages, addLog, addHealth, consumeItem, startRandomEvent, activeEvent } = useGameStore();
  const [feedback, setFeedback] = useState<string>('');

  // Find location messages from past lives
  const unlockedLocations = archivedMessages
    .filter(m => m.type === 'location')
    .map(m => ({
      id: m.locationId || m.id,
      name: m.locationName || '特殊地点',
      risk: '未知',
      drops: '前世记忆中的物资（不稳定）',
      hint: m.text
    }));

  const locations = [...BASE_LOCATIONS, ...unlockedLocations];

  const handleExplore = (loc: ExploreLocation) => {
    if (time > 16) {
      setFeedback('时间太晚了，天黑前无法返回安全屋，你不敢出门。');
      return;
    }
    if (activeEvent) return;

    advanceTime(8);
    let travelStr = `你前往了${loc.name}探索。`;

    const okFood = consumeItem('food', 1);
    const okWater = consumeItem('water', 1);
    if (!okFood) {
      addHealth(-20);
      travelStr += '（没有食物补给，体力透支：血量-20）';
    }
    if (!okWater) {
      addHealth(-20);
      travelStr += '（缺水行动，口干舌燥：血量-20）';
    }
    addLog(travelStr);
    setFeedback('');
    startRandomEvent('explore');
  };

  return (
    <div className="space-y-4 h-full min-h-0 flex flex-col">
      <div className="bg-black p-4 rounded-lg border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.1)] flex-1 min-h-0 flex flex-col overflow-hidden">
        <SceneBanner
          image="explore-ruins"
          title="废墟搜索"
          subtitle="带够食物和水，天黑前回来。外面每一条街都可能变成事件。"
          tone="red"
        />
        <div className="mt-4">
        <h2 className="text-lg font-bold text-red-500 mb-2 font-serif tracking-widest">外出探索 (耗时 8h)</h2>
        <p className="text-sm text-red-400/70 mb-4">高风险高回报。必须在16:00前出发。</p>
        </div>

        <PagedList
          items={locations}
          pageSize={3}
          getKey={(loc) => loc.id}
          gridClassName="space-y-3"
          renderItem={(loc) => (
            <button
              onClick={() => handleExplore(loc)}
              disabled={time > 16 || !!activeEvent}
              className="w-full text-left bg-zinc-900/90 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded border border-red-900/30 hover:border-red-700/70 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-red-200">{loc.name}</span>
                <span className={`text-xs px-2 py-1 rounded bg-black border ${loc.risk === '高' ? 'border-red-500 text-red-500' : loc.risk === '中' ? 'border-yellow-500 text-yellow-500' : 'border-green-500 text-green-500'}`}>
                  风险: {loc.risk}
                </span>
              </div>
              <div className="text-xs text-zinc-500">可能收获: {loc.drops}</div>
              {loc.hint && (
                <div className="mt-2 text-xs text-purple-400 bg-purple-900/20 p-1 rounded border border-purple-900/50">
                  【轮回记忆】：{loc.hint}
                </div>
              )}
            </button>
          )}
        />

        {feedback && (
          <div className="mt-3 shrink-0 bg-red-950/50 p-3 rounded text-sm text-red-200 text-center border border-red-900">
            {feedback}
          </div>
        )}
      </div>
      <RandomEventModal />
    </div>
  );
};

export default ExploreView;
