import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import PagedList from './PagedList';

const ExerciseView: React.FC = () => {
  const { advanceTime, addStat, addSan, addHealth, time, strength, constitution, health, san, addLog, hasExercisedToday, setHasExercisedToday, balanceExerciseCooldown, setBalanceExerciseCooldown } = useGameStore();
  const [feedback, setFeedback] = useState<string>('');

  const handleExercise = (type: string) => {
    if (hasExercisedToday) {
      setFeedback('今日已完成锻炼，过度疲劳会适得其反。');
      return;
    }

    let resultStr = '';
    if (type === 'con') {
      if (time > 23) { setFeedback('太晚了，无法锻炼。'); return; }
      advanceTime(1);
      addStat('constitution', 2);
      resultStr = '你进行了体能维持训练，体质+2。';
    } else if (type === 'str') {
      if (time > 22) { setFeedback('太晚了，无法锻炼。'); return; }
      advanceTime(2);
      addStat('strength', 1.5);
      resultStr = '你进行了格斗训练，力量+1.5。';
    } else if (type === 'san') {
      if (time > 23) { setFeedback('太晚了，无法锻炼。'); return; }
      advanceTime(1);
      addSan(2);
      addStat('intelligence', 1);
      resultStr = '你进行了阅读学习，理智+2，智力+1。';
    } else if (type === 'rest') {
      if (time > 22) { setFeedback('太晚了，无法锻炼。'); return; }
      advanceTime(2);
      addHealth(50);
      resultStr = '你好好休息了一番，血量大幅恢复。';
    } else if (type === 'balance') {
      if (balanceExerciseCooldown > 0) {
        setFeedback(`平衡锻炼冷却中，还剩 ${balanceExerciseCooldown} 天。`);
        return;
      }
      if (time > 22) { setFeedback('太晚了，无法锻炼。'); return; }
      advanceTime(2);
      addStat('constitution', 1);
      addStat('strength', 1);
      setBalanceExerciseCooldown(3);
      resultStr = '你进行了平衡锻炼，体质+1，力量+1。';
    }
    
    setHasExercisedToday(true);
    setFeedback(resultStr);
    if (resultStr) {
      addLog(resultStr);
    }
  };

  const exerciseOptions = [
    { type: 'con', name: '体能维持', detail: '耗时 1h | 体质+2', disabled: hasExercisedToday },
    { type: 'str', name: '格斗训练', detail: '耗时 2h | 力量+1.5', disabled: hasExercisedToday },
    { type: 'san', name: '阅读学习', detail: '耗时 1h | 理智+2 智力+1', disabled: hasExercisedToday },
    { type: 'rest', name: '休息', detail: '耗时 2h | 血量+50%', disabled: hasExercisedToday },
    {
      type: 'balance',
      name: '平衡锻炼',
      detail: balanceExerciseCooldown > 0 ? `冷却中 (${balanceExerciseCooldown}天)` : '耗时 2h | 体质+1 力量+1',
      disabled: hasExercisedToday || balanceExerciseCooldown > 0,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex gap-2 text-center">
        <div className="flex-1">
          <div className="text-zinc-500 text-xs">血量</div>
          <div className="text-lg text-red-400 font-mono font-bold">{Math.floor(health)}</div>
        </div>
        <div className="flex-1">
          <div className="text-zinc-500 text-xs">体质</div>
          <div className="text-lg text-zinc-200 font-mono">{Math.floor(constitution)}</div>
        </div>
        <div className="flex-1">
          <div className="text-zinc-500 text-xs">力量</div>
          <div className="text-lg text-zinc-200 font-mono">{Math.floor(strength)}</div>
        </div>
        <div className="flex-1">
          <div className="text-zinc-500 text-xs">理智</div>
          <div className="text-lg text-purple-400 font-mono">{Math.floor(san)}</div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-zinc-800 bg-zinc-900 p-4 overflow-hidden">
        <h2 className="mb-4 shrink-0 text-lg font-bold text-zinc-100">锻炼选项</h2>
        
        <PagedList
          items={exerciseOptions}
          pageSize={3}
          getKey={(option) => option.type}
          renderItem={(option) => (
            <button
              onClick={() => handleExercise(option.type)}
              disabled={option.disabled}
              className="w-full flex justify-between items-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 p-4 rounded transition-colors"
            >
              <span className="font-bold text-zinc-200">{option.name}</span>
              <span className="text-zinc-400 text-sm">{option.detail}</span>
            </button>
          )}
        />

        {feedback && (
          <div className="mt-3 shrink-0 bg-zinc-800 p-3 rounded text-sm text-green-400 text-center animate-pulse">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseView;
