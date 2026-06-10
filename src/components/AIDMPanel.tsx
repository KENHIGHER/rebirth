import React, { useEffect, useState } from 'react';
import { BrainCircuit, LoaderCircle, ShieldAlert, Sparkles } from 'lucide-react';
import {
  AI_DM_BASE_URL_STORAGE,
  AI_DM_KEY_STORAGE,
  AI_DM_MODEL_STORAGE,
  AI_DM_PROTOCOL_STORAGE,
  AI_DM_PROVIDER_STORAGE,
  generateAIDMWorld,
  resolveAIDMConnection,
} from '../lib/aiDm';
import { useGameStore } from '../store/gameStore';

interface AIDMPanelProps {
  open: boolean;
  onClose: () => void;
}

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
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!open) return;
    setApiKey(sessionStorage.getItem(AI_DM_KEY_STORAGE) || '');
    setEnabled(Boolean(aiDmTitle));
    setStatus('');
  }, [open, aiDmTitle]);

  if (!open) return null;

  const handleEnabledChange = (nextEnabled: boolean) => {
    setEnabled(nextEnabled);
    if (!nextEnabled) {
      clearAIDMWorld();
      setStatus('AI DM 已关闭，世界线与叙事日志恢复为默认模式。');
    }
  };

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setStatus('请先输入 API Key。');
      return;
    }
    setLoading(true);
    setStatus('正在识别 AI 服务与可用模型……');
    try {
      const connection = await resolveAIDMConnection({ apiKey: apiKey.trim() });
      sessionStorage.setItem(AI_DM_KEY_STORAGE, connection.apiKey);
      sessionStorage.setItem(AI_DM_MODEL_STORAGE, connection.model);
      sessionStorage.setItem(AI_DM_BASE_URL_STORAGE, connection.baseUrl);
      sessionStorage.setItem(AI_DM_PROTOCOL_STORAGE, connection.protocol);
      sessionStorage.setItem(AI_DM_PROVIDER_STORAGE, connection.provider);
      setStatus(`已识别为 ${connection.provider} / ${connection.model}，正在编织世界线……`);
      const world = await generateAIDMWorld(connection, {
        date,
        isDoomsday,
        cash,
        stats: { health, san, strength, constitution, intelligence, luck, leadership },
      });
      applyAIDMWorld(world);
      setEnabled(true);
      setStatus(`世界线「${world.title}」已启用。识别结果：${connection.provider} / ${connection.model}。`);
    } catch (error) {
      setStatus(error instanceof Error ? `${error.message}。世界仍按默认轨迹运行。` : 'AI DM 启用失败，世界仍按默认轨迹运行。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-purple-800/60 bg-zinc-950 p-4 shadow-[0_0_50px_rgba(126,34,206,0.24)] custom-scrollbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-purple-200">
            <BrainCircuit size={20} />
            <h2 className="font-bold tracking-wider">AI DM</h2>
          </div>
          <button onClick={onClose} className="rounded bg-zinc-900 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800">
            关闭
          </button>
        </div>

        <div className="mt-4 rounded border border-purple-900/50 bg-purple-950/20 p-3 text-xs leading-relaxed text-zinc-300">
          开启后，只需输入 API 密钥。系统会根据密钥格式安全识别 AI 服务与模型，并生成本轮世界线、市场波动、可打听传闻与第一人称叙事。
        </div>

        <label className="mt-4 flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/70 p-3 text-sm">
          <span className="font-bold text-zinc-200">启用 AI DM</span>
          <input type="checkbox" checked={enabled} onChange={(event) => handleEnabledChange(event.target.checked)} />
        </label>

        {enabled && (
          <div className="mt-4 space-y-3">
            <label className="block text-xs text-zinc-400">
              API Key
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                className="mt-1 w-full rounded border border-zinc-700 bg-black px-3 py-2 text-zinc-100 outline-none focus:border-purple-600"
              />
            </label>
            <div className="flex gap-2 rounded border border-amber-900/50 bg-amber-950/20 p-3 text-[11px] leading-relaxed text-amber-200/80">
              <ShieldAlert className="mt-0.5 shrink-0" size={15} />
              密钥只保存在当前浏览器会话中。系统不会为了识别服务而把同一密钥发送给多个厂商。
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
