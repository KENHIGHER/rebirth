import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  Gamepad2,
  LoaderCircle,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AI_DM_PROVIDER_CANDIDATES,
  AI_DM_PROVIDER_NAMES,
  type AIDMConnection,
  type AIDMProvider,
} from '../lib/aiDm';

type Panel = 'menu' | 'guide' | 'settings' | 'ai-setup';

interface StartScreenProps {
  hasSave: boolean;
  onNewGame: (connection?: AIDMConnection) => Promise<void>;
  onContinue: () => void;
}

const guideSections = [
  {
    title: '基础操作',
    entries: [
      ['主页', '查看当前日期、状态、消息和近期行动记录。'],
      ['交易', '在末日前买卖物资与金融资产，价格会随日期和事件波动。'],
      ['背包', '查看持有物资，并在需要时使用药品等消耗品。'],
      ['地产 / 安全屋', '购买并强化住所。末日后，防护与舒适度决定长期生存能力。'],
    ],
  },
  {
    title: '时间与生存',
    entries: [
      ['行动与睡觉', '大多数行动会推进时间。睡觉将进入下一天并刷新市场。'],
      ['末日倒计时', '灾难会在固定日期降临。提前囤积食物、水、药品与建材。'],
      ['健康与理智', '健康或理智归零会死亡。低理智还可能造成严重资源损失。'],
      ['轮回', '死亡不是终点。进入下一轮回后，你会保留收集到的末日消息。'],
    ],
  },
  {
    title: '末日机制',
    entries: [
      ['外出探索', '进入废墟寻找补给，也可能触发奖励或惩罚事件。'],
      ['属性检定', '力量、智力、幸运和领导力会影响事件选项的成功率。'],
      ['每日消耗', '末日后每天都会消耗食物和水；不足时健康将大幅下降。'],
      ['命运', '命运面板可改变市场、传闻与随机事件，塑造本轮世界。'],
    ],
  },
];

export default function StartScreen({ hasSave, onNewGame, onContinue }: StartScreenProps) {
  const [panel, setPanel] = useState<Panel>('menu');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('rebirth-sound') !== 'off');
  const [largeText, setLargeText] = useState(() => localStorage.getItem('rebirth-large-text') === 'on');
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AIDMProvider>('DeepSeek');
  const [model, setModel] = useState('deepseek-chat');
  const [baseUrl, setBaseUrl] = useState('');
  const [starting, setStarting] = useState(false);
  const [startStatus, setStartStatus] = useState('');
  const selectedProvider = AI_DM_PROVIDER_CANDIDATES.find((candidate) => candidate.provider === provider);
  const availableModels = selectedProvider?.models || [];

  useEffect(() => {
    document.documentElement.classList.toggle('rebirth-large-text', largeText);
    localStorage.setItem('rebirth-large-text', largeText ? 'on' : 'off');
  }, [largeText]);

  useEffect(() => {
    localStorage.setItem('rebirth-sound', soundEnabled ? 'on' : 'off');
  }, [soundEnabled]);

  const menuItems = [
    { label: '新游戏', hint: '从灾难前五天开始', icon: RotateCcw, action: () => setPanel('ai-setup'), disabled: false },
    { label: '继续游戏', hint: hasSave ? '读取最近的自动存档' : '暂无存档', icon: Gamepad2, action: onContinue, disabled: !hasSave },
    { label: '指南', hint: '操作与生存机制', icon: BookOpen, action: () => setPanel('guide'), disabled: false },
    { label: '设置', hint: '声音与显示', icon: Settings, action: () => setPanel('settings'), disabled: false },
  ];

  return (
    <div className="start-screen">
      <div className="start-sun" />
      <div className="start-haze start-haze-one" />
      <div className="start-haze start-haze-two" />
      <div className="start-skyline start-skyline-back" />
      <div className="start-skyline start-skyline-front" />
      <div className="start-road" />
      <div className="start-survivor">
        <span className="start-survivor-head" />
        <span className="start-survivor-body" />
        <span className="start-survivor-leg start-survivor-leg-left" />
        <span className="start-survivor-leg start-survivor-leg-right" />
      </div>
      <div className="start-grain" />

      <section className="start-ui">
        <header className="start-title">
          <p>THE LAST FIVE DAYS</p>
          <h1>REBIRTH</h1>
          <span>死亡会留下线索，轮回会带来答案。</span>
        </header>

        {panel === 'menu' && (
          <nav className="start-menu" aria-label="开始菜单">
            {menuItems.map(({ label, hint, icon: Icon, action, disabled }) => (
              <button key={label} type="button" onClick={action} disabled={disabled} className="start-menu-item">
                <Icon size={18} strokeWidth={1.5} />
                <span className="start-menu-copy">
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </span>
                <ChevronRight className="start-menu-arrow" size={18} />
              </button>
            ))}
          </nav>
        )}

        {panel === 'guide' && (
          <div className="start-panel custom-scrollbar">
            <button type="button" className="start-back" onClick={() => setPanel('menu')}>
              <ArrowLeft size={16} /> 返回
            </button>
            <div className="start-panel-heading">
              <BookOpen size={20} />
              <div><small>SURVIVAL MANUAL</small><h2>生存指南</h2></div>
            </div>
            {guideSections.map((section) => (
              <section key={section.title} className="guide-section">
                <h3>{section.title}</h3>
                {section.entries.map(([name, detail]) => (
                  <div key={name} className="guide-entry">
                    <strong>{name}</strong>
                    <p>{detail}</p>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}

        {panel === 'settings' && (
          <div className="start-panel">
            <button type="button" className="start-back" onClick={() => setPanel('menu')}>
              <ArrowLeft size={16} /> 返回
            </button>
            <div className="start-panel-heading">
              <SlidersHorizontal size={20} />
              <div><small>SYSTEM</small><h2>设置</h2></div>
            </div>
            <button type="button" className="setting-row" onClick={() => setSoundEnabled((value) => !value)}>
              {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
              <span><strong>声音</strong><small>界面与环境音效</small></span>
              <b>{soundEnabled ? '开启' : '关闭'}</b>
            </button>
            <button type="button" className="setting-row" onClick={() => setLargeText((value) => !value)}>
              <span className="setting-aa">Aa</span>
              <span><strong>大号文字</strong><small>提高界面文字可读性</small></span>
              <b>{largeText ? '开启' : '关闭'}</b>
            </button>
          </div>
        )}

        {panel === 'ai-setup' && (
          <div className="start-panel">
            <button type="button" className="start-back" onClick={() => setPanel('menu')} disabled={starting}>
              <ArrowLeft size={16} /> 返回
            </button>
            <div className="start-panel-heading">
              <BrainCircuit size={20} />
              <div><small>STORY MODE</small><h2>启用命运编织？</h2></div>
            </div>
            <p className="ai-setup-copy">
              可选接入外部编织器，为本轮游戏生成世界线、传闻和第一人称叙事。不启用则按原本规则开始。
            </p>
            <div className="ai-provider-grid">
              {AI_DM_PROVIDER_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  disabled={starting}
                  onClick={() => {
                    setProvider(name);
                    setModel(AI_DM_PROVIDER_CANDIDATES.find((candidate) => candidate.provider === name)?.models[0] || '');
                    setBaseUrl('');
                  }}
                  className={provider === name ? 'active' : ''}
                >
                  {name}
                </button>
              ))}
            </div>
            <label className="ai-setup-key">
              选择 AI 模型
              {availableModels.length > 0 ? (
                <select value={model} onChange={(event) => setModel(event.target.value)} disabled={starting}>
                  {availableModels.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  placeholder={provider === '豆包' ? '填写火山方舟接入点 ID' : '填写模型名'}
                  autoComplete="off"
                  disabled={starting}
                />
              )}
            </label>
            {provider === '自定义兼容接口' && (
              <label className="ai-setup-key">
                API Base URL
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                  placeholder="https://example.com/v1"
                  autoComplete="off"
                  disabled={starting}
                />
              </label>
            )}
            <label className="ai-setup-key">
              世界编织密钥
              <input
                type="password"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-..."
                autoComplete="off"
                disabled={starting}
              />
            </label>
            {startStatus && <p className="ai-setup-status">{startStatus}</p>}
            <button
              type="button"
              className="doom-enter ai-setup-primary"
              disabled={starting || !apiKey.trim() || !model.trim()}
              onClick={async () => {
                setStarting(true);
                setStartStatus('正在连接编织器并生成世界线……');
                try {
                  await onNewGame({
                    apiKey: apiKey.trim(),
                    provider,
                    model: model.trim(),
                    baseUrl: baseUrl.trim() || undefined,
                    protocol: provider === '自定义兼容接口' ? 'chat' : undefined,
                  });
                } catch (error) {
                  setStartStatus(error instanceof Error ? error.message : '命运编织启动失败，请检查密钥后重试。');
                  setStarting(false);
                }
              }}
            >
              {starting ? <><LoaderCircle size={16} className="animate-spin" /> 正在开始</> : '启用命运编织并开始'}
            </button>
            <button
              type="button"
              className="ai-setup-skip"
              disabled={starting}
              onClick={async () => {
                setStarting(true);
                await onNewGame();
              }}
            >
              不启用，直接开始
            </button>
          </div>
        )}
      </section>

      <footer className="start-footer">AUTOSAVE ENABLED · v0.1</footer>
    </div>
  );
}
