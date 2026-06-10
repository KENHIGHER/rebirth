import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Archive, MessageSquare } from 'lucide-react';
import PagedTextBlock from './PagedTextBlock';
import PagedList from './PagedList';
import TestReportModal from './TestReportModal';
import { corruptText } from '../utils/textEffects';

const ArchiveView: React.FC = () => {
  const { currentMessages, archivedMessages, runEventSystemTest, san } = useGameStore();
  const glitch = (text: string) => corruptText(text, san);
  const archiveEntries = [
    ...currentMessages.map((message) => ({ type: 'current' as const, message })),
    ...archivedMessages.map((message) => ({ type: 'archived' as const, message })),
  ];

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex-1 flex flex-col overflow-hidden">
        <h2 className="shrink-0 text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
          <Archive size={20} className="text-blue-400" /> {glitch('档案馆')}
        </h2>

        <button
          onClick={() => runEventSystemTest()}
          className="mb-4 w-full shrink-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-2 rounded border border-zinc-700 text-sm font-bold"
        >
          {glitch('运行随机事件系统测试')}
        </button>
        
        <PagedList
          items={archiveEntries}
          pageSize={2}
          getKey={(entry) => `${entry.type}-${entry.message.id}`}
          empty={
            <div className="space-y-3 text-sm text-zinc-500 italic">
              <p>{glitch('暂无新消息，多去逛逛或在末日存活更久吧。')}</p>
              <p>{glitch('这是你的第一次轮回，还没有前世的记忆。')}</p>
            </div>
          }
          renderItem={(entry) => (
            <div className={`rounded border p-3 text-sm ${entry.type === 'current' ? 'border-zinc-700 bg-zinc-800 text-zinc-200' : 'border-zinc-700/50 bg-zinc-800/50 text-zinc-400'}`}>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-zinc-300">
                {entry.type === 'current' ? (
                  <>
                    <MessageSquare size={14} className="text-green-400" /> {glitch('当前轮回收集的消息')}
                  </>
                ) : (
                  <>
                    <Archive size={14} className="text-purple-400" /> {glitch('前世小道消息')}
                  </>
                )}
              </h3>
              <PagedTextBlock
                text={corruptText(entry.message.text, san)}
                pageChars={92}
                textClassName="whitespace-pre-wrap"
              />
            </div>
          )}
        />
      </div>
      <TestReportModal />
    </div>
  );
};

export default ArchiveView;
