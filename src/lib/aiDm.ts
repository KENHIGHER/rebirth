import { FINANCE_ASSETS, ITEMS, Message } from '../types/game';
import { AIDMRequestContext, AIDMWorld } from '../types/aiDm';
import { Delta, RandomEventDefinition, StatKey } from '../types/randomEvent';

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

const extractOutputText = (response: { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }) =>
  response.output_text || response.output?.flatMap((item) => item.content || []).map((content) => content.text || '').join('') || '';

export const generateAIDMWorld = async (apiKey: string, model: string, context: AIDMRequestContext): Promise<AIDMWorld> => {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      store: false,
      instructions: '你是末日轮回生存游戏的DM。输出严格JSON，不要Markdown。让和平期市场波动有因果，末日事件险象环生但公平，选择应有明确取舍。',
      input: `根据游戏状态生成本轮世界编排：${JSON.stringify(context)}。
可用物资ID：${Object.keys(ITEMS).join(',')}。可用金融资产ID：${FINANCE_ASSETS.map((x) => x.id).join(',')}。
输出对象字段：title字符串；briefing字符串；itemMultipliers对象；financeMultipliers对象；rumors数组；events数组。
rumors是“玩家在和平期逛逛时可能打听到的线索”，不是开局直接获得的消息。每条rumor必须在text里写清前因后果，例如“你在银行排队时听到柜员压低声音说……”。rumor必须符合：text,type(finance/material/property/metal/location),source固定peace，可选targetItem/targetAssetId/priceMultiplier/locationId/locationName。
events生成4个，source固定explore，kind为reward或punish，每个2-3个choices；choice可以有check(attribute为strength/intelligence/luck/leadership,difficulty为0-3)和success/failure，或always；每个outcome含text和deltas。delta只能是cash、item或stat。`,
      text: { format: { type: 'json_object' } },
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`世界编织失败 (${response.status})：${detail.slice(0, 180)}`);
  }
  const raw = await response.json();
  const parsed = JSON.parse(extractOutputText(raw)) as AIDMWorld & { messages?: Message[] };
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
