import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface DeveloperPanelProps {
  open: boolean;
  onClose: () => void;
}

const DeveloperPanel: React.FC<DeveloperPanelProps> = ({ open, onClose }) => {
  const {
    cash,
    date,
    time,
    health,
    san,
    strength,
    constitution,
    intelligence,
    luck,
    leadership,
    isDoomsday,
    applyDeveloperState,
  } = useGameStore();

  const [form, setForm] = useState({
    cash: 0,
    date: '',
    time: 8,
    health: 100,
    san: 50,
    strength: 50,
    constitution: 50,
    intelligence: 50,
    luck: 50,
    leadership: 50,
    isDoomsday: false,
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      cash,
      date,
      time,
      health,
      san,
      strength,
      constitution,
      intelligence,
      luck,
      leadership,
      isDoomsday,
    });
  }, [open, cash, date, time, health, san, strength, constitution, intelligence, luck, leadership, isDoomsday]);

  if (!open) return null;

  const updateField = (key: keyof typeof form, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    applyDeveloperState(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-950 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wide text-zinc-100">开发者模式</h2>
          <button onClick={onClose} className="rounded bg-zinc-900 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800">
            关闭
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <label className="flex flex-col gap-1">
            <span className="text-zinc-500">资金</span>
            <input value={form.cash} onChange={(e) => updateField('cash', Number(e.target.value) || 0)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-500">日期</span>
            <input value={form.date} onChange={(e) => updateField('date', e.target.value)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-500">时间</span>
            <input value={form.time} onChange={(e) => updateField('time', Number(e.target.value) || 0)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-500">血量</span>
            <input value={form.health} onChange={(e) => updateField('health', Number(e.target.value) || 0)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-500">理智</span>
            <input value={form.san} onChange={(e) => updateField('san', Number(e.target.value) || 0)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-500">力量</span>
            <input value={form.strength} onChange={(e) => updateField('strength', Number(e.target.value) || 0)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-500">体质</span>
            <input value={form.constitution} onChange={(e) => updateField('constitution', Number(e.target.value) || 0)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-500">智力</span>
            <input value={form.intelligence} onChange={(e) => updateField('intelligence', Number(e.target.value) || 0)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-500">幸运</span>
            <input value={form.luck} onChange={(e) => updateField('luck', Number(e.target.value) || 0)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-zinc-500">领导力</span>
            <input value={form.leadership} onChange={(e) => updateField('leadership', Number(e.target.value) || 0)} className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-100" />
          </label>
        </div>

        <label className="mt-4 flex items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={form.isDoomsday}
            onChange={(e) => updateField('isDoomsday', e.target.checked)}
          />
          强制末日阶段
        </label>

        <button
          onClick={handleApply}
          className="mt-4 w-full rounded border border-amber-700 bg-amber-900/60 py-2 text-sm font-bold text-amber-100 hover:bg-amber-800/70"
        >
          应用修改
        </button>
      </div>
    </div>
  );
};

export default DeveloperPanel;
