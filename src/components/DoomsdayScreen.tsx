import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Archive, Crosshair, Shield, Skull } from 'lucide-react';
import { generateAIDMNarrative, getStoredAIDMCredentials } from '../lib/aiDm';

interface DoomsdayScreenProps {
  day: string;
  time: number;
  aiEnabled: boolean;
  worldTitle?: string;
  stats: {
    health: number;
    san: number;
    strength: number;
    constitution: number;
    intelligence: number;
    luck: number;
    leadership: number;
  };
  onEnter: () => void;
}

export default function DoomsdayScreen({ day, time, aiEnabled, worldTitle, stats, onEnter }: DoomsdayScreenProps) {
  const { health, san, strength, constitution, intelligence, luck, leadership } = stats;
  const requestedContext = useRef('');
  const [intro, setIntro] = useState(
    '城市电网正在熄灭，广播里只剩下断续的警报。街区变成废墟，食物、水和安全屋从现在开始决定你能活多久。',
  );

  useEffect(() => {
    if (!aiEnabled) return;
    const credentials = getStoredAIDMCredentials();
    if (!credentials) return;
    const requestKey = `${day}|${time}|${worldTitle}|${health}|${san}`;
    if (requestedContext.current === requestKey) return;
    requestedContext.current = requestKey;

    generateAIDMNarrative(credentials, {
      rawEvent: '末日正式降临。请描写主角此刻的身体状态、心理反应、城市变化，以及他意识到生存规则改变的一瞬间。',
      date: day,
      time,
      isDoomsday: true,
      worldTitle,
      stats: { health, san, strength, constitution, intelligence, luck, leadership },
    })
      .then((text) => {
        if (text) setIntro(text);
      })
      .catch(() => undefined);
  }, [aiEnabled, day, time, worldTitle, health, san, strength, constitution, intelligence, luck, leadership]);

  return (
    <div className="doomsday-screen">
      <div className="doom-noise" />
      <div className="doom-sun" />
      <div className="doom-city doom-city-back" />
      <div className="doom-city doom-city-front" />
      <div className="doom-ash" />
      <div className="doom-ground" />

      <section className="doom-panel">
        <div className="doom-alert">
          <AlertTriangle size={18} />
          EMERGENCY BROADCAST
        </div>
        <h1>末日降临</h1>
        <p className="doom-time">
          {day} · {time}:00
        </p>
        <p className="doom-copy">{intro}</p>

        <div className="doom-rules">
          <div><Shield size={16} /><span>安全屋防护影响长期生存</span></div>
          <div><Crosshair size={16} /><span>探索会触发高风险事件</span></div>
          <div><Archive size={16} /><span>前世情报会成为路线优势</span></div>
          <div><Skull size={16} /><span>健康或理智归零即死亡</span></div>
        </div>

        <button type="button" className="doom-enter" onClick={onEnter}>
          进入废墟
        </button>
      </section>
    </div>
  );
}
