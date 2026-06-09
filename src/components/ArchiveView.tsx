import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Archive, MessageSquare } from 'lucide-react';
import PagedTextBlock from './PagedTextBlock';
import TestReportModal from './TestReportModal';
import { corruptText } from '../utils/textEffects';

const ArchiveView: React.FC = () => {
  const { currentMessages, archivedMessages, runEventSystemTest, san } = useGameStore();
  const glitch = (text: string) => corruptText(text, san);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex-1 flex flex-col overflow-hidden">
        <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
          <Archive size={20} className="text-blue-400" /> {glitch('档案馆')}
        </h2>

        <button
          onClick={() => runEventSystemTest()}
          className="mb-4 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 rounded border border-zinc-700 text-sm font-bold"
        >
          {glitch('运行随机事件系统测试')}
        </button>
        
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {/* 当前轮回消息 */}
          <div>
            <h3 className="text-md font-bold text-zinc-300 mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-green-400" /> {glitch('当前轮回收集的消息')}
            </h3>
            {currentMessages.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">{glitch('暂无新消息，多去逛逛或在末日存活更久吧。')}</p>
            ) : (
              <div className="space-y-2">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className="bg-zinc-800 p-3 rounded border border-zinc-700 text-sm text-zinc-200">
                    <PagedTextBlock
                      text={corruptText(msg.text, san)}
                      pageChars={92}
                      textClassName="whitespace-pre-wrap"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 前世消息 */}
          <div>
            <h3 className="text-md font-bold text-zinc-300 mb-3 flex items-center gap-2">
              <Archive size={16} className="text-purple-400" /> {glitch('前世小道消息')}
            </h3>
            {archivedMessages.length === 0 ? (
              <p className="text-sm text-zinc-500 italic">{glitch('这是你的第一次轮回，还没有前世的记忆。')}</p>
            ) : (
              <div className="space-y-2">
                {archivedMessages.map((msg) => (
                  <div key={msg.id} className="bg-zinc-800/50 p-3 rounded border border-zinc-700/50 text-sm text-zinc-400">
                    <PagedTextBlock
                      text={corruptText(msg.text, san)}
                      pageChars={92}
                      textClassName="whitespace-pre-wrap"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <TestReportModal />
    </div>
  );
};

export default ArchiveView;
