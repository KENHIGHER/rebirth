import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { FINANCE_ASSETS, FINANCE_EVENTS, ITEMS, MARKET_EVENTS, Message } from '../types/game';
import PagedList from './PagedList';
import SceneBanner from './SceneBanner';

const LOCATIONS = [
  '证券交易所', '银行', '医院', '黑市', '图书馆', '公司', '政府大楼'
];

const PEACE_MESSAGE_TYPES = ['material', 'finance', 'property', 'metal'] as const;

interface PendingOffer {
  message: Message;
  price: number;
}

const StrollView: React.FC = () => {
  const {
    advanceTime,
    time,
    addMessage,
    buyItem,
    addLog,
    archivedMessages,
    usedMemoryLocationIds,
    markMemoryLocationUsed,
    aiRumors,
    consumeAIRumor,
    addSan,
    applyDeltas,
    cash,
  } = useGameStore();
  const [feedback, setFeedback] = useState<string>('');
  const [pendingOffer, setPendingOffer] = useState<PendingOffer | null>(null);

  const dateToNumber = (d: string) => {
    const [y, m, day] = d.split('.').map((x) => parseInt(x, 10));
    return y * 10000 + m * 100 + day;
  };

  const unlockedLocations = Array.from(
    new Map(
      archivedMessages
        .filter((m) => m.type === 'location' && m.locationName)
        .map((m) => [
          m.locationId || m.id,
          {
            id: m.locationId || m.id,
            name: m.locationName as string,
            hint: m.text,
            isMemory: true,
          },
        ]),
    ).values(),
  ).filter((location) => !usedMemoryLocationIds.includes(location.id));

  const locations = [
    ...unlockedLocations,
    ...LOCATIONS.map((name) => ({ id: name, name, hint: '', isMemory: false })),
  ];

  const getUpcomingMarketEvent = () => {
    const now = useGameStore.getState().date;
    const nowNum = dateToNumber(now);
    const candidates = MARKET_EVENTS.filter((e) => dateToNumber(e.date) > nowNum);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const getUpcomingFinanceEvent = () => {
    const now = useGameStore.getState().date;
    const nowNum = dateToNumber(now);
    const candidates = FINANCE_EVENTS.filter((e) => dateToNumber(e.date) > nowNum);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const buildRumorPrice = (message: Message) => {
    const multiplier = message.priceMultiplier ?? 1;
    const premium = Math.min(1.5, Math.max(0.5, 0.5 + Math.random() + Math.max(0, multiplier - 1) * 0.15));
    return Math.round(5000 * premium);
  };

  const messageTypeLabel = (type: Message['type']) => {
    if (type === 'finance') return '金融情报';
    if (type === 'metal') return '贵金属情报';
    if (type === 'property') return '地产情报';
    if (type === 'location') return '地点情报';
    return '物资情报';
  };

  const pickAIRumor = (locationName: string) => {
    if (aiRumors.length === 0) return null;
    const preferredTypes: Record<string, Message['type'][]> = {
      证券交易所: ['finance', 'metal'],
      银行: ['finance', 'property'],
      医院: ['material'],
      黑市: ['finance', 'metal', 'material', 'location'],
      图书馆: ['location', 'property'],
      公司: ['finance', 'material'],
      政府大楼: ['property', 'location'],
    };
    const types = preferredTypes[locationName] || [];
    const matched = aiRumors.filter((rumor) => types.includes(rumor.type));
    const candidates = matched.length > 0 ? matched : aiRumors;
    return candidates[Math.floor(Math.random() * candidates.length)];
  };

  const buildPeaceRumor = (locationName: string, preferred?: 'item' | 'finance'): Message | null => {
    const type = PEACE_MESSAGE_TYPES[Math.floor(Math.random() * PEACE_MESSAGE_TYPES.length)];

    if (preferred === 'finance' || (type === 'finance' || type === 'metal')) {
      const evt = getUpcomingFinanceEvent();
      if (!evt) return null;
      const asset = FINANCE_ASSETS.find((a) => a.id === evt.assetId);
      if (!asset) return null;
      const targetPrice = asset.defaultPrice * evt.multiplier;
      const text =
        type === 'metal'
          ? `【贵金属消息】${locationName}传来风声，${evt.date} ${asset.name}会涨到接近¥${targetPrice.toFixed(0)}，黑市已经有人提前囤货。`
          : `【金融消息】你在${locationName}听说，${evt.date} ${asset.name}会冲到原价的${evt.multiplier}倍，市场会先一步躁动。`;
      return {
        id: Math.random().toString(36).substr(2, 9),
        text,
        type: type === 'metal' ? 'metal' : 'finance',
        source: 'peace' as const,
        triggerDate: evt.date,
        targetAssetId: evt.assetId,
        priceMultiplier: evt.multiplier,
      };
    }

    const evt = getUpcomingMarketEvent();
    if (!evt) return null;
    const item = Object.values(ITEMS).find((i) => i.id === evt.itemId);
    const itemName = item?.name || '某种物资';
    const targetPrice = (item?.defaultPrice || 100) * evt.multiplier;
    const text =
      type === 'property'
        ? `【地产消息】${locationName}的经纪人悄悄说，${evt.date} 与${itemName}储备相关的安全屋和据点会更值钱。`
        : `【物资消息】你在${locationName}听说，${evt.date} ${itemName}价格会变成原来的${evt.multiplier}倍（约¥${targetPrice}/份）。`;
    return {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type: type === 'property' ? 'property' : 'material',
      source: 'peace' as const,
      triggerDate: evt.date,
      targetItem: evt.itemId,
      priceMultiplier: evt.multiplier,
    };
  };

  const handleStroll = (location: { id: string; name: string; hint: string; isMemory: boolean }) => {
    if (pendingOffer) {
      setFeedback('你还没决定是否买下黑市商人的情报。');
      return;
    }
    if (time > 19) {
      setFeedback('时间太晚了，很多地方已经关门了。');
      return;
    }

    advanceTime(5);

    // Random Event
    const rand = Math.random();
    let resultStr = '';
    if (location.isMemory) {
      const drops = ['food', 'water', 'materials', 'fuel', 'medicine'] as const;
      const primaryId = drops[Math.floor(Math.random() * drops.length)];
      const bonusPool = drops.filter((id) => id !== primaryId);
      const bonusId = bonusPool[Math.floor(Math.random() * bonusPool.length)];
      const primary = ITEMS[primaryId];
      const bonus = ITEMS[bonusId];
      const primaryQty = 3 + Math.floor(Math.random() * 3);
      const bonusQty = 1 + Math.floor(Math.random() * 2);
      const cashBonus = 600 + Math.floor(Math.random() * 900);

      markMemoryLocationUsed(location.id);
      applyDeltas([
        { type: 'item', itemId: primary.id, itemName: primary.name, amount: primaryQty },
        { type: 'item', itemId: bonus.id, itemName: bonus.name, amount: bonusQty },
        { type: 'cash', amount: cashBonus },
        { type: 'stat', key: 'san', amount: 2 },
      ]);
      resultStr = `【轮回记忆】你按前世线索搜完了 ${location.name}。这是一次性机会：带回 ${primaryQty} 份${primary.name}、${bonusQty} 份${bonus.name}，还找到 ¥${cashBonus} 的可用物资票据。`;
    } else if (location.name === '黑市' && rand < 0.35) {
      const msg = buildPeaceRumor(location.name, 'finance');
      if (!msg) {
        resultStr = `黑市里全是空消息，今晚没人拿出真情报。`;
      } else {
        const price = buildRumorPrice(msg);
        setPendingOffer({ message: msg, price });
        resultStr = `黑市商人掏出一张密封情报单，开价 ¥${price}。他只肯透露：这是一条${messageTypeLabel(msg.type)}，将在 ${msg.triggerDate} 左右应验。`;
      }
    } else if (rand < 0.25 || aiRumors.length > 0) {
      const aiRumor = pickAIRumor(location.name);
      const msg = aiRumor || buildPeaceRumor(location.name);
      if (msg) {
        addMessage(msg);
        if (aiRumor) {
          consumeAIRumor(aiRumor.id);
        }
        resultStr = aiRumor
          ? `你在${location.name}打听到一条传闻：${msg.text}`
          : `你在${location.name}获得了一条小道消息（仅本轮回有效）。`;
      } else {
        resultStr = `你在${location.name}听到一些传闻，但不够可靠。`;
      }
    } else if (rand < 0.55) {
      const drops = ['food', 'water', 'materials', 'fuel'] as const;
      const dropId = drops[Math.floor(Math.random() * drops.length)];
      const item = Object.values(ITEMS).find((i) => i.id === dropId);
      const qty = 1 + Math.floor(Math.random() * 2);
      if (item) {
        buyItem(item.id, item.name, qty, 0);
        resultStr = `你在${location.name}顺手捡到了 ${qty} 份${item.name}。`;
      } else {
        resultStr = `你在${location.name}逛了半天，但没什么收获。`;
      }
    } else if (rand < 0.75) {
      addSan(-2);
      resultStr = `你在${location.name}遇到了一场争执，情绪受到影响。`;
    } else {
      resultStr = `你在${location.name}度过了平静的几个小时。`;
    }
    
    setFeedback(resultStr);
    addLog(resultStr);
  };

  const handleBuyOffer = () => {
    if (!pendingOffer) return;
    if (cash < pendingOffer.price) {
      setFeedback(`你掏了掏口袋，发现还差一些钱，买不起这条情报。`);
      return;
    }

    applyDeltas([{ type: 'cash', amount: -pendingOffer.price }]);
    addMessage(pendingOffer.message);
    const resultStr = `你花了 ¥${pendingOffer.price} 买下情报，拆开后看到：${pendingOffer.message.text}`;
    setFeedback(resultStr);
    addLog(resultStr);
    setPendingOffer(null);
  };

  const handleDeclineOffer = () => {
    if (!pendingOffer) return;
    const resultStr = `你没有买下那张密封情报单，黑市商人耸耸肩，把它又塞回了大衣里。`;
    setFeedback(resultStr);
    addLog(resultStr);
    setPendingOffer(null);
  };

  return (
    <div className="space-y-4 h-full min-h-0 flex flex-col">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 flex min-h-0 flex-1 flex-col overflow-hidden">
        <SceneBanner
          image="stroll-street"
          title="城市漫游"
          subtitle="霓虹还没熄灭。消息、偶遇和麻烦，都藏在下一个街角。"
          tone="cyan"
        />
        <div className="mt-4">
        <h2 className="text-lg font-bold text-zinc-100 mb-2">逛逛 (耗时 5h)</h2>
        <p className="text-sm text-zinc-500 mb-4">在城市里四处走走，也许会有意外收获。19:00 后不可开始。</p>
        </div>
        
        <PagedList
          items={locations}
          pageSize={6}
          getKey={(loc) => loc.id}
          gridClassName="grid grid-cols-2 gap-3"
          renderItem={(loc) => (
            <button
              onClick={() => handleStroll(loc)}
              disabled={time > 19 || !!pendingOffer}
              className={`disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded text-sm transition-colors ${
                loc.isMemory
                  ? 'bg-purple-900/30 hover:bg-purple-900/40 text-purple-200 border border-purple-900/50'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              <span className="block font-bold">{loc.isMemory ? `★ ${loc.name}` : loc.name}</span>
              {loc.isMemory && <span className="mt-1 block text-[10px] text-purple-300/70">前世地点：高收益，仅本轮一次</span>}
            </button>
          )}
        />

        {pendingOffer && (
          <div className="mt-3 shrink-0 rounded border border-amber-800/60 bg-amber-950/30 p-3 text-sm">
            <div className="font-bold text-amber-200">黑市情报交易</div>
            <div className="mt-2 text-zinc-300">
              商人压低声音说，这是一条{messageTypeLabel(pendingOffer.message.type)}，会在 {pendingOffer.message.triggerDate} 左右兑现。
            </div>
            <div className="mt-1 text-xs text-zinc-500">只有付款后，情报正文才会给你看。</div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-amber-300 font-mono">报价 ¥{pendingOffer.price.toLocaleString()}</div>
              <div className="flex gap-2">
                <button
                  onClick={handleDeclineOffer}
                  className="rounded bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-700"
                >
                  放弃
                </button>
                <button
                  onClick={handleBuyOffer}
                  disabled={cash < pendingOffer.price}
                  className="rounded bg-amber-800 px-3 py-1.5 text-xs font-bold text-amber-100 hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  购买后查看
                </button>
              </div>
            </div>
          </div>
        )}

        {feedback && (
          <div className="mt-3 shrink-0 bg-zinc-800 p-3 rounded text-sm text-zinc-300 text-center border border-zinc-700">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrollView;
