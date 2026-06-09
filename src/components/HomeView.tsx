import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ScrollText, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { corruptText } from '../utils/textEffects';

const PAGE_SIZE = 10;

const HomeView: React.FC = () => {
  const { logs, san } = useGameStore();
  const [currentPage, setCurrentPage] = useState(1);
  const glitch = (text: string) => corruptText(text, san);

  const totalPages = Math.ceil(logs.length / PAGE_SIZE) || 1;
  
  const handlePrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));

  const currentLogs = logs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <ScrollText size={20} className="text-yellow-400" /> {glitch('事件记录')}
          </h2>
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={handlePrev} 
              disabled={currentPage === 1}
              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-zinc-400">{currentPage} / {totalPages}</span>
            <button 
              onClick={handleNext} 
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden space-y-3 pr-2">
          {currentLogs.length === 0 ? (
            <p className="text-sm text-zinc-500 italic text-center py-8">{glitch('暂无记录...')}</p>
          ) : (
            currentLogs.map((log) => (
              <div key={log.id} className="bg-zinc-800 p-3 rounded border border-zinc-700 text-sm">
                <div className="flex items-center gap-3 mb-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {log.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {log.time}:00</span>
                </div>
                <div className="text-zinc-200 re-clamp-3">{glitch(log.text)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
