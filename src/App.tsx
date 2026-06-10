import React, { useEffect, useState } from 'react';
import { Activity, Brain, BrainCircuit, Calendar, Clock, LogOut, RefreshCcw, Wrench } from 'lucide-react';
import AIDMPanel from './components/AIDMPanel';
import ArchiveView from './components/ArchiveView';
import BackpackView from './components/BackpackView';
import DeveloperPanel from './components/DeveloperPanel';
import DoomsdayScreen from './components/DoomsdayScreen';
import ExerciseView from './components/ExerciseView';
import ExploreView from './components/ExploreView';
import HomeView from './components/HomeView';
import PagedTextBlock from './components/PagedTextBlock';
import PropertyView from './components/PropertyView';
import StrollView from './components/StrollView';
import StartScreen from './components/StartScreen';
import TradeView from './components/TradeView';
import {
  AI_DM_BASE_URL_STORAGE,
  AI_DM_KEY_STORAGE,
  AI_DM_MODEL_STORAGE,
  AI_DM_PROTOCOL_STORAGE,
  AI_DM_PROVIDER_STORAGE,
  generateAIDMWorld,
  resolveAIDMConnection,
} from './lib/aiDm';
import { beginNewGame, hasGameSave } from './lib/gameSave';
import { useGameStore } from './store/gameStore';
import { corruptText } from './utils/textEffects';

type View = 'home' | 'backpack' | 'trade' | 'property' | 'exercise' | 'stroll' | 'archive' | 'explore';

function App() {
  const [inGame, setInGame] = useState(false);
  const [saveAvailable, setSaveAvailable] = useState(hasGameSave);
  const {
    num,
    date,
    time,
    health,
    san,
    constitution,
    strength,
    intelligence,
    luck,
    leadership,
    isDead,
    deathReason,
    rebirth,
    sleep,
    isDoomsday,
    currentMessages,
    doomsdayDays,
    aiDmTitle,
  } = useGameStore();
  const [currentView, setCurrentView] = useState<View>('home');
  const [devOpen, setDevOpen] = useState(false);
  const [aiDmOpen, setAiDmOpen] = useState(false);
  const [doomsdayIntroOpen, setDoomsdayIntroOpen] = useState(false);
  const glitch = (text: string) => corruptText(text, san);

  useEffect(() => {
    if (isDoomsday && !['explore', 'exercise', 'home', 'backpack', 'property'].includes(currentView)) {
      setCurrentView('explore');
    }
  }, [isDoomsday, currentView]);

  useEffect(() => {
    if (isDoomsday) {
      setDoomsdayIntroOpen(true);
    } else {
      setDoomsdayIntroOpen(false);
    }
  }, [isDoomsday]);

  if (!inGame) {
    return (
      <StartScreen
        hasSave={saveAvailable}
        onNewGame={async (connection) => {
          let generatedWorld;
          let resolvedConnection;
          if (connection) {
            resolvedConnection = await resolveAIDMConnection(connection);
            generatedWorld = await generateAIDMWorld(resolvedConnection, {
              date: '2027.5.1',
              isDoomsday: false,
              cash: 10000,
              stats: {
                health: 100,
                san: 50,
                strength: 50,
                constitution: 50,
                intelligence: 50,
                luck: 50,
                leadership: 50,
              },
            });
            sessionStorage.setItem(AI_DM_KEY_STORAGE, resolvedConnection.apiKey);
            sessionStorage.setItem(AI_DM_MODEL_STORAGE, resolvedConnection.model);
            sessionStorage.setItem(AI_DM_BASE_URL_STORAGE, resolvedConnection.baseUrl);
            sessionStorage.setItem(AI_DM_PROTOCOL_STORAGE, resolvedConnection.protocol);
            sessionStorage.setItem(AI_DM_PROVIDER_STORAGE, resolvedConnection.provider);
          }
          beginNewGame();
          if (generatedWorld) {
            useGameStore.getState().applyAIDMWorld(generatedWorld);
          } else {
            sessionStorage.removeItem(AI_DM_KEY_STORAGE);
            sessionStorage.removeItem(AI_DM_MODEL_STORAGE);
            sessionStorage.removeItem(AI_DM_BASE_URL_STORAGE);
            sessionStorage.removeItem(AI_DM_PROTOCOL_STORAGE);
            sessionStorage.removeItem(AI_DM_PROVIDER_STORAGE);
          }
          setCurrentView('home');
          setSaveAvailable(true);
          setInGame(true);
        }}
        onContinue={() => setInGame(true)}
      />
    );
  }

  if (isDead) {
    const doomsdayMessages = currentMessages.filter((m) => m.source === 'doomsday');

    return (
      <div className="min-h-screen bg-black text-zinc-300 flex flex-col items-center justify-center p-6 border-x border-red-900/30 max-w-md mx-auto relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black" />
        <h1 className="text-5xl text-red-600 font-bold mb-2 tracking-widest font-serif drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">{glitch('死亡')}</h1>
        <p className="text-lg mb-8 text-red-400">{glitch('死因：')}{glitch(deathReason)}</p>

        <div className="bg-zinc-900/80 border border-red-900/50 p-6 rounded-lg w-full max-w-sm mb-8 z-10">
          <h2 className="text-xl font-bold text-zinc-100 mb-4 border-b border-zinc-700 pb-2">{glitch('本轮总结')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">{glitch('末日存活：')}</span>
              <span className="text-red-400 font-bold font-mono">{doomsdayDays} 天</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">{glitch('获取末日消息：')}</span>
              <span className="text-purple-400 font-bold font-mono">{doomsdayMessages.length} 条</span>
            </div>
          </div>

          {doomsdayMessages.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
              <div className="text-xs text-zinc-500">{glitch('已存入轮回档案馆：')}</div>
              {doomsdayMessages.map((message) => (
                <div key={message.id} className="bg-zinc-950/70 border border-zinc-800 rounded p-2">
                  <PagedTextBlock
                    text={corruptText(message.text, san)}
                    pageChars={72}
                    textClassName="text-xs text-purple-300/80 whitespace-pre-wrap"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            rebirth();
            setCurrentView('home');
          }}
          className="z-10 px-8 py-3 bg-red-950 hover:bg-red-900 text-red-200 rounded border border-red-800 flex items-center gap-2 transition-all hover:scale-105 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
        >
          <RefreshCcw size={20} />
          <span className="font-bold tracking-widest">{glitch('进入下一轮回')}</span>
        </button>
      </div>
    );
  }

  if (doomsdayIntroOpen) {
    return (
      <DoomsdayScreen
        day={date}
        time={time}
        aiEnabled={Boolean(aiDmTitle)}
        worldTitle={aiDmTitle}
        stats={{ health, san, strength, constitution, intelligence, luck, leadership }}
        onEnter={() => {
          setDoomsdayIntroOpen(false);
          setCurrentView('explore');
        }}
      />
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'backpack':
        return <BackpackView />;
      case 'trade':
        return <TradeView />;
      case 'property':
        return <PropertyView />;
      case 'exercise':
        return <ExerciseView />;
      case 'stroll':
        return <StrollView />;
      case 'archive':
        return <ArchiveView />;
      case 'explore':
        return <ExploreView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-300 flex flex-col max-w-md mx-auto border-x border-zinc-800 overflow-hidden">
      <header className="h-[68px] shrink-0 bg-zinc-900 border-b border-zinc-800 p-1.5 text-[11px] flex flex-col justify-center">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-1 text-zinc-400">
            <RefreshCcw size={12} /> {glitch('轮回')}: {num} | <Calendar size={12} /> {date} | <Clock size={12} /> {time}:00
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSaveAvailable(hasGameSave());
                setInGame(false);
              }}
              className="flex items-center gap-1 rounded border border-zinc-700 bg-zinc-950/60 px-2 py-0.5 text-[10px] font-bold text-zinc-300 hover:bg-zinc-800"
              title="返回标题界面"
            >
              <LogOut size={10} />
              标题
            </button>
            <button
              onClick={() => setAiDmOpen(true)}
              className="flex items-center gap-1 rounded border border-purple-800 bg-purple-950/60 px-2 py-0.5 text-[10px] font-bold text-purple-200 hover:bg-purple-900/70"
            >
              <BrainCircuit size={10} />
              命运
            </button>
            <button
              onClick={() => setDevOpen(true)}
              className="flex items-center gap-1 rounded border border-amber-800 bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-200 hover:bg-amber-900/70"
            >
              <Wrench size={10} />
              DEV
            </button>
            <div className={`font-bold ${isDoomsday ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
              {glitch(isDoomsday ? '末日降临' : '和平期')}
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center text-zinc-200">
          <div className="flex items-center gap-1">
            <Activity size={14} className="text-red-400" /> {glitch('血量')}:
            <span className={`${health < 30 ? 'text-red-500 animate-pulse font-bold' : health >= 100 ? 'text-yellow-400 font-bold' : ''}`}>
              {Math.floor(health)}/100
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Brain size={14} className="text-purple-400" /> {glitch('理智')}:
            <span className={`${san < 30 ? 'text-purple-500 animate-pulse font-bold' : san >= 100 ? 'text-yellow-400 font-bold' : ''}`}>
              {Math.floor(san)}
            </span>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between text-zinc-200">
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">{glitch('体质')}:</span>
            <span className={`${constitution >= 100 ? 'text-yellow-400 font-bold' : ''}`}>{Math.floor(constitution)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">{glitch('力量')}:</span>
            <span className={`${strength >= 100 ? 'text-yellow-400 font-bold' : ''}`}>{Math.floor(strength)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">{glitch('智力')}:</span>
            <span className={`${intelligence >= 100 ? 'text-yellow-400 font-bold' : ''}`}>{Math.floor(intelligence)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">{glitch('幸运')}:</span>
            <span className={`${luck >= 100 ? 'text-yellow-400 font-bold' : ''}`}>{Math.floor(luck)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zinc-500">{glitch('领导')}:</span>
            <span className={`${leadership >= 100 ? 'text-yellow-400 font-bold' : ''}`}>{Math.floor(leadership)}</span>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden bg-zinc-950 p-3">
        {renderContent()}
      </main>

      {isDoomsday ? (
        <footer className="shrink-0 bg-black border-t border-red-900 p-1.5 grid grid-cols-5 gap-1.5 text-xs relative">
          <div className="absolute inset-0 pointer-events-none border-t border-red-900 opacity-50 shadow-[0_-5px_15px_rgba(220,38,38,0.2)]" />
          <button onClick={() => setCurrentView('explore')} className={`py-2 rounded font-bold ${currentView === 'explore' ? 'bg-red-900 text-white' : 'bg-zinc-900 text-red-500 hover:bg-zinc-800 border border-red-900/50'}`}>{glitch('外出探索')}</button>
          <button onClick={() => setCurrentView('property')} className={`py-2 rounded font-bold ${currentView === 'property' ? 'bg-red-900 text-white' : 'bg-zinc-900 text-red-500 hover:bg-zinc-800 border border-red-900/50'}`}>{glitch('安全屋')}</button>
          <button onClick={() => setCurrentView('backpack')} className={`py-2 rounded font-bold ${currentView === 'backpack' ? 'bg-red-900 text-white' : 'bg-zinc-900 text-red-500 hover:bg-zinc-800 border border-red-900/50'}`}>{glitch('背包')}</button>
          <button onClick={() => setCurrentView('exercise')} className={`py-2 rounded font-bold ${currentView === 'exercise' ? 'bg-red-900 text-white' : 'bg-zinc-900 text-red-500 hover:bg-zinc-800 border border-red-900/50'}`}>{glitch('锻炼')}</button>
          <button onClick={() => sleep()} className="py-2 rounded bg-red-950 hover:bg-red-900 text-white font-bold border border-red-800">{glitch('下一日')}</button>
        </footer>
      ) : (
        <footer className="shrink-0 bg-zinc-900 border-t border-zinc-800 p-1.5 grid grid-cols-4 gap-1.5 text-xs">
          <button onClick={() => setCurrentView('home')} className={`py-1.5 rounded ${currentView === 'home' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}>{glitch('主页')}</button>
          <button onClick={() => setCurrentView('trade')} className={`py-1.5 rounded ${currentView === 'trade' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}>{glitch('交易')}</button>
          <button onClick={() => setCurrentView('backpack')} className={`py-1.5 rounded ${currentView === 'backpack' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}>{glitch('背包')}</button>
          <button onClick={() => setCurrentView('property')} className={`py-1.5 rounded ${currentView === 'property' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}>{glitch('地产')}</button>
          <button onClick={() => setCurrentView('exercise')} className={`py-1.5 rounded ${currentView === 'exercise' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}>{glitch('锻炼')}</button>
          <button onClick={() => setCurrentView('stroll')} className={`py-1.5 rounded ${currentView === 'stroll' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}>{glitch('逛逛')}</button>
          <button onClick={() => setCurrentView('archive')} className={`py-1.5 rounded ${currentView === 'archive' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}>{glitch('档案')}</button>
          <button onClick={() => sleep()} className="py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-red-400 font-bold">{glitch('睡觉')}</button>
        </footer>
      )}
      <AIDMPanel open={aiDmOpen} onClose={() => setAiDmOpen(false)} />
      <DeveloperPanel open={devOpen} onClose={() => setDevOpen(false)} />
    </div>
  );
}

export default App;
