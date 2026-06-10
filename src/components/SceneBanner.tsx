import React from 'react';

interface SceneBannerProps {
  image: 'home-city' | 'market' | 'explore-ruins' | 'stroll-street';
  title: string;
  subtitle: string;
  tone?: 'neutral' | 'red' | 'amber' | 'cyan';
}

const toneClass = {
  neutral: 'from-zinc-950/95 via-zinc-950/45 to-transparent border-zinc-700/70',
  red: 'from-red-950/95 via-zinc-950/45 to-transparent border-red-900/60',
  amber: 'from-amber-950/90 via-zinc-950/45 to-transparent border-amber-900/60',
  cyan: 'from-cyan-950/80 via-zinc-950/45 to-transparent border-cyan-900/50',
};

const SceneBanner: React.FC<SceneBannerProps> = ({ image, title, subtitle, tone = 'neutral' }) => {
  const imageUrl = `${import.meta.env.BASE_URL}scenes/${image}.svg`;

  return (
    <div className={`relative overflow-hidden rounded-xl border ${toneClass[tone]} min-h-[118px] bg-zinc-950 shadow-[0_18px_45px_rgba(0,0,0,0.28)]`}>
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-90 [image-rendering:pixelated]"
      />
      <div className={`absolute inset-0 bg-gradient-to-r ${toneClass[tone]}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_15%,rgba(255,255,255,0.16),transparent_24%)]" />
      <div className="relative z-10 flex min-h-[72px] flex-col justify-end p-2.5">
        <div className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">Rebirth Scene</div>
        <div className="mt-1 text-xl font-bold tracking-widest text-zinc-100 drop-shadow">{title}</div>
        <div className="mt-1 max-w-[260px] text-xs leading-relaxed text-zinc-300/85">{subtitle}</div>
      </div>
    </div>
  );
};

export default SceneBanner;
