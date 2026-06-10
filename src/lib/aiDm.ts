import { FINANCE_ASSETS, ITEMS, Message } from '../types/game';
import { AIDMRequestContext, AIDMWorld } from '../types/aiDm';
import { Delta, RandomEventDefinition, StatKey } from '../types/randomEvent';

export const AI_DM_KEY_STORAGE = 'rebirth-ai-dm-api-key';
export const AI_DM_MODEL_STORAGE = 'rebirth-ai-dm-model';
export const AI_DM_BASE_URL_STORAGE = 'rebirth-ai-dm-base-url';
export const AI_DM_PROTOCOL_STORAGE = 'rebirth-ai-dm-protocol';
export const AI_DM_PROVIDER_STORAGE = 'rebirth-ai-dm-provider';
export type AIDMProtocol = 'responses' | 'chat';
export interface AIDMConnection {
  apiKey: string;
  baseUrl?: string;
  protocol?: AIDMProtocol;
  model?: string;
  provider?: string;
}

const AI_DM_PROVIDER_CANDIDATES = [
  {
    provider: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    protocol: 'responses' as const,
    models: ['gpt-5-mini', 'gpt-4.1-mini', 'gpt-4o-mini'],
  },
  {
    provider: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    protocol: 'chat' as const,
    models: ['deepseek-v4-flash', 'deepseek-v4-pro', 'deepseek-chat', 'deepseek-reasoner'],
  },
  {
    provider: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    protocol: 'chat' as const,
    models: ['openai/gpt-4o-mini', 'deepseek/deepseek-chat', 'google/gemini-2.0-flash-001'],
  },
  {
    provider: 'Moonshot',
    baseUrl: 'https://api.moonshot.cn/v1',
    protocol: 'chat' as const,
    models: ['moonshot-v1-8k', 'moonshot-v1-32k'],
  },
  {
    provider: 'DashScope',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    protocol: 'chat' as const,
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
  },
  {
    provider: 'SiliconFlow',
    baseUrl: 'https://api.siliconflow.cn/v1',
    protocol: 'chat' as const,
    models: ['deepseek-ai/DeepSeek-V3', 'Qwen/Qwen2.5-7B-Instruct'],
  },
];

const clamp = (min: number, max: number, value: number) => Math.max(min, Math.min(max, value));
const itemIds = new Set(Object.keys(ITEMS));
const financeIds = new Set(FINANCE_ASSETS.map((asset) => asset.id));
const statKeys = new Set<StatKey>(['health', 'san', 'strength', 'constitution', 'intelligence', 'luck', 'leadership']);

const sanitizeDelta = (delta: Delta): Delta | null => {
  if (delta.type === 'cash') return { type: 'cash', amount: Math.round(clamp(-2500, 3500, delta.amount)) };
  if (delta.type === 'item') {
    if (!itemIds.has(delta.itemId)) return null;
    const item = ITEMS[delta.itemId as keyof typeof ITEMS];
    return { type: 'item', itemId: item.id, itemName: item.name, amount: Math.round(clamp(-3, 6, delta.amount)) };
  }
  if (!statKeys.has(delta.key)) return null;
  return { type: 'stat', key: delta.key, amount: Math.round(clamp(-25, 8, delta.amount)) };
};

const sanitizeEvent = (event: RandomEventDefinition, index: number): RandomEventDefinition | null => {
  if (!event.title || !event.scene || !Array.isArray(event.choices) || event.choices.length < 2) return null;
  const choices = event.choices.slice(0, 3).map((choice, choiceIndex) => {
    const cleanOutcome = (outcome: typeof choice.always) => outcome ? {
      text: String(outcome.text).slice(0, 220),
      deltas: outcome.deltas.map(sanitizeDelta).filter((delta): delta is Delta => Boolean(delta)),
    } : undefined;
    return {
      ...choice,
      id: `ai_choice_${index}_${choiceIndex}`,
      label: String(choice.label).slice(0, 80),
      check: choice.check ? {
        attribute: choice.check.attribute,
        difficulty: clamp(0, 3, Math.round(choice.check.difficulty)) as 0 | 1 | 2 | 3,
      } : undefined,
      success: cleanOutcome(choice.success),
      failure: cleanOutcome(choice.failure),
      always: cleanOutcome(choice.always),
    };
  }).filter((choice) => choice.always || (choice.check && choice.success && choice.failure));
  if (choices.length < 2) return null;
  return {
    id: `ai_event_${Date.now()}_${index}`,
    kind: event.kind === 'punish' ? 'punish' : 'reward',
    title: String(event.title).slice(0, 60),
    scene: String(event.scene).slice(0, 420),
    source: 'explore',
    tags: Array.isArray(event.tags) ? event.tags.slice(0, 4).map(String).filter((tag) => !/ai|dm/i.test(tag)) : ['异变'],
    choices,
  };
};

const sanitizeMessages = (messages: Message[]) => messages.slice(0, 8).map((message, index) => ({
  ...message,
  id: `ai_message_${Date.now()}_${index}`,
  text: String(message.text).slice(0, 260),
  source: 'peace' as const,
  type: ['finance', 'material', 'property', 'metal', 'location'].includes(message.type) ? message.type : 'material',
}));

const sanitizeMultipliers = (values: Record<string, number>, validIds: Set<string>) =>
  Object.fromEntries(Object.entries(values || {})
    .filter(([id]) => validIds.has(id))
    .map(([id, value]) => [id, clamp(0.65, 2.5, Number(value) || 1)]));

const extractOutputText = (response: {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
  choices?: Array<{ message?: { content?: string } }>;
}) => response.output_text
  || response.output?.flatMap((item) => item.content || []).map((content) => content.text || '').join('')
  || response.choices?.[0]?.message?.content
  || '';

const callAIProxy = async (kind: 'models' | 'responses' | 'chat', connection: AIDMConnection, body?: unknown) => {
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, ...connection, body }),
  });
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') && text ? JSON.parse(text) : text;
  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'error' in payload
        ? typeof payload.error === 'string'
          ? payload.error
          : typeof payload.error === 'object' && payload.error && 'message' in payload.error
            ? String(payload.error.message)
            : JSON.stringify(payload.error)
        : String(payload || 'Request failed');
    throw new Error(message.slice(0, 240));
  }
  return payload;
};

export const resolveAIDMConnection = async (connection: AIDMConnection): Promise<Required<AIDMConnection>> => {
  if (connection.baseUrl && connection.protocol) {
    const normalized = {
      ...connection,
      provider: connection.provider || '自定义 API',
      baseUrl: connection.baseUrl.trim().replace(/\/+$/, ''),
      protocol: connection.protocol,
    };
    if (normalized.model?.trim()) return { ...normalized, model: normalized.model.trim() };
    const payload = await callAIProxy('models', normalized) as { data?: Array<{ id?: string }> };
    const available = (payload.data || []).map((model) => model.id).filter((id): id is string => Boolean(id));
    const preferred = AI_DM_PROVIDER_CANDIDATES.flatMap((candidate) => candidate.models).find((model) => available.includes(model));
    if (preferred) return { ...normalized, model: preferred };
    const compatible = available.find((model) =>
      !/(audio|realtime|transcribe|tts|image|embedding|moderation)/i.test(model),
    );
    if (compatible) return { ...normalized, model: compatible };
    throw new Error('当前密钥没有可用于 AI DM 的文本模型');
  }

  const key = connection.apiKey.trim();
  const safeCandidates = (() => {
    if (key.startsWith('sk-or-')) {
      return AI_DM_PROVIDER_CANDIDATES.filter((candidate) => candidate.provider === 'OpenRouter');
    }
    if (key.startsWith('sk-proj-') || key.startsWith('sk-svcacct-')) {
      return AI_DM_PROVIDER_CANDIDATES.filter((candidate) => candidate.provider === 'OpenAI');
    }
    if (/^sk-[a-f0-9]{32,}$/i.test(key)) {
      return AI_DM_PROVIDER_CANDIDATES.filter((candidate) => candidate.provider === 'DeepSeek');
    }
    return AI_DM_PROVIDER_CANDIDATES.filter((candidate) => candidate.provider === 'OpenAI');
  })();
  const failures: string[] = [];
  for (const candidate of safeCandidates) {
    const probe = { ...connection, ...candidate };
    try {
      const payload = await callAIProxy('models', probe) as { data?: Array<{ id?: string }> };
      const available = (payload.data || []).map((model) => model.id).filter((id): id is string => Boolean(id));
      const preferred = candidate.models.find((model) => available.includes(model));
      if (preferred) return { ...probe, model: preferred };
      const compatible = available.find((model) =>
        !/(audio|realtime|transcribe|tts|image|embedding|moderation)/i.test(model),
      );
      if (compatible) return { ...probe, model: compatible };
      failures.push(`${candidate.provider}: 没有可用文本模型`);
    } catch (error) {
      failures.push(`${candidate.provider}: ${error instanceof Error ? error.message : '识别失败'}`);
    }
  }

  throw new Error(`无法安全识别该密钥对应的 AI 服务。${failures.join('；')}。为避免泄露密钥，系统不会将同一密钥发送给多个厂商。`);
};

const buildCompletionBody = (connection: Required<AIDMConnection>, instructions: string, input: string, json = false) =>
  connection.protocol === 'responses'
    ? {
        model: connection.model,
        store: false,
        instructions,
        input,
        ...(json ? { text: { format: { type: 'json_object' } } } : {}),
      }
    : {
        model: connection.model,
        messages: [
          { role: 'system', content: instructions },
          { role: 'user', content: input },
        ],
        ...(json ? { response_format: { type: 'json_object' } } : {}),
      };

export const generateAIDMWorld = async (connection: Required<AIDMConnection>, context: AIDMRequestContext): Promise<AIDMWorld> => {
  try {
    const instructions = '你是末日轮回生存游戏的DM。输出严格JSON，不要Markdown。让和平期市场波动有因果，末日事件险象环生但公平，选择应有明确取舍。';
    const input = `根据游戏状态生成本轮世界编排：${JSON.stringify(context)}。
可用物资ID：${Object.keys(ITEMS).join(',')}。可用金融资产ID：${FINANCE_ASSETS.map((x) => x.id).join(',')}。
输出对象字段：title字符串；briefing字符串；itemMultipliers对象；financeMultipliers对象；rumors数组；events数组。
rumors是“玩家在和平期逛逛时可能打听到的线索”，不是开局直接获得的消息。每条rumor必须在text里写清前因后果，例如“你在银行排队时听到柜员压低声音说……”。rumor必须符合：text,type(finance/material/property/metal/location),source固定peace，可选targetItem/targetAssetId/priceMultiplier/locationId/locationName。
events生成4个，source固定explore，kind为reward或punish，每个2-3个choices；choice可以有check(attribute为strength/intelligence/luck/leadership,difficulty为0-3)和success/failure，或always；每个outcome含text和deltas。delta只能是cash、item或stat。`;
    const raw = await callAIProxy(connection.protocol, connection, buildCompletionBody(connection, instructions, input, true));
    const parsed = JSON.parse(extractOutputText(raw as any)) as AIDMWorld & { messages?: Message[] };
    return {
      title: String(parsed.title || '未知世界线').slice(0, 80),
      briefing: String(parsed.briefing || '命运的暗流改变了这条世界线。').slice(0, 360),
      itemMultipliers: sanitizeMultipliers(parsed.itemMultipliers, itemIds),
      financeMultipliers: sanitizeMultipliers(parsed.financeMultipliers, financeIds),
      rumors: sanitizeMessages(Array.isArray(parsed.rumors) ? parsed.rumors : Array.isArray(parsed.messages) ? parsed.messages : []),
      events: (Array.isArray(parsed.events) ? parsed.events : [])
        .map(sanitizeEvent)
        .filter((event): event is RandomEventDefinition => Boolean(event)),
    };
  } catch (error) {
    throw new Error(`世界编织失败：${error instanceof Error ? error.message : '未知错误'}`);
  }
};

export const getStoredAIDMCredentials = () => {
  if (typeof window === 'undefined') return null;
  const apiKey = window.sessionStorage.getItem(AI_DM_KEY_STORAGE)?.trim();
  const model = window.sessionStorage.getItem(AI_DM_MODEL_STORAGE)?.trim() || 'gpt-5-mini';
  const baseUrl = window.sessionStorage.getItem(AI_DM_BASE_URL_STORAGE)?.trim() || 'https://api.openai.com/v1';
  const protocol = window.sessionStorage.getItem(AI_DM_PROTOCOL_STORAGE) === 'chat' ? 'chat' : 'responses';
  const provider = window.sessionStorage.getItem(AI_DM_PROVIDER_STORAGE)?.trim() || 'OpenAI';
  return apiKey ? { apiKey, model, baseUrl, protocol, provider } as Required<AIDMConnection> : null;
};

export const generateAIDMNarrative = async (
  connection: Required<AIDMConnection>,
  context: {
    rawEvent: string;
    date: string;
    time: number;
    isDoomsday: boolean;
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
  },
) => {
  const instructions = '你是《Rebirth》的AI DM。把游戏事件改写成主角第一人称小说段落。只输出正文，不要标题、Markdown、引号或解释。中文，沉浸、克制、末日感强。不得改变结算事实，不新增奖励或损失。一轮不超过200字。';
  const input = `事件与状态：${JSON.stringify(context)}。要求：用“我”的视角描写正在发生的经过、环境、身体状态和心理反应；和平时期偏悬疑压抑，末日时期偏危险和生存压力；如果事件很短，也要写得像小说的一小段。`;
  const raw = await callAIProxy(connection.protocol, connection, buildCompletionBody(connection, instructions, input));
  return extractOutputText(raw as any).trim().replace(/^["“]|["”]$/g, '').slice(0, 220);
};

export const createDemoAIDMWorld = (): AIDMWorld => ({
  title: '灰烬雨下的第七码头',
  briefing: '连续酸雨切断了北区物流，幸存者开始争抢药品与燃料。有人声称，第七码头仍停着一艘装满物资的货轮，但广播里夹着不属于人类的敲击声。',
  itemMultipliers: {
    medicine: 1.85,
    fuel: 1.65,
    water: 1.35,
    food: 1.18,
    materials: 0.82,
  },
  financeMultipliers: {
    hope_bio: 1.45,
    ironwall_ind: 1.28,
  },
  rumors: [
    {
      id: 'demo_message_market',
      text: '【市场传闻】你在医院走廊排队买绷带时，听见两个护士低声抱怨：急救车队正在用燃料换抗生素，药品和燃料接下来都会被抢空。',
      type: 'material',
      source: 'peace',
      targetItem: 'medicine',
      priceMultiplier: 1.85,
    },
    {
      id: 'demo_message_bank',
      text: '【地产传闻】你在银行柜台兑换现金时，柜员压低声音说：临时避难贷款审批突然收紧，带地下储藏空间的房产正在被提前锁单。',
      type: 'property',
      source: 'peace',
      priceMultiplier: 1.28,
    },
    {
      id: 'demo_message_location',
      text: '【地点线索】你在图书馆翻到一份旧港务局值班日志：第七码头货轮的冷藏舱仍有备用电源，但每晚都会传来三次金属敲击。',
      type: 'location',
      source: 'peace',
      locationId: 'pier_seven',
      locationName: '第七码头',
    },
    {
      id: 'demo_message_finance',
      text: '【金融传闻】你在证券交易所大厅听到两个经纪人争吵：希望制药已经拿到应急订单，资金正抢先涌入医疗板块。',
      type: 'finance',
      source: 'peace',
      targetAssetId: 'hope_bio',
      priceMultiplier: 1.45,
    },
  ],
  events: [
    {
      id: 'demo_pier_signal',
      kind: 'reward',
      title: '第七码头的求救灯',
      scene: '酸雨中，一盏红色信号灯从货轮驾驶舱反复闪烁。甲板上散落着未拆封的补给箱，而船舱深处正传来规律的敲击声。',
      source: 'explore',
      tags: ['码头', '高风险'],
      choices: [
        {
          id: 'demo_board_fast',
          label: '冒雨冲上甲板，快速搬走补给箱',
          check: { attribute: 'strength', difficulty: 2 },
          success: { text: '你扛起补给箱，在船舱门开启前成功撤离。', deltas: [{ type: 'item', itemId: 'medicine', itemName: '药品', amount: 4 }, { type: 'item', itemId: 'fuel', itemName: '燃料', amount: 3 }] },
          failure: { text: '湿滑甲板让你重重摔倒，黑暗里的东西已经靠近。', deltas: [{ type: 'stat', key: 'health', amount: -18 }, { type: 'item', itemId: 'medicine', itemName: '药品', amount: 1 }] },
        },
        {
          id: 'demo_decode',
          label: '先破解信号灯的闪烁规律',
          check: { attribute: 'intelligence', difficulty: 2 },
          success: { text: '那不是求救信号，而是船员留下的安全路线。你避开了危险舱室。', deltas: [{ type: 'cash', amount: 1800 }, { type: 'item', itemId: 'water', itemName: '水', amount: 4 }, { type: 'stat', key: 'san', amount: 3 }] },
          failure: { text: '你误读了信号，打开了一扇不该打开的门。', deltas: [{ type: 'stat', key: 'san', amount: -16 }, { type: 'stat', key: 'health', amount: -8 }] },
        },
        {
          id: 'demo_leave',
          label: '记住位置，立刻离开',
          always: { text: '你压下贪念撤离码头，至少今晚还能安稳入睡。', deltas: [{ type: 'stat', key: 'san', amount: 2 }] },
        },
      ],
    },
    {
      id: 'demo_acid_convoy',
      kind: 'punish',
      title: '酸雨中的车队',
      scene: '一支没有牌照的车队堵住了返程道路。领头人要求你交出一半物资，否则他们会亲自检查你的背包。',
      source: 'explore',
      tags: ['冲突', '交易'],
      choices: [
        {
          id: 'demo_bluff',
          label: '谎称附近有军方巡逻队',
          check: { attribute: 'leadership', difficulty: 2 },
          success: { text: '你的语气足够镇定，车队选择迅速撤离。', deltas: [{ type: 'stat', key: 'leadership', amount: 2 }] },
          failure: { text: '他们看穿了你的虚张声势，并给了你一个教训。', deltas: [{ type: 'cash', amount: -1200 }, { type: 'stat', key: 'health', amount: -12 }] },
        },
        {
          id: 'demo_pay',
          label: '交钱换取安全通行',
          always: { text: '你用现金买下了一条安全返程路。', deltas: [{ type: 'cash', amount: -700 }, { type: 'stat', key: 'san', amount: 1 }] },
        },
      ],
    },
  ],
});
