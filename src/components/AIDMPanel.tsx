import React, { useEffect, useState } from 'react';
import { BrainCircuit, LoaderCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { createDemoAIDMWorld, generateAIDMWorld } from '../lib/aiDm';
import { useGameStore } from '../store/gameStore';

interface AIDMPanelProps {
  open: boolean;
  onClose: () => void;
}

const KEY_STORAGE = 'rebirth-ai-dm-api-key';
const MODEL_STORAGE = 'rebirth-ai-dm-model';

const AIDMPanel: React.FC<AIDMPanelProps> = ({ open, onClose }) => {
  const {
    date,
    isDoomsday,
    cash,
    health,
    san,
    strength,
    constitution,
    intelligence,
    luck,
    leadership,
    aiDmTitle,
    aiDmBriefing,
    applyAIDMWorld,
    clearAIDMWorld,
  } = useGameStore();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-5-mini');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!open) return;
    setApiKey(sessionStorage.getItem(KEY_STORAGE) || '');
    setModel(sessionStorage.getItem(MODEL_STORAGE) || 'gpt-5-mini');
    setEnabled(Boolean(aiDmTitle));
    setStatus('');
  }, [open, aiDmTitle]);

  if (!open) return null;

  const handleEnabledChange = (nextEnabled: boolean) => {
    setEnabled(nextEnabled);
    if (!nextEnabled) {
      clearAIDMWorld();
      setStatus('命运编织已关闭，世界恢复原本轨迹。');
    }
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setStatus('请先输入世界编织密钥。');
      return;
    }
    setLoading(true);
    setStatus('命运正在编织市场、传闻与危险……');
    try {
      sessionStorage.setItem(KEY_STORAGE, apiKey.trim());
      sessionStorage.setItem(MODEL_STORAGE, model.trim() || 'gpt-5-mini');
      const world = await generateAIDMWorld(apiKey.trim(), model.trim() || 'gpt-5-mini', {
        date,
        isDoomsday,
        cash,
        stats: { health, san, strength, constitution, intelligence, luck, leadership },
      });
      applyAIDMWorld(world);
      setEnabled(true);
      setStatus(`世界线“${world.title}”已启用：${world.events.length} 个新事件，${world.rumors.length} 条待打听线索。`);
    } catch (error) {
      setStatus(error instanceof Error ? `${error.message}。世界仍按原本轨迹运行。` : '命运编织失败，世界仍按原本轨迹运行。');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    const world = createDemoAIDMWorld();
    applyAIDMWorld(world);
    setEnabled(true);
    setStatus('示例世界线已启用。你可以先逛逛打听传闻，再在末日探索中遭遇新的危险。');
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-purple-800/60 bg-zinc-950 p-4 shadow-[0_0_50px_rgba(126,34,206,0.24)] custom-scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-200">
            <BrainCircuit size={20} />
            <h2 className="font-bold tracking-wider">命运编织</h2>
          </div>
          <button onClick={onClose} className="rounded bg-zinc-900 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800">关闭</button>
        </div>

        <div className="mt-4 rounded border border-purple-900/50 bg-purple-950/20 p-3 text-xs leading-relaxed text-zinc-300">
          开启后，世界会拥有更险象环生的末日事件、更有因果的市场波动，以及需要你亲自打听的传闻。关闭或失败时，世界按原本轨迹运行。
        </div>

        <label className="mt-4 flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 p-3 text-sm">
          <span className="font-bold text-zinc-200">启用命运编织</span>
          <input type="checkbox" checked={enabled} onChange={(event) => handleEnabledChange(event.target.checked)} />
        </label>

        <button
          onClick={handleDemo}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-cyan-800/70 bg-cyan-950/40 py-2.5 text-sm font-bold text-cyan-100 hover:bg-cyan-900/50"
        >
          <Sparkles size={16} />
          体验示例世界线
        </button>

        {enabled && (
          <div className="mt-4 space-y-3">
            <label className="block text-xs text-zinc-400">
              世界编织密钥
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                className="mt-1 w-full rounded border border-zinc-700 bg-black px-3 py-2 text-zinc-100 outline-none focus:border-purple-600"
              />
            </label>
            <label className="block text-xs text-zinc-400">
              编织器型号
              <input
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="mt-1 w-full rounded border border-zinc-700 bg-black px-3 py-2 text-zinc-100 outline-none focus:border-purple-600"
              />
            </label>

            <div className="flex gap-2 rounded border border-amber-900/50 bg-amber-950/20 p-3 text-[11px] leading-relaxed text-amber-200/80">
              <ShieldAlert className="mt-0.5 shrink-0" size={15} />
              这是纯前端站点。密钥只保存在当前浏览器会话中，不会提交到仓库，但会由浏览器直接发送给服务方。请使用可随时撤销、有限额的密钥。
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded border border-purple-700 bg-purple-900/60 py-2.5 text-sm font-bold text-purple-100 hover:bg-purple-800/70 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? <LoaderCircle className="animate-spin" size={16} /> : <Sparkles size={16} />}
              {loading ? '编织世界中' : aiDmTitle ? '重新编织本轮世界' : '编织本轮世界'}
            </button>
          </div>
        )}

        {aiDmTitle && (
          <div className="mt-4 rounded border border-purple-800/50 bg-black/40 p-3">
            <div className="text-sm font-bold text-purple-200">{aiDmTitle}</div>
            <div className="mt-1 text-xs leading-relaxed text-zinc-400">{aiDmBriefing}</div>
          </div>
        )}
        {status && <div className="mt-4 rounded bg-zinc-900 p-3 text-xs leading-relaxed text-zinc-300">{status}</div>}
      </div>
    </div>
  );
};

export default AIDMPanel;
