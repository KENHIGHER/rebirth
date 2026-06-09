import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

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

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex gap-2 text-center">
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

      <div className="flex-1 bg-zinc-900 p-4 rounded-lg border border-zinc-800 overflow-y-auto custom-scrollbar">
        <h2 className="text-lg font-bold text-zinc-100 mb-4">锻炼选项</h2>
        
        <div className="space-y-3 mb-6">
          <button 
            onClick={() => handleExercise('con')}
            disabled={hasExercisedToday}
            className="w-full flex justify-between items-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 p-4 rounded transition-colors"
          >
            <span className="font-bold text-zinc-200">体能维持</span>
            <span className="text-zinc-400 text-sm">耗时 1h | 体质+2</span>
          </button>
          
          <button 
            onClick={() => handleExercise('str')}
            disabled={hasExercisedToday}
            className="w-full flex justify-between items-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 p-4 rounded transition-colors"
          >
            <span className="font-bold text-zinc-200">格斗训练</span>
            <span className="text-zinc-400 text-sm">耗时 2h | 力量+1.5</span>
          </button>
          
          <button 
            onClick={() => handleExercise('san')}
            disabled={hasExercisedToday}
            className="w-full flex justify-between items-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 p-4 rounded transition-colors"
          >
            <span className="font-bold text-zinc-200">阅读学习</span>
            <span className="text-zinc-400 text-sm">耗时 1h | 理智+2 智力+1</span>
          </button>

          <button 
            onClick={() => handleExercise('rest')}
            disabled={hasExercisedToday}
            className="w-full flex justify-between items-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 p-4 rounded transition-colors"
          >
            <span className="font-bold text-zinc-200">休息</span>
            <span className="text-zinc-400 text-sm">耗时 2h | 血量+50%</span>
          </button>

          <button 
            onClick={() => handleExercise('balance')}
            disabled={hasExercisedToday || balanceExerciseCooldown > 0}
            className="w-full flex justify-between items-center bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 p-4 rounded transition-colors"
          >
            <span className="font-bold text-zinc-200">平衡锻炼</span>
            <span className="text-zinc-400 text-sm">
              {balanceExerciseCooldown > 0 ? `冷却中 (${balanceExerciseCooldown}天)` : '耗时 2h | 体质+1 力量+1'}
            </span>
          </button>
        </div>

        {feedback && (
          <div className="bg-zinc-800 p-3 rounded text-sm text-green-400 text-center animate-pulse">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseView;
